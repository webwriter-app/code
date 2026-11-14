import { build, context } from "esbuild";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
import { copyFile, cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";

const targets = {
    javascript: "src/javascript/shared/javascript.worker.ts",
    typescript: "src/javascript/shared/typescript.worker.ts",
    "java-compiler": "src/java/languageModules/javac.worker.ts",
    "java-runner": "src/java/languageModules/java-runner.worker.ts",
    webassembly: "src/webassembly/languageModules/webassembly.worker.ts",
    sql: "src/sql/sql.worker.ts",
    lua: "src/lua/lua.worker.ts",
    prolog: "src/prolog/prolog.worker.ts",
    scheme: "src/scheme/scheme.worker.ts",
    python: "src/python/languageModules/pyodide.worker.ts",
    csharp: "src/csharp/csharp.worker.ts",
    cpp: "src/cpp/cpp.worker.ts",
    php: "src/php/php.worker.ts",
    go: "src/go/go.worker.ts",
    rust: "src/rust/rust.worker.ts",
    shell: "src/shell/shell.worker.ts",
};

const watch = process.argv.includes("--watch");
if (!watch) {
    // Remove obsolete hashed chunks so they never end up in a published tarball.
    await Promise.all(
        ["runtime", "widgets", "chunks"].map((directory) => rm("dist/" + directory, { recursive: true, force: true })),
    );
}
await mkdir("dist/runtime/java", { recursive: true });
await Promise.all(
    ["compiler.wasm", "compile-classlib-teavm.bin", "runtime-classlib-teavm.bin"].map((file) =>
        copyFile("src/java/teavm/" + file, "dist/runtime/java/" + file),
    ),
);
await cp("assets/runtime", "dist/runtime", { recursive: true });
const options = {
    entryPoints: targets,
    outdir: "dist/runtime",
    bundle: true,
    minify: true,
    define: { "process.browser": "true" },
    platform: "browser",
    target: "es2022",
    format: "iife",
    logLevel: "info",
    legalComments: "eof",
    logOverride: { "empty-import-meta": "silent" },
    plugins: [
        {
            name: "runtime-adapters",
            setup(build) {
                build.onResolve({ filter: /^node:zlib$/ }, () => ({
                    path: fileURLToPath(new URL("../src/shell/zlib.ts", import.meta.url)),
                }));
                build.onResolve({ filter: /^worker_threads$/ }, () => ({
                    path: "worker_threads",
                    namespace: "node-only",
                }));
                build.onLoad({ filter: /.*/, namespace: "node-only" }, () => ({
                    contents: 'throw new Error("This operation requires Node.js")',
                }));
                build.onResolve({ filter: /^@php-wasm\/web-8-4\/asyncify\/php_8_4.js$/ }, () => ({
                    path: fileURLToPath(
                        new URL("../node_modules/@php-wasm/web-8-4/asyncify/php_8_4.js", import.meta.url),
                    ),
                    namespace: "php-runtime",
                }));
                build.onLoad({ filter: /.*/, namespace: "php-runtime" }, async ({ path }) => {
                    const source = await readFile(path, "utf8");
                    // The worker sets locateFile to the URL supplied by offlineAssets.
                    const contents = source
                        .replace(
                            "var ENVIRONMENT_IS_NODE = RuntimeName === 'NODE';",
                            "var ENVIRONMENT_IS_NODE = false;",
                        )
                        .replace(/ENVIRONMENT_IS_NODE\s*\? require\('events'\)\.EventEmitter\s*:/, "")
                        .replace(/new URL\('\.\/[^']+\.wasm', import.meta.url\)\s*\.href/, '"php_8_4.wasm"');
                    return { contents, loader: "js", resolveDir: dirname(path) };
                });
                build.onResolve({ filter: /^@live-codes\/rust-wasm\/src\/miri.js$/ }, () => ({
                    path: fileURLToPath(new URL("../node_modules/@live-codes/rust-wasm/src/miri.js", import.meta.url)),
                }));
            },
        },
        {
            name: "pyodide-classic-worker",
            setup(build) {
                build.onEnd(async ({ errors }) => {
                    if (errors.length) return;
                    // The classic loader uses Emscripten's global without fetching a script.
                    const python = await Promise.all(
                        [
                            "node_modules/pyodide/pyodide.asm.js",
                            "node_modules/pyodide/pyodide.js",
                            "dist/runtime/python.js",
                        ].map((file) => readFile(file, "utf8")),
                    );
                    await writeFile("dist/runtime/python.js", python.join("\n;\n"));
                });
            },
        },
    ],
};
if (watch) {
    const workerBuild = await context(options);
    await workerBuild.rebuild();
    await workerBuild.watch();
    const { spawn } = await import("node:child_process");
    const cli = new URL("../node_modules/@webwriter/build/build.js", import.meta.url);
    const editorBuild = spawn(process.execPath, [fileURLToPath(cli), "dev", "--shared-dependencies"], {
        stdio: "inherit",
    });
    const stop = () => {
        editorBuild.kill();
    };
    process.once("SIGINT", stop);
    process.once("SIGTERM", stop);
    editorBuild.on("exit", async (code) => {
        await workerBuild.dispose();
        process.exitCode = code ?? 0;
    });
} else {
    await build(options);
}
