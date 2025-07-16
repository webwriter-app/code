import { wast } from "@codemirror/lang-wast";
import WebAssemblyWorker from "worker:./webassembly.worker";
import { LanguageModule } from "../../shared/ww-code-template";
import Code from "../ww-code-webassembly";

const webAssemblyWorker: Worker = new Worker(
    URL.createObjectURL(new Blob([WebAssemblyWorker], { type: "application/javascript" })),
    { type: "module" },
);

let currentId = 0;
const callbacks: { [key: number]: (value: any) => void } = {};

webAssemblyWorker.onmessage = (event) => {
    const { id, ...data } = event.data;
    const onSuccess = callbacks[id];
    delete callbacks[id];
    onSuccess(data);
};

const executeWebassembly = async (code: string, context: Code) => {
    const id = currentId++;

    const res: any = await new Promise((onSuccess) => {
        callbacks[id] = onSuccess;
        webAssemblyWorker.postMessage({
            code,
            id,
        });
    });

    if (res.error) {
        const errorMessage: string = res.error;

        const match = errorMessage.match(/file\.wasm:(\d+):(\d+): error: (.+)/);
        if (match) {
            const [, line, character, message] = match;
            let start = context.codeMirror.state.doc.line(Number(line)).from + Number(character);
            start = Math.min(start, context.codeMirror.state.doc.length);

            context.diagnostics = [
                {
                    message: message.trim(),
                    start,
                    line: Number(line),
                    character: Number(character),
                },
            ];
        } else {
            context.diagnostics = [{ message: errorMessage }];
        }
    } else {
        context.results.push({ text: String(res.result), color: "0x0000" });
    }
};

export const webassemblyModule: LanguageModule = {
    name: "WebAssembly",
    executionFunction: executeWebassembly,
    languageExtension: wast(),
};
