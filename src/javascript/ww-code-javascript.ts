import { javascriptWorker } from "./javascript-assets";
import { offlineRuntimeAssets } from "../shared/runtime-assets";
import { javascript } from "@codemirror/lang-javascript";
import { customElement } from "lit/decorators.js";
import { style } from "../shared/ww-code-css-single";
import { jsTemplateStyle } from "./shared/ww-code-js-css";
import CodeJsTemplate from "./shared/ww-code-js-template";

/** Code widget for JavaScript with execution capabilities. */
@customElement("webwriter-code-javascript")
export default class CodeJavaScript extends CodeJsTemplate {
    static styles = [style, jsTemplateStyle] as any;

    static offlineAssets(element: Element) {
        return offlineRuntimeAssets(element, [javascriptWorker]);
    }

    constructor() {
        super("JavaScript", javascript());
    }
}
