// @ts-ignore
import WABT from "wabt";

let wabtInstance!: Awaited<ReturnType<typeof WABT>>;
let loadWabtPromise = loadWabt();

async function loadWabt() {
    wabtInstance = await WABT();
}

self.onmessage = async (event) => {
    await loadWabtPromise;

    try {
        const file = wabtInstance.parseWat("file.wasm", event.data.code);
        const binary = file.toBinary({ log: true });
        const wasm = new WebAssembly.Module(binary.buffer);
        const instance = new WebAssembly.Instance(wasm, {});

        if (typeof instance.exports.main != "function")
            throw new Error("No main function found in the WebAssembly module");
        const result = instance.exports.main();

        self.postMessage({
            result: result,
            id: event.data.id,
        });
    } catch (e) {
        self.postMessage({
            error: e instanceof Error ? e.message : String(e),
            id: event.data.id,
        });
    }
};
