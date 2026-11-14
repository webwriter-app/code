import { createCodeWorker, requestWorker } from "./code-worker";

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

export async function runInWorker<Result>(source: string, input: object, signal: AbortSignal): Promise<Result> {
    const worker = createCodeWorker(source);
    try {
        const response = await requestWorker<WorkerResponse<Result>>(
            worker,
            input,
            AbortSignal.any([signal, AbortSignal.timeout(10000)]),
        );
        if ("error" in response) throw new Error(response.error);
        return response.result;
    } finally {
        worker.terminate();
    }
}
