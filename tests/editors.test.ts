/// <reference types="mocha" />
import "mocha/mocha.js";
import { assert } from "chai";
import { getMochaConfig } from "@webwriter/build/test";
import { editorText, fixtures, loadWidgets, mount, removeAll, resourceURLs, runtime, until } from "./helpers";

mocha.setup(getMochaConfig());

describe("code widgets", function () {
  this.timeout(30000);
  afterEach(removeAll);

  it("every editor opens without requesting execution runtimes", async function () {
    const languages = Object.keys(fixtures);
    await loadWidgets(...languages);
    const widgets = await Promise.all(languages.map((language) => mount(language)));
    languages.forEach((language, index) => assert.equal(editorText(widgets[index]), fixtures[language][0], language));
    assert.deepEqual(
      resourceURLs().filter((url) => runtime.test(url) || url.includes("pyodide")),
      [],
    );
  });

  it("offline asset declarations skip disabled cells and share the C toolchain", async function () {
    await loadWidgets("c", "cpp", "sql");
    const get = async (language: string, disabled = false) => {
      const widget = await mount(language);
      const copy = widget.cloneNode(true) as HTMLElement;
      if (disabled) copy.setAttribute("disable-execution", "");
      return (customElements.get("webwriter-code-" + language) as any).offlineAssets(copy);
    };
    const c = await get("c");
    const cpp = await get("cpp");
    const sql = await get("sql");
    const disabled = await get("sql", true);
    assert.deepEqual(disabled, []);
    assert.deepEqual(c, cpp);
    assert.isTrue(
      sql.some(
        ({ url, mimeType }: { url: string; mimeType: string }) =>
          url.includes("sql-wasm-browser.wasm.gz") && mimeType === "application/gzip",
      ),
    );
    assert.deepEqual(
      resourceURLs().filter((url) => runtime.test(url)),
      [],
    );
  });

  describe("settings", function () {
    const attributes: Record<string, string> = {
      disableExecution: "disable-execution",
      autoRun: "autorun",
      autocomplete: "autocomplete",
      hideCode: "hide-code",
      showExecutionTime: "showexecutiontime",
      hideExecutionCount: "hide-execution-count",
    };

    afterEach(function () {
      document.documentElement.lang = "en";
    });

    it("are authored attributes and the drawer declares them with localized labels", async function () {
      const element = await mount("javascript");
      const options = element.options;
      assert.deepEqual(Object.keys(options).sort(), Object.keys(attributes).sort());
      const groups: Record<string, string> = { disableExecution: "execution", autoRun: "execution", autocomplete: "editor" };
      for (const [name, attribute] of Object.entries(attributes)) {
        assert.equal(options[name].attribute, attribute, name);
        assert.strictEqual(options[name].type, Boolean, name);
        assert.isString(options[name].label._, name);
        if (groups[name]) assert.equal(options[name].group, groups[name], name);
        // The property writes the attribute, and the attribute sets the property.
        element[name] = true;
        await until(() => element.getAttribute(attribute) === "", `attribute ${attribute}`);
        element.removeAttribute(attribute);
        assert.isFalse(element[name], name);
      }
      assert.deepEqual(Object.keys(element.actions), ["resetExecutionCount"]);

      // A language change re-announces the drawer.
      let changes = 0;
      element.addEventListener("optionschange", () => changes++);
      element.setAttribute("lang", "en");
      await until(() => element.options.autoRun.label._ === "Run on load", "English label");
      element.setAttribute("lang", "de");
      await until(() => element.options.autoRun.label._ === "Beim Laden ausführen", "German label");
      assert.isAbove(changes, 0);
      assert.equal(element.actions.resetExecutionCount.label._, "Ausführungszähler zurücksetzen");
      assert.equal(element.optionGroups.execution.label._, "Codeausführung");
    });

    it("hide the code in read mode and show it in edit mode", async function () {
      const element = await mount("javascript", undefined, "hide-code");
      const layout = () => element.shadowRoot!.querySelector<HTMLElement>(".layout")!;
      await until(layout, "layout");
      assert.isTrue(layout().hidden);
      element.setAttribute("contenteditable", "");
      await until(() => !layout().hidden, "visible layout in edit mode");
      element.removeAttribute("contenteditable");
      await until(() => layout().hidden, "hidden layout in read mode");
    });

    it("follow the document language in the cell and the drawer", async function () {
      const element = await mount("javascript");
      document.documentElement.lang = "de";
      await until(() => element.shadowRoot!.querySelector(".run-button")?.textContent?.includes("Ausführen (0)"), "German Run label");
      assert.equal(element.options.disableExecution.label._, "Codeausführung deaktivieren");
      assert.isNull(element.getAttribute("lang"));
    });
  });

  describe("vertical resizing", function () {
    for (const language of ["html", "javascript"]) {
      it(`${language} keeps the toolbar and output and scrolls the editor`, async function () {
        const element = await mount(language);
        const measure = async (maxHeight: string) => {
          element.style.maxWidth = "100px";
          element.style.maxHeight = maxHeight;
          // Wait for the widget to consume WebWriter's inline resize styles.
          await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
          const pane = (selector: string) => element.shadowRoot!.querySelector(selector)!;
          const host = element.getBoundingClientRect();
          const scroller = pane(".cm-scroller");
          const toolbar = pane(".controls").getBoundingClientRect();
          const output = pane("output").getBoundingClientRect();
          return {
            width: host.width,
            height: host.height,
            editor: scroller.getBoundingClientRect().height,
            toolbar: toolbar.height,
            output: output.height,
            bottomGap: host.bottom - output.bottom,
            scrollHeight: scroller.scrollHeight,
          };
        };
        const natural = await measure("");
        const enlarged = await measure("450px");
        const minimum = await measure("10px");
        assert.equal(minimum.width, 300);
        assert.isAtLeast(minimum.editor, 64);
        assert.equal(enlarged.height, 450);
        assert.equal(enlarged.editor - natural.editor, enlarged.height - natural.height);
        for (const layout of [enlarged, minimum]) {
          assert.equal(layout.toolbar, natural.toolbar);
          assert.equal(layout.output, natural.output);
          assert.equal(layout.bottomGap, natural.bottomGap);
        }
        element.code = Array.from({ length: 100 }, (_, index) => `Line ${index + 1}`).join("\n");
        const longCode = await measure("10px");
        assert.equal(longCode.height, minimum.height);
        assert.isAbove(longCode.scrollHeight, longCode.editor);
      });
    }
  });
});

mocha.run();
