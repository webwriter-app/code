import { Clang, LLD, setUpSysroot } from "browsercc";
import { replyWithResult } from "../shared/run-worker";
import { executeWasi, wasiText } from "../shared/wasi";

replyWithResult(
    async ({
        code,
        language,
        assets: [clangWasm, linkerWasm, sysrootTar],
    }: {
        code: string;
        language: string;
        assets: Blob[];
    }) => {
        let diagnostic = "";
        const printErr = (line: string) => {
            diagnostic += line + "\n";
        };
        const [compilerBinary, linkerBinary, sysroot] = await Promise.all(
            [clangWasm, linkerWasm, sysrootTar].map((asset) => asset.arrayBuffer()),
        );
        // The bundled Emscripten loaders ask for a filename even with wasmBinary.
        // Returning that filename avoids their import.meta.url fallback in the worker.
        const locateFile = (name: string) => name;
        const linker = await LLD({ thisProgram: "wasm-ld", wasmBinary: linkerBinary, printErr, locateFile });
        const driverName = language === "cpp" ? "clang++" : "clang";
        const name = language === "cpp" ? "main.cpp" : "main.c";
        const compilerOptions = {
            thisProgram: driverName,
            wasmBinary: compilerBinary,
            locateFile,
            printErr,
        };
        const driver = await Clang(compilerOptions);
        driver.FS.writeFile(name, code);
        setUpSysroot(driver, sysroot);
        const status = driver.callMain([
            name,
            "-O0",
            "-fno-color-diagnostics",
            "-fno-exceptions",
            "-o",
            "main.wasm",
            "-###",
        ]);
        const parseArgs = (command: string) =>
            (
                diagnostic
                    .split("\n")
                    .find((line) => line.includes(command))
                    ?.match(/"([^"]*)"/g) ?? []
            )
                .slice(1)
                .map((arg) => arg.slice(1, -1));
        const compileArgs = parseArgs('"-cc1"');
        const linkArgs = parseArgs('wasm-ld"');
        if (status || !compileArgs.length || !linkArgs.length) throw new Error(diagnostic || "Clang driver failed");
        const object = compileArgs[compileArgs.indexOf("-o") + 1];
        diagnostic = "";
        const clang = await Clang(compilerOptions);
        clang.FS.writeFile(name, code);
        setUpSysroot(clang, sysroot);
        if (clang.callMain(compileArgs)) throw new Error(diagnostic || "Compilation failed");
        linker.FS.writeFile(object, clang.FS.readFile(object, { encoding: "binary" }));
        setUpSysroot(linker, sysroot);
        if (linker.callMain(linkArgs)) throw new Error(diagnostic || "Linking failed");
        const binary = linker.FS.readFile("main.wasm", { encoding: "binary" });
        const result = await executeWasi(await WebAssembly.compile(binary), [name]);
        return diagnostic + wasiText(result);
    },
);
