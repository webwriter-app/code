import { replyWithResult } from "../shared/run-worker";
import { readRuntimeArchive } from "../shared/runtime-archive";

replyWithResult(async ({ code, assets: [archive] }: { code: string; assets: Blob[] }) => {
    const files = await readRuntimeArchive(archive);
    const modules = new Map<string, string>();
    const moduleURL = (name: string) => {
        let url = modules.get(name);
        if (!url) {
            const bytes = files.get(name);
            if (!bytes) throw new Error(`Missing .NET module ${name}`);
            url = URL.createObjectURL(new Blob([bytes], { type: "text/javascript" }));
            modules.set(name, url);
        }
        return url;
    };
    try {
        // .NET 10 uses this marker to distinguish an independent worker from a runtime thread.
        Object.assign(globalThis, { dotnetSidecar: true });
        const { dotnet } = await import(moduleURL("dotnet.js"));
        const engine = await dotnet
            .withConfig({ cacheBootResources: false })
            .withResourceLoader((type: string, name: string) => {
                if (type === "dotnetjs") return moduleURL(name);
                const bytes = files.get(name);
                if (!bytes) throw new Error(`Missing .NET resource ${name}`);
                const mime = name.endsWith(".wasm") ? "application/wasm" : "application/octet-stream";
                return Promise.resolve(new Response(bytes, { headers: { "Content-Type": mime } }));
            })
            .create();
        const exports = await engine.getAssemblyExports(engine.getConfig().mainAssemblyName);
        engine.Module.FS_createPath("/", "references", true, true);
        const names: string[] = [];
        for (const [name, bytes] of files) {
            if (!name.startsWith("references/")) continue;
            const filename = name.slice("references/".length);
            engine.Module.FS_createDataFile("/references", filename, bytes, true, false, true);
            names.push(filename.slice(0, -4));
        }
        return (await exports.Program.Run(code, names.join("\n"))) as string;
    } finally {
        for (const url of modules.values()) URL.revokeObjectURL(url);
    }
});
