import "@shoelace-style/shoelace/dist/themes/light.css";
import { customElement } from "lit/decorators.js";
import { PropertyValueMap } from "lit";

import Code from "../shared/ww-code-template";

import { style } from "../shared/ww-code-css-single";

// CodeMirror
import { LanguageSupport } from "@codemirror/language";

// Language Modules
import { webassemblyModule } from "./languageModules/webassemblyModule";

export type LanguageModule = {
    name: string;
    executionFunction: ((code: string, context: CodeHTML) => any) | undefined;
    languageExtension: LanguageSupport;
};

@customElement("webwriter-code-webassembly")
export default class CodeHTML extends Code {
    static styles = style;

    constructor() {
        super();
        this.languages = [webassemblyModule];
        this.languageModule = this.languages[0];
    }
}
