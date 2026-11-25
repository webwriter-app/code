import { javascriptWorker, typescriptWorker } from "../model/javascript/javascript-assets";
import { offlineRuntimeAssets } from "../model/runtime-assets";
import { javascript } from "@codemirror/lang-javascript";
import type { CSSResultGroup } from "lit";
import { customElement } from "lit/decorators.js";
import { style } from "../components/code.styles";
import { jsTemplateStyle } from "../components/code-js.styles";
import { CodeJsTemplate } from "../components/code-js-template";
import { sourceConversions } from "../model/source-files";

/**
 * Code widget for TypeScript with compilation and execution capabilities.
 *
 * Transpiles with the TypeScript compiler, then runs the JavaScript in a worker.
 *
 * Conversions: a `pre` element converts both ways, and a source file with the language's extension is imported or exported (the import replaces the program and clears locked lines; an export drops locked lines and run results).
 *
 * Signals: `output` (string) is the text of the last run, or its error messages; `failed` (boolean) is true after an error (in JavaScript and TypeScript also after `console.error`).
 *
 * @part editor - The code editor.
 * @part output - The area for results, console lines and tables.
 */
@customElement("webwriter-code-typescript")
export class WebwriterCodeTypescript extends CodeJsTemplate {
    static convertFrom = sourceConversions("typescript").convertFrom;
    static convertTo = sourceConversions("typescript").convertTo;

    static styles: CSSResultGroup = [style, jsTemplateStyle];

    static offlineAssets(element: Element) {
        return offlineRuntimeAssets(element, [javascriptWorker, typescriptWorker]);
    }

    constructor() {
        super("TypeScript", javascript({ typescript: true }), true);
    }
}
