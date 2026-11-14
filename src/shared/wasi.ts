import { ConsoleStdout, Directory, File, OpenFile, PreopenDirectory, WASI } from "@bjorn3/browser_wasi_shim";

export { Directory, File, PreopenDirectory };
export type { Inode } from "@bjorn3/browser_wasi_shim";

export async function executeWasi(module: WebAssembly.Module, args: string[], directories: PreopenDirectory[] = []) {
    let stdout = "";
    let stderr = "";
    const out = new TextDecoder();
    const err = new TextDecoder();
    const wasi = new WASI(
        args,
        [],
        [
            new OpenFile(new File(new Uint8Array())),
            new ConsoleStdout((bytes) => {
                stdout += out.decode(bytes, { stream: true });
            }),
            new ConsoleStdout((bytes) => {
                stderr += err.decode(bytes, { stream: true });
            }),
            ...directories,
        ],
        { debug: false },
    );
    const instance = await WebAssembly.instantiate(module, { wasi_snapshot_preview1: wasi.wasiImport });
    const { memory, _start } = instance.exports;
    if (!(memory instanceof WebAssembly.Memory) || typeof _start !== "function") {
        throw new Error("The WASI program has no memory or start function");
    }
    const status = wasi.start({ exports: { memory, _start: _start as () => unknown } });
    return { status, stdout: stdout + out.decode(), stderr: stderr + err.decode() };
}

export function wasiText({ status, stdout, stderr }: Awaited<ReturnType<typeof executeWasi>>) {
    return stdout + stderr + (status ? `\nProcess exited with status ${status}` : "");
}
