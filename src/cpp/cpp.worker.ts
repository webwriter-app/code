import { Clang, LLD, setUpSysroot } from "browsercc";
import { fetchRuntimeAsset } from "../shared/runtime-assets";
import { replyWithResult } from "../shared/run-worker";
import { executeWasi, wasiText } from "../shared/wasi";

replyWithResult(
    async ({
        code,
        language,
        assets: [clangURL, linkerURL, sysrootURL],
    }: {
        code: string;
        language: string;
        assets: string[];
    }) => {
        let diagnostic = "";
        const printErr = (line: string) => {
            diagnostic += line + "\n";
        };
        const sysrootPromise = fetchRuntimeAsset(sysrootURL).then((response) => response.arrayBuffer());
        const [compilerBinary, linker, sysroot] = await Promise.all([
            fetchRuntimeAsset(clangURL).then((response) => response.arrayBuffer()),
            LLD({ thisProgram: "wasm-ld", locateFile: () => linkerURL, printErr }),
            sysrootPromise,
        ]);
        const driverName = language === "cpp" ? "clang++" : "clang";
        const name = language === "cpp" ? "main.cpp" : "main.c";
        const compilerOptions = {
            thisProgram: driverName,
            wasmBinary: compilerBinary,
            locateFile: () => clangURL,
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
