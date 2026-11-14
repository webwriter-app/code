import { fetchRuntimeAsset } from "../shared/runtime-assets";
import initSql, { type SqlValue } from "sql.js";
import { replyWithResult } from "../shared/run-worker";
import type { SqlTable } from "./sql-runtime";

replyWithResult(async ({ code, wasm }: { code: string; wasm: string }) => {
    const wasmBinary = await (await fetchRuntimeAsset(wasm)).arrayBuffer();
    const { Database } = await initSql({ wasmBinary });
    const database = new Database();

    try {
        const tables: SqlTable[] = [];
        for (const statement of database.iterateStatements(code)) {
            try {
                const columns = statement.getColumnNames();
                const rows: string[][] = [];
                let hasMore = false;
                // sql.js supports exact integers; its type declarations omit this overload.
                const get = statement.get as (params: null, options: { useBigInt: true }) => (SqlValue | bigint)[];
                while (statement.step()) {
                    if (rows.length === 500) {
                        hasMore = true;
                        break;
                    }
                    rows.push(
                        get.call(statement, null, { useBigInt: true }).map((value) => {
                            if (value === null) return "NULL";
                            if (value instanceof Uint8Array) {
                                const hex = Array.from(value.subarray(0, 64), (byte) =>
                                    byte.toString(16).padStart(2, "0"),
                                ).join("");
                                return `X'${hex}'${value.length > 64 ? "…" : ""}`;
                            }
                            return String(value);
                        }),
                    );
                }
                if (columns.length) tables.push({ columns, rows, hasMore });
            } finally {
                statement.free();
            }
        }
        return tables;
    } finally {
        database.close();
    }
});
