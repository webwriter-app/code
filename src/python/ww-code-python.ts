import { python } from "@codemirror/lang-python";
import { customElement } from "lit/decorators.js";
import Code from "../shared/ww-code-template";

/** Code widget for Python with execution capabilities using Pyodide. */
@customElement("webwriter-code-python")
export default class CodePython extends Code {
    static offlineImports(element: Element) {
        return Code.runtimeImports(element, "./ww-code-python.js");
    }

    constructor() {
        super({
            name: "Python",
            languageExtension: python(),
            loadRuntime: () => import("./languageModules/pythonModule"),
        });
    }
}
