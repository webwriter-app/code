/// <reference types="mocha" />
import "mocha/mocha.js";
import { assert } from "chai";
import { getMochaConfig } from "@webwriter/build/test";
import { mount, part, removeAll, run, until, type CodeWidget } from "./helpers";

mocha.setup(getMochaConfig());

describe("HTML sandbox preview", function () {
  this.timeout(15000);
  let messages: MessageEvent[];
  let listener: AbortController;
  let token: string;

  beforeEach(() => {
    token = Math.random().toString(36).slice(2);
    messages = [];
    listener = new AbortController();
    window.addEventListener("message", (event) => {
      if (event.origin === "null" && event.data?.token === token) messages.push(event);
    }, { signal: listener.signal });
  });

  afterEach(() => {
    listener.abort();
    removeAll();
  });

  const frame = (widget: CodeWidget) => part<HTMLIFrameElement>(widget, "iframe")!;
  const report = async (widget: CodeWidget, after = 0) => until(
    () => messages.slice(after).find((event) => event.source === frame(widget)?.contentWindow)?.data,
    "message from the isolated HTML preview",
  );
  const source = () => `<!doctype html><html lang="en"><head><title>Keep me</title></head><body>
<!-- keep this comment --><p id="greeting">Offline preview</p><custom-item data-value="kept"></custom-item>
<script type="application/json" id="data">{"kept":true}</script>
<script>globalThis.order = ["classic"]; globalThis.runId = Math.random();</script>
<script src="data:text/javascript,globalThis.order.push('external')"></script>
<script type="module">globalThis.order.push("module");</script>
<script>
let isolated = false;
try { parent.document.body; } catch { isolated = true; }
parent.postMessage({token:${JSON.stringify(token)}, runId, isolated, order:order.join(","),
  text:document.getElementById("greeting").textContent, title:document.title,
  kept:JSON.parse(document.getElementById("data").textContent).kept && !!document.querySelector("custom-item[data-value=kept]")}, "*");
</script></body></html>`;

  it("runs classic, embedded external and module scripts in order with an opaque origin", async () => {
    const widget = await mount("html", source());
    run(widget);
    const result = await report(widget);
    assert.equal(frame(widget).getAttribute("sandbox"), "allow-scripts");
    assert.isNull(frame(widget).contentDocument);
    assert.isFalse(frame(widget).srcdoc.includes("nonce="), "the preview never borrows a host nonce");
    assert.isTrue(result.isolated);
    assert.isTrue(result.kept);
    assert.equal(result.order, "classic,external,module");
    assert.equal(result.title, "Keep me");
    assert.equal(result.text, "Offline preview");
  });

  it("creates a fresh frame for identical source but keeps it through settings and counter changes", async () => {
    const widget = await mount("html", source());
    run(widget);
    const first = await report(widget);
    const previous = frame(widget);
    widget.showExecutionTime = true;
    widget.resetExecutionCount();
    await widget.updateComplete;
    assert.strictEqual(frame(widget), previous);
    assert.equal(messages.length, 1, "presentation changes do not run the program");
    const after = messages.length;
    run(widget);
    const second = await report(widget, after);
    assert.notStrictEqual(frame(widget), previous);
    assert.isFalse(previous.isConnected);
    assert.notEqual(second.runId, first.runId);
  });

  it("preserves the original data and exports source without preview artifacts", async () => {
    const original = source();
    const widget = await mount("html", original);
    widget.append(document.createComment("unrelated authored content"));
    const before = widget.outerHTML;
    run(widget);
    await report(widget);
    assert.equal(widget.code, original);
    assert.equal(widget.outerHTML, before);
    assert.equal(await widget.exportSource().text(), original);
    assert.isNull(widget.querySelector("iframe"), "preview stays in shadow DOM");
    const copy = widget.cloneNode(true) as CodeWidget;
    widget.remove();
    document.body.append(copy);
    await until(() => part(copy, ".cm-content"), "restored editor");
    const after = messages.length;
    run(copy);
    assert.equal((await report(copy, after)).text, "Offline preview");
    assert.equal(copy.code, original);
  });

  it("reads legacy code and subsequent authored data changes without storing the runner", async () => {
    const widget = await mount("html", "");
    widget.querySelector('script[slot="data"]')!.remove();
    const original = source();
    widget.setAttribute("code", original);
    await until(() => widget.code === original, "legacy source");
    run(widget);
    await report(widget);
    assert.equal(widget.getAttribute("code"), original);
    const data = document.createElement("script");
    data.type = "application/json";
    data.slot = "data";
    const changed = original.replace("Offline preview", "Updated source");
    data.textContent = JSON.stringify({ code: changed, lockedLines: [1] });
    widget.append(data);
    await until(() => widget.code === changed, "authored data update");
    const after = messages.length;
    run(widget);
    assert.equal((await report(widget, after)).text, "Updated source");
    assert.equal(JSON.parse(data.textContent!).code, changed);
    assert.deepEqual(widget.lockedLines, [1]);
  });

  it("disposes the old execution realm when output is cleared", async () => {
    const widget = await mount("html", `<script>
setInterval(() => parent.postMessage({token:${JSON.stringify(token)}}, "*"), 20);
</script>`);
    run(widget);
    await report(widget);
    const previous = frame(widget);
    Array.from(widget.shadowRoot!.querySelectorAll<HTMLElement>("sl-button"))
      .find((button) => button.textContent?.trim() === "Clear Output")!.click();
    await widget.updateComplete;
    assert.isFalse(previous.isConnected);
    // Allow already queued messages to arrive before checking realm disposal.
    await new Promise((resolve) => setTimeout(resolve, 100));
    const count = messages.length;
    await new Promise((resolve) => setTimeout(resolve, 100));
    assert.equal(messages.length, count);
  });
});

mocha.run();
