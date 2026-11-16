import { customElement } from "lit/decorators.js";
import { Code } from "../components/code-template";
import { htmlModule } from "../model/html/html-module";

/**
 * Code widget for HTML with live preview functionality.
 *
 * Renders the preview in a sandboxed iframe. External resources referenced by the authored HTML need their usual network access.
 */
@customElement("webwriter-code-html")
export class WebwriterCodeHtml extends Code {
    constructor() {
        super(htmlModule);
    }
}
