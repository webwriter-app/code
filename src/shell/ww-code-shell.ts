import { shellWorker } from "./shell-assets";
import { LanguageSupport, StreamLanguage, type StreamParser } from "@codemirror/language";
import { shell } from "@codemirror/legacy-modes/mode/shell";
import { customElement } from "lit/decorators.js";
import TextRuntimeCode from "../shared/text-runtime";
import { offlineRuntimeAssets } from "../shared/runtime-assets";

/** Code widget for Bash. */
@customElement("webwriter-code-shell")
export default class CodeBash extends TextRuntimeCode {
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
