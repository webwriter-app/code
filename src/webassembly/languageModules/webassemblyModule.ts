import { webAssemblyWorker } from "../webassembly-assets";
import { Text } from "@codemirror/state";
import { createCodeWorker, requestWorker } from "../../shared/code-worker";
import type { CodeRunner } from "../../shared/ww-code-template";

export const execute: CodeRunner = async (code, context, signal) => {
    await context.withRuntimeAssets([webAssemblyWorker], signal, async (runtime) => {
        const source = await runtime.asset(webAssemblyWorker).text();
        signal.throwIfAborted();
        const worker = createCodeWorker(source);
        try {
            const { error, result } = await requestWorker<{ error?: string; result: unknown }>(
                worker,
                { code },
                signal,
            );
            if (error) {
                const match = error.match(/file\.wasm:(\d+):(\d+): error: (.+)/);
                if (match) {
                    const [, line, character, message] = match;
                    const doc = Text.of(code.split(/\r\n?|\n/));
                    const location = Number(line) <= doc.lines ? doc.line(Number(line)) : undefined;
                    context.diagnostics = [
                        {
                            message: message.trim(),
                            start: location && Math.min(location.from + Number(character) - 1, location.to),
                            line: Number(line),
                            character: Number(character),
                        },
                    ];
                } else {
                    context.diagnostics = [{ message: error }];
                }
            } else {
                context.results = [{ text: String(result) }];
            }
        } finally {
            worker.terminate();
        }
    });
};
