import { schemeWorker } from "./scheme-assets";
import { runInWorker } from "../run-worker";
import type { CodeRunner } from "../../components/code-template";

export const execute: CodeRunner = async (code, context, signal) => {
    await context.withRuntimeAssets([schemeWorker], signal, async (runtime) => {
        const result = await runInWorker<string>(await runtime.asset(schemeWorker).text(), { code }, signal);
        context.results = [{ text: result }];
    });
};
