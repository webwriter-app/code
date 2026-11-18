import { cppWorker, cppAssets } from "../model/cpp/cpp-assets";
import { cpp } from "@codemirror/lang-cpp";
import { customElement } from "lit/decorators.js";
import { TextRuntimeCode } from "../components/text-runtime-code";
import { offlineRuntimeAssets } from "../model/runtime-assets";
import { sourceConversions } from "../model/source-files";

/**
 * Code widget for C.
 *
 * C and C++ share one compiler (Clang) and sysroot. They target WASI, with C++ exceptions disabled in the bundled sysroot.
 *
 * Conversions: a `pre` element converts both ways, and a source file with the language's extension is imported or exported (the import replaces the program and clears locked lines; an export drops locked lines and run results).
 *
 * Signals: `output` (string) is the text of the last run, or its error messages; `failed` (boolean) is true after an error.
 *
 * @part editor - The code editor.
 * @part output - The area for results, console lines and tables.
 */
@customElement("webwriter-code-c")
export class WebwriterCodeC extends TextRuntimeCode {
    static convertFrom = sourceConversions("c").convertFrom;
    static convertTo = sourceConversions("c").convertTo;

    static offlineAssets(element: Element) {
        return offlineRuntimeAssets(element, [cppWorker, ...cppAssets]);
    }

    constructor() {
        super("C", cpp(), cppWorker, cppAssets, "c");
    }
}
