import { load } from "../teavm/compiler.wasm-runtime.js";

self.onmessage = async (event) => {
    const caches: Record<"stdout" | "stderr", string> = { stdout: "", stderr: "" };

    const wasm = event.data.wasm;
    const outputTeaVM = await load(wasm, {
        installImports(o: any) {
            const makePutchar = (type: "stdout" | "stderr") => (c: number) => {
                if (c === 0x0a) {
                    self.postMessage({
                        type,
                        data: caches[type],
                    });
                    caches[type] = "";
                } else {
                    caches[type] += String.fromCharCode(c);
                }
            };

            o.teavmConsole.putcharStdout = makePutchar("stdout");
            o.teavmConsole.putcharStderr = makePutchar("stderr");
        },
    });

    try {
        (outputTeaVM.exports as any).main([]);
        self.postMessage({
            type: "terminated",
            success: true,
        });
    } catch (e) {
        self.postMessage({
            type: "terminated",
            success: false,
            error: e + "",
        });
    }
};
