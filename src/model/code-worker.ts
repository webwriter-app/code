export function createCodeWorker(source: string, classic = false) {
    const url = URL.createObjectURL(new Blob([source], { type: "application/javascript" }));
    try {
        // The bundled worker is self-contained. Chrome does not start a Blob
        // module worker from a file: document, as used by Offline HTML.
        return new Worker(url, { type: classic || location.protocol === "file:" ? "classic" : "module" });
    } finally {
        URL.revokeObjectURL(url);
    }
}

export function requestWorker<T>(worker: Worker, message: object, signal: AbortSignal) {
    signal.throwIfAborted();
    const listeners = new AbortController();
    return new Promise<T>((resolve, reject) => {
        worker.onmessage = ({ data }) => resolve(data);
        worker.onmessageerror = () => reject(new Error("Could not read the code runtime response"));
        worker.onerror = (event) => {
            event.preventDefault();
            reject(new Error(event.message || "Could not start the code runtime"));
        };
        signal.addEventListener("abort", () => reject(signal.reason), { signal: listeners.signal });
        worker.postMessage(message);
    }).finally(() => {
        listeners.abort();
        worker.onmessage = worker.onmessageerror = worker.onerror = null;
    });
}
