import { csharpWorker, csharpAssets } from "../model/csharp/csharp-assets";
import { LanguageSupport, StreamLanguage, type StreamParser } from "@codemirror/language";
import { csharp } from "@codemirror/legacy-modes/mode/clike";
import { customElement } from "lit/decorators.js";
import { TextRuntimeCode } from "../components/text-runtime-code";
import { offlineRuntimeAssets } from "../model/runtime-assets";

/**
 * Code widget for C#.
 *
 * Uses Roslyn and the browser .NET 10 framework and exposes console output.
 */
@customElement("webwriter-code-csharp")
export class WebwriterCodeCsharp extends TextRuntimeCode {
    static offlineAssets(element: Element) {
        return offlineRuntimeAssets(element, [csharpWorker, ...csharpAssets]);
    }

    constructor() {
        super(
            "C#",
            new LanguageSupport(StreamLanguage.define(csharp as unknown as StreamParser<unknown>)),
            csharpWorker,
            csharpAssets,
        );
    }
}
