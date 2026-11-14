import { scriptAsset, gzipAsset } from "../shared/runtime-assets";

export const javaCompilerWorker = scriptAsset("java-compiler");
export const javaRunnerWorker = scriptAsset("java-runner");
export const javaCompiler = gzipAsset("java/compiler.wasm", "application/wasm");
export const javaSdk = gzipAsset("java/compile-classlib-teavm.bin", "application/octet-stream");
export const javaClasslib = gzipAsset("java/runtime-classlib-teavm.bin", "application/octet-stream");
export const javaAssets = [javaCompilerWorker, javaRunnerWorker, javaCompiler, javaSdk, javaClasslib];
