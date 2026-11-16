import { shellWorker } from "../model/shell/shell-assets";
import { LanguageSupport, StreamLanguage, type StreamParser } from "@codemirror/language";
import { shell } from "@codemirror/legacy-modes/mode/shell";
import { customElement } from "lit/decorators.js";
import { TextRuntimeCode } from "../components/text-runtime-code";
import { offlineRuntimeAssets } from "../model/runtime-assets";

/**
 * Code widget for Bash.
 *
 * Bash-compatible shell via just-bash, with a virtual filesystem and bundled commands.
 */
@customElement("webwriter-code-shell")
export class WebwriterCodeShell extends TextRuntimeCode {
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
