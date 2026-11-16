import { execute } from "../model/webassembly/webassembly-module";
import { offlineRuntimeAssets } from "../model/runtime-assets";
import { webAssemblyWorker } from "../model/webassembly/webassembly-assets";
import { wast } from "@codemirror/lang-wast";
import { customElement } from "lit/decorators.js";
import { Code } from "../components/code-template";

/**
 * Code widget for WebAssembly with compilation and execution capabilities.
 *
 * Assembles WebAssembly Text Format (WAT) with WABT.
 */
@customElement("webwriter-code-webassembly")
export class WebwriterCodeWebassembly extends Code {
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
