import { fetchRuntimeAsset } from "./runtime-assets";

/** A gzip archive with a little-endian length, JSON file index, then concatenated file bytes. */
export async function readRuntimeArchive(url: string) {
    const response = await fetchRuntimeAsset(url);
    const archive = await new Response(response.body!.pipeThrough(new DecompressionStream("gzip"))).arrayBuffer();
    const length = new DataView(archive).getUint32(0, true);
    const packages = JSON.parse(new TextDecoder().decode(new Uint8Array(archive, 4, length))) as [string, number][];
    let offset = 4 + length;
    return new Map(
        packages.map(([name, size]) => {
            const bytes = new Uint8Array(archive, offset, size);
            offset += size;
            return [name, bytes];
        }),
    );
}
