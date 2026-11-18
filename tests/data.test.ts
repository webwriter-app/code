/// <reference types="mocha" />
import "mocha/mocha.js";
import { assert } from "chai";
import { getMochaConfig } from "@webwriter/build/test";
import { fixtures, loadWidgets, mount, removeAll, until, waitForLabel, run, type CodeWidget } from "./helpers";

mocha.setup(getMochaConfig());

const languages = Object.keys(fixtures);
const extensionOf: Record<string, string> = {
  c: ".c", cpp: ".cpp", csharp: ".cs", go: ".go", haskell: ".hs", html: ".html", java: ".java", javascript: ".js",
  lua: ".lua", php: ".php", prolog: ".pl", python: ".py", rust: ".rs", scheme: ".scm", shell: ".sh", sql: ".sql",
  typescript: ".ts", webassembly: ".wat",
};

const widgetClass = (language: string) => customElements.get("webwriter-code-" + language) as any;
const sourceFile = (language: string, text: string, name = "program") => new File([text], name + extensionOf[language]);

describe("code widget data", function () {
  this.timeout(30000);
  afterEach(removeAll);

  describe("source files", function () {
    for (const language of languages) {
      it(`${language} declares its extension and round-trips its program`, async function () {
        await loadWidgets(language);
        const type = widgetClass(language);
        assert.equal(type.convertFrom[extensionOf[language]], "importSource");
        assert.equal(type.convertTo[extensionOf[language]], "exportSource");

        const widget = await mount(language, "placeholder");
        const [source] = fixtures[language];
        const apply = await widget.importSource(sourceFile(language, source));
        assert.equal(widget.code, "placeholder", "the widget stays unchanged before the apply function runs");
        apply();
        assert.equal(widget.code, source);

        const file: File = widget.exportSource();
        assert.isTrue(file.name.endsWith(extensionOf[language]), file.name);
        assert.equal(await file.text(), source);
      });
    }

    it("names a Java file after its public class", async function () {
      const widget = await mount("java");
      assert.equal(widget.exportSource().name, "Main.java");
      widget.code = "public class Greeter {}";
      assert.equal(widget.exportSource().name, "Greeter.java");
    });

    it("normalizes line breaks and a byte order mark, and clears locked lines", async function () {
      const widget = await mount("python", "a\nb\nc");
      widget.lockedLines = [1, 2];
      const apply = await widget.importSource(new File(["﻿x = 1\r\ny = 2\r\n"], "values.py"));
      apply();
      assert.equal(widget.code, "x = 1\ny = 2\n");
      assert.deepEqual(widget.lockedLines, []);
    });

    it("rejects a binary file and an oversized file without changing the widget", async function () {
      const widget = await mount("python", "keep = 1");
      for (const file of [
        new File([new Uint8Array([0x50, 0x4b, 0x03, 0x04, 0xff, 0xfe, 0x00])], "archive.py"),
        new File(["print(1)\0"], "nul.py"),
        new File([new Uint8Array(1_000_001).fill(97)], "large.py"),
      ]) {
        let message = "";
        try {
          await widget.importSource(file);
        } catch (error) {
          message = (error as Error).message;
        }
        assert.include(message, "not a text file", file.name);
      }
      assert.equal(widget.code, "keep = 1");
    });
  });

  describe("pre element", function () {
    it("takes the program from a pre and gives one back", async function () {
      const widget = await mount("python", "old = 1");
      const fragment = document.createDocumentFragment();
      const pre = fragment.appendChild(document.createElement("pre"));
      pre.innerHTML = "<code>print(&quot;a &lt; b&quot;)\nprint(2)</code>";
      assert.notEqual(widget.loadPre(fragment), false);
      assert.equal(widget.code, 'print("a < b")\nprint(2)');

      const out: HTMLPreElement = widget.toPre();
      assert.equal(out.localName, "pre");
      assert.equal(out.textContent, 'print("a < b")\nprint(2)');
      assert.equal(out.querySelector("code")!.className, "language-python");
      assert.isNull(out.parentNode, "the result is detached");
    });

    it("declines a fragment without a pre and keeps the program", async function () {
      const widget = await mount("python", "keep = 1");
      const fragment = document.createDocumentFragment();
      fragment.append(document.createElement("p"));
      assert.isFalse(widget.loadPre(fragment));
      assert.equal(widget.code, "keep = 1");
    });

    it("declares the pre conversion for every language", async function () {
      await loadWidgets(...languages);
      for (const language of languages) {
        assert.equal(widgetClass(language).convertFrom.pre, "loadPre", language);
        assert.equal(widgetClass(language).convertTo.pre, "toPre", language);
      }
    });
  });

  describe("signals", function () {
    const signalsOf = (widget: CodeWidget) => widget.signals as Record<string, { get(): unknown }>;

    it("publishes the output text and the failure state of the last run", async function () {
      const widget = await mount("javascript", 'console.log("hello", 2); console.error("bad");');
      assert.deepEqual(Object.keys(signalsOf(widget)).sort(), ["failed", "output"]);
      assert.equal(signalsOf(widget).output.get(), "");
      assert.isFalse(signalsOf(widget).failed.get());
      const output = signalsOf(widget).output;
      await waitForLabel(widget, "Run (0)");
      run(widget);
      await until(() => output.get() !== "", "published output");
      assert.equal(signalsOf(widget).output, output, "the signal instance stays the same");
      assert.equal(output.get(), "hello 2\nbad");
      assert.isTrue(signalsOf(widget).failed.get(), "console.error counts as an error");
    });

    it("is not failed after a clean run", async function () {
      const widget = await mount("javascript", 'console.log("fine");');
      await waitForLabel(widget, "Run (0)");
      run(widget);
      await until(() => signalsOf(widget).output.get() === "fine", "published output");
      assert.isFalse(signalsOf(widget).failed.get());
    });

    it("reports a failed run", async function () {
      const widget = await mount("javascript", "throw new Error('boom');");
      await waitForLabel(widget, "Run (0)");
      run(widget);
      await until(() => signalsOf(widget).output.get(), "published error");
      assert.include(String(signalsOf(widget).output.get()), "boom");
      assert.isTrue(signalsOf(widget).failed.get());
    });

    it("publishes the first query result of an SQL cell as a table", async function () {
      const widget = await mount("sql", "SELECT 'Ada' AS name, 42 AS score;");
      assert.isNull(signalsOf(widget).table.get());
      await waitForLabel(widget, "Run (0)");
      run(widget);
      const table = await until(() => signalsOf(widget).table.get(), "published table");
      assert.deepEqual(table, { columns: ["name", "score"], rows: [["Ada", "42"]] });
      assert.include(String(signalsOf(widget).output.get()), "Ada\t42");
    });
  });
});

mocha.run();
