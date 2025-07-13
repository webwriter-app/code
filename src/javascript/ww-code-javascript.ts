import { javascript } from "@codemirror/lang-javascript";
import { localized } from "@lit/localize";
import { customElement } from "lit/decorators.js";
import { style } from "../shared/ww-code-css-single";
import { jsTemplateStyle } from "./shared/ww-code-js-css";
import CodeJsTemplate from "./shared/ww-code-js-template";

@customElement("webwriter-code-javascript")
@localized()
export default class CodeJavaScript extends CodeJsTemplate {
    static styles = [style, jsTemplateStyle] as any;

    constructor() {
        super("JavaScript", javascript());
    }

    build(code: string): string {
        return code;
    }
}
