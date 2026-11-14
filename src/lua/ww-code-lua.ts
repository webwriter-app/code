import { execute } from "./lua-runtime";
import { luaWorker, luaWasm } from "./lua-assets";
import { offlineRuntimeAssets } from "../shared/runtime-assets";
import { LanguageSupport, StreamLanguage, type StreamParser } from "@codemirror/language";
import { lua } from "@codemirror/legacy-modes/mode/lua";
import { customElement } from "lit/decorators.js";
import Code from "../shared/ww-code-template";

/** Code widget for Lua 5.4, powered by Wasmoon. */
@customElement("webwriter-code-lua")
export default class CodeLua extends Code {
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
