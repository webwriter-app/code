import { goWorker, goAssets } from "../model/go/go-assets";
import { go } from "@codemirror/lang-go";
import { customElement } from "lit/decorators.js";
import { TextRuntimeCode } from "../components/text-runtime-code";
import { offlineRuntimeAssets } from "../model/runtime-assets";
import { sourceConversions } from "../model/source-files";

/**
 * Code widget for Go.
 *
 * Go 1.27.4 compiler and linker, with a subset of the standard library.
 *
 * Conversions: a `pre` element converts both ways, and a source file with the language's extension is imported or exported (the import replaces the program and clears locked lines; an export drops locked lines and run results).
 *
 * Signals: `output` (string) is the text of the last run, or its error messages; `failed` (boolean) is true after an error.
 *
 * @part editor - The code editor.
 * @part output - The area for results, console lines and tables.
 */
@customElement("webwriter-code-go")
export class WebwriterCodeGo extends TextRuntimeCode {
    static convertFrom = sourceConversions("go").convertFrom;
    static convertTo = sourceConversions("go").convertTo;

    static offlineAssets(element: Element) {
        return offlineRuntimeAssets(element, [goWorker, ...goAssets]);
    }

    constructor() {
        super("Go", go(), goWorker, goAssets);
    }
}
