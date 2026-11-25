import { assert } from "chai";

export interface CodeWidget extends HTMLElement {
  code: string;
  lockedLines: number[];
  updateComplete: Promise<boolean>;
  options: Record<string, any>;
  actions: Record<string, any>;
  optionGroups: Record<string, any>;
  [property: string]: any;
}

export const fixtures: Record<string, [source: string, output: string]> = {
  html: ["<p>HTML output</p>", "HTML output"],
  javascript: ['console.log("JS output", {nested: {value: 42}});', "JS output"],
  typescript: ["const count: number = 42; console.log(count);", "42"],
  java: [
    'public class Main { public static void main(String[] args) { System.out.println("Java output"); } }',
    "Java output",
  ],
  webassembly: ['(module (func (export "main") (result i32) i32.const 27))', "27"],
  python: ['print("Python output")', "Python output"],
  sql: ["SELECT 'Ada' AS name, 42 AS score;", "Ada"],
  lua: ['print("Lua output")', "Lua output"],
  prolog: ["parent(ada, grace).\nparent(ada, alan).", "Who = grace"],
  scheme: ["(map (lambda (x) (* x x)) '(1 2 3))", "(1 4 9)"],
  shell: ['printf "Bash output\\n" | grep Bash', "Bash output"],
  csharp: ['using System; Console.WriteLine("C# output");', "C# output"],
  go: ['package main\nimport "fmt"\nfunc main() { fmt.Println("Go output") }', "Go output"],
  c: ['#include <stdio.h>\nint main(void) { puts("C output"); }', "C output"],
  cpp: ['#include <iostream>\nint main() { std::cout << "C++ output" << std::endl; }', "C++ output"],
  php: ['<?php echo "PHP output";', "PHP output"],
  rust: ['fn main() { println!("Rust output"); }', "Rust output"],
  haskell: ['main :: IO ()\nmain = putStrLn "Haskell output"', "Haskell output"],
};

/** Requests for execution runtimes. */
export const runtime = /\/dist\/runtime\/|\.(?:wasm|tar|gz)(?:$|\?)/;

const loaded = new Set<string>();

/** The widgets find their runtime files through the module script that loaded them, so they are loaded from the build. */
export async function loadWidgets(...languages: string[]) {
  await Promise.all(
    languages.map(async (language) => {
      const tag = "webwriter-code-" + language;
      if (customElements.get(tag)) return;
      if (!loaded.has(tag)) {
        loaded.add(tag);
        const script = document.createElement("script");
        script.type = "module";
        script.src = `/dist/widgets/${tag}.js`;
        document.head.append(script);
      }
      await customElements.whenDefined(tag);
    }),
  );
}

export function cell(language: string, code: string, attributes = "") {
  const data = JSON.stringify({ code }).replace(/</g, "\\u003c");
  return `<webwriter-code-${language} ${attributes}><script type="application/json" slot="data">${data}</script></webwriter-code-${language}>`;
}

export async function until<T>(read: () => T | undefined | null | false, what: string, timeout = 15000): Promise<T> {
  const end = Date.now() + timeout;
  for (;;) {
    let value: T | undefined | null | false;
    try {
      value = read();
    } catch {
      value = undefined;
    }
    if (value) return value;
    if (Date.now() > end) throw new Error(`timed out waiting for ${what}`);
    await new Promise((resolve) => setTimeout(resolve, 20));
  }
}

export function mountHTML(markup: string) {
  const template = document.createElement("template");
  template.innerHTML = markup;
  const element = template.content.firstElementChild as CodeWidget;
  document.body.append(element);
  return element;
}

/** Mounts a language widget with its authored data block and waits until its editor is there. */
export async function mount(language: string, code = fixtures[language][0], attributes = "") {
  await loadWidgets(language);
  const widget = mountHTML(cell(language, code, attributes));
  await until(() => widget.shadowRoot?.querySelector(".cm-content"), language + " editor");
  return widget;
}

