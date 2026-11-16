import { phpWorker, phpAssets } from "../model/php/php-assets";
import { php } from "@codemirror/lang-php";
import { customElement } from "lit/decorators.js";
import { TextRuntimeCode } from "../components/text-runtime-code";
import { offlineRuntimeAssets } from "../model/runtime-assets";

/**
 * Code widget for PHP.
 *
 * Runs PHP 8.4 from WordPress Playground.
 */
@customElement("webwriter-code-php")
export class WebwriterCodePhp extends TextRuntimeCode {
    static offlineAssets(element: Element) {
        return offlineRuntimeAssets(element, [phpWorker, ...phpAssets]);
    }

    constructor() {
        super("PHP", php(), phpWorker, phpAssets);
    }
}
