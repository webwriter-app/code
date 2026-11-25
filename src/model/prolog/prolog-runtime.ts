import { prologWorker } from "./prolog-assets";
import { runInWorker } from "../run-worker";
import type { WebwriterCodeProlog } from "../../widgets/webwriter-code-prolog";
import type { CodeRunner } from "../../components/code-template";

export const execute: CodeRunner = async (code, context, signal) => {
    const goal = ((context as WebwriterCodeProlog).goal ?? "").trim().replace(/^\?-\s*/, "");
    if (!goal) throw new Error(context.msg("Enter a Prolog query."));
    await context.withRuntimeAssets([prologWorker], signal, async (runtime) => {
        const result = await runInWorker<{ text: string }[]>(
            await runtime.asset(prologWorker).text(),
            { code, goal },
            signal,
        );
        context.results = result;
    });
};
