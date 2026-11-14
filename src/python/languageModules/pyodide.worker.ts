let stdout = "";
let pyodide: any;

self.onmessage = async ({ data: { code } }: MessageEvent<{ code: string }>) => {
    try {
        if (!pyodide) {
            // @ts-ignore This module is loaded by the browser.
            const { loadPyodide } = await import("https://cdn.jsdelivr.net/pyodide/v0.26.3/full/pyodide.mjs");
            pyodide = await loadPyodide();
            pyodide.setStdout({
                batched: (message: string) => {
                    stdout += message + "\n";
                },
            });
        }
    } catch {
        self.postMessage({ error: "Python could not load Pyodide. Running Python requires an internet connection." });
        return;
    }

    try {
        await pyodide.loadPackagesFromImports(code);
        await pyodide.runPythonAsync(code);
        self.postMessage({ results: stdout });
    } catch (error) {
        self.postMessage({ error: error instanceof Error ? error.message : String(error) });
    } finally {
        stdout = "";
    }
};
