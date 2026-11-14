import { schemeWorker } from "./scheme-assets";
import { runInWorker } from "../shared/run-worker";
import type { CodeRunner } from "../shared/ww-code-template";

export const execute: CodeRunner = async (code, context, signal) => {
    await context.withRuntimeAssets([schemeWorker], signal, async (runtime) => {
        const result = await runInWorker<string>(await runtime.asset(schemeWorker).text(), { code }, signal);
        context.results = [{ text: result }];
    });
};
