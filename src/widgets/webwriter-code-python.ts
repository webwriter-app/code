import { execute } from "../model/python/python-module";
import { offlineRuntimeAssets } from "../model/runtime-assets";
import { pythonAssets, pythonWorker } from "../model/python/python-assets";
import { python } from "@codemirror/lang-python";
import { customElement } from "lit/decorators.js";
import { Code } from "../components/code-template";

/**
 * Code widget for Python with execution capabilities using Pyodide.
 *
 * The interpreter and standard library are bundled; add-on packages downloaded by Pyodide need network access.
 */
@customElement("webwriter-code-python")
export class WebwriterCodePython extends Code {
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
