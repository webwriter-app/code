import { goWorker, goAssets } from "./go-assets";
import { go } from "@codemirror/lang-go";
import { customElement } from "lit/decorators.js";
import TextRuntimeCode from "../shared/text-runtime";
import { offlineRuntimeAssets } from "../shared/runtime-assets";

/** Code widget for Go. */
@customElement("webwriter-code-go")
export default class CodeGo extends TextRuntimeCode {
    static offlineAssets(element: Element) {
        return offlineRuntimeAssets(element, [goWorker, ...goAssets]);
    }

    constructor() {
        super("Go", go(), goWorker, goAssets);
    }
}
