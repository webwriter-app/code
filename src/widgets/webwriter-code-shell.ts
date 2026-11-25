import { shellWorker } from "../model/shell/shell-assets";
import { LanguageSupport, StreamLanguage, type StreamParser } from "@codemirror/language";
import { shell } from "@codemirror/legacy-modes/mode/shell";
import { customElement } from "lit/decorators.js";
import { TextRuntimeCode } from "../components/text-runtime-code";
import { offlineRuntimeAssets } from "../model/runtime-assets";
import { sourceConversions } from "../model/source-files";

/**
 * Code widget for Bash.
 *
 * Bash-compatible shell via just-bash, with a virtual filesystem and bundled commands.
 *
 * Conversions: a `pre` element converts both ways, and a source file with the language's extension is imported or exported (the import replaces the program and clears locked lines; an export drops locked lines and run results).
 *
 * Signals: `output` (string) is the text of the last run, or its error messages; `failed` (boolean) is true after an error.
 *
 * @part editor - The code editor.
 * @part output - The area for results, console lines and tables.
 */
@customElement("webwriter-code-shell")
export class WebwriterCodeShell extends TextRuntimeCode {
    static convertFrom = sourceConversions("shell").convertFrom;
    static convertTo = sourceConversions("shell").convertTo;

    static offlineAssets(element: Element) {
        return offlineRuntimeAssets(element, [shellWorker]);
    }

    constructor() {
        super(
            "Bash",
            new LanguageSupport(StreamLanguage.define(shell as unknown as StreamParser<unknown>)),
            shellWorker,
            [],
        );
    }
}
