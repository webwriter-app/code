import assert from "node:assert/strict";
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { chromium } from "playwright";

const fixtures = {
    html: ["<p>HTML output</p>", "HTML output"],
    javascript: ['console.log("JS output", {nested: {value: 42}});', "JS output"],
    typescript: ["const count: number = 42; console.log(count);", "42"],
    java: [
        'public class Main { public static void main(String[] args) { System.out.println("Java output"); } }',
        "Java output",
    ],
    webassembly: ['(module (func (export "main") (result i32) i32.const 27))', "27"],
    python: ['print("Python output")', "Python output"],
    sql: ["SELECT 'Ada' AS name, 42 AS score;", "Ada"],
    lua: ['print("Lua output")', "Lua output"],
    prolog: ["parent(ada, grace).\nparent(ada, alan).", "Who = grace"],
    scheme: ["(map (lambda (x) (* x x)) '(1 2 3))", "(1 4 9)"],
    shell: ['printf "Bash output\\n" | grep Bash', "Bash output"],
    csharp: ['using System; Console.WriteLine("C# output");', "C# output"],
    go: ['package main\nimport "fmt"\nfunc main() { fmt.Println("Go output") }', "Go output"],
    c: ['#include <stdio.h>\nint main(void) { puts("C output"); }', "C output"],
    cpp: ['#include <iostream>\nint main() { std::cout << "C++ output" << std::endl; }', "C++ output"],
    php: ['<?php echo "PHP output";', "PHP output"],
    rust: ['fn main() { println!("Rust output"); }', "Rust output"],
};

const runtime = /\/dist\/runtime\/|\.(?:wasm|tar|gz)(?:$|\?)/;
const languages = Object.keys(fixtures);
const cell = (language, code) =>
    `<webwriter-code-${language}${language === "prolog" ? ' goal="parent(ada, Who)."' : ""}><script type="application/json" slot="data">${JSON.stringify({ code }).replace(/</g, "\\u003c")}</script></webwriter-code-${language}>`;
const markup = `<!doctype html><html lang="en"><meta charset="utf-8">${languages
    .map(
        (language) => `
    <link rel="stylesheet" href="/dist/widgets/ww-code-${language}.css">
    <script type="module" src="/dist/widgets/ww-code-${language}.js"></script>`,
    )
    .join("")}
    <body>${languages.map((language) => cell(language, fixtures[language][0])).join("")}</body></html>`;

