# HTML sandbox release

Publish `@webwriter/widget@1.4.0` before releasing this Code version. The dependency
adds the public `@webwriter/widget/sandbox` export. Code bundles that runner, so
an exported widget does not fetch an SDK or a runner page at execution time.
Authored pages must embed their own resources to work offline.

The SDK entry in `package-lock.json` pins the integrity of the prepared 1.4.0
tarball. Publish that exact tarball. After publishing, compare
`npm view @webwriter/widget@1.4.0 dist.integrity` with the lockfile's
`packages["node_modules/@webwriter/widget"].integrity`. If the SDK is repacked
with different contents, regenerate the lockfile against the published package.

Then, using Node.js 22 or 24 in this package:

```sh
npm ci
npm run prepublishOnly
npm run test:html-sandbox
```

The last command requires Chrome (`CHROME_BIN` overrides the default macOS
location). It tests the built widget and exported browser test bundle in real
`file://` documents with HTTP(S) blocked. It covers the hash-authorized CSP,
script execution and isolation, reruns, authored data, cleanup, a saved export
reloaded offline, and layout at 300px and 768px. Set
`WEBWRITER_HTML_SCREENSHOTS` to an existing directory to save screenshots.

For hosts enforcing CSP, authorize the SDK's `sandboxScriptHash` with
`strict-dynamic`, as WebWriter's editor and preview already do. The preview
uses only `sandbox="allow-scripts"`. Inline event attributes and
`document.write` are not supported under the editor policy.

After these checks, the package can be released through its usual npm workflow.
