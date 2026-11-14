// @ts-ignore
import WABT from "wabt";

self.onmessage = async (event) => {
    try {
        const wabtInstance = await WABT();
        const file = wabtInstance.parseWat("file.wasm", event.data.code);
        const binary = file.toBinary({});
        file.destroy();
        const wasm = new WebAssembly.Module(new Uint8Array(binary.buffer));
        const instance = new WebAssembly.Instance(wasm, {});

        if (typeof instance.exports.main != "function")
            throw new Error("No main function found in the WebAssembly module");
        const result = instance.exports.main();

        self.postMessage({
            result: result,
        });
    } catch (e) {
        self.postMessage({
            error: e instanceof Error ? e.message : String(e),
        });
    }
};
