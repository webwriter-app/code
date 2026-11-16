import { luaWorker, luaWasm } from "./lua-assets";
import { runInWorker } from "../run-worker";
import type { CodeRunner } from "../../components/code-template";

export const execute: CodeRunner = async (code, context, signal) => {
    await context.withRuntimeAssets([luaWorker, luaWasm], signal, async (runtime) => {
        const result = await runInWorker<string>(
            await runtime.asset(luaWorker).text(),
            { code, wasm: runtime.asset(luaWasm) },
            signal,
        );
        context.results = [{ text: result }];
    });
};
