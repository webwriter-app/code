import JavaRunnerWorker from "worker:./java-runner.worker";
import JavacWorker from "worker:./javac.worker";
import { createCodeWorker, requestWorker } from "../../shared/code-worker";
import type { CodeRunner } from "../../shared/ww-code-template";
import type { JavaDiagnostic } from "../teavm/types";

export const execute: CodeRunner = async (code, context, signal) => {
    const mainClass = code.match(/public\s+class\s+([A-Za-z_$][A-Za-z0-9_$]*)/)?.[1];
    if (!mainClass) {
        context.diagnostics = [
            {
                message:
                    "Public class not found, please define a public class like this:\n  public class <ClassName> { ... }",
            },
        ];
        return;
    }

    const compiler = createCodeWorker(JavacWorker);
    let wasm: Uint8Array;
    try {
        const response = await requestWorker<{ wasm: Uint8Array; diagnostics?: JavaDiagnostic[]; error?: string }>(
            compiler,
            { code, mainClass },
            signal,
        );
        if (response.error) throw new Error(response.error);
        if (response.diagnostics) {
            context.diagnostics = response.diagnostics
                .filter((diagnostic) => diagnostic.severity === "error")
                .map((diagnostic) => ({
                    message: diagnostic.message,
                    start: diagnostic.startPosition,
                    line: diagnostic.lineNumber,
                    character: diagnostic.columnNumber,
                }));
            return;
        }
        wasm = response.wasm;
    } finally {
        compiler.terminate();
    }

    signal.throwIfAborted();
    const worker = createCodeWorker(JavaRunnerWorker);
    const listeners = new AbortController();
    try {
        await new Promise<void>((resolve, reject) => {
            worker.onmessage = ({ data }) => {
                if (data.type === "stdout" || data.type === "stderr") {
                    context.results = [
                        ...context.results,
                        { text: data.data, color: data.type === "stderr" ? "red" : undefined },
                    ];
                } else if (data.type === "terminated") {
                    if (data.error) context.results = [...context.results, { text: data.error, color: "red" }];
                    resolve();
                }
            };
            worker.onerror = (event) => {
                event.preventDefault();
                reject(new Error(event.message || "Could not start the Java runtime"));
            };
            worker.onmessageerror = () => reject(new Error("Could not read the Java runtime response"));
            signal.addEventListener("abort", () => reject(signal.reason), { signal: listeners.signal });
            worker.postMessage({ wasm, mainClass });
        });
    } finally {
        listeners.abort();
        worker.terminate();
    }
};
