import { scriptAsset, wasmAsset } from "../shared/runtime-assets";

export const sqlWorker = scriptAsset("sql");
export const sqlWasm = wasmAsset("https://cdn.jsdelivr.net/npm/sql.js@1.16.0/dist/sql-wasm-browser.wasm");
