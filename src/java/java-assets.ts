import { scriptAsset, wasmAsset } from "../shared/runtime-assets";

export const javaCompilerWorker = scriptAsset("java-compiler");
export const javaRunnerWorker = scriptAsset("java-runner");
export const javaCompiler = wasmAsset("java/compiler.wasm");
export const javaSdk = { path: "java/compile-classlib-teavm.bin", mimeType: "application/octet-stream" };
export const javaClasslib = { path: "java/runtime-classlib-teavm.bin", mimeType: "application/octet-stream" };
export const javaAssets = [javaCompilerWorker, javaRunnerWorker, javaCompiler, javaSdk, javaClasslib];
