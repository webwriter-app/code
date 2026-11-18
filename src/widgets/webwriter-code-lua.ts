import { execute } from "../model/lua/lua-runtime";
import { luaWorker, luaWasm } from "../model/lua/lua-assets";
import { offlineRuntimeAssets } from "../model/runtime-assets";
import { LanguageSupport, StreamLanguage, type StreamParser } from "@codemirror/language";
import { lua } from "@codemirror/legacy-modes/mode/lua";
import { customElement } from "lit/decorators.js";
import { Code } from "../components/code-template";
import { sourceConversions } from "../model/source-files";

/**
 * Code widget for Lua 5.4, powered by Wasmoon.
 *
 * Conversions: a `pre` element converts both ways, and a source file with the language's extension is imported or exported (the import replaces the program and clears locked lines; an export drops locked lines and run results).
 *
 * Signals: `output` (string) is the text of the last run, or its error messages; `failed` (boolean) is true after an error.
 *
 * @part editor - The code editor.
 * @part output - The area for results, console lines and tables.
 */
@customElement("webwriter-code-lua")
export class WebwriterCodeLua extends Code {
    static convertFrom = sourceConversions("lua").convertFrom;
    static convertTo = sourceConversions("lua").convertTo;

    static offlineAssets(element: Element) {
        return offlineRuntimeAssets(element, [luaWorker, luaWasm]);
    }

    constructor() {
        super({
            name: "Lua",
            // Legacy modes use the same stream API but declare a separate private tabSize.
            languageExtension: new LanguageSupport(StreamLanguage.define(lua as unknown as StreamParser<unknown>)),
            execute,
        });
    }
}
