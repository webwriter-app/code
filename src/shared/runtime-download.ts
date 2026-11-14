import { fetchRuntimeAsset, hasOfflineRuntimeAssets, runtimeAssetURL, type RuntimeAsset } from "./runtime-assets";

export type RuntimeDownload = { received: number; total?: number };
type Transfer = RuntimeDownload & { downloading: boolean; cors?: boolean };
export type LoadedRuntime = {
    asset(asset: RuntimeAsset): Blob;
};

function knownLength(response: Response): number | undefined {
    // Fetch delivers a decoded body. Cross-origin responses can hide Content-Encoding.
    const encoding = response.headers.get("Content-Encoding");
    const bytes = Number(response.headers.get("Content-Length"));
    if (response.type !== "cors" && (!encoding || encoding === "identity") && bytes > 0) return bytes;
    return undefined;
}

async function cachedResponse(url: string, signal: AbortSignal) {
    if (new URL(url).origin !== location.origin) return undefined;
    // This request mode only consults the browser cache and is limited to same-origin URLs.
    try {
        const response = await fetch(url, { cache: "only-if-cached", mode: "same-origin", signal });
        return response.ok ? response : undefined;
    } catch {
        signal.throwIfAborted();
        return undefined;
    }
}

/** Download only on Run, and use the same loader for regular and Offline HTML. */
export async function withRuntimeAssets<T>(
    assets: readonly RuntimeAsset[],
    owner: Document,
    signal: AbortSignal,
    report: (download: RuntimeDownload | undefined) => void,
    use: (runtime: LoadedRuntime) => Promise<T>,
): Promise<T> {
    const offline = hasOfflineRuntimeAssets(owner);
    const downloads = new AbortController();
    const downloadSignal = AbortSignal.any([signal, downloads.signal]);
    const transfers = assets.map((): Transfer => ({ received: 0, downloading: false }));
    let showDownload = false;
    let reported: number | "unknown" | undefined;
    let sizes: Record<string, number> | undefined;
    let sizeRequest: Promise<void> | undefined;

    const update = () => {
        if (downloadSignal.aborted || !showDownload) return;
        const active = transfers.some((file) => file.downloading);
        const total = transfers.every((file) => file.total !== undefined)
            ? transfers.reduce((sum, file) => sum + file.total!, 0)
            : undefined;
        const received = transfers.reduce((sum, file) => sum + file.received, 0);
        const status = active ? (total ? Math.floor((100 * received) / total) : "unknown") : undefined;
        if (status !== reported) {
            reported = status;
            report(active ? { received, total } : undefined);
        }
    };

    // For cross-origin requests the HTTP cache is opaque until the fetch completes.
    // Keep the immediate "Running" label for quick hits and show ongoing transfers.
    const delay = offline
        ? undefined
        : setTimeout(() => {
              showDownload = true;
              update();
          }, 350);

    const applySize = (file: Transfer, asset: RuntimeAsset) => {
        if (!file.downloading || !file.cors) return;
        const bytes = asset.bytes ?? sizes?.[asset.path];
        if (bytes && bytes >= file.received) file.total = bytes;
    };
    const loadSizes = async () => {
        // The published file sizes are independent of HTTP Content-Encoding.
        const url = runtimeAssetURL({ path: "sizes.json", mimeType: "application/json" }, owner);
        try {
            sizes = await (await fetchRuntimeAsset(url, downloadSignal)).json();
            transfers.forEach((file, i) => applySize(file, assets[i]));
            update();
        } catch {
            // If metadata is unavailable, the progress indicator stays indeterminate.
        }
    };

    try {
        const entries = await Promise.all(
            assets.map(async (asset, i) => {
                const url = runtimeAssetURL(asset, owner);
                const file = transfers[i];
                const prefetched = offline ? undefined : await cachedResponse(url, downloadSignal);
                file.downloading = !offline && !prefetched;
                if (!file.downloading) file.total = 0;
                update();
                const response = prefetched ?? (await fetchRuntimeAsset(url, downloadSignal));
                let stream = response.body;
                if (!stream) throw new Error("The runtime asset is empty");
                if (file.downloading) {
                    file.total = knownLength(response);
                    file.cors = response.type === "cors";
                    if (file.cors && !/^https?:/.test(asset.path)) sizeRequest ??= loadSizes();
                    applySize(file, asset);
                    update();
                    stream = stream.pipeThrough(
                        new TransformStream<Uint8Array<ArrayBuffer>, Uint8Array<ArrayBuffer>>({
                            transform(chunk, controller) {
                                file.received += chunk.byteLength;
                                if (file.total !== undefined && file.received > file.total) file.total = undefined;
                                update();
                                controller.enqueue(chunk);
                            },
                            flush() {
                                file.downloading = false;
                                file.total = file.received;
                                update();
                            },
                        }),
                    );
                }
                const blob = await new Response(
                    asset.gunzip ? stream.pipeThrough(new DecompressionStream("gzip")) : stream,
                    { headers: { "Content-Type": asset.mimeType } },
                ).blob();
                return [asset, blob] as const;
            }),
        );
        signal.throwIfAborted();
        clearTimeout(delay);
        downloads.abort();
        report(undefined);
        const blobs = new Map(entries);
        return await use({
            asset(asset) {
                const blob = blobs.get(asset);
                if (!blob) throw new Error(`Runtime asset was not loaded: ${asset.path}`);
                return blob;
            },
        });
    } finally {
        clearTimeout(delay);
        downloads.abort();
        if (!signal.aborted) report(undefined);
    }
}
