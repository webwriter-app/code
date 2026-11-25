import { csharpWorker, csharpAssets } from "../model/csharp/csharp-assets";
import { LanguageSupport, StreamLanguage, type StreamParser } from "@codemirror/language";
import { csharp } from "@codemirror/legacy-modes/mode/clike";
import { customElement } from "lit/decorators.js";
import { TextRuntimeCode } from "../components/text-runtime-code";
import { offlineRuntimeAssets } from "../model/runtime-assets";
import { sourceConversions } from "../model/source-files";

/**
 * Code widget for C#.
 *
 * Uses Roslyn and the browser .NET 10 framework and exposes console output.
 *
 * Conversions: a `pre` element converts both ways, and a source file with the language's extension is imported or exported (the import replaces the program and clears locked lines; an export drops locked lines and run results).
 *
 * Signals: `output` (string) is the text of the last run, or its error messages; `failed` (boolean) is true after an error.
 *
 * @part editor - The code editor.
 * @part output - The area for results, console lines and tables.
 */
@customElement("webwriter-code-csharp")
export class WebwriterCodeCsharp extends TextRuntimeCode {
    static convertFrom = sourceConversions("csharp").convertFrom;
    static convertTo = sourceConversions("csharp").convertTo;

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
