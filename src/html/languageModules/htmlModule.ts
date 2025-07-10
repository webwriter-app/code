import { html } from "@codemirror/lang-html";
import { LanguageModule } from "../../shared/ww-code-template";
import CodeHTML from "../ww-code-html";

const executeHTML = (code: string, context: CodeHTML) => {
    context.results = [code];
    return code;
};

export const htmlModule: LanguageModule = {
    name: "HTML",
    executionFunction: executeHTML,
    languageExtension: html(),
};
