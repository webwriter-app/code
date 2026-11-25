import { execute } from "../model/python/python-module";
import { offlineRuntimeAssets } from "../model/runtime-assets";
import { pythonAssets, pythonWorker } from "../model/python/python-assets";
import { python } from "@codemirror/lang-python";
import { customElement } from "lit/decorators.js";
import { Code } from "../components/code-template";
import { sourceConversions } from "../model/source-files";

/**
 * Code widget for Python with execution capabilities using Pyodide.
 *
 * The interpreter and standard library are bundled; add-on packages downloaded by Pyodide need network access.
 *
 * Conversions: a `pre` element converts both ways, and a source file with the language's extension is imported or exported (the import replaces the program and clears locked lines; an export drops locked lines and run results).
 *
 * Signals: `output` (string) is the text of the last run, or its error messages; `failed` (boolean) is true after an error.
 *
 * @part editor - The code editor.
 * @part output - The area for results, console lines and tables.
 */
@customElement("webwriter-code-python")
export class WebwriterCodePython extends Code {
    static convertFrom = sourceConversions("python").convertFrom;
    static convertTo = sourceConversions("python").convertTo;

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
