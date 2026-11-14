import { customElement } from "lit/decorators.js";
import Code from "../shared/ww-code-template";
import { webassemblyModule } from "./languageModules/webassemblyModule";

/** Code widget for WebAssembly with compilation and execution capabilities. */
@customElement("webwriter-code-webassembly")

export default class CodeWebAssembly extends Code {
    constructor() {
        super(webassemblyModule);
    }
}
