import { createHaskell } from "@live-codes/browser-haskell";
import { replyWithResult, type WorkerResponse } from "../shared/run-worker";

export type HaskellInput = {
    code: string;
    compiler: Blob;
    wasm: Blob;
    packageIndex: Blob;
    packageURLs: Record<string, string>;
};

// The generated compiler can reject asynchronously, outside its public promise.
self.addEventListener("unhandledrejection", (event) => {
    event.preventDefault();
    const error = event.reason instanceof Error ? event.reason.message : String(event.reason);
    self.postMessage({ error } satisfies WorkerResponse<string>);
});

replyWithResult(async ({ code, compiler, wasm, packageIndex, packageURLs }: HaskellInput) => {
    const compilerURL = URL.createObjectURL(compiler);
    const wasmURL = compilerURL.slice(0, compilerURL.lastIndexOf("/") + 1) + "mhs-embed.wasm";
    const packagesBase = "https://webwriter.invalid/haskell/";
    const fetchFromNetwork = self.fetch.bind(self);

    // MicroHs's loader expects sibling URLs. Connect those requests to the
    // widget's assets, including embedded package URLs in an Offline HTML file.
    self.fetch = (input, init) => {
        const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
        if (url === wasmURL) return Promise.resolve(new Response(wasm));
        if (url === packagesBase + "index.json") return Promise.resolve(new Response(packageIndex));
        const packagePrefix = packagesBase + "packages/";
        if (url.startsWith(packagePrefix)) {
            const name = url.slice(packagePrefix.length);
            if (Object.prototype.hasOwnProperty.call(packageURLs, name))
                return fetchFromNetwork(packageURLs[name], init);
            return Promise.resolve(new Response(null, { status: 404 }));
        }
        return fetchFromNetwork(input, init);
    };
    try {
        const haskell = await createHaskell({ wasmUrl: compilerURL, packagesUrl: packagesBase });
        try {
            const { output, error, exitCode } = await haskell.run({ code });
            if (error || exitCode) throw new Error(output || error || `Haskell exited with status ${exitCode}`);
            return output;
        } finally {
            haskell.dispose();
        }
    } finally {
        URL.revokeObjectURL(compilerURL);
        self.fetch = fetchFromNetwork;
    }
});
