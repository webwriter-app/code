/// <reference types="mocha" />
import "mocha/mocha.js";
import { assert } from "chai";
import { getMochaConfig } from "@webwriter/build/test";
import {
  label,
  loadWidgets,
  mount,
  mountHTML,
  outputText,
  part,
  removeAll,
  run,
  until,
  waitForLabel,
  waitForOutput,
  type CodeWidget,
} from "./helpers";

mocha.setup(getMochaConfig());

function placeCaretAtEnd(element: Element) {
  const range = document.createRange();
  range.selectNodeContents(element);
  range.collapse(false);
  const selection = window.getSelection()!;
  selection.removeAllRanges();
  selection.addRange(range);
}

/** A reader's keystroke: text inserted at the focused caret of the editor. */
function type(widget: CodeWidget, text: string) {
  part(widget, ".cm-content")!.focus();
  document.execCommand("insertText", false, text);
}

function click(element: Element) {
  const box = element.getBoundingClientRect();
  const init = { bubbles: true, composed: true, clientX: box.left + box.width / 2, clientY: box.top + box.height / 2 };
  element.dispatchEvent(new MouseEvent("mousedown", init));
  element.dispatchEvent(new MouseEvent("mouseup", init));
  element.dispatchEvent(new MouseEvent("click", init));
}

describe("authored code widget", function () {
  this.timeout(40000);
  afterEach(removeAll);

  describe("host edits", function () {
    it("bypass reader locks and preserve other authored data", async function () {
      const js = await mount("javascript", "first\nsecond\nthird");
      const source = "first\nsecond\nthird";
      js.querySelector("script")!.textContent = JSON.stringify({ code: source, lockedLines: [2], extra: 17 });
      js.append(document.createComment("preserve me"), document.createElement("aside"));
      const lockedLine = () => part(js, ".cm-locked-line");
      await until(() => lockedLine()?.textContent === "second", "locked second line");

      placeCaretAtEnd(lockedLine()!);
      type(js, "reader");
      await new Promise((resolve) => setTimeout(resolve, 100));
      assert.equal(js.code, source);

      const gutter = Array.from(js.shadowRoot!.querySelectorAll(".cm-lock-gutter .cm-gutterElement"))
        .filter((element) => element.querySelector("img"))
        .at(-1)!;
      click(gutter);
      assert.deepEqual(js.lockedLines, [2]);
      js.querySelector("script")!.textContent = JSON.stringify({ code: "first\nremote\nthird", lockedLines: [2], extra: 17 });
      await until(() => lockedLine()?.textContent === "remote", "remote edit");

      js.setAttribute("contenteditable", "");
      await until(() => part(js, ".cm-author-mode"), "author mode");
      placeCaretAtEnd(lockedLine()!);
      type(js, "!");
      await until(() => /!/.test(js.code.split("\n")[1]), "author edit in a locked line");
      assert.equal(JSON.parse(js.querySelector("script")!.textContent!).extra, 17);
      assert.equal(js.querySelectorAll("aside").length, 1);
      assert.match(js.innerHTML, /<!--preserve me-->/);

      js.removeAttribute("contenteditable");
      const parent = js.parentElement!;
      js.remove();
      parent.append(js);
      await until(() => part(js, ".cm-editor"), "editor after reconnect");
      assert.equal(js.shadowRoot!.querySelectorAll(".cm-editor").length, 1);
      assert.equal(js.shadowRoot!.querySelectorAll(".cm-author-mode").length, 0);
    });
  });

  describe("legacy and persisted state", function () {
    it("restores legacy source and never persists execution output", async function () {
      await loadWidgets("javascript");
      const js = document.createElement("webwriter-code-javascript") as CodeWidget;
      js.setAttribute("code", 'console.log("legacy");');
      js.setAttribute("lockedlines", "[1]");
      js.setAttribute("autorun", "");
      js.setAttribute("disable-execution", "");
      js.setAttribute("showexecutioncount", "");
      document.body.append(js);
      assert.equal(js.code, 'console.log("legacy");');
      assert.deepEqual(js.lockedLines, [1]);
      await until(() => part(js, ".cm-content"), "editor");
      assert.isTrue(part(js, ".run-control")!.hidden, "no Run button while execution is disabled");
      js.removeAttribute("disable-execution");
      await waitForLabel(js, "Run (0)");
      run(js);
      await waitForOutput(js, "legacy");
      assert.equal(js.innerHTML, "");
      await waitForLabel(js, "Run (1)");
      assert.isNull(js.getAttribute("executioncount"));

      const hideAttribute = js.options.hideExecutionCount.attribute;
      assert.equal(hideAttribute, "hide-execution-count");
      js.setAttribute(hideAttribute, "");
      await waitForLabel(js, "Run");
      js.removeAttribute(hideAttribute);
      await waitForLabel(js, "Run (1)");
    });
  });

  describe("Prolog", function () {
    it("keeps the query in the authored markup and runs it on Enter", async function () {
      await loadWidgets("prolog");
      const prolog = mountHTML(
        `<webwriter-code-prolog goal="parent(ada, Who)."><script type="application/json" slot="data">${JSON.stringify({
          code: "parent(ada, grace).\nparent(ada, alan).",
        })}</script></webwriter-code-prolog>`,
      );
      const query = await until(() => part<HTMLInputElement>(prolog, "input"), "query input");
      const enter = () => query.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true }));
      const fill = (value: string) => {
        query.value = value;
        query.dispatchEvent(new InputEvent("input", { bubbles: true, composed: true }));
      };
      fill("?- parent(ada, alan)");
      enter();
      await waitForOutput(prolog, "true.");
      assert.equal(prolog.getAttribute("goal"), "?- parent(ada, alan)");
      prolog.setAttribute("goal", "parent(ada, Who).");
      await until(() => query.value === "parent(ada, Who).", "query follows the attribute");
      prolog.removeAttribute("goal");
      await until(() => query.value === "", "query cleared");
      enter();
      await waitForOutput(prolog, "Enter a Prolog query.");
    });
  });

  describe("SQL", function () {
    it("renders multiple result sets, including empty tables and exact integers", async function () {
      const sql = await mount("sql");
      sql.code = `CREATE TABLE example (name TEXT);
        INSERT INTO example VALUES ('<em>Ada</em>');
        SELECT name, null AS missing, 9223372036854775807 AS big FROM example;
        SELECT name FROM example WHERE 0;`;
      await waitForLabel(sql, "Run (0)");
      run(sql);
      const cells = () => Array.from(sql.shadowRoot!.querySelectorAll("td")).map((cell) => cell.textContent!.trim());
      await until(() => cells().includes("No rows"), "empty result set");
      assert.equal(sql.shadowRoot!.querySelectorAll("table").length, 2);
      assert.deepEqual(
        Array.from(sql.shadowRoot!.querySelectorAll("th")).map((cell) => cell.textContent!.trim()),
        ["name", "missing", "big", "name"],
      );
      assert.include(cells(), "<em>Ada</em>");
      assert.include(cells(), "9223372036854775807");

      // Creating the same table again verifies that each run gets a fresh database.
      await waitForLabel(sql, "Run (1)");
      sql.code = `CREATE TABLE example (name TEXT);
        WITH RECURSIVE nums(n) AS (SELECT 1 UNION ALL SELECT n + 1 FROM nums WHERE n < 501)
        SELECT n FROM nums;`;
      run(sql);
      await until(() => outputText(sql).includes("Only the first 500 rows are shown."), "row limit notice");
      assert.equal(sql.shadowRoot!.querySelectorAll("td").length, 500);
      assert.equal(label(sql), "Run (2)");
    });
  });
});

mocha.run();
