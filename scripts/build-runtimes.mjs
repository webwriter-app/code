import { build, context } from "esbuild";
import { fileURLToPath } from "node:url";
import { dirname, relative } from "node:path";
import { createReadStream, createWriteStream } from "node:fs";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { createGzip } from "node:zlib";
import { copyFile, cp, mkdir, readdir, readFile, rm, stat, writeFile } from "node:fs/promises";

const targets = {
    javascript: "src/model/javascript/javascript.worker.ts",
    typescript: "src/model/javascript/typescript.worker.ts",
    "java-compiler": "src/model/java/javac.worker.ts",
    "java-runner": "src/model/java/java-runner.worker.ts",
    webassembly: "src/model/webassembly/webassembly.worker.ts",
    sql: "src/model/sql/sql.worker.ts",
    lua: "src/model/lua/lua.worker.ts",
    prolog: "src/model/prolog/prolog.worker.ts",
    scheme: "src/model/scheme/scheme.worker.ts",
    python: "src/model/python/pyodide.worker.ts",
    csharp: "src/model/csharp/csharp.worker.ts",
    cpp: "src/model/cpp/cpp.worker.ts",
    php: "src/model/php/php.worker.ts",
    go: "src/model/go/go.worker.ts",
    rust: "src/model/rust/rust.worker.ts",
    shell: "src/model/shell/shell.worker.ts",
    haskell: "src/model/haskell/haskell.worker.ts",
};

const watch = process.argv.includes("--watch");

// `@webwriter/build` builds the Mocha modules only in its dev mode, so a one-off build bundles them here.
async function buildTests() {
    const { exports } = JSON.parse(await readFile("package.json", "utf8"));
    const entryPoints = Object.entries(exports)
        .filter(([key]) => key.startsWith("./tests/"))
        .map(([, { source, default: output }]) => ({ in: source, out: output.replace(/\.\*$/, "").replace(/^\.\//, "") }));
    if (entryPoints.length)
        await build({
            entryPoints,
            outdir: ".",
            bundle: true,
            format: "esm",
            target: "es2022",
            logLevel: "warning",
            loader: { ".html": "text" },
        });
}
if (!watch) {
    // Remove obsolete hashed chunks so they never end up in a published tarball.
    await Promise.all(
        ["runtime", "widgets", "chunks"].map((directory) => rm("dist/" + directory, { recursive: true, force: true })),
    );
}
const haskellRoot = "node_modules/@live-codes/browser-haskell/dist";
const haskellPackages = JSON.parse(await readFile("src/assets/haskell-package-files.json", "utf8"));
const haskellIndex = JSON.parse(await readFile(haskellRoot + "/pkgs/index.json", "utf8"));
if (JSON.stringify(haskellPackages) !== JSON.stringify(Object.keys(haskellIndex.packages).sort())) {
    throw new Error("Update src/assets/haskell-package-files.json to match MicroHs's package index.");
}

const assets = {
    "java/compiler.wasm": "scripts/teavm/compiler.wasm",
    "java/compile-classlib-teavm.bin": "scripts/teavm/compile-classlib-teavm.bin",
    "java/runtime-classlib-teavm.bin": "scripts/teavm/runtime-classlib-teavm.bin",
    "clang/clang.wasm": "node_modules/browsercc/dist/clang.wasm",
    "clang/lld.wasm": "node_modules/browsercc/dist/lld.wasm",
    "clang/sysroot.tar": "node_modules/browsercc/dist/sysroot.tar",
    "php/php_8_4.wasm": "node_modules/@php-wasm/web-8-4/asyncify/8_4_27/php_8_4.wasm",
    "python/pyodide.asm.wasm": "node_modules/pyodide/pyodide.asm.wasm",
    "python/pyodide-lock.json": "node_modules/pyodide/pyodide-lock.json",
    "sql/sql-wasm-browser.wasm": "node_modules/sql.js/dist/sql-wasm-browser.wasm",
    "lua/glue.wasm": "node_modules/wasmoon/dist/glue.wasm",
    "haskell/index.json": haskellRoot + "/pkgs/index.json",
};
await cp("scripts/runtime-assets", "dist/runtime", { recursive: true });
async function compressAsset(path, input) {
    await mkdir(dirname(path), { recursive: true });
    await pipeline(input, createGzip({ level: 9 }), createWriteStream(path));
}
const staticAssets = Promise.all([
    ...Object.entries(assets).map(([path, input]) =>
        compressAsset("dist/runtime/" + path + ".gz", createReadStream(input)),
    ),
    // MicroHs .pkg files already use compression.
    cp(haskellRoot + "/pkgs/packages", "dist/runtime/haskell", { recursive: true }),
    mkdir("dist/runtime/python", { recursive: true }).then(() =>
        copyFile("node_modules/pyodide/python_stdlib.zip", "dist/runtime/python/python_stdlib.zip"),
    ),
]);
const options = {
    entryPoints: targets,
    outdir: "dist/runtime",
    bundle: true,
    write: false,
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
                    path: fileURLToPath(new URL("../src/model/shell/zlib.ts", import.meta.url)),
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
            name: "compressed-worker-assets",
            setup(build) {
                build.onEnd(async ({ errors, outputFiles }) => {
                    if (errors.length) return;
                    const pyodide = await Promise.all(
                        ["pyodide.asm.js", "pyodide.js"].map((file) =>
                            readFile("node_modules/pyodide/" + file, "utf8"),
                        ),
                    );
                    await Promise.all(
                        outputFiles.map(({ path, contents }) =>
                            compressAsset(
                                path + ".gz",
                                Readable.from(
                                    path.endsWith("/python.js")
                                        ? [...pyodide.map((script) => script + "\n;\n"), contents]
                                        : [contents],
                                ),
                            ),
                        ),
                    );
                    await staticAssets;
                    const root = "dist/runtime";
                    const files = (await readdir(root, { recursive: true, withFileTypes: true })).filter(
                        (entry) => entry.isFile() && entry.name !== "sizes.json",
                    );
                    const sizes = await Promise.all(
                        files.map(async (entry) => {
                            const path = entry.parentPath + "/" + entry.name;
                            return [relative(root, path).split("\\").join("/"), (await stat(path)).size];
                        }),
                    );
                    await writeFile(root + "/sizes.json", JSON.stringify(Object.fromEntries(sizes)));
                });
            },
        },
    ],
};
if (watch) {
    const workerBuild = await context(options);
    await Promise.all([staticAssets, workerBuild.rebuild()]);
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
    await Promise.all([staticAssets, build(options), buildTests()]);
}
