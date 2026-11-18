import { execute } from "../model/scheme/scheme-runtime";
import { schemeWorker } from "../model/scheme/scheme-assets";
import { offlineRuntimeAssets } from "../model/runtime-assets";
import { LanguageSupport, StreamLanguage, type StreamParser } from "@codemirror/language";
import { scheme } from "@codemirror/legacy-modes/mode/scheme";
import { customElement } from "lit/decorators.js";
import { Code } from "../components/code-template";
import { sourceConversions } from "../model/source-files";

/**
 * Code widget for Scheme, powered by BiwaScheme.
 *
 * Conversions: a `pre` element converts both ways, and a source file with the language's extension is imported or exported (the import replaces the program and clears locked lines; an export drops locked lines and run results).
 *
 * Signals: `output` (string) is the text of the last run, or its error messages; `failed` (boolean) is true after an error.
 *
 * @part editor - The code editor.
 * @part output - The area for results, console lines and tables.
 */
@customElement("webwriter-code-scheme")
export class WebwriterCodeScheme extends Code {
    static convertFrom = sourceConversions("scheme").convertFrom;
    static convertTo = sourceConversions("scheme").convertTo;

    static offlineAssets(element: Element) {
        return offlineRuntimeAssets(element, [schemeWorker]);
    }

    constructor() {
        super({
            name: "Scheme",
            // Legacy modes use the same stream API but declare a separate private tabSize.
            languageExtension: new LanguageSupport(StreamLanguage.define(scheme as unknown as StreamParser<unknown>)),
            execute,
        });
    }
}
