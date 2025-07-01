import "@shoelace-style/shoelace/dist/themes/light.css";
import { customElement } from "lit/decorators.js";

import Code from "../shared/ww-code-template";

import { style } from "../shared/ww-code-css-single";

// CodeMirror
import { LanguageSupport } from "@codemirror/language";

// Language Modules
import { javascriptModule } from "./languageModules/javascriptModule";

export type LanguageModule = {
    name: string;
    executionFunction: ((code: string, context: CodeJS) => any) | undefined;
    languageExtension: LanguageSupport;
};

@customElement("webwriter-code-javascript")
export default class CodeJS extends Code {
    static styles = style;

    constructor() {
        super();
        this.languages = [javascriptModule];
        this.languageModule = this.languages[0];
    }
}