test("code widgets defer runtimes and preserve authored content", async (t) => {
    let finishDownload;
    const server = createServer(async (req, res) => {
        const { pathname, searchParams } = new URL(req.url, "http://127.0.0.1");
        if (pathname === "/") {
            const base = searchParams.has("cross-origin")
                ? `<base href="http://localhost:${server.address().port}/">`
                : "";
            return res
                .setHeader("content-type", "text/html")
                .end(markup.replace('<meta charset="utf-8">', base + '<meta charset="utf-8">'));
        }
        if (pathname === "/favicon.ico") return res.writeHead(204).end();
        if (!/^\/dist\/(?:(?:widgets|chunks)\/[\w-]+\.(?:js|css)|runtime\/(?:[\w-]+\/)?[\w.-]+)$/.test(pathname))
            return res.writeHead(404).end();
        res.setHeader("access-control-allow-origin", "*");
        try {
            const file = await readFile(new URL(".." + pathname, import.meta.url));
            if (pathname.endsWith("/javascript.js.gz")) res.setHeader("cache-control", "public, max-age=3600");
            const progress = searchParams.get("test-progress");
            if (pathname.endsWith("/javascript.js.gz") && progress) {
                if (progress === "known") res.setHeader("content-length", file.length);
                const midway = Math.floor(file.length / 2);
                finishDownload = () => res.end(file.subarray(midway));
                res.write(file.subarray(0, midway));
                return;
            }
            res.setHeader(
                "content-type",
                pathname.endsWith(".js")
                    ? "text/javascript"
                    : pathname.endsWith(".css")
                      ? "text/css"
                      : pathname.endsWith(".wasm")
                        ? "application/wasm"
                        : "application/octet-stream",
            ).end(file);
        } catch {
            res.writeHead(404).end();
        }
    });
    await new Promise((resolve, reject) => {
        server.once("error", reject);
        server.listen(0, "127.0.0.1", resolve);
    });
    t.after(() => new Promise((resolve) => server.close(resolve)));
    const browser = await chromium.launch({ channel: process.env.CODE_TEST_BROWSER || "chrome" });
    t.after(() => browser.close());

    const page = await browser.newPage({ viewport: { width: 375, height: 900 } });
    const errors = [];
    const requests = [];
    page.on("request", (request) => requests.push(request.url()));
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto(`http://127.0.0.1:${server.address().port}`);
    const widget = (language) => page.locator("webwriter-code-" + language);

    await t.test("every editor opens without requesting execution runtimes", async () => {
        for (const [language, [source]] of Object.entries(fixtures)) {
            assert.equal(await widget(language).locator(".cm-content").innerText(), source);
        }
        assert.deepEqual(
            requests.filter((url) => runtime.test(url) || url.includes("pyodide")),
            [],
        );
    });

    await t.test("offline asset declarations skip disabled cells and share the C toolchain", async () => {
        const declarations = await page.evaluate(() => {
            const get = (language) => {
                const tag = "webwriter-code-" + language;
                return customElements.get(tag).offlineAssets(document.querySelector(tag).cloneNode(true));
            };
            const disabled = document.querySelector("webwriter-code-sql").cloneNode(true);
            disabled.setAttribute("disable-execution", "");
            return {
                c: get("c"),
                cpp: get("cpp"),
                sql: get("sql"),
                disabled: customElements.get("webwriter-code-sql").offlineAssets(disabled),
            };
        });
        assert.deepEqual(declarations.disabled, []);
        assert.deepEqual(declarations.c, declarations.cpp);
        assert.ok(
            declarations.sql.some(
                ({ url, mimeType }) => url.includes("sql-wasm-browser.wasm.gz") && mimeType === "application/gzip",
            ),
        );
        assert.deepEqual(
            requests.filter((url) => runtime.test(url)),
            [],
        );
    });

    await t.test("Run shows determinate and indeterminate download progress", async () => {
        for (const progress of ["known", "unknown", "cors"]) {
            const measurable = progress !== "unknown";
            const loading = await browser.newPage({ viewport: { width: 320, height: 640 } });
            try {
                await loading.route("**/dist/runtime/javascript.js.gz", (route) =>
                    route.continue({ url: route.request().url() + "?test-progress=" + progress }),
                );
                await loading.goto(
                    `http://127.0.0.1:${server.address().port}/${progress === "cors" ? "?cross-origin" : ""}`,
                );
                const js = loading.locator("webwriter-code-javascript");
                await js.getByRole("button", { name: "Run (0)", exact: true }).press("Enter");
                const label = measurable ? /^Downloading runtime [1-9]\d?%$/ : "Downloading runtime…";
                await js.getByRole("button", { name: label }).waitFor();
                const indicator = js.getByRole("progressbar", { name: "Downloading runtime" });
                const value = await indicator.getAttribute("value");
                if (measurable) {
                    assert.ok(Number(value) > 0 && Number(value) < 1);
                    const fill = await js
                        .locator(".run-button")
                        .evaluate(
                            (button) => getComputedStyle(button.shadowRoot.querySelector("button")).backgroundImage,
                        );
                    assert.match(fill, /^linear-gradient/);
                } else {
                    assert.equal(value, null);
                    await js.locator(".runtime-spinner").waitFor();
                }
                finishDownload();
                await js.locator("output").getByText("JS output").waitFor();
                await js.getByRole("button", { name: "Run (1)", exact: true }).waitFor();
                assert.equal(await indicator.count(), 0);
            } finally {
                finishDownload?.();
                finishDownload = undefined;
                await loading.close();
            }
        }
    });

    await t.test("Run says Running while reading a prefetched runtime", async () => {
        const prefetched = await browser.newPage();
        try {
            await prefetched.goto(`http://127.0.0.1:${server.address().port}`);
            await prefetched.evaluate(async () => {
                await (await fetch("/dist/runtime/javascript.js.gz")).arrayBuffer();
                const button = document
                    .querySelector("webwriter-code-javascript")
                    .shadowRoot.querySelector(".run-button");
                window.runtimeLabels = [];
                new MutationObserver(() => window.runtimeLabels.push(button.textContent.trim())).observe(button, {
                    childList: true,
                    characterData: true,
                    subtree: true,
                });
                const fetchAsset = window.fetch.bind(window);
                window.fetch = async (url, options) => {
                    const response = await fetchAsset(url, options);
                    if (options?.cache === "only-if-cached" && response.ok) {
                        // Keep the cache hit pending long enough to expose a misleading download label.
                        const stream = response.body.pipeThrough(
                            new TransformStream({
                                async transform(chunk, controller) {
                                    await new Promise((resolve) => setTimeout(resolve, 600));
                                    controller.enqueue(chunk);
                                },
                            }),
                        );
                        return new Response(stream, { headers: response.headers });
                    }
                    return response;
                };
            });
            const js = prefetched.locator("webwriter-code-javascript");
            await js.getByRole("button", { name: "Run (0)", exact: true }).press("Enter");
            await js.getByRole("button", { name: "Running…", exact: true }).waitFor();
            await js.locator("output").getByText("JS output").waitFor();
            assert.equal(await js.getByRole("progressbar").count(), 0);
            assert.deepEqual(
                await prefetched.evaluate(() =>
                    window.runtimeLabels.filter((label) => label.startsWith("Downloading")),
                ),
                [],
            );
        } finally {
            await prefetched.close();
        }
    });

    await t.test("gzip runtime assets in an Offline HTML manifest run without a connection", async () => {
        const offline = await browser.newContext();
        try {
            const reader = await offline.newPage();
            await reader.goto(`http://127.0.0.1:${server.address().port}`);
            const sql = reader.locator("webwriter-code-sql");
            const declarations = await sql.evaluate((element) => element.constructor.offlineAssets(element));
            const assets = Object.fromEntries(
                await Promise.all(
                    declarations.map(async ({ url, mimeType }) => {
                        const path = new URL(url).pathname;
                        const bytes = await readFile(new URL(".." + path, import.meta.url));
                        assert.equal(bytes.readUInt16BE(0), 0x1f8b);
                        return [url, `data:${mimeType};base64,${bytes.toString("base64")}`];
                    }),
                ),
            );
            await reader.evaluate((assets) => {
                const manifest = document.createElement("script");
                manifest.id = "webwriter-offline-assets";
                manifest.type = "application/json";
                manifest.textContent = JSON.stringify(assets);
                document.head.append(manifest);
            }, assets);
            await offline.setOffline(true);
            const requests = [];
            reader.on("request", (request) => requests.push(request.url()));
            await sql.getByRole("button", { name: "Run (0)", exact: true }).press("Enter");
            await sql.getByRole("cell", { name: "Ada" }).waitFor();
            assert.deepEqual(
                requests.filter((url) => /^https?:/.test(url)),
                [],
            );
        } finally {
            await offline.close();
        }
    });

    await t.test("first Run loads the runtime and displays output", async () => {
        for (const [language, [, output]] of Object.entries(fixtures)) {
            if (language === "rust" && !process.env.CODE_TEST_RUNTIMES_ONLINE) continue;
            const start = requests.length;
            const run = widget(language).getByRole("button", { name: "Run (0)", exact: true });
            await run.press("Enter");
            if (language === "html") {
                await widget(language).frameLocator("iframe").getByText(output).waitFor();
            } else {
                await widget(language)
                    .locator("output")
                    .getByText(output, { exact: language !== "prolog" })
                    .waitFor({ timeout: 120_000 })
                    .catch(async (error) => {
                        throw new Error(language + ": " + (await widget(language).locator("output").innerText()), {
                            cause: error,
                        });
                    });
                assert.ok(
                    requests.slice(start).some((url) => runtime.test(url)),
                    language,
                );
            }
        }
        const js = widget("javascript");
        await js.getByRole("button", { expanded: false }).press("Space");
        await js.locator("button.log-clickable[aria-expanded=true]").waitFor();
        await js.getByRole("button", { expanded: false }).press("Enter");
        await js.getByText("value: 42", { exact: true }).waitFor();
    });

    await t.test("SQL renders multiple result sets, including empty tables and exact integers", async () => {
        const sql = widget("sql");
        await sql.evaluate((el) => {
            el.code = `CREATE TABLE example (name TEXT);
                INSERT INTO example VALUES ('<em>Ada</em>');
                SELECT name, null AS missing, 9223372036854775807 AS big FROM example;
                SELECT name FROM example WHERE 0;`;
        });
        await sql.getByRole("button", { name: "Run (1)" }).click();
        await sql.getByRole("cell", { name: "No rows" }).waitFor();
        assert.equal(await sql.getByRole("table").count(), 2);
        assert.deepEqual(await sql.getByRole("columnheader").allTextContents(), ["name", "missing", "big", "name"]);
        await sql.getByRole("cell", { name: "<em>Ada</em>" }).waitFor();
        await sql.getByRole("cell", { name: "9223372036854775807" }).waitFor();

        // Creating the same table again verifies that each run gets a fresh database.
        await sql.evaluate((el) => {
            el.code = `CREATE TABLE example (name TEXT);
                WITH RECURSIVE nums(n) AS (SELECT 1 UNION ALL SELECT n + 1 FROM nums WHERE n < 501)
                SELECT n FROM nums;`;
        });
        await sql.getByRole("button", { name: "Run (2)" }).click();
        await sql.getByText("Only the first 500 rows are shown.").waitFor();
        assert.equal(await sql.getByRole("cell").count(), 500);
    });

    await t.test("Prolog keeps the query in the authored markup and runs it on Enter", async () => {
        const prolog = widget("prolog");
        const query = prolog.getByRole("textbox", { name: "Query" });
        await query.fill("?- parent(ada, alan)");
        await query.press("Enter");
        await prolog.locator("output").getByText("true.").waitFor();
        assert.equal(await prolog.getAttribute("goal"), "?- parent(ada, alan)");
        await prolog.evaluate((el) => el.setAttribute("goal", "parent(ada, Who)."));
        assert.equal(await query.inputValue(), "parent(ada, Who).");
        await prolog.evaluate((el) => el.removeAttribute("goal"));
        assert.equal(await query.inputValue(), "");
        await query.press("Enter");
        await prolog.getByText("Enter a Prolog query.").waitFor();
    });

    await t.test("vertical resizing preserves the toolbar and output and scrolls the editor", async () => {
        for (const language of ["html", "javascript"]) {
            const measure = (maxHeight) =>
                widget(language).evaluate(async (element, maxHeight) => {
                    element.style.maxWidth = "100px";
                    element.style.maxHeight = maxHeight;
                    // Wait for the widget to consume WebWriter's inline resize styles.
                    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
                    const pane = (selector) => element.shadowRoot.querySelector(selector);
                    const host = element.getBoundingClientRect();
                    const scroller = pane(".cm-scroller");
                    const toolbar = pane(".controls").getBoundingClientRect();
                    const output = pane("output").getBoundingClientRect();
                    return {
                        width: host.width,
                        height: host.height,
                        editor: scroller.getBoundingClientRect().height,
                        toolbar: toolbar.height,
                        output: output.height,
                        bottomGap: host.bottom - output.bottom,
                        scrollHeight: scroller.scrollHeight,
                    };
                }, maxHeight);

            const natural = await measure("");
            const enlarged = await measure("450px");
            const minimum = await measure("10px");
            assert.equal(minimum.width, 300, language);
            assert.ok(minimum.editor >= 64, language);
            assert.equal(enlarged.height, 450, language);
            assert.equal(enlarged.editor - natural.editor, enlarged.height - natural.height, language);
            for (const layout of [enlarged, minimum]) {
                assert.equal(layout.toolbar, natural.toolbar, language);
                assert.equal(layout.output, natural.output, language);
                assert.equal(layout.bottomGap, natural.bottomGap, language);
            }

            const original = await widget(language).evaluate((element) => {
                const original = element.code;
                element.code = Array.from({ length: 100 }, (_, index) => `Line ${index + 1}`).join("\n");
                return original;
            });
            const longCode = await measure("10px");
            assert.equal(longCode.height, minimum.height, language);
            assert.ok(longCode.scrollHeight > longCode.editor, language);
            await widget(language).evaluate((element, original) => {
                element.style.removeProperty("max-width");
                element.style.removeProperty("max-height");
                element.code = original;
            }, original);
        }
    });

    await t.test("host edits bypass reader locks and preserve other authored data", async () => {
        const js = widget("javascript");
        const source = "first\nsecond\nthird";
        await js.evaluate((element, source) => {
            element.querySelector("script").textContent = JSON.stringify({ code: source, lockedLines: [2], extra: 17 });
            element.append(document.createComment("preserve me"), document.createElement("aside"));
        }, source);
        const lockedLine = js.locator(".cm-locked-line");
        await lockedLine.getByText("second", { exact: true }).waitFor();
        await lockedLine.click();
        await page.keyboard.insertText("reader");
        assert.equal(await js.evaluate((element) => element.code), source);

        await js
            .locator(".cm-lock-gutter .cm-gutterElement")
            .filter({ has: page.locator("img") })
            .last()
            .click();
        assert.deepEqual(await js.evaluate((element) => element.lockedLines), [2]);
        await js.evaluate((element) => {
            element.querySelector("script").textContent = JSON.stringify({
                code: "first\nremote\nthird",
                lockedLines: [2],
                extra: 17,
            });
        });
        await lockedLine.getByText("remote", { exact: true }).waitFor();

        await js.evaluate((element) => element.setAttribute("contenteditable", ""));
        await js.locator(".cm-author-mode").waitFor();
        await lockedLine.click();
        await page.keyboard.insertText("!");
        assert.match(await js.evaluate((element) => element.code.split("\n")[1]), /!/);
        assert.equal(await js.evaluate((element) => JSON.parse(element.querySelector("script").textContent).extra), 17);
        assert.equal(await js.locator("aside").count(), 1);
        assert.match(await js.evaluate((element) => element.innerHTML), /<!--preserve me-->/);

        await js.evaluate((element) => {
            element.removeAttribute("contenteditable");
            const parent = element.parentElement;
            element.remove();
            parent.append(element);
        });
        await js.locator(".cm-editor").waitFor();
        assert.equal(await js.locator(".cm-editor").count(), 1);
        assert.equal(await js.locator(".cm-author-mode").count(), 0);
    });

    await t.test("fixtures restore legacy source and never persist execution output", async () => {
        const js = await page.evaluateHandle(() => {
            const widget = document.createElement("webwriter-code-javascript");
            widget.setAttribute("code", 'console.log("legacy");');
            widget.setAttribute("lockedlines", "[1]");
            widget.setAttribute("autorun", "");
            widget.setAttribute("disable-execution", "");
            widget.setAttribute("showexecutioncount", "");
            document.body.append(widget);
            return widget;
        });
        assert.equal(await js.evaluate((element) => element.code), 'console.log("legacy");');
        assert.deepEqual(await js.evaluate((element) => element.lockedLines), [1]);
        const candidate = widget("javascript").last();
        await candidate.locator(".cm-content").waitFor();
        assert.equal(await candidate.getByRole("button", { name: /^Run/ }).count(), 0);
        await js.evaluate((element) => element.removeAttribute("disable-execution"));
        await candidate.getByRole("button", { name: "Run (0)", exact: true }).press("Enter");
        await candidate.locator("output").getByText("legacy", { exact: true }).waitFor();
        assert.equal(await js.evaluate((element) => element.innerHTML), "");
        await candidate.getByRole("button", { name: "Run (1)", exact: true }).waitFor();
        assert.equal(await js.evaluate((element) => element.getAttribute("executioncount")), null);

        const hideAttribute = await js.evaluate((element) => element.options.hideExecutionCount.attribute);
        assert.equal(hideAttribute, "hide-execution-count");
        await js.evaluate((element, attr) => element.setAttribute(attr, ""), hideAttribute);
        await candidate.getByRole("button", { name: "Run", exact: true }).waitFor();
        await js.evaluate((element, attr) => element.removeAttribute(attr), hideAttribute);
        await candidate.getByRole("button", { name: "Run (1)", exact: true }).waitFor();
    });

    await t.test("a missing runtime reports the error and clears the busy state", async () => {
        const broken = await browser.newPage();
        try {
            await broken.route("**/dist/runtime/python.js.gz", (route) => route.abort());
            await broken.goto(`http://127.0.0.1:${server.address().port}`);
            const python = broken.locator("webwriter-code-python");
            await python.getByRole("button", { name: "Run (0)", exact: true }).press("Enter");
            await python
                .locator("output")
                .getByText(/failed to fetch/i)
                .waitFor();
            assert.equal(await python.locator("sl-button").first().getAttribute("aria-busy"), "false");
        } finally {
            await broken.close();
        }
    });

    await t.test("changing the document language updates the cell and drawer", async () => {
        const js = widget("javascript").first();
        await page.evaluate(() => (document.documentElement.lang = "de"));
        await js.getByRole("button", { name: "Ausführen (1)", exact: true }).waitFor();
        assert.equal(
            await js.evaluate((element) => element.options.disableExecution.label._),
            "Codeausführung deaktivieren",
        );
        assert.equal(await js.evaluate((element) => element.getAttribute("lang")), null);
    });

    assert.deepEqual(errors, []);
});
