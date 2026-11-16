import { goWorker, goAssets } from "../model/go/go-assets";
import { go } from "@codemirror/lang-go";
import { customElement } from "lit/decorators.js";
import { TextRuntimeCode } from "../components/text-runtime-code";
import { offlineRuntimeAssets } from "../model/runtime-assets";

/**
 * Code widget for Go.
 *
 * Go 1.27.4 compiler and linker, with a subset of the standard library.
 */
@customElement("webwriter-code-go")
export class WebwriterCodeGo extends TextRuntimeCode {
    static offlineAssets(element: Element) {
        return offlineRuntimeAssets(element, [goWorker, ...goAssets]);
    }

    constructor() {
        super("Go", go(), goWorker, goAssets);
    }
}
