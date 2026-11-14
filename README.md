# Code

Write and run interactive code exercises in WebWriter. The package has ten cell types:

| Cell | Element | Runtime |
| --- | --- | --- |
| HTML | `webwriter-code-html` | Browser preview in a sandboxed iframe |
| JavaScript | `webwriter-code-javascript` | JavaScript worker and interactive console |
| TypeScript | `webwriter-code-typescript` | TypeScript transpiler and JavaScript worker |
| Python | `webwriter-code-python` | Pyodide |
| Java | `webwriter-code-java` | TeaVM (Java 21) |
| WebAssembly | `webwriter-code-webassembly` | WABT for WebAssembly Text Format (WAT) |
| SQL | `webwriter-code-sql` | SQLite via sql.js |
| Lua | `webwriter-code-lua` | Lua 5.4 via Wasmoon |
| Prolog | `webwriter-code-prolog` | Tau Prolog |
| Scheme | `webwriter-code-scheme` | BiwaScheme |

The editor and syntax highlighting load when the cell opens. The execution runtime
loads on the first **Run**, or on load when **Run on load** is enabled. A WebWriter
**Offline HTML** export includes the bundled runtimes required by its runnable cells.
Python's widget module is also included when needed, but Pyodide and its Python
packages still require an internet connection. HTML previews can also request
external resources referenced by authored code.

## Authoring and embedding

Insert a code cell in WebWriter. Its Widget drawer controls execution,
autocompletion, code visibility, and execution statistics. While authoring, click
the lock gutter or press Control+L (Command+L on macOS) to toggle locks on selected
lines. Readers may edit unlocked lines.

The saved program and locked lines are stored in an inert JSON script. Use the
matching built stylesheet and module when embedding on a plain page:

```html
<link rel="stylesheet" href="./dist/widgets/ww-code-javascript.css">
<script type="module" src="./dist/widgets/ww-code-javascript.js"></script>
<webwriter-code-javascript>
  <script type="application/json" slot="data">
    {"code":"console.log('Hello, world!');","lockedLines":[1]}
  </script>
</webwriter-code-javascript>
```

Publish or serve the whole `dist` directory, including `dist/chunks`. Each
entry shares the same editor dependencies and loads its runtime via a relative
module import; the browser needs no import map for this build. Source text
containing a literal `<` should use the JSON escape `\u003c` in hand-authored
data blocks.

The authored attributes are `autorun`, `autocomplete`, `hide-code`,
`disable-execution`, `showexecutiontime`, and `hide-execution-count`. The Run
button shows the execution count by default. Use **Hide execution count** in the
Widget drawer to hide it. Run results, diagnostics, counts, and timings stay in
memory. Older `code` and `lockedlines` attributes remain readable when their
fields are absent from the data block.

SQL starts with an empty in-memory database on each run. Use the same cell to
create tables, insert data, and query it. Each query result shows up to 500 rows
in its own table. In Prolog, enter facts and rules in the editor and the goal in
the **Query** field. The goal is saved in the cell's `goal` attribute.

The package exports the `HTML.html`, `java.html`, `sql.html`, `lua.html`,
`prolog.html`, and `scheme.html` starter snippets under `@webwriter/code/snippets/`.

## Development

Use Node.js 22 or newer. Run `npm ci` and `npm run dev`, then load this package
through WebWriter's **Develop → Local packages → Load**. Use
`npm run prepublishOnly` for a one-time production build.

Run `npm test` with Chrome installed to check the built exports, lazy runtime
loading, saved state, author and reader behavior, and keyboard interactions.
Set `CODE_TEST_PYTHON_ONLINE=1` to execute the Python fixture against the CDN.
