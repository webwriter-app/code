import { rustWorker, rustAssets } from "../model/rust/rust-assets";
import { rust } from "@codemirror/lang-rust";
import { customElement } from "lit/decorators.js";
import { TextRuntimeCode } from "../components/text-runtime-code";
import { offlineRuntimeAssets } from "../model/runtime-assets";
import { sourceConversions } from "../model/source-files";

/**
 * Code widget for Rust.
 *
 * Runs rustc's Miri interpreter via LiveCodes on a single source file with the bundled standard library. Offline HTML export needs network access to fetch the toolchain from its CDN; the saved HTML runs with networking disabled.
 *
 * Conversions: a `pre` element converts both ways, and a source file with the language's extension is imported or exported (the import replaces the program and clears locked lines; an export drops locked lines and run results).
 *
 * Signals: `output` (string) is the text of the last run, or its error messages; `failed` (boolean) is true after an error.
 *
 * @part editor - The code editor.
 * @part output - The area for results, console lines and tables.
 */
@customElement("webwriter-code-rust")
export class WebwriterCodeRust extends TextRuntimeCode {
    static convertFrom = sourceConversions("rust").convertFrom;
    static convertTo = sourceConversions("rust").convertTo;

    static offlineAssets(element: Element) {
        return offlineRuntimeAssets(element, [rustWorker, ...rustAssets]);
    }

    constructor() {
        super("Rust", rust(), rustWorker, rustAssets);
    }
}
