import { sqlWorker, sqlWasm } from "./sql-assets";
import { runInWorker } from "../shared/run-worker";
import type { CodeRunner } from "../shared/ww-code-template";

export type SqlTable = { columns: string[]; rows: string[][]; hasMore: boolean };

export const execute: CodeRunner = async (code, context, signal) => {
    await context.withRuntimeAssets([sqlWorker, sqlWasm], signal, async (runtime) => {
        const result = await runInWorker<SqlTable[]>(
            await runtime.asset(sqlWorker).text(),
            { code, wasm: runtime.asset(sqlWasm) },
            signal,
        );
        context.results = result;
    });
};
