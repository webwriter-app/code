import { readRuntimeArchive } from "../shared/runtime-archive";
import { fetchRuntimeAsset } from "../shared/runtime-assets";
import { replyWithResult } from "../shared/run-worker";
import { Directory, executeWasi, File, type Inode, PreopenDirectory, wasiText } from "../shared/wasi";

async function decompress(url: string) {
    const response = await fetchRuntimeAsset(url);
    return new Response(response.body!.pipeThrough(new DecompressionStream("gzip")));
}

replyWithResult(async ({ code, assets: [compilerURL, linkerURL, stdURL] }: { code: string; assets: string[] }) => {
    const [compiler, linker, archive] = await Promise.all([
        decompress(compilerURL)
            .then((response) => response.arrayBuffer())
            .then(WebAssembly.compile),
        decompress(linkerURL)
            .then((response) => response.arrayBuffer())
            .then(WebAssembly.compile),
        readRuntimeArchive(stdURL),
    ]);

    const encoder = new TextEncoder();
    const config: string[] = [];
    const files = new Map<string, File>();
    for (const [name, bytes] of archive) {
        const filename = files.size + ".a";
        files.set(filename, new File(bytes, { readonly: true }));
        config.push(`packagefile ${name}=/work/pkg/${filename}`);
    }

    const work = new PreopenDirectory(
        "/work",
        new Map<string, Inode>([
            ["main.go", new File(encoder.encode(code))],
            ["importcfg", new File(encoder.encode(config.join("\n") + "\n"))],
            ["pkg", new Directory(files)],
        ]),
    );
    const tmp = new PreopenDirectory("/tmp", new Map());
    const compile = await executeWasi(
        compiler,
        [
            "compile",
            "-p",
            "main",
            "-lang=go1.27",
            "-complete",
            "-pack",
            "-importcfg",
            "/work/importcfg",
            "-o",
            "/work/main.a",
            "/work/main.go",
        ],
        [work, tmp],
    );
    if (compile.status) throw new Error(compile.stderr || compile.stdout || "Go compilation failed");
    const link = await executeWasi(
        linker,
        ["link", "-s", "-w", "-importcfg", "/work/importcfg", "-o", "/work/main.wasm", "/work/main.a"],
        [work, tmp],
    );
    if (link.status) throw new Error(link.stderr || link.stdout || "Go linking failed");
    const program = work.dir.contents.get("main.wasm") as File;
    return wasiText(await executeWasi(await WebAssembly.compile(program.data.slice().buffer), ["main"]));
});
