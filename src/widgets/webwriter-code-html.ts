import { customElement } from "lit/decorators.js";
import { Code } from "../components/code-template";
import { htmlModule } from "../model/html/html-module";
import { sourceConversions } from "../model/source-files";

/**
 * Code widget for HTML with live preview functionality.
 *
 * Renders the preview in a sandboxed iframe. External resources referenced by the authored HTML need their usual network access.
 *
 * Conversions: a `pre` element converts both ways, and a source file with the language's extension is imported or exported (the import replaces the program and clears locked lines; an export drops locked lines and run results).
 *
 * Signals: `output` (string) and `failed` (boolean) exist for every widget but stay empty and false for HTML, because the preview page is not run through the shared runner.
 *
 * @part editor - The code editor.
 * @part output - The area for results, console lines and tables.
 * @part preview - The frame that shows the rendered page.
 */
@customElement("webwriter-code-html")
export class WebwriterCodeHtml extends Code {
    static convertFrom = sourceConversions("html").convertFrom;
    static convertTo = sourceConversions("html").convertTo;

    constructor() {
        super(htmlModule);
    }
}
