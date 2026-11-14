import { html } from "@codemirror/lang-html";
import type { CodeRunner, LanguageModule } from "../../shared/ww-code-template";

const executeHTML: CodeRunner = (code, context) => {
    context.results = [code];
};

export const htmlModule: LanguageModule = {
    name: "HTML",
    execute: executeHTML,
    languageExtension: html(),
};
