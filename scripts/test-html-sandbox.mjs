// Exercise the actual bundled widget in file:// documents, with HTTP(S) blocked.
// CDP uses inherited pipes; this check does not start a server.
import { build } from "esbuild";
import { spawn } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { sandboxScriptHash } from "@webwriter/widget/sandbox";

const root = fileURLToPath(new URL("..", import.meta.url));
const scratch = await mkdtemp(join(tmpdir(), "webwriter-html-code-"));
const pending = new Map();
let browser;
try {
  const widget = await build({
    absWorkingDir: root,
    entryPoints: ["dist/widgets/webwriter-code-html.js"],
    bundle: true, minify: true, write: false, outfile: "widget.js", format: "iife", target: "es2022",
    loader: { ".svg": "dataurl" },
  });
  const tests = await build({
    absWorkingDir: root,
    entryPoints: ["dist/tests/html-sandbox.js"],
    bundle: true, minify: true, write: false, format: "iife", target: "es2022",
  });
  const script = (text) => text.replace(/<\/script/gi, "<\\/script");
  const widgetJS = script(widget.outputFiles.find((file) => file.path.endsWith(".js")).text);
  const css = await readFile(join(root, "dist/widgets/webwriter-code-html.css"), "utf8");
  const strictPolicy = `default-src 'none'; script-src 'nonce-fixture' 'strict-dynamic' '${sandboxScriptHash}'; style-src 'unsafe-inline'; img-src data: blob:; font-src data:; frame-src blob: data:; base-uri 'none'; object-src 'none'`;
  const documentHTML = (body, code, policy = strictPolicy) => `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
${policy ? `<meta http-equiv="Content-Security-Policy" content="${policy}">` : ""}
<style>${css} body {margin:24px;font:16px system-ui} webwriter-code-html {display:block;width:768px}</style>
<title>HTML Code standalone verification</title></head><body>${body}
<script nonce="fixture">${widgetJS}</script><script nonce="fixture">${script(code)}</script></body></html>`;

  let stderr = "", protocolBuffer = "", sequence = 0;
  const network = [];
  browser = spawn(process.env.CHROME_BIN ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", [
    "--headless=new", "--disable-gpu", "--no-first-run", "--enable-logging=stderr",
    `--user-data-dir=${join(scratch, "profile")}`, "--remote-debugging-pipe",
  ], { stdio: ["ignore", "ignore", "pipe", "pipe", "pipe"] });
  browser.stdio[4].on("data", (chunk) => {
    protocolBuffer += chunk.toString();
    let end;
    while ((end = protocolBuffer.indexOf("\0")) >= 0) {
      const response = JSON.parse(protocolBuffer.slice(0, end));
      protocolBuffer = protocolBuffer.slice(end + 1);
      if (response.method === "Network.requestWillBeSent" && /^https?:/.test(response.params.request.url)) network.push(response.params.request.url);
      const request = pending.get(response.id);
      if (!request) continue;
      pending.delete(response.id);
      clearTimeout(request.timer);
      if (response.error) request.reject(new Error(JSON.stringify(response.error)));
      else request.resolve(response.result);
    }
  });
  const command = (method, params = {}, sessionId) => new Promise((resolve, reject) => {
    const id = ++sequence;
    const timer = setTimeout(() => { pending.delete(id); reject(new Error(`Chrome timed out: ${method}`)); }, 15000);
    pending.set(id, { resolve, reject, timer });
    browser.stdio[3].write(JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) }) + "\0");
  });
  browser.on("error", (error) => {
    for (const request of pending.values()) { clearTimeout(request.timer); request.reject(error); }
    pending.clear();
  });
  browser.stderr.on("data", (chunk) => { stderr += chunk; });
  const { targetId } = await command("Target.createTarget", { url: "about:blank" });
  const { sessionId } = await command("Target.attachToTarget", { targetId, flatten: true });
  await command("Page.enable", {}, sessionId);
  await command("Network.enable", {}, sessionId);
  await command("Network.setBlockedURLs", { urls: ["http://*", "https://*"] }, sessionId);
  await command("Page.addScriptToEvaluateOnNewDocument", { source: `
window.checks = {finished:false, tests:[], reports:[]};
addEventListener("test-update", event => {
  if(event.detail.type === "afterOne") checks.tests.push(event.detail);
  if(event.detail.type === "afterAll") checks.finished = true;
});
addEventListener("message", event => {
  const widget = document.querySelector("webwriter-code-html#saved");
  if(event.origin === "null" && event.source === widget?.shadowRoot.querySelector("iframe")?.contentWindow && event.data?.kind === "saved-preview") checks.reports.push(event.data);
});` }, sessionId);
  const evaluate = async (expression) => {
    const result = await command("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true }, sessionId);
    if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails));
    return result.result.value;
  };
  const waitFor = async (expression) => {
    const end = Date.now() + 45000;
    while (Date.now() < end) {
      const result = await evaluate(expression);
      if (result) return result;
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
    throw new Error(`Timed out: ${expression}\n${stderr.split("\n").filter((line) => /CONSOLE|Uncaught/.test(line)).join("\n")}`);
  };
  const navigate = async (name, html) => {
    const file = join(scratch, name);
    await writeFile(file, html);
    await command("Page.navigate", { url: pathToFileURL(file).href }, sessionId);
    return file;
  };
  for (const policy of [strictPolicy, ""]) {
    await navigate("tests.html", documentHTML("", tests.outputFiles[0].text, policy));
    const result = await waitFor("checks.finished && checks.tests");
    if (result.length !== 5 || result.some((test) => !test.passed)) throw new Error(`HTML sandbox tests failed: ${JSON.stringify(result)}\n${stderr}`);
    console.log(`file:// ${policy ? "hash-authorized CSP" : "standalone without CSP"}: ${result.length} tests passed`);
  }

  // Save just the authored widget and the bundled module, then reopen and reload.
  const program = `<!doctype html><h2>Offline HTML preview</h2><p id="status">Waiting</p><script>
document.getElementById("status").textContent = "JavaScript works offline";
parent.postMessage({kind:"saved-preview",text:document.getElementById("status").textContent}, "*");</script>`;
  const data = JSON.stringify({ code: program }).replaceAll("<", "\\u003c");
  const markup = `<webwriter-code-html id="saved" autorun><script type="application/json" slot="data">${data}</script></webwriter-code-html>`;
  const saved = await navigate("export.html", documentHTML(markup, ""));
  await waitFor("checks.reports[0]?.text === 'JavaScript works offline'");
  const authored = await evaluate("document.getElementById('saved').outerHTML");
  if (authored.includes("iframe") || authored.includes("sandboxBootstrap")) throw new Error("Preview artifacts leaked into authored markup");
  await writeFile(saved, documentHTML(authored, ""));
  await command("Page.reload", {}, sessionId);
  await waitFor("checks.reports[0]?.text === 'JavaScript works offline'");
  const screenshots = process.env.WEBWRITER_HTML_SCREENSHOTS;
  for (const width of [300, 768]) {
    await command("Emulation.setDeviceMetricsOverride", { width: width + 48, height: 800, deviceScaleFactor: 1, mobile: false }, sessionId);
    await evaluate(`document.getElementById('saved').style.width = '${width}px'`);
    const fits = await evaluate("new Promise(resolve => requestAnimationFrame(() => { const widget = document.getElementById('saved'); resolve(widget.scrollWidth <= widget.clientWidth); }))");
    if (!fits) throw new Error(`HTML widget overflows at ${width}px`);
    if (screenshots) {
      const { data } = await command("Page.captureScreenshot", { format: "png" }, sessionId);
      await writeFile(resolve(screenshots, `html-code-${width}.png`), Buffer.from(data, "base64"));
    }
  }
  console.log("Saved standalone widget reopened and reloaded offline; layout fits 300px and 768px");
  const withoutHash = strictPolicy.replace(` '${sandboxScriptHash}'`, "");
  await navigate("unauthorized.html", documentHTML(markup, "", withoutHash));
  await waitFor("document.getElementById('saved')?.shadowRoot?.querySelector('iframe')?.srcdoc.includes('saved-preview')");
  await new Promise((resolve) => setTimeout(resolve, 500));
  if (await evaluate("checks.reports.length")) throw new Error("Runner executed without its CSP hash");
  if (network.length) throw new Error(`Unexpected HTTP(S) dependencies: ${network.join(", ")}`);
  console.log("Runner blocked without its CSP hash; zero HTTP(S) requests");
}
finally {
  for (const request of pending.values()) clearTimeout(request.timer);
  if (browser && browser.exitCode === null) {
    const exited = new Promise((resolve) => browser.once("exit", resolve));
    browser.kill();
    await exited;
  }
  await rm(scratch, { recursive: true, force: true });
}
