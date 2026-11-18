import { javascriptWorker } from "../model/javascript/javascript-assets";
import { offlineRuntimeAssets } from "../model/runtime-assets";
import { javascript } from "@codemirror/lang-javascript";
import type { CSSResultGroup } from "lit";
import { customElement } from "lit/decorators.js";
import { style } from "../components/code.styles";
import { jsTemplateStyle } from "../components/code-js.styles";
import { CodeJsTemplate } from "../components/code-js-template";
import { sourceConversions } from "../model/source-files";

/**
 * Code widget for JavaScript with execution capabilities.
 *
 * Runs in a worker with an interactive console.
 *
 * Authoring: the Widget drawer controls execution, autocompletion, code visibility and execution statistics. While authoring, click the lock gutter or press Control+L (Command+L on macOS) to toggle locks on selected lines; readers may edit unlocked lines. The program and locked lines are stored in an inert JSON script (`<script type="application/json" slot="data">`, with `{"code":"...","lockedLines":[1]}`); a literal `<` should be written as `\u003c`. The authored attributes are `autorun`, `autocomplete`, `hide-code`, `disable-execution`, `showexecutiontime` and `hide-execution-count`. Older `code` and `lockedlines` attributes stay readable when the data block lacks the fields. Run results, diagnostics, counts and timings stay in memory.
 *
 * Embedding on a plain page: serve the whole `dist` directory (including `dist/chunks` and `dist/runtime`), because the entry scripts locate their workers relative to themselves. No import map is needed.
 *
 * Conversions: a `pre` element converts both ways, and a source file with the language's extension is imported or exported (the import replaces the program and clears locked lines; an export drops locked lines and run results).
 *
 * Signals: `output` (string) is the text of the last run, or its error messages; `failed` (boolean) is true after an error (in JavaScript and TypeScript also after `console.error`).
 *
 * @part editor - The code editor.
 * @part output - The area for results, console lines and tables.
 */
@customElement("webwriter-code-javascript")
export class WebwriterCodeJavascript extends CodeJsTemplate {
    static convertFrom = sourceConversions("javascript").convertFrom;
    static convertTo = sourceConversions("javascript").convertTo;

    static styles: CSSResultGroup = [style, jsTemplateStyle];

    static offlineAssets(element: Element) {
        return offlineRuntimeAssets(element, [javascriptWorker]);
    }

    constructor() {
        super("JavaScript", javascript());
    }
}
