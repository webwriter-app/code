import { javascript } from "@codemirror/lang-javascript";
import { customElement } from "lit/decorators.js";
import { style } from "../shared/ww-code-css-single";
import { jsTemplateStyle } from "./shared/ww-code-js-css";
import CodeJsTemplate from "./shared/ww-code-js-template";

/** Code widget for TypeScript with compilation and execution capabilities. */
@customElement("webwriter-code-typescript")
export default class CodeTypeScript extends CodeJsTemplate {
    static styles = [style, jsTemplateStyle] as any;

    static offlineImports(element: Element) {
        return CodeJsTemplate.runtimeImports(element, "./ww-code-typescript.js");
    }

    constructor() {
        super("TypeScript", javascript({ typescript: true }), () => import("./shared/typescript-runtime"));
    }
}
