import { phpWorker, phpAssets } from "./php-assets";
import { php } from "@codemirror/lang-php";
import { customElement } from "lit/decorators.js";
import TextRuntimeCode from "../shared/text-runtime";
import { offlineRuntimeAssets } from "../shared/runtime-assets";

/** Code widget for PHP. */
@customElement("webwriter-code-php")
export default class CodePhp extends TextRuntimeCode {
    static offlineAssets(element: Element) {
        return offlineRuntimeAssets(element, [phpWorker, ...phpAssets]);
    }

    constructor() {
        super("PHP", php(), phpWorker, phpAssets);
    }
}
