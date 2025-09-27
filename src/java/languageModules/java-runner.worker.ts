import { load } from "../teavm/compiler.wasm-runtime.js";

self.onmessage = async (event) => {
    const caches: Record<"stdout" | "stderr", string> = { stdout: "", stderr: "" };

    const { wasm, mainClass } = event.data;
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

    const mainMethod = (outputTeaVM.exports as any).main as ((args: string[]) => void) | undefined;

    if (!mainMethod) {
        self.postMessage({
            type: "terminated",
            success: false,
            error: `Error: Main method not found in class ${mainClass}, please define the main method as:\n  public static void main(String[] args)`,
        });
        return;
    }

    try {
        mainMethod([]);
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
