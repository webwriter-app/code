import { runtimeAssetURL } from "../shared/runtime-assets";
import { sqlWorker, sqlWasm } from "./sql-assets";
import { runInWorker } from "../shared/run-worker";
import type { CodeRunner } from "../shared/ww-code-template";

export type SqlTable = { columns: string[]; rows: string[][]; hasMore: boolean };

export const execute: CodeRunner = async (code, context, signal) => {
    context.results = await runInWorker<SqlTable[]>(
        sqlWorker,
        context.ownerDocument,
        { code, wasm: runtimeAssetURL(sqlWasm, context.ownerDocument) },
        signal,
    );
};
