import { phpWorker, phpAssets } from "../model/php/php-assets";
import { php } from "@codemirror/lang-php";
import { customElement } from "lit/decorators.js";
import { TextRuntimeCode } from "../components/text-runtime-code";
import { offlineRuntimeAssets } from "../model/runtime-assets";
import { sourceConversions } from "../model/source-files";

/**
 * Code widget for PHP.
 *
 * Runs PHP 8.4 from WordPress Playground.
 *
 * Conversions: a `pre` element converts both ways, and a source file with the language's extension is imported or exported (the import replaces the program and clears locked lines; an export drops locked lines and run results).
 *
 * Signals: `output` (string) is the text of the last run, or its error messages; `failed` (boolean) is true after an error.
 *
 * @part editor - The code editor.
 * @part output - The area for results, console lines and tables.
 */
@customElement("webwriter-code-php")
export class WebwriterCodePhp extends TextRuntimeCode {
    static convertFrom = sourceConversions("php").convertFrom;
    static convertTo = sourceConversions("php").convertTo;

    static offlineAssets(element: Element) {
        return offlineRuntimeAssets(element, [phpWorker, ...phpAssets]);
    }

    constructor() {
        super("PHP", php(), phpWorker, phpAssets);
    }
}
