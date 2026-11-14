export type RuntimeAsset = { path: string; mimeType: string };

export const scriptAsset = (name: string): RuntimeAsset => ({ path: name + ".js", mimeType: "text/javascript" });
export const wasmAsset = (path: string): RuntimeAsset => ({ path, mimeType: "application/wasm" });

const originalEntriesAttribute = "data-webwriter-original-package-entries";
const offlineAssetManifests = new WeakMap<Element, Record<string, string>>();

// The editor's assetURL helper is not published in @webwriter/widget 1.0.0.
// Read the same exported asset manifest until a package with the helper ships.
function assetURL(url: string, owner: Document): string {
    const manifest = owner.head?.querySelector('script#webwriter-offline-assets[type="application/json"]');
    if (!manifest) return url;
    let assets = offlineAssetManifests.get(manifest);
    if (!assets) {
        assets = JSON.parse(manifest.textContent ?? "{}") as Record<string, string>;
        offlineAssetManifests.set(manifest, assets);
    }
    const embedded = assets[url];
    if (!embedded?.startsWith("data:")) throw new Error(`Asset is unavailable in Offline HTML: ${url}`);
    return embedded;
}

function publishedAssetURL(path: string, owner: Document): string {
    if (/^https?:/.test(path)) return path;
    // The export retains the original package entries so local packages and
    // their published versions use the same asset keys before and after export.
    const bundled = owner.head?.querySelector(`script[${originalEntriesAttribute}]`);
    if (bundled) {
        const entries = JSON.parse(bundled.getAttribute(originalEntriesAttribute) ?? "[]") as string[];
        const entry = entries.find((url) => /\/dist\/widgets\/ww-code-[^/?]+\.js(?:\?|$)/.test(url));
        if (entry) return relativeRuntimeURL(path, entry);
    }
    const entry = (root: Document) =>
        Array.from(root.head?.querySelectorAll<HTMLScriptElement>('script[type="module"][src]') ?? [])
            .map((script) => new URL(script.getAttribute("src")!, document.baseURI).href)
            .find((url) => /\/dist\/widgets\/ww-code-[^/?]+\.js(?:\?|$)/.test(url));
    const scriptURL = entry(owner) ?? entry(document);
    if (!scriptURL) throw new Error("Could not locate the Code package's widget entry");
    return relativeRuntimeURL(path, scriptURL);
}

function relativeRuntimeURL(path: string, entry: string) {
    const url = new URL("../runtime/" + path, entry);
    // Local package reloads version individual resources with their revision.
    if (url.pathname.startsWith("/__webwriter/local-packages/")) url.search = new URL(entry).search;
    return url.href;
}

export const runtimeAssetURL = (asset: RuntimeAsset, owner: Document) =>
    assetURL(publishedAssetURL(asset.path, owner), owner);

export function offlineRuntimeAssets(element: Element, assets: readonly RuntimeAsset[]) {
    if (element.hasAttribute("disable-execution")) return [];
    return assets.map(({ path, mimeType }) => ({ url: publishedAssetURL(path, element.ownerDocument), mimeType }));
}

export async function fetchRuntimeAsset(url: string, signal?: AbortSignal) {
    const response = await fetch(url, { signal });
    if (!response.ok) throw new Error(`Could not load runtime asset (HTTP ${response.status})`);
    return response;
}
