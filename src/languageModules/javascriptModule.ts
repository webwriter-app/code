import { javascript } from "@codemirror/lang-javascript"

const executeJavascript = (code: string) => {
    try {
        if (eval(code) === undefined) {
            return "undefined";
        } else if (eval(code) === null) {
            return "null";
        }
        return eval(code);
    } catch (e) {
        return e;
    }
}

export const javascriptModule = {
    name: "JavaScript",
    executionFunction: executeJavascript,
    languageExtension: javascript(),
}