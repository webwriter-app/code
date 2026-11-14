// @ts-expect-error The pinned upstream worker implementation is JavaScript.
import { MiriRuntime } from "@live-codes/rust-wasm/src/miri.js";
import { replyWithResult } from "../shared/run-worker";
import { rustLibraries } from "./rust-assets";

async function load(asset: Blob) {
    return new Uint8Array(
        await new Response(asset.stream().pipeThrough(new DecompressionStream("gzip"))).arrayBuffer(),
    );
}

replyWithResult(async ({ code, assets }: { code: string; assets: Blob[] }) => {
    const [miriBytes, ...libraries] = await Promise.all(assets.map(load));
    const sysroot = new Map(rustLibraries.map((name, index) => [name, libraries[index]]));
    const runtime = await MiriRuntime.create({ miriBytes, sysroot });
    const { stdout, stderr, exitCode, trap } = await runtime.run(code);
    return stdout + stderr + (exitCode && !stderr ? `\n${trap ?? "Process exited with status " + exitCode}` : "");
});
