/// <reference types="mocha" />
import "mocha/mocha.js";
import { assert } from "chai";
import { getMochaConfig } from "@webwriter/build/test";
import {
  installOfflineManifest,
  mount,
  outputText,
  patchFetch,
  removeAll,
  resourceURLs,
  run,
  toDataURL,
  waitForLabel,
  waitForOutput,
} from "./helpers";

mocha.setup(getMochaConfig());

const program = `import Text.Parsec
import Test.QuickCheck
main :: IO ()
main = do
  print (parse (char 'a') "" "a")
  quickCheck ((\\x -> x + 0 == x) :: Int -> Bool)`;

describe("Haskell", function () {
  this.timeout(55000);
  afterEach(removeAll);

  it("embedded in an Offline HTML manifest run without a connection", async function () {
    const reader = await mount("haskell", program);
    const declarations: { url: string; mimeType: string }[] = (reader.constructor as any).offlineAssets(reader);
    assert.equal(declarations.filter(({ url }) => url.endsWith(".pkg")).length, 43);
    assert.lengthOf(resourceURLs().filter((url) => url.endsWith(".pkg")), 0);

    // A reader of the exported document has the runtime files in its manifest and no connection.
    const embedded: Record<string, string> = {};
    for (const { url, mimeType } of declarations) embedded[url] = await toDataURL(await fetch(url), mimeType);
    installOfflineManifest(embedded);
    const outbound: string[] = [];
    const sent: Record<string, string>[] = [];
    const postMessage = Worker.prototype.postMessage;
    Worker.prototype.postMessage = function (this: Worker, message: any, ...rest: any[]) {
      if (message?.packageURLs) sent.push(message.packageURLs);
      return postMessage.call(this, message, ...rest);
    } as typeof postMessage;
    const restore = patchFetch((original) => async (input, init) => {
      const url = input instanceof Request ? input.url : String(input);
      if (/^https?:/.test(url)) {
        outbound.push(url);
        throw new TypeError("offline");
      }
      return original(input, init);
    });
    try {
      await waitForLabel(reader, "Run (0)");
      run(reader);
      await waitForOutput(reader, /Right 'a'/);
      await waitForOutput(reader, /passed 100 tests/);
      assert.deepEqual(outbound, []);
      // The worker reads every package from the manifest, so it needs no connection either.
      assert.lengthOf(sent, 1);
      assert.lengthOf(Object.values(sent[0]), 43);
      for (const url of Object.values(sent[0])) assert.match(url, /^data:/);
      assert.include(outputText(reader), "Right 'a'");
    } finally {
      restore();
      Worker.prototype.postMessage = postMessage;
    }
  });
});

mocha.run();
