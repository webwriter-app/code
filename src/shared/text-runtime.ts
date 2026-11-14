import type { LanguageSupport } from "@codemirror/language";
import Code from "./ww-code-template";
import { runInWorker } from "./run-worker";
import type { RuntimeAsset } from "./runtime-assets";

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
                await context.withRuntimeAssets([worker, ...assets], signal, async (runtime) => {
                    const options = { code, language, assets: assets.map(runtime.asset) };
                    const text = await runInWorker<string>(
                        await runtime.asset(worker).text(),
                        options,
                        signal,
                        120_000,
                    );
                    context.results = [{ text }];
                });
            },
        });
    }
}
