import { javascriptWorker, typescriptWorker } from "../model/javascript/javascript-assets";
import { offlineRuntimeAssets } from "../model/runtime-assets";
import { javascript } from "@codemirror/lang-javascript";
import type { CSSResultGroup } from "lit";
import { customElement } from "lit/decorators.js";
import { style } from "../components/code.styles";
import { jsTemplateStyle } from "../components/code-js.styles";
import { CodeJsTemplate } from "../components/code-js-template";

/**
 * Code widget for TypeScript with compilation and execution capabilities.
 *
 * Transpiles with the TypeScript compiler, then runs the JavaScript in a worker.
 */
@customElement("webwriter-code-typescript")
export class WebwriterCodeTypescript extends CodeJsTemplate {
    static styles: CSSResultGroup = [style, jsTemplateStyle];

    static offlineAssets(element: Element) {
        return offlineRuntimeAssets(element, [javascriptWorker, typescriptWorker]);
    }

    constructor() {
        super("TypeScript", javascript({ typescript: true }), true);
    }
}
