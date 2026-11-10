import { customElement } from "lit/decorators.js";
import Code from "../shared/ww-code-template";
import { pythonModule } from "./languageModules/pythonModule";

/** Code widget for Python with execution capabilities using Pyodide. */
@customElement("webwriter-code-python")

export default class CodePython extends Code {
    constructor() {
        super(pythonModule);
    }
}