export const part = <T extends Element = HTMLElement>(widget: Element, selector: string) =>
  widget.shadowRoot?.querySelector<T>(selector) ?? null;

export const editorText = (widget: Element) => part(widget, ".cm-content")?.innerText ?? "";

export const runButton = (widget: Element) => part(widget, ".run-button");

/** The visible label of the Run button. */
export const label = (widget: Element) => runButton(widget)?.textContent?.replace(/\s+/g, " ").trim() ?? "";

export const outputText = (widget: Element) => part(widget, "output")?.textContent?.replace(/\s+/g, " ").trim() ?? "";

export const waitForLabel = (widget: Element, expected: string | RegExp, timeout?: number) =>
  until(
    () => {
      const current = label(widget);
      return typeof expected === "string" ? current === expected : expected.test(current);
    },
    `Run button label ${expected}`,
    timeout,
  );

export const waitForOutput = (widget: Element, expected: string | RegExp, timeout = 50000) =>
  until(
    () => {
      const text = outputText(widget);
      return typeof expected === "string" ? text.includes(expected) : expected.test(text);
    },
    `output ${expected}`,
    timeout,
  ).catch((error) => {
    throw new Error(`${error.message}; output was: ${outputText(widget)}`);
  });

export const run = (widget: Element) => runButton(widget)!.click();

export const resourceURLs = () => performance.getEntriesByType("resource").map((entry) => entry.name);

export function removeAll() {
  for (const element of Array.from(document.body.children)) if (element.localName.startsWith("webwriter-")) element.remove();
  document.head.querySelector("#webwriter-offline-assets")?.remove();
  document.designMode = "off";
}

/** Replaces window.fetch for the duration of a test and restores it afterwards. */
export function patchFetch(replacement: (original: typeof fetch) => typeof fetch) {
  const original = window.fetch;
  window.fetch = replacement(original.bind(window));
  return () => {
    window.fetch = original;
  };
}

export async function toDataURL(response: Response, mimeType: string) {
  const bytes = new Uint8Array(await response.arrayBuffer());
  let binary = "";
  for (let i = 0; i < bytes.length; i += 0x8000) binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return `data:${mimeType};base64,${btoa(binary)}`;
}

export function installOfflineManifest(assets: Record<string, string>) {
  const manifest = document.createElement("script");
  manifest.id = "webwriter-offline-assets";
  manifest.type = "application/json";
  manifest.textContent = JSON.stringify(assets);
  document.head.append(manifest);
}

/** Defines one test per language: the first Run loads the runtime and shows the output. */
export function defineRuns(languages: string[]) {
  describe("first Run", function () {
    afterEach(removeAll);
    for (const language of languages) {
      const [, output] = fixtures[language];
      // The Rust toolchain is fetched from the network at Run, which the test run does not have.
      const define = language === "rust" ? it.skip : it;
      define(`${language} loads the runtime and displays output`, async function () {
        this.timeout(55000);
        const widget = await mount(language, undefined, language === "prolog" ? 'goal="parent(ada, Who)."' : "");
        const before = resourceURLs().length;
        await waitForLabel(widget, "Run (0)");
        run(widget);
        if (language === "html") {
          const frame = await until(() => part<HTMLIFrameElement>(widget, "iframe"), "preview frame");
          // The preview is sandboxed without allow-same-origin, so its document is read from its srcdoc.
          await until(() => frame.srcdoc.includes(output), "preview content");
        } else {
          await waitForOutput(widget, output);
          assert.isTrue(resourceURLs().slice(before).some((url) => runtime.test(url)), language);
        }
        if (language === "javascript") {
          const toggle = () => part(widget, "button.log-clickable");
          const expanded = await until(() => toggle(), "expandable log value");
          assert.equal(expanded.getAttribute("aria-expanded"), "false");
          expanded.click();
          await until(() => toggle()!.getAttribute("aria-expanded") === "true", "expanded log value");
          await until(() => outputText(widget).includes("value: 42"), "nested value");
        }
      });
    }
  });
}
