import CompileClasslibBin from "../teavm/compile-classlib-teavm.bin.tiff";
import { load } from "../teavm/compiler.wasm-runtime.js";
import CompilerWasm from "../teavm/compiler.wasm.tiff";
import RuntimeClasslibBin from "../teavm/runtime-classlib-teavm.bin.tiff";
import { Compiler, CompilerLibrary } from "../teavm/types.js";

let compiler: Compiler;

async function initializeCompiler() {
    if (compiler) return;

    const compilerWasmResponse = await fetch(CompilerWasm);
    const compilerWasmUrl = URL.createObjectURL(await compilerWasmResponse.blob());
    const teavm = await load(compilerWasmUrl).finally(() => URL.revokeObjectURL(compilerWasmUrl));
    let compilerLib = teavm.exports as CompilerLibrary;
    compiler = compilerLib.createCompiler();

    const compileClasslibReponse = await fetch(CompileClasslibBin);
    compiler.setSdk(new Int8Array(await compileClasslibReponse.arrayBuffer()));

    const runtimeClasslibResponse = await fetch(RuntimeClasslibBin);
    compiler.setTeaVMClasslib(new Int8Array(await runtimeClasslibResponse.arrayBuffer()));

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
    const { code, mainClass } = event.data;
    try {
        await initializeCompiler();
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
