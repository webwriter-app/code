import { scriptAsset, gzipAsset } from "../runtime-assets";

export const sqlWorker = scriptAsset("sql");
export const sqlWasm = gzipAsset("sql/sql-wasm-browser.wasm", "application/wasm");
