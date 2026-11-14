import PyodideWorker from "worker:./pyodide.worker";
import { createCodeWorker, requestWorker } from "../../shared/code-worker";
import type { CodeRunner } from "../../shared/ww-code-template";

let worker: Worker | undefined;
let queue = Promise.resolve();
const clients = new Set<AbortSignal>();
let pending: AbortController | undefined;

// Python cells in the same document share an interpreter, as before. Serialize
// runs so that globals and stdout belong to the right request.
export const execute: CodeRunner = (code, context, signal) => {
    if (!clients.has(signal)) {
        clients.add(signal);
        signal.addEventListener(
            "abort",
            () => {
                clients.delete(signal);
                if (clients.size === 0) {
                    pending?.abort();
                    worker?.terminate();
                    worker = undefined;
                }
            },
            { once: true },
        );
    }

    const run = queue.then(async () => {
        signal.throwIfAborted();
        const runtime = (worker ??= createCodeWorker(PyodideWorker));
        try {
            // When a cell leaves during a run, keep the queue blocked until that
            // run finishes unless the last client has already stopped the worker.
            const lifetime = (pending = new AbortController());
            try {
                const { error, results } = await requestWorker<{ error?: string; results?: string }>(
                    runtime,
                    { code },
                    lifetime.signal,
                );
                if (!signal.aborted) context.results = [{ text: error ?? results, color: error ? "red" : undefined }];
            } finally {
                pending = undefined;
            }
        } catch (error) {
            runtime.terminate();
            if (worker === runtime) worker = undefined;
            throw error;
        }
    });
    queue = run.catch(() => {});
    return run;
};
