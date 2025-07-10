import { java } from "@codemirror/lang-java";
import JavaRunnerWorker from "worker:./java-runner.worker";
import JavacWorker from "worker:./javac.worker";
import { LanguageModule } from "../../shared/ww-code-template";
import { JavaDiagnostic } from "../teavm/types";

const runnerWorkerUrl = URL.createObjectURL(new Blob([JavaRunnerWorker], { type: "application/javascript" }));
let javacWorker: Worker;

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

let currentId = 0;
const callbacks: { [key: number]: (value: any) => void } = {};

export const javaModule: LanguageModule = {
    name: "Java",
    executionFunction: async (code, context) => {
        if (!javacWorker) initializeJavacWorker();

        const id = currentId++;
        const res: any = await new Promise((onSuccess) => {
            callbacks[id] = onSuccess;
            javacWorker.postMessage({
                code,
                id,
            });
        });

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
                console.log(data);
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
            });
        });
    },
    languageExtension: java(),
};
