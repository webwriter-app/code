// The build places Pyodide's classic loader and Emscripten glue ahead of this adapter.
import type { loadPyodide } from "pyodide";
import { pyodideRoot } from "../python-assets";

let stdout = "";
let pyodide: Awaited<ReturnType<typeof loadPyodide>> | undefined;
const networkFetch = globalThis.fetch.bind(globalThis);

self.onmessage = async ({
    data: { code, assets },
}: MessageEvent<{ code: string; assets?: { wasm: Blob; lock: Blob; stdlib: Blob } }>) => {
    try {
        if (!pyodide) {
            if (!assets) throw new Error("Python runtime assets are missing");
            const { wasm, lock, stdlib } = assets;
            const lockFileURL = URL.createObjectURL(lock);
            const stdLibURL = URL.createObjectURL(stdlib);
            globalThis.fetch = (input, init) => {
                const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
                if (url === pyodideRoot + "pyodide.asm.wasm") return Promise.resolve(new Response(wasm));
                return networkFetch(input, init);
            };
            try {
                pyodide = await (globalThis as typeof globalThis & { loadPyodide: typeof loadPyodide }).loadPyodide({
                    indexURL: pyodideRoot,
                    stdLibURL,
                    lockFileURL,
                });
            } finally {
                globalThis.fetch = networkFetch;
                URL.revokeObjectURL(lockFileURL);
                URL.revokeObjectURL(stdLibURL);
            }
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
        self.postMessage({
            error: error instanceof Error ? error.message : String(error),
            initializationError: !pyodide,
        });
    } finally {
        stdout = "";
    }
};
