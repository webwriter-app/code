/// <reference types="mocha" />
import "mocha/mocha.js";
import { assert } from "chai";
import { getMochaConfig } from "@webwriter/build/test";
import { defineRuns, mount, removeAll, run, until, waitForLabel } from "./helpers";

mocha.setup(getMochaConfig());

defineRuns(["html", "javascript", "typescript", "webassembly", "sql", "lua", "prolog", "scheme", "shell"]);

describe("console output", function () {
  afterEach(removeAll);
  it("shows every line of a long log loop and clears the batch on console.clear", async function () {
    this.timeout(55000);
    const widget = await mount("javascript", 'for (let i = 0; i < 3000; i++) console.log("line", i);');
    run(widget);
    await until(() => widget.shadowRoot!.querySelectorAll(".log-line").length === 3000, "3000 log lines");
    await waitForLabel(widget, "Run (1)");
    widget.code = 'console.log("a"); console.clear(); console.log("b");';
    await widget.updateComplete;
    run(widget);
    await until(() => widget.shadowRoot!.querySelectorAll(".log-line").length === 1, "only the line after clear");
    await waitForLabel(widget, "Run (2)");
    assert.include(widget.shadowRoot!.querySelector(".log-line")!.textContent, "b");
  });
});

mocha.run();
