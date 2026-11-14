import type { LanguageSupport } from "@codemirror/language";
import Code from "./ww-code-template";
import { runInWorker } from "./run-worker";
import { runtimeAssetURL, type RuntimeAsset } from "./runtime-assets";

export default abstract class TextRuntimeCode extends Code {
    constructor(
        name: string,
        languageExtension: LanguageSupport,
        worker: RuntimeAsset,
        assets: readonly RuntimeAsset[],
        language?: string,
    ) {
        super({
            name,
            languageExtension,
            execute: async (code, context, signal) => {
                const owner = context.ownerDocument;
                const options = { code, language, assets: assets.map((asset) => runtimeAssetURL(asset, owner)) };
                const text = await runInWorker<string>(worker, owner, options, signal, 120_000);
                context.results = [{ text }];
            },
        });
    }
}
