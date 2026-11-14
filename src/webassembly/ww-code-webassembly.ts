import { execute } from "./languageModules/webassemblyModule";
import { offlineRuntimeAssets } from "../shared/runtime-assets";
import { webAssemblyWorker } from "./webassembly-assets";
import { wast } from "@codemirror/lang-wast";
import { customElement } from "lit/decorators.js";
import Code from "../shared/ww-code-template";

/** Code widget for WebAssembly with compilation and execution capabilities. */
@customElement("webwriter-code-webassembly")
export default class CodeWebAssembly extends Code {
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
