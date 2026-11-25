import { gzipAsset, scriptAsset } from "../runtime-assets";
import packageFiles from "../../assets/haskell-package-files.json";

export const haskellWorker = scriptAsset("haskell");
export const haskellCompiler = gzipAsset("haskell/mhs-embed.js", "text/javascript");
export const haskellWasm = gzipAsset("haskell/mhs-embed.wasm", "application/wasm");
export const haskellPackageIndex = gzipAsset("haskell/index.json", "application/json");
export const haskellPackages = packageFiles.map((file) => ({
    path: "haskell/" + file,
    mimeType: "application/octet-stream",
}));
