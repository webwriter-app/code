import "@shoelace-style/shoelace/dist/themes/light.css";
import { customElement } from "lit/decorators.js";

import Code from "../shared/ww-code-template";

import { style } from "../shared/ww-code-css-single";

// CodeMirror
import { LanguageSupport } from "@codemirror/language";

// Language Modules
import { typescriptModule } from "./languageModules/typescriptModule";

export type LanguageModule = {
    name: string;
    executionFunction: ((code: string, context: CodeHTML) => any) | undefined;
    languageExtension: LanguageSupport;
};

@customElement("webwriter-code-typescript")
export default class CodeHTML extends Code {
    static styles = style;

    constructor() {
        super();
        this.languages = [typescriptModule];
        this.languageModule = this.languages[0];
    }
}
