import workerSource from "worker:./scheme.worker";
import { runInWorker } from "../shared/run-worker";
import type { CodeRunner } from "../shared/ww-code-template";

export const execute: CodeRunner = async (code, context, signal) => {
    context.results = [{ text: await runInWorker<string>(workerSource, { code }, signal) }];
};
