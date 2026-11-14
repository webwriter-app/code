import { LanguageSupport, StreamLanguage, type StreamParser } from "@codemirror/language";
import { haskell } from "@codemirror/legacy-modes/mode/haskell";
import { customElement } from "lit/decorators.js";
import { runInWorker } from "../shared/run-worker";
import { offlineRuntimeAssets, runtimeAssetURL } from "../shared/runtime-assets";
import Code from "../shared/ww-code-template";
import { haskellCompiler, haskellPackageIndex, haskellPackages, haskellWasm, haskellWorker } from "./haskell-assets";
import type { HaskellInput } from "./haskell.worker";

const coreAssets = [haskellWorker, haskellCompiler, haskellWasm, haskellPackageIndex];

/** Code widget for Haskell, powered by MicroHs. */
@customElement("webwriter-code-haskell")
export default class CodeHaskell extends Code {
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
