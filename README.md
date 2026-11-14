# Code

Write and run interactive code exercises in WebWriter. The package has 17 cell types:

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
| C | `webwriter-code-c` | Clang and WASI libc |
| C++ | `webwriter-code-cpp` | Clang and WASI libc++ |
| C# | `webwriter-code-csharp` | Roslyn and .NET 10 WebAssembly |
| PHP | `webwriter-code-php` | PHP 8.4 from WordPress Playground |
| Go | `webwriter-code-go` | Go 1.27.4 compiler and linker |
| Rust | `webwriter-code-rust` | rustc's Miri interpreter via LiveCodes |
| Bash | `webwriter-code-shell` | Bash-compatible shell via just-bash |

The editor loads syntax highlighting on activation. Workers, compilers, and libraries
are fetched on **Run**, or on load when **Run on load** is enabled. WebWriter's
**Offline HTML** export uses the `offlineAssets` interface to embed each runtime
file once for the runnable cells in the document. The export requires network
access to download runtime files that are hosted on a CDN. The saved HTML runs
with networking disabled.

Python's core interpreter and standard library are included. Add-on packages
downloaded by Pyodide and external resources referenced by authored programs or
HTML previews require their usual network access.

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

Publish or serve the whole `dist` directory, including `dist/chunks` and
`dist/runtime`. The widget entry scripts use those relative paths to locate
their workers. The browser needs no import map for this build. Source text
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

The Code menu includes starter snippets under `@webwriter/code/snippets/`.
C and C++ share one compiler and sysroot. They target WASI, with C++ exceptions
disabled in the bundled sysroot. Go includes a subset of its standard library.
Rust uses a single source file with the bundled standard library and runs under
Miri. C# uses the browser .NET framework and exposes console output. Bash
supports Bash syntax and a virtual filesystem with bundled commands.

## Development

Use Node.js 24.18+ and npm 11.16+ for the current PHP build dependencies.
Run `npm ci` and `npm run dev`, then load this package
through WebWriter's **Develop → Local packages → Load**. Use
`npm run prepublishOnly` for a one-time production build.

Run `npm test` with Chrome installed to check the built exports, lazy runtime
loading, saved state, author and reader behavior, and keyboard interactions.
Set `CODE_TEST_RUNTIMES_ONLINE=1` to include Python, C, C++, PHP, and Rust
fixtures against their pinned CDN assets.

The prebuilt Go and C# archives are checked in so ordinary widget builds only
need Node and npm. See [toolchain build instructions](scripts/toolchains/README.md)
for updating those archives.
