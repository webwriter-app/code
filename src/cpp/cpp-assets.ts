import { scriptAsset, gzipAsset } from "../shared/runtime-assets";

export const cppWorker = scriptAsset("cpp");
export const cppAssets = [
    gzipAsset("clang/clang.wasm", "application/wasm"),
    gzipAsset("clang/lld.wasm", "application/wasm"),
    gzipAsset("clang/sysroot.tar", "application/x-tar"),
];
