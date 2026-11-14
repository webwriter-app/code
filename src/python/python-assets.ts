import { scriptAsset, gzipAsset } from "../shared/runtime-assets";

export const pyodideRoot = "https://cdn.jsdelivr.net/pyodide/v0.29.5/full/";
export const pythonWorker = scriptAsset("python");
export const pythonAssets = [
    gzipAsset("python/pyodide.asm.wasm", "application/wasm"),
    gzipAsset("python/pyodide-lock.json", "application/json"),
    { path: "python/python_stdlib.zip", mimeType: "application/zip" },
];
