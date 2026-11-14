import { csharpWorker, csharpAssets } from "./csharp-assets";
import { LanguageSupport, StreamLanguage, type StreamParser } from "@codemirror/language";
import { csharp } from "@codemirror/legacy-modes/mode/clike";
import { customElement } from "lit/decorators.js";
import TextRuntimeCode from "../shared/text-runtime";
import { offlineRuntimeAssets } from "../shared/runtime-assets";

/** Code widget for C#. */
@customElement("webwriter-code-csharp")
export default class CodeCSharp extends TextRuntimeCode {
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
