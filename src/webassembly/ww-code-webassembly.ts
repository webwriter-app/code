import { wast } from "@codemirror/lang-wast";
import { customElement } from "lit/decorators.js";
import Code from "../shared/ww-code-template";

/** Code widget for WebAssembly with compilation and execution capabilities. */
@customElement("webwriter-code-webassembly")
export default class CodeWebAssembly extends Code {
    static offlineImports(element: Element) {
        return Code.runtimeImports(element, "./ww-code-webassembly.js");
    }

    constructor() {
        super({
            name: "WebAssembly",
            languageExtension: wast(),
            loadRuntime: () => import("./languageModules/webassemblyModule"),
        });
    }
}
