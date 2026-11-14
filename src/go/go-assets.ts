import { scriptAsset } from "../shared/runtime-assets";

export const goWorker = scriptAsset("go");
export const goAssets = ["compile.wasm", "link.wasm", "stdlib"].map((name) => ({
    path: `go/${name}.gz`,
    mimeType: "application/gzip",
}));
