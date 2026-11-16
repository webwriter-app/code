import { scriptAsset, gzipAsset } from "../runtime-assets";

export const phpWorker = scriptAsset("php");
export const phpAssets = [gzipAsset("php/php_8_4.wasm", "application/wasm")];
