import { execute } from "../model/scheme/scheme-runtime";
import { schemeWorker } from "../model/scheme/scheme-assets";
import { offlineRuntimeAssets } from "../model/runtime-assets";
import { LanguageSupport, StreamLanguage, type StreamParser } from "@codemirror/language";
import { scheme } from "@codemirror/legacy-modes/mode/scheme";
import { customElement } from "lit/decorators.js";
import { Code } from "../components/code-template";

/** Code widget for Scheme, powered by BiwaScheme. */
@customElement("webwriter-code-scheme")
export class WebwriterCodeScheme extends Code {
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
