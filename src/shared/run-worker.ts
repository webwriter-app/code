import { createCodeWorker, requestWorker } from "./code-worker";
import { fetchRuntimeAsset, runtimeAssetURL, type RuntimeAsset } from "./runtime-assets";

export type WorkerResponse<Result> = { result: Result } | { error: string };

export function replyWithResult<Input, Result>(run: (input: Input) => Result | Promise<Result>) {
    self.onmessage = async ({ data }: MessageEvent<Input>) => {
        try {
            self.postMessage({ result: await run(data) } satisfies WorkerResponse<Result>);
        } catch (error) {
            self.postMessage({ error: error instanceof Error ? error.message : String(error) });
        }
    };
}

export async function loadWorkerSource(asset: RuntimeAsset, owner: Document, signal: AbortSignal) {
    return (await fetchRuntimeAsset(runtimeAssetURL(asset, owner), signal)).text();
}

export async function runInWorker<Result>(
    asset: RuntimeAsset,
    owner: Document,
    input: object,
    signal: AbortSignal,
    timeout = 10_000,
): Promise<Result> {
    const source = await loadWorkerSource(asset, owner, signal);
    signal.throwIfAborted();
    const worker = createCodeWorker(source);
    try {
        const response = await requestWorker<WorkerResponse<Result>>(
            worker,
            input,
            AbortSignal.any([signal, AbortSignal.timeout(timeout)]),
        );
        if ("error" in response) throw new Error(response.error);
        return response.result;
    } finally {
        worker.terminate();
    }
}
