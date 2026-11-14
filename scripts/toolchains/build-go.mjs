import { execFile } from "node:child_process";
import { createReadStream, createWriteStream } from "node:fs";
import { mkdir, mkdtemp, readFile, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pipeline } from "node:stream/promises";
import { promisify } from "node:util";
import { createGzip } from "node:zlib";

const standardPackages = [
    "fmt",
    "strings",
    "strconv",
    "bytes",
    "sort",
    "slices",
    "maps",
    "math",
    "math/big",
    "math/rand",
    "encoding/json",
    "encoding/csv",
    "regexp",
    "time",
    "sync",
    "bufio",
    "os",
    "io",
    "unicode",
    "path/filepath",
];
const exec = promisify(execFile);
const go = process.env.WEBWRITER_GO ?? "go";
const env = { ...process.env, GOOS: "wasip1", GOARCH: "wasm", CGO_ENABLED: "0" };
const output = resolve("assets/runtime/go");
const tmp = await mkdtemp(join(tmpdir(), "webwriter-go-"));
await mkdir(output, { recursive: true });
try {
    const { stdout: version } = await exec(go, ["version"]);
    if (!version.includes("go1.27.4 ")) throw new Error("Building the Go runtime requires Go 1.27.4");

    const buildBinary = async (name) => {
        const path = join(tmp, name + ".wasm");
        await exec(go, ["build", "-trimpath", "-ldflags=-s -w", "-o", path, "cmd/" + name], { env });
        await pipeline(createReadStream(path), createGzip(), createWriteStream(join(output, name + ".wasm.gz")));
    };
    const { stdout } = await exec(
        go,
        ["list", "-deps", "-export", "-f", "{{.ImportPath}} {{.Export}}", ...standardPackages],
        { env },
    );
    const entries = stdout
        .trim()
        .split("\n")
        .flatMap((line) => {
            const [name, file] = line.split(" ");
            return file ? [[name, file]] : [];
        });
    const paths = entries.map(([name, file]) => ({ name, file }));
    const buffers = await Promise.all(paths.map(({ file }) => readFile(file)));
    const index = paths.map(({ name }, i) => [name, buffers[i].length]);
    const manifest = Buffer.from(JSON.stringify(index));
    const header = Buffer.alloc(4);
    header.writeUInt32LE(manifest.length);
    const archive = join(tmp, "stdlib");
    await writeFile(archive, Buffer.concat([header, manifest, ...buffers]));
    await pipeline(createReadStream(archive), createGzip(), createWriteStream(join(output, "stdlib.gz")));
    await Promise.all(["compile", "link"].map(buildBinary));
} finally {
    await rm(tmp, { recursive: true, force: true });
}
