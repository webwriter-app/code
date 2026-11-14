import { customElement } from "lit/decorators.js";
import Code from "../shared/ww-code-template";
import { htmlModule } from "./languageModules/htmlModule";

/** Code widget for HTML with live preview functionality. */
@customElement("webwriter-code-html")

export default class CodeHTML extends Code {
    constructor() {
        super(htmlModule);
    }
}
