import { scriptAsset, wasmAsset } from "../shared/runtime-assets";

const root = "https://cdn.jsdelivr.net/npm/browsercc@0.1.1/dist/";
export const cppWorker = scriptAsset("cpp");
export const cppAssets = [
    wasmAsset(root + "clang.wasm"),
    wasmAsset(root + "lld.wasm"),
    { path: root + "sysroot.tar", mimeType: "application/x-tar" },
];
