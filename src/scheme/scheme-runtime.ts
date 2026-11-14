import { schemeWorker } from "./scheme-assets";
import { runInWorker } from "../shared/run-worker";
import type { CodeRunner } from "../shared/ww-code-template";

export const execute: CodeRunner = async (code, context, signal) => {
    context.results = [{ text: await runInWorker<string>(schemeWorker, context.ownerDocument, { code }, signal) }];
};
