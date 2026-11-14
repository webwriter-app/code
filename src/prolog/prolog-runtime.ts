import workerSource from "worker:./prolog.worker";
import { runInWorker } from "../shared/run-worker";
import type CodeProlog from "./ww-code-prolog";
import type { CodeRunner } from "../shared/ww-code-template";

export const execute: CodeRunner = async (code, context, signal) => {
    const goal = ((context as CodeProlog).goal ?? "").trim().replace(/^\?-\s*/, "");
    if (!goal) throw new Error(context.msg("Enter a Prolog query."));
    context.results = await runInWorker<{ text: string }[]>(workerSource, { code, goal }, signal);
};
