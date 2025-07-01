import { html } from "@codemirror/lang-html";
import CodeHTML from "../ww-code-html";

const executeHTML = (code: string, context: CodeHTML) => {
    console.log(code, context.results);
    context.results.push(code);
    return code;
};

export const htmlModule = {
    name: "HTML",
    executionFunction: executeHTML,
    languageExtension: html(),
};
