import { execute } from "./languageModules/pythonModule";
import { offlineRuntimeAssets } from "../shared/runtime-assets";
import { pythonAssets, pythonWorker } from "./python-assets";
import { python } from "@codemirror/lang-python";
import { customElement } from "lit/decorators.js";
import Code from "../shared/ww-code-template";

/** Code widget for Python with execution capabilities using Pyodide. */
@customElement("webwriter-code-python")
export default class CodePython extends Code {
    static offlineAssets(element: Element) {
        return offlineRuntimeAssets(element, [pythonWorker, ...pythonAssets]);
    }

    constructor() {
        super({
            name: "Python",
            languageExtension: python(),
            execute,
        });
    }
}
