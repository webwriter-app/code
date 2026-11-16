import { rustWorker, rustAssets } from "../model/rust/rust-assets";
import { rust } from "@codemirror/lang-rust";
import { customElement } from "lit/decorators.js";
import { TextRuntimeCode } from "../components/text-runtime-code";
import { offlineRuntimeAssets } from "../model/runtime-assets";

/**
 * Code widget for Rust.
 *
 * Runs rustc's Miri interpreter via LiveCodes on a single source file with the bundled standard library. Offline HTML export needs network access to fetch the toolchain from its CDN; the saved HTML runs with networking disabled.
 */
@customElement("webwriter-code-rust")
export class WebwriterCodeRust extends TextRuntimeCode {
    static offlineAssets(element: Element) {
        return offlineRuntimeAssets(element, [rustWorker, ...rustAssets]);
    }

    constructor() {
        super("Rust", rust(), rustWorker, rustAssets);
    }
}
