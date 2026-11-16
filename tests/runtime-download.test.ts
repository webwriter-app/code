/// <reference types="mocha" />
import "mocha/mocha.js";
import { assert } from "chai";
import { getMochaConfig } from "@webwriter/build/test";
import {
  installOfflineManifest,
  label,
  mount,
  part,
  patchFetch,
  removeAll,
  run,
  toDataURL,
  until,
  waitForLabel,
  waitForOutput,
} from "./helpers";

mocha.setup(getMochaConfig());

const requestURL = (input: RequestInfo | URL) => (input instanceof Request ? input.url : String(input));

describe("runtime download", function () {
  this.timeout(40000);
  let restore: (() => void) | undefined;

  afterEach(function () {
    restore?.();
    restore = undefined;
    removeAll();
  });

  describe("progress", function () {
    for (const mode of ["known", "unknown", "cors"] as const) {
      const measurable = mode !== "unknown";
      it(`Run shows ${measurable ? "determinate" : "indeterminate"} progress for a ${mode === "cors" ? "cross-origin" : mode} length`, async function () {
        let finish!: () => void;
        restore = patchFetch((original) => async (input, init) => {
          const url = requestURL(input);
          if (!url.endsWith("/javascript.js.gz") || init?.cache === "only-if-cached") return original(input, init);
          const file = new Uint8Array(await (await original(input, init)).arrayBuffer());
          const midway = Math.floor(file.length / 2);
          const released = new Promise<void>((resolve) => (finish = resolve));
          const body = new ReadableStream<Uint8Array>({
            start(controller) {
              controller.enqueue(file.subarray(0, midway));
            },
            async pull(controller) {
              await released;
              controller.enqueue(file.subarray(midway));
              controller.close();
            },
          });
          const response = new Response(body, mode === "unknown" ? undefined : { headers: { "content-length": String(file.length) } });
          // A cross-origin response reveals its length only to the runtime's size list.
          if (mode === "cors") Object.defineProperty(response, "type", { value: "cors" });
          return response;
        });

        const js = await mount("javascript");
        await waitForLabel(js, "Run (0)");
        run(js);
        await waitForLabel(js, measurable ? /^Downloading runtime [1-9]\d?%$/ : "Downloading runtime…");
        const indicator = await until(() => part<HTMLProgressElement>(js, "progress"), "progress bar");
        assert.equal(indicator.getAttribute("aria-label"), "Downloading runtime");
        if (measurable) {
          const value = Number(indicator.getAttribute("value"));
          assert.isTrue(value > 0 && value < 1, `progress value ${value}`);
          const inner = part(js, ".run-button")!.shadowRoot!.querySelector("button")!;
          assert.match(getComputedStyle(inner).backgroundImage, /^linear-gradient/);
        } else {
          assert.isNull(indicator.getAttribute("value"));
          assert.isNotNull(part(js, ".runtime-spinner"));
        }
        finish();
        await waitForOutput(js, "JS output");
        await waitForLabel(js, "Run (1)");
        assert.isNull(part(js, "progress"));
      });
    }

    it("Run says Running while reading a prefetched runtime", async function () {
      restore = patchFetch((original) => async (input, init) => {
        const url = requestURL(input);
        if (init?.cache !== "only-if-cached" || !url.endsWith("/javascript.js.gz")) return original(input, init);
        // Keep the cache hit pending long enough to expose a misleading download label.
        const response = await original(url);
        const body = response.body!.pipeThrough(
          new TransformStream<Uint8Array, Uint8Array>({
            async transform(chunk, controller) {
              await new Promise((resolve) => setTimeout(resolve, 600));
              controller.enqueue(chunk);
            },
          }),
        );
        return new Response(body, { headers: response.headers });
      });
      const js = await mount("javascript");
      const labels: string[] = [];
      const button = part(js, ".run-button")!;
      new MutationObserver(() => labels.push(label(js))).observe(button, { childList: true, characterData: true, subtree: true });
      await waitForLabel(js, "Run (0)");
      run(js);
      await waitForLabel(js, "Running…");
      await waitForOutput(js, "JS output");
      assert.isNull(part(js, "progress"));
      assert.deepEqual(
        labels.filter((text) => text.startsWith("Downloading")),
        [],
      );
    });
  });

  it("a missing runtime reports the error and clears the busy state", async function () {
    restore = patchFetch((original) => async (input, init) => {
      if (requestURL(input).endsWith("/dist/runtime/python.js.gz")) throw new TypeError("Failed to fetch");
      return original(input, init);
    });
    const python = await mount("python");
    await waitForLabel(python, "Run (0)");
    run(python);
    await waitForOutput(python, /failed to fetch/i);
    assert.equal(part(python, "sl-button")!.getAttribute("aria-busy"), "false");
  });

  it("gzip runtime assets in an Offline HTML manifest run without a connection", async function () {
    const sql = await mount("sql");
    const declarations: { url: string; mimeType: string }[] = (sql.constructor as any).offlineAssets(sql);
    const assets: Record<string, string> = {};
    for (const { url, mimeType } of declarations) {
      const response = await fetch(url);
      const bytes = new Uint8Array(await response.clone().arrayBuffer());
      assert.equal((bytes[0] << 8) | bytes[1], 0x1f8b, url);
      assets[url] = await toDataURL(response, mimeType);
    }
    installOfflineManifest(assets);
    const requests: string[] = [];
    restore = patchFetch((original) => async (input, init) => {
      const url = requestURL(input);
      requests.push(url);
      if (/^https?:/.test(url)) throw new TypeError("offline");
      return original(input, init);
    });
    await waitForLabel(sql, "Run (0)");
    run(sql);
    await until(
      () => Array.from(sql.shadowRoot!.querySelectorAll("td")).some((cell) => cell.textContent!.trim() === "Ada"),
      "the query result",
    );
    assert.deepEqual(
      requests.filter((url) => /^https?:/.test(url)),
      [],
    );
  });
});

mocha.run();
