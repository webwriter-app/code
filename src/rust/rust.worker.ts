// @ts-expect-error The pinned upstream worker implementation is JavaScript.
import { MiriRuntime } from "@live-codes/rust-wasm/src/miri.js";
import { fetchRuntimeAsset } from "../shared/runtime-assets";
import { replyWithResult } from "../shared/run-worker";
import { rustLibraries } from "./rust-assets";

async function load(url: string) {
    const response = await fetchRuntimeAsset(url);
    return new Uint8Array(
        await new Response(response.body!.pipeThrough(new DecompressionStream("gzip"))).arrayBuffer(),
    );
}

replyWithResult(async ({ code, assets }: { code: string; assets: string[] }) => {
    const [miriBytes, ...libraries] = await Promise.all(assets.map(load));
    const sysroot = new Map(rustLibraries.map((name, index) => [name, libraries[index]]));
    const runtime = await MiriRuntime.create({ miriBytes, sysroot });
    const { stdout, stderr, exitCode, trap } = await runtime.run(code);
    return stdout + stderr + (exitCode && !stderr ? `\n${trap ?? "Process exited with status " + exitCode}` : "");
});
