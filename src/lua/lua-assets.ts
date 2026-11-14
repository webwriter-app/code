import { scriptAsset, wasmAsset } from "../shared/runtime-assets";

export const luaWorker = scriptAsset("lua");
export const luaWasm = wasmAsset("https://cdn.jsdelivr.net/npm/wasmoon@1.16.0/dist/glue.wasm");
