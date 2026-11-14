import { LuaFactory } from "wasmoon";
import { replyWithResult } from "../shared/run-worker";

replyWithResult(async ({ code, wasm }: { code: string; wasm: Blob }) => {
    // Wasmoon initializes the Lua standard streams from the worker console.
    const output: string[] = [];
    const stdout = console.log;
    const stderr = console.error;
    console.log = console.error = (line: string) => {
        output.push(line);
    };
    const url = URL.createObjectURL(wasm);
    try {
        const lua = await new LuaFactory(url).createEngine({ enableProxy: false });
        try {
            const result = await lua.doString(code);
            lua.doStringSync("io.stdout:flush(); io.stderr:flush()");
            if (output.length === 0 && result !== undefined) return String(result);
            return output.join("\n");
        } finally {
            lua.global.close();
        }
    } finally {
        URL.revokeObjectURL(url);
        console.log = stdout;
        console.error = stderr;
    }
});
