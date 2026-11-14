import { cppWorker, cppAssets } from "./cpp-assets";
import { cpp } from "@codemirror/lang-cpp";
import { customElement } from "lit/decorators.js";
import TextRuntimeCode from "../shared/text-runtime";
import { offlineRuntimeAssets } from "../shared/runtime-assets";

/** Code widget for C++. */
@customElement("webwriter-code-cpp")
export default class CodeCpp extends TextRuntimeCode {
    static offlineAssets(element: Element) {
        return offlineRuntimeAssets(element, [cppWorker, ...cppAssets]);
    }

    constructor() {
        super("C++", cpp(), cppWorker, cppAssets, "cpp");
    }
}
