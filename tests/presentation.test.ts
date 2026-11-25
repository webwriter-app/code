/// <reference types="mocha" />
import "mocha/mocha.js";
import { assert } from "chai";
import { getMochaConfig } from "@webwriter/build/test";
import { mount, part, removeAll, until, waitForLabel, type CodeWidget } from "./helpers";

mocha.setup(getMochaConfig());

const keydown = (target: Element, key: string, shiftKey = false) => {
  const event = new KeyboardEvent("keydown", { key, shiftKey, bubbles: true, cancelable: true, composed: true });
  target.dispatchEvent(event);
  return event;
};

function inside(width: number, widget: CodeWidget) {
  const wrapper = document.createElement("div");
  wrapper.style.width = `${width}px`;
  document.body.append(wrapper);
  wrapper.append(widget);
  return wrapper;
}

describe("code widget presentation", function () {
  this.timeout(30000);
  afterEach(() => {
    removeAll();
    document.querySelectorAll("[data-presentation]").forEach((element) => element.remove());
  });

  describe("keyboard", function () {
    it("Tab indents, and Escape then Tab leaves the editor", async function () {
      const widget = await mount("javascript", "let a = 1;");
      const content = part(widget, ".cm-content")!;
      content.focus();
      assert.isTrue(keydown(content, "Tab").defaultPrevented, "Tab indents");
      assert.isFalse(keydown(content, "Escape").defaultPrevented);
      assert.isFalse(keydown(content, "Tab").defaultPrevented, "Tab after Escape moves focus on");
      assert.isFalse(keydown(content, "Tab", true).defaultPrevented, "Shift+Tab after Escape moves focus back");
      keydown(content, "a");
      assert.isTrue(keydown(content, "Tab").defaultPrevented, "another key restores indenting");
    });

    it("describes how to leave the editor", async function () {
      const widget = await mount("javascript");
      assert.include(part(widget, ".cm-content")!.getAttribute("aria-description") ?? "", "Escape");
    });
  });

  describe("touch", function () {
    it("runs with a tap and offers targets of at least 24 by 24 pixels", async function () {
      const widget = await mount("javascript", "console.log('tapped');");
      for (const button of widget.shadowRoot!.querySelectorAll(".controls sl-button")) {
        const box = button.getBoundingClientRect();
        assert.isAtLeast(box.width, 24);
        assert.isAtLeast(box.height, 24);
      }
      const run = part(widget, ".run-button")!;
      const init = { pointerType: "touch", isPrimary: true, bubbles: true, composed: true };
      run.dispatchEvent(new PointerEvent("pointerdown", init));
      run.dispatchEvent(new PointerEvent("pointerup", init));
      run.click();
      await waitForLabel(widget, "Run (1)");
      await until(() => part(widget, "output")!.textContent!.includes("tapped"), "output of the tap");
    });
  });

  describe("layout", function () {
    it("keeps its width between 300 and 2100 pixels without scrolling sideways", async function () {
      const widget = await mount("javascript", "x = '" + "x".repeat(400) + "';");
      widget.remove();
      for (const width of [300, 768, 2100]) {
        const wrapper = inside(width, widget);
        wrapper.dataset.presentation = "";
        await new Promise((resolve) => requestAnimationFrame(resolve));
        assert.equal(widget.getBoundingClientRect().width, width, `width ${width}`);
        assert.isAtMost(widget.scrollWidth, widget.clientWidth, `no sideways scroll at ${width}`);
        assert.equal(getComputedStyle(widget).minWidth, "300px");
        assert.equal(getComputedStyle(widget).maxWidth, "2100px");
        wrapper.remove();
      }
    });
  });

  describe("theme", function () {
    it("follows the document's text color and font", async function () {
      const widget = await mount("javascript", "let a = 1;");
      widget.remove();
      const wrapper = inside(500, widget);
      wrapper.dataset.presentation = "";
      wrapper.style.setProperty("--ww-text-color", "rgb(10, 20, 30)");
      wrapper.style.setProperty("--ww-font-family", "Georgia, serif");
      await until(() => part(widget, ".run-control"), "controls");
      assert.equal(getComputedStyle(widget).color, "rgb(10, 20, 30)");
      assert.include(getComputedStyle(widget).fontFamily, "Georgia");
      assert.equal(getComputedStyle(part(widget, "output")!).color, "rgb(10, 20, 30)");
      assert.include(getComputedStyle(part(widget, "output")!).fontFamily, "Georgia");
    });

    it("exposes named parts", async function () {
      const widget = await mount("javascript");
      assert.equal(part(widget, ".editor")!.getAttribute("part"), "editor");
      assert.equal(part(widget, "output")!.getAttribute("part"), "output");
    });
  });

  describe("print", function () {
    it("keeps a plain copy of the program for paper and prints only that", async function () {
      const widget = await mount("javascript", "first();\nsecond();");
      const copy = part(widget, ".print-code")!;
      assert.equal(copy.textContent, "first();\nsecond();");
      assert.equal(getComputedStyle(copy).display, "none");
      const printed = widget.shadowRoot!.adoptedStyleSheets.flatMap((sheet) =>
        Array.from(sheet.cssRules).filter((rule): rule is CSSMediaRule => rule instanceof CSSMediaRule && rule.media.mediaText === "print"),
      );
      const text = printed.map((rule) => rule.cssText).join("\n");
      assert.match(text, /\.editor\s*\{\s*display: none/);
      assert.match(text, /\.print-code\s*\{\s*display: block/);
      assert.match(text, /\.controls sl-button/);
    });

    it("marks an empty result area so that paper does not show an empty box", async function () {
      const widget = await mount("javascript", "console.log('printed');");
      assert.isTrue(part(widget, "output")!.hasAttribute("data-empty"));
      part(widget, ".run-button")!.click();
      await until(() => !part(widget, "output")!.hasAttribute("data-empty"), "result");
    });
  });
});

mocha.run();
