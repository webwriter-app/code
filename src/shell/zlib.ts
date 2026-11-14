import { gunzipSync as decompress, gzipSync as compress } from "fflate";

// just-bash uses these Node names for its browser gzip and grep commands.
export const constants = { Z_BEST_COMPRESSION: 9, Z_BEST_SPEED: 1, Z_DEFAULT_COMPRESSION: -1 };
export const gzipSync = (bytes: Uint8Array, { level }: { level?: number } = {}) =>
    compress(bytes, { level: level === -1 ? undefined : (level as 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | undefined) });
export function gunzipSync(bytes: Uint8Array, options?: { maxOutputLength?: number }) {
    const size = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength).getUint32(bytes.length - 4, true);
    if (options?.maxOutputLength !== undefined && size > options.maxOutputLength) {
        throw new RangeError("Inflated output exceeds the size limit");
    }
    return decompress(bytes);
}
