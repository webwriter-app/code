import { rustWorker, rustAssets } from "./rust-assets";
import { rust } from "@codemirror/lang-rust";
import { customElement } from "lit/decorators.js";
import TextRuntimeCode from "../shared/text-runtime";
import { offlineRuntimeAssets } from "../shared/runtime-assets";

/** Code widget for Rust. */
@customElement("webwriter-code-rust")
export default class CodeRust extends TextRuntimeCode {
    static offlineAssets(element: Element) {
        return offlineRuntimeAssets(element, [rustWorker, ...rustAssets]);
    }

    constructor() {
        super("Rust", rust(), rustWorker, rustAssets);
    }
}
