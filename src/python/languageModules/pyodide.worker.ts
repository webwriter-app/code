// @ts-ignore
import { loadPyodide } from "https://cdn.jsdelivr.net/pyodide/v0.26.3/full/pyodide.mjs";

let resMessage = "";
let pyodide: any = null;

async function loadPyodideAndPackages() {
    pyodide = await loadPyodide();
    pyodide.setStdout({
        batched: (msg: string) => {
            resMessage += msg + "\n";
        },
    });
}
const pyodideReadyPromise = loadPyodideAndPackages();

self.onmessage = async (event: MessageEvent) => {
    await pyodideReadyPromise;
    const { id, python, ...context } = event.data;
    for (const key of Object.keys(context)) {
        // @ts-ignore
        self[key] = context[key];
    }
    try {
        await pyodide.loadPackagesFromImports(python);
        await pyodide.runPythonAsync(python);
        self.postMessage({ results: resMessage, id });
        resMessage = "";
    } catch (error: any) {
        self.postMessage({ error: error.message, id });
    }
};
