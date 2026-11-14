import { scriptAsset, wasmAsset } from "../shared/runtime-assets";

export const phpWorker = scriptAsset("php");
export const phpAssets = [
    wasmAsset("https://cdn.jsdelivr.net/npm/@php-wasm/web-8-4@3.1.64/asyncify/8_4_27/php_8_4.wasm"),
];
