import { runtimeAssetURL } from "../shared/runtime-assets";
import { luaWorker, luaWasm } from "./lua-assets";
import { runInWorker } from "../shared/run-worker";
import type { CodeRunner } from "../shared/ww-code-template";

export const execute: CodeRunner = async (code, context, signal) => {
    context.results = [
        {
            text: await runInWorker<string>(
                luaWorker,
                context.ownerDocument,
                { code, wasm: runtimeAssetURL(luaWasm, context.ownerDocument) },
                signal,
            ),
        },
    ];
};
