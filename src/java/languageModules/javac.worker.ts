import { load } from "../teavm/compiler.wasm-runtime.js";
import { Compiler, CompilerLibrary } from "../teavm/types.js";

let compiler: Compiler;

async function initializeCompiler({ wasm, sdk, classlib }: { wasm: Blob; sdk: Blob; classlib: Blob }) {
    if (compiler) return;

    const compilerWasmUrl = URL.createObjectURL(wasm);
    const teavm = await load(compilerWasmUrl).finally(() => URL.revokeObjectURL(compilerWasmUrl));
    let compilerLib = teavm.exports as CompilerLibrary;
    compiler = compilerLib.createCompiler();

    compiler.setSdk(new Int8Array(await sdk.arrayBuffer()));

    compiler.setTeaVMClasslib(new Int8Array(await classlib.arrayBuffer()));

    compiler.onDiagnostic((diagnostic) => {
        diagnostics.push({
            message: diagnostic.message,
            severity: diagnostic.severity,
            fileName: diagnostic.fileName,
            lineNumber: diagnostic.lineNumber,
            columnNumber: diagnostic.columnNumber,
            startPosition: diagnostic.startPosition,
            endPosition: diagnostic.endPosition,
            position: diagnostic.position,
            type: diagnostic.type,
        });
    });
}

let diagnostics: any[] = [];

self.onmessage = async (event) => {
    const { code, mainClass, assets } = event.data;
    try {
        await initializeCompiler(assets);
    } catch (error) {
        self.postMessage({ error: error instanceof Error ? error.message : String(error) });
        return;
    }

    diagnostics = [];
    compiler.clearInputClassFiles();
    compiler.clearSourceFiles();
    compiler.clearOutputFiles();

    try {
        compiler.addSourceFile(`${mainClass}.java`, code);
        if (!compiler.compile()) throw "Compilation failed!";
        if (
            !compiler.generateWebAssembly({
                outputName: "app",
                mainClass,
            })
        )
            throw "WebAssembly generation failed!";

        const wasm = compiler.getWebAssemblyOutputFile("app.wasm");
        self.postMessage({
            wasm: wasm,
        });
    } catch (e) {
        self.postMessage(diagnostics.length ? { diagnostics } : { error: e instanceof Error ? e.message : String(e) });
    }
};
