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
};

const runtime = /\/(?:javaModule|typescript-runtime|javascript-runtime|pythonModule|webassemblyModule)-/;
const languages = Object.keys(fixtures);
const cell = (language, code) =>
    `<webwriter-code-${language}><script type="application/json" slot="data">${JSON.stringify({ code }).replace(/</g, "\\u003c")}</script></webwriter-code-${language}>`;
const markup = `<!doctype html><html lang="en"><meta charset="utf-8">${languages
    .map(
        (language) => `
    <link rel="stylesheet" href="/dist/widgets/ww-code-${language}.css">
    <script type="module" src="/dist/widgets/ww-code-${language}.js"></script>`,
    )
    .join("")}
    <body>${languages.map((language) => cell(language, fixtures[language][0])).join("")}</body></html>`;

test("code widgets defer runtimes and preserve authored content", async (t) => {
    const server = createServer(async (req, res) => {
        const { pathname } = new URL(req.url, "http://127.0.0.1");
        if (pathname === "/") return res.setHeader("content-type", "text/html").end(markup);
        if (pathname === "/favicon.ico") return res.writeHead(204).end();
        if (!/^\/dist\/(?:widgets|chunks)\/[\w-]+\.(?:js|css)$/.test(pathname)) return res.writeHead(404).end();
        try {
            const file = await readFile(new URL(".." + pathname, import.meta.url));
            res.setHeader("content-type", pathname.endsWith(".js") ? "text/javascript" : "text/css").end(file);
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

    await t.test("first Run loads the runtime and displays output", async () => {
        for (const [language, [, output]] of Object.entries(fixtures)) {
            if (language === "python" && !process.env.CODE_TEST_PYTHON_ONLINE) continue;
            const start = requests.length;
            await widget(language).getByRole("button", { name: "Run", exact: true }).press("Enter");
            if (language === "html") {
                await widget(language).frameLocator("iframe").getByText(output).waitFor();
            } else {
                await widget(language).locator("output").getByText(output, { exact: true }).waitFor();
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
        assert.equal(await js.evaluate((element) => element.getAttribute("executioncount")), null);
    });

    await t.test("a missing runtime reports the error and clears the busy state", async () => {
        const broken = await browser.newPage();
        try {
            await broken.route("**/pythonModule-*.js", (route) => route.abort());
            await broken.goto(`http://127.0.0.1:${server.address().port}`);
            const python = broken.locator("webwriter-code-python");
            await python.getByRole("button", { name: "Run", exact: true }).press("Enter");
            await python
                .locator("output")
                .getByText(/failed to fetch dynamically imported module/i)
                .waitFor();
            assert.equal(
                await python.locator("sl-button").first().getAttribute("aria-busy"),
                "false",
            );
        } finally {
            await broken.close();
        }
    });

    await t.test("changing the document language updates the cell and drawer", async () => {
        const js = widget("javascript").first();
        await page.evaluate(() => (document.documentElement.lang = "de"));
        await js.getByRole("button", { name: "Ausführen", exact: true }).waitFor();
        assert.equal(
            await js.evaluate((element) => element.options.disableExecution.label._),
            "Codeausführung deaktivieren",
        );
        assert.equal(await js.evaluate((element) => element.getAttribute("lang")), null);
    });

    assert.deepEqual(errors, []);
});
