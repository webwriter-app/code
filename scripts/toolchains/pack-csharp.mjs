import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { gzipSync } from "node:zlib";

const framework = process.argv[2];
if (!framework) throw new Error("Pass the published .NET wwwroot/_framework directory");
const names = (await readdir(framework)).filter((name) => /\.(wasm|js|dat)$/.test(name)).sort();
const buffers = await Promise.all(names.map((name) => readFile(join(framework, name))));
const loaderIndex = names.indexOf("dotnet.js");
if (loaderIndex < 0) throw new Error("The publish directory has no dotnet.js");
const loader = buffers[loaderIndex]
    .toString("utf8")
    .replace(
        /\b([\w$]+)\.scriptDirectory=\(([\w$]+)=\1\.scriptUrl\)\.slice\(0,\2\.lastIndexOf\("\/"\)\)\+"\/"/,
        '$1.scriptDirectory="https://webwriter.invalid/dotnet/"',
    );
if (loader === buffers[loaderIndex].toString("utf8")) throw new Error("Unknown .NET module base implementation");
buffers[loaderIndex] = Buffer.from(loader);
const nativeIndex = names.findIndex((name) => /^dotnet\.native\..+\.js$/.test(name));
if (nativeIndex < 0) throw new Error("The publish directory has no native runtime module");
const native = buffers[nativeIndex].toString("utf8");
const standalone = native.replace("new URL('dotnet.native.wasm', import.meta.url).href", "'dotnet.native.wasm'");
if (standalone === native) throw new Error("Unknown .NET native module loader");
buffers[nativeIndex] = Buffer.from(standalone);
// Roslyn requires PE metadata, while the browser runtime ships Webcil assemblies.
const references = process.argv[3];
if (!references) throw new Error("Pass the net10.0 reference-assembly directory");
const referenceNames = (await readdir(references)).filter((name) => name.endsWith(".dll")).sort();
for (const name of referenceNames) {
    names.push("references/" + name);
    buffers.push(await readFile(join(references, name)));
}
const index = Buffer.from(JSON.stringify(names.map((name, i) => [name, buffers[i].length])));
const header = Buffer.alloc(4);
header.writeUInt32LE(index.length);
await mkdir("assets/runtime/csharp", { recursive: true });
await writeFile(
    "assets/runtime/csharp/framework.gz",
    gzipSync(Buffer.concat([header, index, ...buffers]), { level: 9 }),
);
