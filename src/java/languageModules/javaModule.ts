import { java } from "@codemirror/lang-java";
import JavaRunnerWorker from "worker:./java-runner.worker";
import JavacWorker from "worker:./javac.worker";
import { LanguageModule } from "../../shared/ww-code-template";
import { JavaDiagnostic } from "../teavm/types";

const runnerWorkerUrl = URL.createObjectURL(new Blob([JavaRunnerWorker], { type: "application/javascript" }));
let javacWorker: Worker;

let currentId = 0;
const callbacks: { [key: number]: (value: any) => void } = {};

export function initializeJavacWorker() {
    if (!javacWorker) {
        javacWorker = new Worker(URL.createObjectURL(new Blob([JavacWorker], { type: "application/javascript" })), {
            type: "module",
        });

        javacWorker.onmessage = (event) => {
            const { id, ...data } = event.data;
            const onSuccess = callbacks[id];
            delete callbacks[id];
            onSuccess(data);
        };
    }
}

function extractClassName(code: string): string | null {
    const classMatch = code.match(/public\s+class\s+([A-Za-z_$][A-Za-z0-9_$]*)/);
    return classMatch ? classMatch[1] : null;
}

function compileCode(code: string, mainClass: string): Promise<any> {
    return new Promise((onSuccess) => {
        callbacks[currentId] = onSuccess;
        javacWorker.postMessage({
            mainClass: mainClass,
            code,
            id: currentId++,
        });
    });
}

export const javaModule: LanguageModule = {
    name: "Java",
    executionFunction: async (code, context) => {
        if (!javacWorker) initializeJavacWorker();

        const mainClass = extractClassName(code);
        if (!mainClass) {
            context.diagnostics = [
                {
                    message:
                        "Public class not found, please define a public class like this:\n  public class <ClassName> { ... }",
                },
            ];
            return;
        }

        const res = await compileCode(code, mainClass);

        if (res.diagnostics) {
            context.diagnostics = res.diagnostics
                .filter((d: JavaDiagnostic) => d.severity === "error")
                .map((diagnostic: JavaDiagnostic) => ({
                    message: diagnostic.message,
                    start: diagnostic.startPosition,
                    line: diagnostic.lineNumber,
                    character: diagnostic.columnNumber,
                }));
            return;
        }

        const runnerWorker = new Worker(runnerWorkerUrl, { type: "module" });

        return new Promise((resolve, reject) => {
            runnerWorker.onmessage = ({ data }) => {
                if (data.type === "stdout") {
                    context.results = [...context.results, { text: data.data, color: "0x0000" }];
                } else if (data.type === "stderr") {
                    context.results = [...context.results, { text: data.data, color: "red" }];
                } else if (data.type === "terminated") {
                    if (data.error) context.results = [...context.results, { text: `${data.error}`, color: "red" }];

                    resolve({});
                }
            };

            runnerWorker.onerror = (error) => {
                reject(error);
            };

            runnerWorker.postMessage({
                wasm: res.wasm,
                mainClass,
            });
        });
    },
    languageExtension: java(),
};
