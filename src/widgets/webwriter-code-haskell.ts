import { LanguageSupport, StreamLanguage, type StreamParser } from "@codemirror/language";
import { haskell } from "@codemirror/legacy-modes/mode/haskell";
import { customElement } from "lit/decorators.js";
import { runInWorker } from "../model/run-worker";
import { offlineRuntimeAssets, runtimeAssetURL } from "../model/runtime-assets";
import { Code } from "../components/code-template";
import { haskellCompiler, haskellPackageIndex, haskellPackages, haskellWasm, haskellWorker } from "../model/haskell/haskell-assets";
import type { HaskellInput } from "../model/haskell/haskell.worker";
import { sourceConversions } from "../model/source-files";

const coreAssets = [haskellWorker, haskellCompiler, haskellWasm, haskellPackageIndex];

/**
 * Code widget for Haskell, powered by MicroHs.
 *
 * Runs a single `Main` module with `main :: IO ()`. The compiler includes MicroHs's base library and loads optional packages such as QuickCheck, Parsec and mtl on demand; offline HTML includes all 43 optional packages so readers can change imports after export. MicroHs supports extended Haskell 2010, with gaps including Template Haskell and type families. The cell captures text output; canvas and audio APIs are not available.
 *
 * Conversions: a `pre` element converts both ways, and a source file with the language's extension is imported or exported (the import replaces the program and clears locked lines; an export drops locked lines and run results).
 *
 * Signals: `output` (string) is the text of the last run, or its error messages; `failed` (boolean) is true after an error.
 *
 * @part editor - The code editor.
 * @part output - The area for results, console lines and tables.
 */
@customElement("webwriter-code-haskell")
export class WebwriterCodeHaskell extends Code {
    static convertFrom = sourceConversions("haskell").convertFrom;
    static convertTo = sourceConversions("haskell").convertTo;

    static offlineAssets(element: Element) {
        return offlineRuntimeAssets(element, [...coreAssets, ...haskellPackages]);
    }

    constructor() {
        super({
            name: "Haskell",
            languageExtension: new LanguageSupport(StreamLanguage.define(haskell as unknown as StreamParser<unknown>)),
            execute: async (code, context, signal) => {
                await context.withRuntimeAssets(coreAssets, signal, async (runtime) => {
                    const packageURLs = Object.fromEntries(
                        haskellPackages.map((asset) => [
                            asset.path.slice("haskell/".length),
                            runtimeAssetURL(asset, context.ownerDocument),
                        ]),
                    );
                    const input: HaskellInput = {
                        code,
                        compiler: runtime.asset(haskellCompiler),
                        wasm: runtime.asset(haskellWasm),
                        packageIndex: runtime.asset(haskellPackageIndex),
                        packageURLs,
                    };
                    // MicroHs's Emscripten loader uses importScripts in a worker.
                    const text = await runInWorker<string>(
                        await runtime.asset(haskellWorker).text(),
                        input,
                        signal,
                        120_000,
                        true,
                    );
                    context.results = [{ text }];
                });
            },
        });
    }
}
