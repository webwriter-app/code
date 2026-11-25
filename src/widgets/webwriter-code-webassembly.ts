import { execute } from "../model/webassembly/webassembly-module";
import { offlineRuntimeAssets } from "../model/runtime-assets";
import { webAssemblyWorker } from "../model/webassembly/webassembly-assets";
import { wast } from "@codemirror/lang-wast";
import { customElement } from "lit/decorators.js";
import { Code } from "../components/code-template";
import { sourceConversions } from "../model/source-files";

/**
 * Code widget for WebAssembly with compilation and execution capabilities.
 *
 * Assembles WebAssembly Text Format (WAT) with WABT.
 *
 * Conversions: a `pre` element converts both ways, and a source file with the language's extension is imported or exported (the import replaces the program and clears locked lines; an export drops locked lines and run results).
 *
 * Signals: `output` (string) is the text of the last run, or its error messages; `failed` (boolean) is true after an error.
 *
 * @part editor - The code editor.
 * @part output - The area for results, console lines and tables.
 */
@customElement("webwriter-code-webassembly")
export class WebwriterCodeWebassembly extends Code {
    static convertFrom = sourceConversions("webassembly").convertFrom;
    static convertTo = sourceConversions("webassembly").convertTo;

    static offlineAssets(element: Element) {
        return offlineRuntimeAssets(element, [webAssemblyWorker]);
    }

    constructor() {
        super({
            name: "WebAssembly",
            languageExtension: wast(),
            execute,
        });
    }
}
