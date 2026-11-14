import { scriptAsset, gzipAsset } from "../shared/runtime-assets";

export const luaWorker = scriptAsset("lua");
export const luaWasm = gzipAsset("lua/glue.wasm", "application/wasm");
