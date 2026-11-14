import { scriptAsset, wasmAsset } from "../shared/runtime-assets";

export const pyodideRoot = "https://cdn.jsdelivr.net/pyodide/v0.26.3/full/";
export const pythonWorker = scriptAsset("python");
export const pythonAssets = [
    wasmAsset(pyodideRoot + "pyodide.asm.wasm"),
    { path: pyodideRoot + "pyodide-lock.json", mimeType: "application/json" },
    { path: pyodideRoot + "python_stdlib.zip", mimeType: "application/zip" },
];
