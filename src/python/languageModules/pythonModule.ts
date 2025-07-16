import { python } from "@codemirror/lang-python";
import PyodideWorker from "worker:./pyodide.worker";
import { LanguageModule } from "../../shared/ww-code-template";
import Code from "../ww-code-python";

const pyodideWorker: Worker = new Worker(
    URL.createObjectURL(new Blob([PyodideWorker], { type: "application/javascript" })),
    { type: "module" },
);

const callbacks: { [key: number]: (value: any) => void } = {};

pyodideWorker.onmessage = (event) => {
    const { id, ...data } = event.data;
    const onSuccess = callbacks[id];
    delete callbacks[id];
    onSuccess(data);
};

const asyncRun = (() => {
    let id = 0;
    return (script: any, context: any) => {
        id = (id + 1) % Number.MAX_SAFE_INTEGER;
        return new Promise((onSuccess) => {
            callbacks[id] = onSuccess;
            pyodideWorker.postMessage({
                ...context,
                python: script,
                id,
            });
        });
    };
})();

const executePython = async (code: string, context: Code) => {
    let res: any = (await asyncRun(code, null)) as object;

    if (res.error) {
        let errText: string = "File " + res.error.split("File").pop();
        context.results.push({ text: errText, color: "red" });
    } else {
        context.results.push({ text: res.results, color: "0x0000" });
    }
};

export const pythonModule: LanguageModule = {
    name: "Python",
    executionFunction: executePython,
    languageExtension: python(),
};
