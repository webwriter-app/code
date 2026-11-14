import { PHP, loadPHPRuntime } from "@php-wasm/universal";
// This loader is shipped by WordPress Playground alongside the Asyncify binary.
// @ts-expect-error The low-level Emscripten file has no public type declaration.
import { init, dependencyFilename, dependenciesTotalSize } from "@php-wasm/web-8-4/asyncify/php_8_4.js";
import { replyWithResult } from "../shared/run-worker";

replyWithResult(async ({ code, assets: [wasm] }: { code: string; assets: Blob[] }) => {
    const runtime = await loadPHPRuntime(
        { init, dependencyFilename, dependenciesTotalSize, phpWasmAsyncMode: "asyncify" },
        { wasmBinary: await wasm.arrayBuffer() },
    );
    const php = new PHP(runtime);
    const response = await php.run({ code: /^\s*<\?/.test(code) ? code : "<?php\n" + code });
    return response.text + response.errors;
});
