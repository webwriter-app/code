import workerSource from "worker:./sql.worker";
import { runInWorker } from "../shared/run-worker";
import type { CodeRunner } from "../shared/ww-code-template";

export type SqlTable = { columns: string[]; rows: string[][]; hasMore: boolean };

export const execute: CodeRunner = async (code, context, signal) => {
    context.results = await runInWorker<SqlTable[]>(workerSource, { code }, signal);
};
