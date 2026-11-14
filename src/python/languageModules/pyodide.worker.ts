// The build places Pyodide's classic loader and Emscripten glue ahead of this adapter.
import type { loadPyodide } from "pyodide";
import { pyodideRoot } from "../python-assets";

let stdout = "";
let pyodide: Awaited<ReturnType<typeof loadPyodide>> | undefined;
const networkFetch = globalThis.fetch.bind(globalThis);
const offline = new Map<string, string>();

self.onmessage = async ({
    data: { code, wasm, lock, stdlib },
}: MessageEvent<{ code: string; wasm: string; lock: string; stdlib: string }>) => {
    try {
        if (!pyodide) {
            offline.set(pyodideRoot + "pyodide.asm.wasm", wasm);
            globalThis.fetch = (input, init) => {
                const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
                return networkFetch(offline.get(url) ?? input, init);
            };
            pyodide = await (globalThis as typeof globalThis & { loadPyodide: typeof loadPyodide }).loadPyodide({
                indexURL: pyodideRoot,
                stdLibURL: stdlib,
                lockFileURL: lock,
            });
            pyodide.setStdout({
                batched: (message: string) => {
                    stdout += message + "\n";
                },
            });
        }

        await pyodide.loadPackagesFromImports(code);
        await pyodide.runPythonAsync(code);
        self.postMessage({ results: stdout });
    } catch (error) {
        self.postMessage({ error: error instanceof Error ? error.message : String(error) });
    } finally {
        stdout = "";
    }
};
