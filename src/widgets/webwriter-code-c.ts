import { cppWorker, cppAssets } from "../model/cpp/cpp-assets";
import { cpp } from "@codemirror/lang-cpp";
import { customElement } from "lit/decorators.js";
import { TextRuntimeCode } from "../components/text-runtime-code";
import { offlineRuntimeAssets } from "../model/runtime-assets";

/**
 * Code widget for C.
 *
 * C and C++ share one compiler (Clang) and sysroot. They target WASI, with C++ exceptions disabled in the bundled sysroot.
 */
@customElement("webwriter-code-c")
export class WebwriterCodeC extends TextRuntimeCode {
    static offlineAssets(element: Element) {
        return offlineRuntimeAssets(element, [cppWorker, ...cppAssets]);
    }

    constructor() {
        super("C", cpp(), cppWorker, cppAssets, "c");
    }
}
