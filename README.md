# Code (`@webwriter/code@4.0.0`)
[License: MIT](LICENSE) | Version: 4.0.0

Write and run code in HTML, JavaScript, TypeScript, Python, Java, WebAssembly, SQL, Lua, Prolog, Scheme, C#, C, C++, PHP, Go, Rust, Bash, and Haskell.

## Snippets
[Snippets](https://webwriter.app/docs/snippets/snippets/) are examples and templates using the package's widgets.

| Name | Import Path |
| :--: | :---------: |
| HTML | `@webwriter/code/snippets/HTML.html` |
| Java | `@webwriter/code/snippets/java.html` |
| Sql | `@webwriter/code/snippets/sql.html` |
| Lua | `@webwriter/code/snippets/lua.html` |
| Prolog | `@webwriter/code/snippets/prolog.html` |
| Scheme | `@webwriter/code/snippets/scheme.html` |
| C | `@webwriter/code/snippets/c.html` |
| Cpp | `@webwriter/code/snippets/cpp.html` |
| Csharp | `@webwriter/code/snippets/csharp.html` |
| Php | `@webwriter/code/snippets/php.html` |
| Go | `@webwriter/code/snippets/go.html` |
| Rust | `@webwriter/code/snippets/rust.html` |
| Shell | `@webwriter/code/snippets/shell.html` |
| Haskell | `@webwriter/code/snippets/haskell.html` |



## `WebwriterCodeJavascript` (`<webwriter-code-javascript>`)
Code widget for JavaScript with execution capabilities.

Runs in a worker with an interactive console.

Authoring: the Widget drawer controls execution, autocompletion, code visibility and execution statistics. While authoring, click the lock gutter or press Control+L (Command+L on macOS) to toggle locks on selected lines; readers may edit unlocked lines. The program and locked lines are stored in an inert JSON script (`<script type="application/json" slot="data">`, with `{"code":"...","lockedLines":[1]}`); a literal `<` should be written as `\u003c`. The authored attributes are `autorun`, `autocomplete`, `hide-code`, `disable-execution`, `showexecutiontime` and `hide-execution-count`. Older `code` and `lockedlines` attributes stay readable when the data block lacks the fields. Run results, diagnostics, counts and timings stay in memory.

Embedding on a plain page: serve the whole `dist` directory (including `dist/chunks` and `dist/runtime`), because the entry scripts locate their workers relative to themselves. No import map is needed.

Conversions: a `pre` element converts both ways, and a source file with the language's extension is imported or exported (the import replaces the program and clears locked lines; an export drops locked lines and run results).

Signals: `output` (string) is the text of the last run, or its error messages; `failed` (boolean) is true after an error (in JavaScript and TypeScript also after `console.error`).

### Usage

Use with a CDN (e.g. [jsdelivr](https://jsdelivr.com)):
```html
<link href="https://cdn.jsdelivr.net/npm/@webwriter/code/widgets/webwriter-code-javascript.css" rel="stylesheet">
<script type="module" src="https://cdn.jsdelivr.net/npm/@webwriter/code/widgets/webwriter-code-javascript.js"></script>
<webwriter-code-javascript></webwriter-code-javascript>
```

Or use with a bundler (e.g. [Vite](https://vite.dev)):

```
npm install @webwriter/code
```

```html
<link href="@webwriter/code/widgets/webwriter-code-javascript.css" rel="stylesheet">
<script type="module" src="@webwriter/code/widgets/webwriter-code-javascript.js"></script>
<webwriter-code-javascript></webwriter-code-javascript>
```

## Fields
| Name (Attribute Name) | Type | Description | Default | Reflects |
| :-------------------: | :--: | :---------: | :-----: | :------: |
| `WebwriterCodeJavascript.convertFrom` | - | - | - | ✗ |
| `WebwriterCodeJavascript.convertTo` | - | - | - | ✗ |
| `WebwriterCodeJavascript.settings` | - | - | `declarations` | ✗ |
| `settingsCore` | - | - | `new SettingsCore(this, { ...options, root: () => this.renderRoot, rendered: () => this.updateComplete })` | ✗ |
| `options` | - | - | - | ✗ |
| `WebwriterCodeJavascript.optionGroups` | `object` | - | `{ execution: { label: drawerText({ en: "Execution", de: "Ausführung" }, (msg) => msg("Execution")) }, editor: { label: (widget: DrawerTexts) => ({ _: widget.msg("Editor") }) }, results: { label: drawerText({ en: "Results", de: "Ergebnisse" }, (msg) => msg("Results")) }, }` | ✗ |
| `WebwriterCodeJavascript.actions` | `object` | - | `{ resetExecutionCount: { group: "results", label: drawerText( { en: "Reset execution count", de: "Anzahl der Ausführungen zurücksetzen" }, (msg) => msg("Reset execution count"), ), }, }` | ✗ |
| `msg` | - | - | - | ✗ |
| `signals` | `Record<string, { get(): unknown }>` | Signals other widgets can read: `output` (string) is the text of the last run's output, or its error messages;<br>`failed` (boolean) is true when the last run ended with an error or logged one to the console. | `{ output: computed(() => this.#output.get()), failed: computed(() => this.#failed.get()), }` | ✗ |
| `executionTime` | `number` | The execution time in milliseconds of the last code run. | `0` | ✗ |
| `executionCount` | `number` | The number of times the code has been executed. | `0` | ✗ |
| `results` | `CodeResult[]` | The results from the last code execution. | `[]` | ✗ |
| `diagnostics` | `Diagnostic[]` | Compilation or runtime errors from the last code execution. | `[]` | ✗ |
| `code` | - | The authored source in the JSON data block, or in a legacy code attribute. | - | ✗ |
| `lockedLines` | `number[]` | The authored, one-based line numbers locked for readers. | - | ✗ |
| `showExecutionCount` | - | Whether the run button displays the execution count. | - | ✗ |

*Fields including [properties](https://developer.mozilla.org/en-US/docs/Glossary/Property/JavaScript) and [attributes](https://developer.mozilla.org/en-US/docs/Glossary/Attribute) define the current state of the widget and offer customization options.*

## Methods
| Name | Description | Parameters |
| :--: | :---------: | :-------: |
| `offlineAssets` | - | `element: Element`
| `finalize` | - | -
| `loadPre` | Takes the program from a `pre` element (conversion). Declines when the fragment has none. | `fragment: DocumentFragment`
| `toPre` | The program as a `pre` element with a `code` child (conversion). | -
| `importSource` | Reads a source file and returns the function that replaces the program with it (import). | `file: File`
| `exportSource` | The program as a source file with the language's extension (export). Locked lines are not part of the file. | -
| `resetExecutionCount` | - | -

*[Methods](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Method_definitions) allow programmatic access to the widget.*

## CSS parts
| Name | Description |
| :--: | :---------: |
| editor | The code editor. |
| output | The area for results, console lines and tables. |

*[CSS parts](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_shadow_parts) allow freely styling internals of the widget with CSS.*

## Editing config
| Name | Value |
| :--: | :---------: |


*The [editing config](https://webwriter.app/docs/packages/configuring/#editingconfig) defines how explorable authoring tools such as [WebWriter](https://webwriter.app) treat the widget.*

*No public slots, events, or custom CSS properties.*


## `WebwriterCodeHtml` (`<webwriter-code-html>`)
Code widget for HTML with live preview functionality.

Renders the preview in a sandboxed iframe. External resources referenced by the authored HTML need their usual network access.

Conversions: a `pre` element converts both ways, and a source file with the language's extension is imported or exported (the import replaces the program and clears locked lines; an export drops locked lines and run results).

Signals: `output` (string) and `failed` (boolean) exist for every widget but stay empty and false for HTML, because the preview page is not run through the shared runner.

### Usage

Use with a CDN (e.g. [jsdelivr](https://jsdelivr.com)):
```html
<link href="https://cdn.jsdelivr.net/npm/@webwriter/code/widgets/webwriter-code-html.css" rel="stylesheet">
<script type="module" src="https://cdn.jsdelivr.net/npm/@webwriter/code/widgets/webwriter-code-html.js"></script>
<webwriter-code-html></webwriter-code-html>
```

Or use with a bundler (e.g. [Vite](https://vite.dev)):

```
npm install @webwriter/code
```

```html
<link href="@webwriter/code/widgets/webwriter-code-html.css" rel="stylesheet">
<script type="module" src="@webwriter/code/widgets/webwriter-code-html.js"></script>
<webwriter-code-html></webwriter-code-html>
```

## Fields
| Name (Attribute Name) | Type | Description | Default | Reflects |
| :-------------------: | :--: | :---------: | :-----: | :------: |
| `WebwriterCodeHtml.convertFrom` | - | - | - | ✗ |
| `WebwriterCodeHtml.convertTo` | - | - | - | ✗ |
| `WebwriterCodeHtml.settings` | - | - | `declarations` | ✗ |
| `settingsCore` | - | - | `new SettingsCore(this, { ...options, root: () => this.renderRoot, rendered: () => this.updateComplete })` | ✗ |
| `options` | - | - | - | ✗ |
| `WebwriterCodeHtml.optionGroups` | `object` | - | `{ execution: { label: drawerText({ en: "Execution", de: "Ausführung" }, (msg) => msg("Execution")) }, editor: { label: (widget: DrawerTexts) => ({ _: widget.msg("Editor") }) }, results: { label: drawerText({ en: "Results", de: "Ergebnisse" }, (msg) => msg("Results")) }, }` | ✗ |
| `WebwriterCodeHtml.actions` | `object` | - | `{ resetExecutionCount: { group: "results", label: drawerText( { en: "Reset execution count", de: "Anzahl der Ausführungen zurücksetzen" }, (msg) => msg("Reset execution count"), ), }, }` | ✗ |
| `msg` | - | - | - | ✗ |
| `signals` | `Record<string, { get(): unknown }>` | Signals other widgets can read: `output` (string) is the text of the last run's output, or its error messages;<br>`failed` (boolean) is true when the last run ended with an error or logged one to the console. | `{ output: computed(() => this.#output.get()), failed: computed(() => this.#failed.get()), }` | ✗ |
| `executionTime` | `number` | The execution time in milliseconds of the last code run. | `0` | ✗ |
| `executionCount` | `number` | The number of times the code has been executed. | `0` | ✗ |
| `results` | `CodeResult[]` | The results from the last code execution. | `[]` | ✗ |
| `diagnostics` | `Diagnostic[]` | Compilation or runtime errors from the last code execution. | `[]` | ✗ |
| `code` | - | The authored source in the JSON data block, or in a legacy code attribute. | - | ✗ |
| `lockedLines` | `number[]` | The authored, one-based line numbers locked for readers. | - | ✗ |
| `showExecutionCount` | - | Whether the run button displays the execution count. | - | ✗ |

*Fields including [properties](https://developer.mozilla.org/en-US/docs/Glossary/Property/JavaScript) and [attributes](https://developer.mozilla.org/en-US/docs/Glossary/Attribute) define the current state of the widget and offer customization options.*

## Methods
| Name | Description | Parameters |
| :--: | :---------: | :-------: |
| `finalize` | - | -
| `loadPre` | Takes the program from a `pre` element (conversion). Declines when the fragment has none. | `fragment: DocumentFragment`
| `toPre` | The program as a `pre` element with a `code` child (conversion). | -
| `importSource` | Reads a source file and returns the function that replaces the program with it (import). | `file: File`
| `exportSource` | The program as a source file with the language's extension (export). Locked lines are not part of the file. | -
| `resetExecutionCount` | - | -

*[Methods](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Method_definitions) allow programmatic access to the widget.*

## CSS parts
| Name | Description |
| :--: | :---------: |
| editor | The code editor. |
| output | The area for results, console lines and tables. |
| preview | The frame that shows the rendered page. |

*[CSS parts](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_shadow_parts) allow freely styling internals of the widget with CSS.*

## Editing config
| Name | Value |
| :--: | :---------: |


*The [editing config](https://webwriter.app/docs/packages/configuring/#editingconfig) defines how explorable authoring tools such as [WebWriter](https://webwriter.app) treat the widget.*

*No public slots, events, or custom CSS properties.*


## `WebwriterCodeJava` (`<webwriter-code-java>`)
Code widget for Java with compilation and execution capabilities using TeaVM (Java 21).

Compiles Java 21 with TeaVM.

Conversions: a `pre` element converts both ways, and a source file with the language's extension is imported or exported (the import replaces the program and clears locked lines; an export drops locked lines and run results).

Signals: `output` (string) is the text of the last run, or its error messages; `failed` (boolean) is true after an error.

### Usage

Use with a CDN (e.g. [jsdelivr](https://jsdelivr.com)):
```html
<link href="https://cdn.jsdelivr.net/npm/@webwriter/code/widgets/webwriter-code-java.css" rel="stylesheet">
<script type="module" src="https://cdn.jsdelivr.net/npm/@webwriter/code/widgets/webwriter-code-java.js"></script>
<webwriter-code-java></webwriter-code-java>
```

Or use with a bundler (e.g. [Vite](https://vite.dev)):

```
npm install @webwriter/code
```

```html
<link href="@webwriter/code/widgets/webwriter-code-java.css" rel="stylesheet">
<script type="module" src="@webwriter/code/widgets/webwriter-code-java.js"></script>
<webwriter-code-java></webwriter-code-java>
```

## Fields
| Name (Attribute Name) | Type | Description | Default | Reflects |
| :-------------------: | :--: | :---------: | :-----: | :------: |
| `WebwriterCodeJava.convertFrom` | - | - | - | ✗ |
| `WebwriterCodeJava.convertTo` | - | - | - | ✗ |
| `WebwriterCodeJava.settings` | - | - | `declarations` | ✗ |
| `settingsCore` | - | - | `new SettingsCore(this, { ...options, root: () => this.renderRoot, rendered: () => this.updateComplete })` | ✗ |
| `options` | - | - | - | ✗ |
| `WebwriterCodeJava.optionGroups` | `object` | - | `{ execution: { label: drawerText({ en: "Execution", de: "Ausführung" }, (msg) => msg("Execution")) }, editor: { label: (widget: DrawerTexts) => ({ _: widget.msg("Editor") }) }, results: { label: drawerText({ en: "Results", de: "Ergebnisse" }, (msg) => msg("Results")) }, }` | ✗ |
| `WebwriterCodeJava.actions` | `object` | - | `{ resetExecutionCount: { group: "results", label: drawerText( { en: "Reset execution count", de: "Anzahl der Ausführungen zurücksetzen" }, (msg) => msg("Reset execution count"), ), }, }` | ✗ |
| `msg` | - | - | - | ✗ |
| `signals` | `Record<string, { get(): unknown }>` | Signals other widgets can read: `output` (string) is the text of the last run's output, or its error messages;<br>`failed` (boolean) is true when the last run ended with an error or logged one to the console. | `{ output: computed(() => this.#output.get()), failed: computed(() => this.#failed.get()), }` | ✗ |
| `executionTime` | `number` | The execution time in milliseconds of the last code run. | `0` | ✗ |
| `executionCount` | `number` | The number of times the code has been executed. | `0` | ✗ |
| `results` | `CodeResult[]` | The results from the last code execution. | `[]` | ✗ |
| `diagnostics` | `Diagnostic[]` | Compilation or runtime errors from the last code execution. | `[]` | ✗ |
| `code` | - | The authored source in the JSON data block, or in a legacy code attribute. | - | ✗ |
| `lockedLines` | `number[]` | The authored, one-based line numbers locked for readers. | - | ✗ |
| `showExecutionCount` | - | Whether the run button displays the execution count. | - | ✗ |

*Fields including [properties](https://developer.mozilla.org/en-US/docs/Glossary/Property/JavaScript) and [attributes](https://developer.mozilla.org/en-US/docs/Glossary/Attribute) define the current state of the widget and offer customization options.*

## Methods
| Name | Description | Parameters |
| :--: | :---------: | :-------: |
| `offlineAssets` | - | `element: Element`
| `finalize` | - | -
| `loadPre` | Takes the program from a `pre` element (conversion). Declines when the fragment has none. | `fragment: DocumentFragment`
| `toPre` | The program as a `pre` element with a `code` child (conversion). | -
| `importSource` | Reads a source file and returns the function that replaces the program with it (import). | `file: File`
| `exportSource` | The program as a source file with the language's extension (export). Locked lines are not part of the file. | -
| `resetExecutionCount` | - | -

*[Methods](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Method_definitions) allow programmatic access to the widget.*

## CSS parts
| Name | Description |
| :--: | :---------: |
| editor | The code editor. |
| output | The area for results, console lines and tables. |

*[CSS parts](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_shadow_parts) allow freely styling internals of the widget with CSS.*

## Editing config
| Name | Value |
| :--: | :---------: |


*The [editing config](https://webwriter.app/docs/packages/configuring/#editingconfig) defines how explorable authoring tools such as [WebWriter](https://webwriter.app) treat the widget.*

*No public slots, events, or custom CSS properties.*


## `WebwriterCodeTypescript` (`<webwriter-code-typescript>`)
Code widget for TypeScript with compilation and execution capabilities.

Transpiles with the TypeScript compiler, then runs the JavaScript in a worker.

Conversions: a `pre` element converts both ways, and a source file with the language's extension is imported or exported (the import replaces the program and clears locked lines; an export drops locked lines and run results).

Signals: `output` (string) is the text of the last run, or its error messages; `failed` (boolean) is true after an error (in JavaScript and TypeScript also after `console.error`).

### Usage

Use with a CDN (e.g. [jsdelivr](https://jsdelivr.com)):
```html
<link href="https://cdn.jsdelivr.net/npm/@webwriter/code/widgets/webwriter-code-typescript.css" rel="stylesheet">
<script type="module" src="https://cdn.jsdelivr.net/npm/@webwriter/code/widgets/webwriter-code-typescript.js"></script>
<webwriter-code-typescript></webwriter-code-typescript>
```

Or use with a bundler (e.g. [Vite](https://vite.dev)):

```
npm install @webwriter/code
```

```html
<link href="@webwriter/code/widgets/webwriter-code-typescript.css" rel="stylesheet">
<script type="module" src="@webwriter/code/widgets/webwriter-code-typescript.js"></script>
<webwriter-code-typescript></webwriter-code-typescript>
```

## Fields
| Name (Attribute Name) | Type | Description | Default | Reflects |
| :-------------------: | :--: | :---------: | :-----: | :------: |
| `WebwriterCodeTypescript.convertFrom` | - | - | - | ✗ |
| `WebwriterCodeTypescript.convertTo` | - | - | - | ✗ |
| `WebwriterCodeTypescript.settings` | - | - | `declarations` | ✗ |
| `settingsCore` | - | - | `new SettingsCore(this, { ...options, root: () => this.renderRoot, rendered: () => this.updateComplete })` | ✗ |
| `options` | - | - | - | ✗ |
| `WebwriterCodeTypescript.optionGroups` | `object` | - | `{ execution: { label: drawerText({ en: "Execution", de: "Ausführung" }, (msg) => msg("Execution")) }, editor: { label: (widget: DrawerTexts) => ({ _: widget.msg("Editor") }) }, results: { label: drawerText({ en: "Results", de: "Ergebnisse" }, (msg) => msg("Results")) }, }` | ✗ |
| `WebwriterCodeTypescript.actions` | `object` | - | `{ resetExecutionCount: { group: "results", label: drawerText( { en: "Reset execution count", de: "Anzahl der Ausführungen zurücksetzen" }, (msg) => msg("Reset execution count"), ), }, }` | ✗ |
| `msg` | - | - | - | ✗ |
| `signals` | `Record<string, { get(): unknown }>` | Signals other widgets can read: `output` (string) is the text of the last run's output, or its error messages;<br>`failed` (boolean) is true when the last run ended with an error or logged one to the console. | `{ output: computed(() => this.#output.get()), failed: computed(() => this.#failed.get()), }` | ✗ |
| `executionTime` | `number` | The execution time in milliseconds of the last code run. | `0` | ✗ |
| `executionCount` | `number` | The number of times the code has been executed. | `0` | ✗ |
| `results` | `CodeResult[]` | The results from the last code execution. | `[]` | ✗ |
| `diagnostics` | `Diagnostic[]` | Compilation or runtime errors from the last code execution. | `[]` | ✗ |
| `code` | - | The authored source in the JSON data block, or in a legacy code attribute. | - | ✗ |
| `lockedLines` | `number[]` | The authored, one-based line numbers locked for readers. | - | ✗ |
| `showExecutionCount` | - | Whether the run button displays the execution count. | - | ✗ |

*Fields including [properties](https://developer.mozilla.org/en-US/docs/Glossary/Property/JavaScript) and [attributes](https://developer.mozilla.org/en-US/docs/Glossary/Attribute) define the current state of the widget and offer customization options.*

## Methods
| Name | Description | Parameters |
| :--: | :---------: | :-------: |
| `offlineAssets` | - | `element: Element`
| `finalize` | - | -
| `loadPre` | Takes the program from a `pre` element (conversion). Declines when the fragment has none. | `fragment: DocumentFragment`
| `toPre` | The program as a `pre` element with a `code` child (conversion). | -
| `importSource` | Reads a source file and returns the function that replaces the program with it (import). | `file: File`
| `exportSource` | The program as a source file with the language's extension (export). Locked lines are not part of the file. | -
| `resetExecutionCount` | - | -

*[Methods](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Method_definitions) allow programmatic access to the widget.*

## CSS parts
| Name | Description |
| :--: | :---------: |
| editor | The code editor. |
| output | The area for results, console lines and tables. |

*[CSS parts](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_shadow_parts) allow freely styling internals of the widget with CSS.*

## Editing config
| Name | Value |
| :--: | :---------: |


*The [editing config](https://webwriter.app/docs/packages/configuring/#editingconfig) defines how explorable authoring tools such as [WebWriter](https://webwriter.app) treat the widget.*

*No public slots, events, or custom CSS properties.*


## `WebwriterCodePython` (`<webwriter-code-python>`)
Code widget for Python with execution capabilities using Pyodide.

The interpreter and standard library are bundled; add-on packages downloaded by Pyodide need network access.

Conversions: a `pre` element converts both ways, and a source file with the language's extension is imported or exported (the import replaces the program and clears locked lines; an export drops locked lines and run results).

Signals: `output` (string) is the text of the last run, or its error messages; `failed` (boolean) is true after an error.

### Usage

Use with a CDN (e.g. [jsdelivr](https://jsdelivr.com)):
```html
<link href="https://cdn.jsdelivr.net/npm/@webwriter/code/widgets/webwriter-code-python.css" rel="stylesheet">
<script type="module" src="https://cdn.jsdelivr.net/npm/@webwriter/code/widgets/webwriter-code-python.js"></script>
<webwriter-code-python></webwriter-code-python>
```

Or use with a bundler (e.g. [Vite](https://vite.dev)):

```
npm install @webwriter/code
```

```html
<link href="@webwriter/code/widgets/webwriter-code-python.css" rel="stylesheet">
<script type="module" src="@webwriter/code/widgets/webwriter-code-python.js"></script>
<webwriter-code-python></webwriter-code-python>
```

## Fields
| Name (Attribute Name) | Type | Description | Default | Reflects |
| :-------------------: | :--: | :---------: | :-----: | :------: |
| `WebwriterCodePython.convertFrom` | - | - | - | ✗ |
| `WebwriterCodePython.convertTo` | - | - | - | ✗ |
| `WebwriterCodePython.settings` | - | - | `declarations` | ✗ |
| `settingsCore` | - | - | `new SettingsCore(this, { ...options, root: () => this.renderRoot, rendered: () => this.updateComplete })` | ✗ |
| `options` | - | - | - | ✗ |
| `WebwriterCodePython.optionGroups` | `object` | - | `{ execution: { label: drawerText({ en: "Execution", de: "Ausführung" }, (msg) => msg("Execution")) }, editor: { label: (widget: DrawerTexts) => ({ _: widget.msg("Editor") }) }, results: { label: drawerText({ en: "Results", de: "Ergebnisse" }, (msg) => msg("Results")) }, }` | ✗ |
| `WebwriterCodePython.actions` | `object` | - | `{ resetExecutionCount: { group: "results", label: drawerText( { en: "Reset execution count", de: "Anzahl der Ausführungen zurücksetzen" }, (msg) => msg("Reset execution count"), ), }, }` | ✗ |
| `msg` | - | - | - | ✗ |
| `signals` | `Record<string, { get(): unknown }>` | Signals other widgets can read: `output` (string) is the text of the last run's output, or its error messages;<br>`failed` (boolean) is true when the last run ended with an error or logged one to the console. | `{ output: computed(() => this.#output.get()), failed: computed(() => this.#failed.get()), }` | ✗ |
| `executionTime` | `number` | The execution time in milliseconds of the last code run. | `0` | ✗ |
| `executionCount` | `number` | The number of times the code has been executed. | `0` | ✗ |
| `results` | `CodeResult[]` | The results from the last code execution. | `[]` | ✗ |
| `diagnostics` | `Diagnostic[]` | Compilation or runtime errors from the last code execution. | `[]` | ✗ |
| `code` | - | The authored source in the JSON data block, or in a legacy code attribute. | - | ✗ |
| `lockedLines` | `number[]` | The authored, one-based line numbers locked for readers. | - | ✗ |
| `showExecutionCount` | - | Whether the run button displays the execution count. | - | ✗ |

*Fields including [properties](https://developer.mozilla.org/en-US/docs/Glossary/Property/JavaScript) and [attributes](https://developer.mozilla.org/en-US/docs/Glossary/Attribute) define the current state of the widget and offer customization options.*

## Methods
| Name | Description | Parameters |
| :--: | :---------: | :-------: |
| `offlineAssets` | - | `element: Element`
| `finalize` | - | -
| `loadPre` | Takes the program from a `pre` element (conversion). Declines when the fragment has none. | `fragment: DocumentFragment`
| `toPre` | The program as a `pre` element with a `code` child (conversion). | -
| `importSource` | Reads a source file and returns the function that replaces the program with it (import). | `file: File`
| `exportSource` | The program as a source file with the language's extension (export). Locked lines are not part of the file. | -
| `resetExecutionCount` | - | -

*[Methods](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Method_definitions) allow programmatic access to the widget.*

## CSS parts
| Name | Description |
| :--: | :---------: |
| editor | The code editor. |
| output | The area for results, console lines and tables. |

*[CSS parts](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_shadow_parts) allow freely styling internals of the widget with CSS.*

## Editing config
| Name | Value |
| :--: | :---------: |


*The [editing config](https://webwriter.app/docs/packages/configuring/#editingconfig) defines how explorable authoring tools such as [WebWriter](https://webwriter.app) treat the widget.*

*No public slots, events, or custom CSS properties.*


## `WebwriterCodeWebassembly` (`<webwriter-code-webassembly>`)
Code widget for WebAssembly with compilation and execution capabilities.

Assembles WebAssembly Text Format (WAT) with WABT.

Conversions: a `pre` element converts both ways, and a source file with the language's extension is imported or exported (the import replaces the program and clears locked lines; an export drops locked lines and run results).

Signals: `output` (string) is the text of the last run, or its error messages; `failed` (boolean) is true after an error.

### Usage

Use with a CDN (e.g. [jsdelivr](https://jsdelivr.com)):
```html
<link href="https://cdn.jsdelivr.net/npm/@webwriter/code/widgets/webwriter-code-webassembly.css" rel="stylesheet">
<script type="module" src="https://cdn.jsdelivr.net/npm/@webwriter/code/widgets/webwriter-code-webassembly.js"></script>
<webwriter-code-webassembly></webwriter-code-webassembly>
```

Or use with a bundler (e.g. [Vite](https://vite.dev)):

```
npm install @webwriter/code
```

```html
<link href="@webwriter/code/widgets/webwriter-code-webassembly.css" rel="stylesheet">
<script type="module" src="@webwriter/code/widgets/webwriter-code-webassembly.js"></script>
<webwriter-code-webassembly></webwriter-code-webassembly>
```

## Fields
| Name (Attribute Name) | Type | Description | Default | Reflects |
| :-------------------: | :--: | :---------: | :-----: | :------: |
| `WebwriterCodeWebassembly.convertFrom` | - | - | - | ✗ |
| `WebwriterCodeWebassembly.convertTo` | - | - | - | ✗ |
| `WebwriterCodeWebassembly.settings` | - | - | `declarations` | ✗ |
| `settingsCore` | - | - | `new SettingsCore(this, { ...options, root: () => this.renderRoot, rendered: () => this.updateComplete })` | ✗ |
| `options` | - | - | - | ✗ |
| `WebwriterCodeWebassembly.optionGroups` | `object` | - | `{ execution: { label: drawerText({ en: "Execution", de: "Ausführung" }, (msg) => msg("Execution")) }, editor: { label: (widget: DrawerTexts) => ({ _: widget.msg("Editor") }) }, results: { label: drawerText({ en: "Results", de: "Ergebnisse" }, (msg) => msg("Results")) }, }` | ✗ |
| `WebwriterCodeWebassembly.actions` | `object` | - | `{ resetExecutionCount: { group: "results", label: drawerText( { en: "Reset execution count", de: "Anzahl der Ausführungen zurücksetzen" }, (msg) => msg("Reset execution count"), ), }, }` | ✗ |
| `msg` | - | - | - | ✗ |
| `signals` | `Record<string, { get(): unknown }>` | Signals other widgets can read: `output` (string) is the text of the last run's output, or its error messages;<br>`failed` (boolean) is true when the last run ended with an error or logged one to the console. | `{ output: computed(() => this.#output.get()), failed: computed(() => this.#failed.get()), }` | ✗ |
| `executionTime` | `number` | The execution time in milliseconds of the last code run. | `0` | ✗ |
| `executionCount` | `number` | The number of times the code has been executed. | `0` | ✗ |
| `results` | `CodeResult[]` | The results from the last code execution. | `[]` | ✗ |
| `diagnostics` | `Diagnostic[]` | Compilation or runtime errors from the last code execution. | `[]` | ✗ |
| `code` | - | The authored source in the JSON data block, or in a legacy code attribute. | - | ✗ |
| `lockedLines` | `number[]` | The authored, one-based line numbers locked for readers. | - | ✗ |
| `showExecutionCount` | - | Whether the run button displays the execution count. | - | ✗ |

*Fields including [properties](https://developer.mozilla.org/en-US/docs/Glossary/Property/JavaScript) and [attributes](https://developer.mozilla.org/en-US/docs/Glossary/Attribute) define the current state of the widget and offer customization options.*

## Methods
| Name | Description | Parameters |
| :--: | :---------: | :-------: |
| `offlineAssets` | - | `element: Element`
| `finalize` | - | -
| `loadPre` | Takes the program from a `pre` element (conversion). Declines when the fragment has none. | `fragment: DocumentFragment`
| `toPre` | The program as a `pre` element with a `code` child (conversion). | -
| `importSource` | Reads a source file and returns the function that replaces the program with it (import). | `file: File`
| `exportSource` | The program as a source file with the language's extension (export). Locked lines are not part of the file. | -
| `resetExecutionCount` | - | -

*[Methods](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Method_definitions) allow programmatic access to the widget.*

## CSS parts
| Name | Description |
| :--: | :---------: |
| editor | The code editor. |
| output | The area for results, console lines and tables. |

*[CSS parts](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_shadow_parts) allow freely styling internals of the widget with CSS.*

## Editing config
| Name | Value |
| :--: | :---------: |


*The [editing config](https://webwriter.app/docs/packages/configuring/#editingconfig) defines how explorable authoring tools such as [WebWriter](https://webwriter.app) treat the widget.*

*No public slots, events, or custom CSS properties.*


## `WebwriterCodeSql` (`<webwriter-code-sql>`)
Code widget for SQLite with tabular query results.

Uses SQLite via sql.js. Each run starts with an empty in-memory database; use the same cell to create tables, insert data and query it. Each query result shows up to 500 rows in its own table.

Signals: `output` (string), `failed` (boolean) and `table` (`{columns, rows}`, the first query result, or null).

Conversions: a `pre` element converts both ways, and a source file with the language's extension is imported or exported (the import replaces the program and clears locked lines; an export drops locked lines and run results).

### Usage

Use with a CDN (e.g. [jsdelivr](https://jsdelivr.com)):
```html
<link href="https://cdn.jsdelivr.net/npm/@webwriter/code/widgets/webwriter-code-sql.css" rel="stylesheet">
<script type="module" src="https://cdn.jsdelivr.net/npm/@webwriter/code/widgets/webwriter-code-sql.js"></script>
<webwriter-code-sql></webwriter-code-sql>
```

Or use with a bundler (e.g. [Vite](https://vite.dev)):

```
npm install @webwriter/code
```

```html
<link href="@webwriter/code/widgets/webwriter-code-sql.css" rel="stylesheet">
<script type="module" src="@webwriter/code/widgets/webwriter-code-sql.js"></script>
<webwriter-code-sql></webwriter-code-sql>
```

## Fields
| Name (Attribute Name) | Type | Description | Default | Reflects |
| :-------------------: | :--: | :---------: | :-----: | :------: |
| `WebwriterCodeSql.convertFrom` | - | - | - | ✗ |
| `WebwriterCodeSql.convertTo` | - | - | - | ✗ |
| `signals` | `Record<string, { get(): unknown }>` | Signals other widgets can read: `output` (string) is the text of the last run's output, or its error messages;<br>`failed` (boolean) is true when the last run ended with an error or logged one to the console. | `{ ...this.signals, table: computed(() => this.#table.get()) }` | ✗ |
| `WebwriterCodeSql.settings` | - | - | `declarations` | ✗ |
| `settingsCore` | - | - | `new SettingsCore(this, { ...options, root: () => this.renderRoot, rendered: () => this.updateComplete })` | ✗ |
| `options` | - | - | - | ✗ |
| `WebwriterCodeSql.optionGroups` | `object` | - | `{ execution: { label: drawerText({ en: "Execution", de: "Ausführung" }, (msg) => msg("Execution")) }, editor: { label: (widget: DrawerTexts) => ({ _: widget.msg("Editor") }) }, results: { label: drawerText({ en: "Results", de: "Ergebnisse" }, (msg) => msg("Results")) }, }` | ✗ |
| `WebwriterCodeSql.actions` | `object` | - | `{ resetExecutionCount: { group: "results", label: drawerText( { en: "Reset execution count", de: "Anzahl der Ausführungen zurücksetzen" }, (msg) => msg("Reset execution count"), ), }, }` | ✗ |
| `msg` | - | - | - | ✗ |
| `executionTime` | `number` | The execution time in milliseconds of the last code run. | `0` | ✗ |
| `executionCount` | `number` | The number of times the code has been executed. | `0` | ✗ |
| `results` | `CodeResult[]` | The results from the last code execution. | `[]` | ✗ |
| `diagnostics` | `Diagnostic[]` | Compilation or runtime errors from the last code execution. | `[]` | ✗ |
| `code` | - | The authored source in the JSON data block, or in a legacy code attribute. | - | ✗ |
| `lockedLines` | `number[]` | The authored, one-based line numbers locked for readers. | - | ✗ |
| `showExecutionCount` | - | Whether the run button displays the execution count. | - | ✗ |

*Fields including [properties](https://developer.mozilla.org/en-US/docs/Glossary/Property/JavaScript) and [attributes](https://developer.mozilla.org/en-US/docs/Glossary/Attribute) define the current state of the widget and offer customization options.*

## Methods
| Name | Description | Parameters |
| :--: | :---------: | :-------: |
| `offlineAssets` | - | `element: Element`
| `finalize` | - | -
| `loadPre` | Takes the program from a `pre` element (conversion). Declines when the fragment has none. | `fragment: DocumentFragment`
| `toPre` | The program as a `pre` element with a `code` child (conversion). | -
| `importSource` | Reads a source file and returns the function that replaces the program with it (import). | `file: File`
| `exportSource` | The program as a source file with the language's extension (export). Locked lines are not part of the file. | -
| `resetExecutionCount` | - | -

*[Methods](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Method_definitions) allow programmatic access to the widget.*

## CSS parts
| Name | Description |
| :--: | :---------: |
| editor | The code editor. |
| output | The area for results, console lines and tables. |

*[CSS parts](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_shadow_parts) allow freely styling internals of the widget with CSS.*

## Editing config
| Name | Value |
| :--: | :---------: |


*The [editing config](https://webwriter.app/docs/packages/configuring/#editingconfig) defines how explorable authoring tools such as [WebWriter](https://webwriter.app) treat the widget.*

*No public slots, events, or custom CSS properties.*


## `WebwriterCodeLua` (`<webwriter-code-lua>`)
Code widget for Lua 5.4, powered by Wasmoon.

Conversions: a `pre` element converts both ways, and a source file with the language's extension is imported or exported (the import replaces the program and clears locked lines; an export drops locked lines and run results).

Signals: `output` (string) is the text of the last run, or its error messages; `failed` (boolean) is true after an error.

### Usage

Use with a CDN (e.g. [jsdelivr](https://jsdelivr.com)):
```html
<link href="https://cdn.jsdelivr.net/npm/@webwriter/code/widgets/webwriter-code-lua.css" rel="stylesheet">
<script type="module" src="https://cdn.jsdelivr.net/npm/@webwriter/code/widgets/webwriter-code-lua.js"></script>
<webwriter-code-lua></webwriter-code-lua>
```

Or use with a bundler (e.g. [Vite](https://vite.dev)):

```
npm install @webwriter/code
```

```html
<link href="@webwriter/code/widgets/webwriter-code-lua.css" rel="stylesheet">
<script type="module" src="@webwriter/code/widgets/webwriter-code-lua.js"></script>
<webwriter-code-lua></webwriter-code-lua>
```

## Fields
| Name (Attribute Name) | Type | Description | Default | Reflects |
| :-------------------: | :--: | :---------: | :-----: | :------: |
| `WebwriterCodeLua.convertFrom` | - | - | - | ✗ |
| `WebwriterCodeLua.convertTo` | - | - | - | ✗ |
| `WebwriterCodeLua.settings` | - | - | `declarations` | ✗ |
| `settingsCore` | - | - | `new SettingsCore(this, { ...options, root: () => this.renderRoot, rendered: () => this.updateComplete })` | ✗ |
| `options` | - | - | - | ✗ |
| `WebwriterCodeLua.optionGroups` | `object` | - | `{ execution: { label: drawerText({ en: "Execution", de: "Ausführung" }, (msg) => msg("Execution")) }, editor: { label: (widget: DrawerTexts) => ({ _: widget.msg("Editor") }) }, results: { label: drawerText({ en: "Results", de: "Ergebnisse" }, (msg) => msg("Results")) }, }` | ✗ |
| `WebwriterCodeLua.actions` | `object` | - | `{ resetExecutionCount: { group: "results", label: drawerText( { en: "Reset execution count", de: "Anzahl der Ausführungen zurücksetzen" }, (msg) => msg("Reset execution count"), ), }, }` | ✗ |
| `msg` | - | - | - | ✗ |
| `signals` | `Record<string, { get(): unknown }>` | Signals other widgets can read: `output` (string) is the text of the last run's output, or its error messages;<br>`failed` (boolean) is true when the last run ended with an error or logged one to the console. | `{ output: computed(() => this.#output.get()), failed: computed(() => this.#failed.get()), }` | ✗ |
| `executionTime` | `number` | The execution time in milliseconds of the last code run. | `0` | ✗ |
| `executionCount` | `number` | The number of times the code has been executed. | `0` | ✗ |
| `results` | `CodeResult[]` | The results from the last code execution. | `[]` | ✗ |
| `diagnostics` | `Diagnostic[]` | Compilation or runtime errors from the last code execution. | `[]` | ✗ |
| `code` | - | The authored source in the JSON data block, or in a legacy code attribute. | - | ✗ |
| `lockedLines` | `number[]` | The authored, one-based line numbers locked for readers. | - | ✗ |
| `showExecutionCount` | - | Whether the run button displays the execution count. | - | ✗ |

*Fields including [properties](https://developer.mozilla.org/en-US/docs/Glossary/Property/JavaScript) and [attributes](https://developer.mozilla.org/en-US/docs/Glossary/Attribute) define the current state of the widget and offer customization options.*

## Methods
| Name | Description | Parameters |
| :--: | :---------: | :-------: |
| `offlineAssets` | - | `element: Element`
| `finalize` | - | -
| `loadPre` | Takes the program from a `pre` element (conversion). Declines when the fragment has none. | `fragment: DocumentFragment`
| `toPre` | The program as a `pre` element with a `code` child (conversion). | -
| `importSource` | Reads a source file and returns the function that replaces the program with it (import). | `file: File`
| `exportSource` | The program as a source file with the language's extension (export). Locked lines are not part of the file. | -
| `resetExecutionCount` | - | -

*[Methods](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Method_definitions) allow programmatic access to the widget.*

## CSS parts
| Name | Description |
| :--: | :---------: |
| editor | The code editor. |
| output | The area for results, console lines and tables. |

*[CSS parts](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_shadow_parts) allow freely styling internals of the widget with CSS.*

## Editing config
| Name | Value |
| :--: | :---------: |


*The [editing config](https://webwriter.app/docs/packages/configuring/#editingconfig) defines how explorable authoring tools such as [WebWriter](https://webwriter.app) treat the widget.*

*No public slots, events, or custom CSS properties.*


## `WebwriterCodeProlog` (`<webwriter-code-prolog>`)
Code widget for Prolog facts, rules and queries, powered by Tau Prolog.

Enter facts and rules in the editor and the goal in the Query field. The goal is saved in the `goal` attribute.

Conversions: a `pre` element converts both ways, and a source file with the language's extension is imported or exported (the import replaces the program and clears locked lines; an export drops locked lines and run results).

Signals: `output` (string) is the text of the last run, or its error messages; `failed` (boolean) is true after an error.

### Usage

Use with a CDN (e.g. [jsdelivr](https://jsdelivr.com)):
```html
<link href="https://cdn.jsdelivr.net/npm/@webwriter/code/widgets/webwriter-code-prolog.css" rel="stylesheet">
<script type="module" src="https://cdn.jsdelivr.net/npm/@webwriter/code/widgets/webwriter-code-prolog.js"></script>
<webwriter-code-prolog></webwriter-code-prolog>
```

Or use with a bundler (e.g. [Vite](https://vite.dev)):

```
npm install @webwriter/code
```

```html
<link href="@webwriter/code/widgets/webwriter-code-prolog.css" rel="stylesheet">
<script type="module" src="@webwriter/code/widgets/webwriter-code-prolog.js"></script>
<webwriter-code-prolog></webwriter-code-prolog>
```

## Fields
| Name (Attribute Name) | Type | Description | Default | Reflects |
| :-------------------: | :--: | :---------: | :-----: | :------: |
| `WebwriterCodeProlog.convertFrom` | - | - | - | ✗ |
| `WebwriterCodeProlog.convertTo` | - | - | - | ✗ |
| `goal` (`goal`) | `string` | The Prolog goal evaluated when Run is pressed. | `""` | ✓ |
| `WebwriterCodeProlog.settings` | - | - | `declarations` | ✗ |
| `settingsCore` | - | - | `new SettingsCore(this, { ...options, root: () => this.renderRoot, rendered: () => this.updateComplete })` | ✗ |
| `options` | - | - | - | ✗ |
| `WebwriterCodeProlog.optionGroups` | `object` | - | `{ execution: { label: drawerText({ en: "Execution", de: "Ausführung" }, (msg) => msg("Execution")) }, editor: { label: (widget: DrawerTexts) => ({ _: widget.msg("Editor") }) }, results: { label: drawerText({ en: "Results", de: "Ergebnisse" }, (msg) => msg("Results")) }, }` | ✗ |
| `WebwriterCodeProlog.actions` | `object` | - | `{ resetExecutionCount: { group: "results", label: drawerText( { en: "Reset execution count", de: "Anzahl der Ausführungen zurücksetzen" }, (msg) => msg("Reset execution count"), ), }, }` | ✗ |
| `msg` | - | - | - | ✗ |
| `signals` | `Record<string, { get(): unknown }>` | Signals other widgets can read: `output` (string) is the text of the last run's output, or its error messages;<br>`failed` (boolean) is true when the last run ended with an error or logged one to the console. | `{ output: computed(() => this.#output.get()), failed: computed(() => this.#failed.get()), }` | ✗ |
| `executionTime` | `number` | The execution time in milliseconds of the last code run. | `0` | ✗ |
| `executionCount` | `number` | The number of times the code has been executed. | `0` | ✗ |
| `results` | `CodeResult[]` | The results from the last code execution. | `[]` | ✗ |
| `diagnostics` | `Diagnostic[]` | Compilation or runtime errors from the last code execution. | `[]` | ✗ |
| `code` | - | The authored source in the JSON data block, or in a legacy code attribute. | - | ✗ |
| `lockedLines` | `number[]` | The authored, one-based line numbers locked for readers. | - | ✗ |
| `showExecutionCount` | - | Whether the run button displays the execution count. | - | ✗ |

*Fields including [properties](https://developer.mozilla.org/en-US/docs/Glossary/Property/JavaScript) and [attributes](https://developer.mozilla.org/en-US/docs/Glossary/Attribute) define the current state of the widget and offer customization options.*

## Methods
| Name | Description | Parameters |
| :--: | :---------: | :-------: |
| `offlineAssets` | - | `element: Element`
| `finalize` | - | -
| `loadPre` | Takes the program from a `pre` element (conversion). Declines when the fragment has none. | `fragment: DocumentFragment`
| `toPre` | The program as a `pre` element with a `code` child (conversion). | -
| `importSource` | Reads a source file and returns the function that replaces the program with it (import). | `file: File`
| `exportSource` | The program as a source file with the language's extension (export). Locked lines are not part of the file. | -
| `resetExecutionCount` | - | -

*[Methods](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Method_definitions) allow programmatic access to the widget.*

## CSS parts
| Name | Description |
| :--: | :---------: |
| editor | The code editor. |
| output | The area for results, console lines and tables. |

*[CSS parts](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_shadow_parts) allow freely styling internals of the widget with CSS.*

## Editing config
| Name | Value |
| :--: | :---------: |


*The [editing config](https://webwriter.app/docs/packages/configuring/#editingconfig) defines how explorable authoring tools such as [WebWriter](https://webwriter.app) treat the widget.*

*No public slots, events, or custom CSS properties.*


## `WebwriterCodeScheme` (`<webwriter-code-scheme>`)
Code widget for Scheme, powered by BiwaScheme.

Conversions: a `pre` element converts both ways, and a source file with the language's extension is imported or exported (the import replaces the program and clears locked lines; an export drops locked lines and run results).

Signals: `output` (string) is the text of the last run, or its error messages; `failed` (boolean) is true after an error.

### Usage

Use with a CDN (e.g. [jsdelivr](https://jsdelivr.com)):
```html
<link href="https://cdn.jsdelivr.net/npm/@webwriter/code/widgets/webwriter-code-scheme.css" rel="stylesheet">
<script type="module" src="https://cdn.jsdelivr.net/npm/@webwriter/code/widgets/webwriter-code-scheme.js"></script>
<webwriter-code-scheme></webwriter-code-scheme>
```

Or use with a bundler (e.g. [Vite](https://vite.dev)):

```
npm install @webwriter/code
```

```html
<link href="@webwriter/code/widgets/webwriter-code-scheme.css" rel="stylesheet">
<script type="module" src="@webwriter/code/widgets/webwriter-code-scheme.js"></script>
<webwriter-code-scheme></webwriter-code-scheme>
```

## Fields
| Name (Attribute Name) | Type | Description | Default | Reflects |
| :-------------------: | :--: | :---------: | :-----: | :------: |
| `WebwriterCodeScheme.convertFrom` | - | - | - | ✗ |
| `WebwriterCodeScheme.convertTo` | - | - | - | ✗ |
| `WebwriterCodeScheme.settings` | - | - | `declarations` | ✗ |
| `settingsCore` | - | - | `new SettingsCore(this, { ...options, root: () => this.renderRoot, rendered: () => this.updateComplete })` | ✗ |
| `options` | - | - | - | ✗ |
| `WebwriterCodeScheme.optionGroups` | `object` | - | `{ execution: { label: drawerText({ en: "Execution", de: "Ausführung" }, (msg) => msg("Execution")) }, editor: { label: (widget: DrawerTexts) => ({ _: widget.msg("Editor") }) }, results: { label: drawerText({ en: "Results", de: "Ergebnisse" }, (msg) => msg("Results")) }, }` | ✗ |
| `WebwriterCodeScheme.actions` | `object` | - | `{ resetExecutionCount: { group: "results", label: drawerText( { en: "Reset execution count", de: "Anzahl der Ausführungen zurücksetzen" }, (msg) => msg("Reset execution count"), ), }, }` | ✗ |
| `msg` | - | - | - | ✗ |
| `signals` | `Record<string, { get(): unknown }>` | Signals other widgets can read: `output` (string) is the text of the last run's output, or its error messages;<br>`failed` (boolean) is true when the last run ended with an error or logged one to the console. | `{ output: computed(() => this.#output.get()), failed: computed(() => this.#failed.get()), }` | ✗ |
| `executionTime` | `number` | The execution time in milliseconds of the last code run. | `0` | ✗ |
| `executionCount` | `number` | The number of times the code has been executed. | `0` | ✗ |
| `results` | `CodeResult[]` | The results from the last code execution. | `[]` | ✗ |
| `diagnostics` | `Diagnostic[]` | Compilation or runtime errors from the last code execution. | `[]` | ✗ |
| `code` | - | The authored source in the JSON data block, or in a legacy code attribute. | - | ✗ |
| `lockedLines` | `number[]` | The authored, one-based line numbers locked for readers. | - | ✗ |
| `showExecutionCount` | - | Whether the run button displays the execution count. | - | ✗ |

*Fields including [properties](https://developer.mozilla.org/en-US/docs/Glossary/Property/JavaScript) and [attributes](https://developer.mozilla.org/en-US/docs/Glossary/Attribute) define the current state of the widget and offer customization options.*

## Methods
| Name | Description | Parameters |
| :--: | :---------: | :-------: |
| `offlineAssets` | - | `element: Element`
| `finalize` | - | -
| `loadPre` | Takes the program from a `pre` element (conversion). Declines when the fragment has none. | `fragment: DocumentFragment`
| `toPre` | The program as a `pre` element with a `code` child (conversion). | -
| `importSource` | Reads a source file and returns the function that replaces the program with it (import). | `file: File`
| `exportSource` | The program as a source file with the language's extension (export). Locked lines are not part of the file. | -
| `resetExecutionCount` | - | -

*[Methods](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Method_definitions) allow programmatic access to the widget.*

## CSS parts
| Name | Description |
| :--: | :---------: |
| editor | The code editor. |
| output | The area for results, console lines and tables. |

*[CSS parts](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_shadow_parts) allow freely styling internals of the widget with CSS.*

## Editing config
| Name | Value |
| :--: | :---------: |


*The [editing config](https://webwriter.app/docs/packages/configuring/#editingconfig) defines how explorable authoring tools such as [WebWriter](https://webwriter.app) treat the widget.*

*No public slots, events, or custom CSS properties.*


## `WebwriterCodeC` (`<webwriter-code-c>`)
Code widget for C.

C and C++ share one compiler (Clang) and sysroot. They target WASI, with C++ exceptions disabled in the bundled sysroot.

Conversions: a `pre` element converts both ways, and a source file with the language's extension is imported or exported (the import replaces the program and clears locked lines; an export drops locked lines and run results).

Signals: `output` (string) is the text of the last run, or its error messages; `failed` (boolean) is true after an error.

### Usage

Use with a CDN (e.g. [jsdelivr](https://jsdelivr.com)):
```html
<link href="https://cdn.jsdelivr.net/npm/@webwriter/code/widgets/webwriter-code-c.css" rel="stylesheet">
<script type="module" src="https://cdn.jsdelivr.net/npm/@webwriter/code/widgets/webwriter-code-c.js"></script>
<webwriter-code-c></webwriter-code-c>
```

Or use with a bundler (e.g. [Vite](https://vite.dev)):

```
npm install @webwriter/code
```

```html
<link href="@webwriter/code/widgets/webwriter-code-c.css" rel="stylesheet">
<script type="module" src="@webwriter/code/widgets/webwriter-code-c.js"></script>
<webwriter-code-c></webwriter-code-c>
```

## Fields
| Name (Attribute Name) | Type | Description | Default | Reflects |
| :-------------------: | :--: | :---------: | :-----: | :------: |
| `WebwriterCodeC.convertFrom` | - | - | - | ✗ |
| `WebwriterCodeC.convertTo` | - | - | - | ✗ |
| `WebwriterCodeC.settings` | - | - | `declarations` | ✗ |
| `settingsCore` | - | - | `new SettingsCore(this, { ...options, root: () => this.renderRoot, rendered: () => this.updateComplete })` | ✗ |
| `options` | - | - | - | ✗ |
| `WebwriterCodeC.optionGroups` | `object` | - | `{ execution: { label: drawerText({ en: "Execution", de: "Ausführung" }, (msg) => msg("Execution")) }, editor: { label: (widget: DrawerTexts) => ({ _: widget.msg("Editor") }) }, results: { label: drawerText({ en: "Results", de: "Ergebnisse" }, (msg) => msg("Results")) }, }` | ✗ |
| `WebwriterCodeC.actions` | `object` | - | `{ resetExecutionCount: { group: "results", label: drawerText( { en: "Reset execution count", de: "Anzahl der Ausführungen zurücksetzen" }, (msg) => msg("Reset execution count"), ), }, }` | ✗ |
| `msg` | - | - | - | ✗ |
| `signals` | `Record<string, { get(): unknown }>` | Signals other widgets can read: `output` (string) is the text of the last run's output, or its error messages;<br>`failed` (boolean) is true when the last run ended with an error or logged one to the console. | `{ output: computed(() => this.#output.get()), failed: computed(() => this.#failed.get()), }` | ✗ |
| `executionTime` | `number` | The execution time in milliseconds of the last code run. | `0` | ✗ |
| `executionCount` | `number` | The number of times the code has been executed. | `0` | ✗ |
| `results` | `CodeResult[]` | The results from the last code execution. | `[]` | ✗ |
| `diagnostics` | `Diagnostic[]` | Compilation or runtime errors from the last code execution. | `[]` | ✗ |
| `code` | - | The authored source in the JSON data block, or in a legacy code attribute. | - | ✗ |
| `lockedLines` | `number[]` | The authored, one-based line numbers locked for readers. | - | ✗ |
| `showExecutionCount` | - | Whether the run button displays the execution count. | - | ✗ |

*Fields including [properties](https://developer.mozilla.org/en-US/docs/Glossary/Property/JavaScript) and [attributes](https://developer.mozilla.org/en-US/docs/Glossary/Attribute) define the current state of the widget and offer customization options.*

## Methods
| Name | Description | Parameters |
| :--: | :---------: | :-------: |
| `offlineAssets` | - | `element: Element`
| `finalize` | - | -
| `loadPre` | Takes the program from a `pre` element (conversion). Declines when the fragment has none. | `fragment: DocumentFragment`
| `toPre` | The program as a `pre` element with a `code` child (conversion). | -
| `importSource` | Reads a source file and returns the function that replaces the program with it (import). | `file: File`
| `exportSource` | The program as a source file with the language's extension (export). Locked lines are not part of the file. | -
| `resetExecutionCount` | - | -

*[Methods](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Method_definitions) allow programmatic access to the widget.*

## CSS parts
| Name | Description |
| :--: | :---------: |
| editor | The code editor. |
| output | The area for results, console lines and tables. |

*[CSS parts](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_shadow_parts) allow freely styling internals of the widget with CSS.*

## Editing config
| Name | Value |
| :--: | :---------: |


*The [editing config](https://webwriter.app/docs/packages/configuring/#editingconfig) defines how explorable authoring tools such as [WebWriter](https://webwriter.app) treat the widget.*

*No public slots, events, or custom CSS properties.*


## `WebwriterCodeCpp` (`<webwriter-code-cpp>`)
Code widget for C++.

C and C++ share one compiler (Clang) and sysroot. They target WASI, with C++ exceptions disabled in the bundled sysroot.

Conversions: a `pre` element converts both ways, and a source file with the language's extension is imported or exported (the import replaces the program and clears locked lines; an export drops locked lines and run results).

Signals: `output` (string) is the text of the last run, or its error messages; `failed` (boolean) is true after an error.

### Usage

Use with a CDN (e.g. [jsdelivr](https://jsdelivr.com)):
```html
<link href="https://cdn.jsdelivr.net/npm/@webwriter/code/widgets/webwriter-code-cpp.css" rel="stylesheet">
<script type="module" src="https://cdn.jsdelivr.net/npm/@webwriter/code/widgets/webwriter-code-cpp.js"></script>
<webwriter-code-cpp></webwriter-code-cpp>
```

Or use with a bundler (e.g. [Vite](https://vite.dev)):

```
npm install @webwriter/code
```

```html
<link href="@webwriter/code/widgets/webwriter-code-cpp.css" rel="stylesheet">
<script type="module" src="@webwriter/code/widgets/webwriter-code-cpp.js"></script>
<webwriter-code-cpp></webwriter-code-cpp>
```

## Fields
| Name (Attribute Name) | Type | Description | Default | Reflects |
| :-------------------: | :--: | :---------: | :-----: | :------: |
| `WebwriterCodeCpp.convertFrom` | - | - | - | ✗ |
| `WebwriterCodeCpp.convertTo` | - | - | - | ✗ |
| `WebwriterCodeCpp.settings` | - | - | `declarations` | ✗ |
| `settingsCore` | - | - | `new SettingsCore(this, { ...options, root: () => this.renderRoot, rendered: () => this.updateComplete })` | ✗ |
| `options` | - | - | - | ✗ |
| `WebwriterCodeCpp.optionGroups` | `object` | - | `{ execution: { label: drawerText({ en: "Execution", de: "Ausführung" }, (msg) => msg("Execution")) }, editor: { label: (widget: DrawerTexts) => ({ _: widget.msg("Editor") }) }, results: { label: drawerText({ en: "Results", de: "Ergebnisse" }, (msg) => msg("Results")) }, }` | ✗ |
| `WebwriterCodeCpp.actions` | `object` | - | `{ resetExecutionCount: { group: "results", label: drawerText( { en: "Reset execution count", de: "Anzahl der Ausführungen zurücksetzen" }, (msg) => msg("Reset execution count"), ), }, }` | ✗ |
| `msg` | - | - | - | ✗ |
| `signals` | `Record<string, { get(): unknown }>` | Signals other widgets can read: `output` (string) is the text of the last run's output, or its error messages;<br>`failed` (boolean) is true when the last run ended with an error or logged one to the console. | `{ output: computed(() => this.#output.get()), failed: computed(() => this.#failed.get()), }` | ✗ |
| `executionTime` | `number` | The execution time in milliseconds of the last code run. | `0` | ✗ |
| `executionCount` | `number` | The number of times the code has been executed. | `0` | ✗ |
| `results` | `CodeResult[]` | The results from the last code execution. | `[]` | ✗ |
| `diagnostics` | `Diagnostic[]` | Compilation or runtime errors from the last code execution. | `[]` | ✗ |
| `code` | - | The authored source in the JSON data block, or in a legacy code attribute. | - | ✗ |
| `lockedLines` | `number[]` | The authored, one-based line numbers locked for readers. | - | ✗ |
| `showExecutionCount` | - | Whether the run button displays the execution count. | - | ✗ |

*Fields including [properties](https://developer.mozilla.org/en-US/docs/Glossary/Property/JavaScript) and [attributes](https://developer.mozilla.org/en-US/docs/Glossary/Attribute) define the current state of the widget and offer customization options.*

## Methods
| Name | Description | Parameters |
| :--: | :---------: | :-------: |
| `offlineAssets` | - | `element: Element`
| `finalize` | - | -
| `loadPre` | Takes the program from a `pre` element (conversion). Declines when the fragment has none. | `fragment: DocumentFragment`
| `toPre` | The program as a `pre` element with a `code` child (conversion). | -
| `importSource` | Reads a source file and returns the function that replaces the program with it (import). | `file: File`
| `exportSource` | The program as a source file with the language's extension (export). Locked lines are not part of the file. | -
| `resetExecutionCount` | - | -

*[Methods](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Method_definitions) allow programmatic access to the widget.*

## CSS parts
| Name | Description |
| :--: | :---------: |
| editor | The code editor. |
| output | The area for results, console lines and tables. |

*[CSS parts](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_shadow_parts) allow freely styling internals of the widget with CSS.*

## Editing config
| Name | Value |
| :--: | :---------: |


*The [editing config](https://webwriter.app/docs/packages/configuring/#editingconfig) defines how explorable authoring tools such as [WebWriter](https://webwriter.app) treat the widget.*

*No public slots, events, or custom CSS properties.*


## `WebwriterCodeCsharp` (`<webwriter-code-csharp>`)
Code widget for C#.

Uses Roslyn and the browser .NET 10 framework and exposes console output.

Conversions: a `pre` element converts both ways, and a source file with the language's extension is imported or exported (the import replaces the program and clears locked lines; an export drops locked lines and run results).

Signals: `output` (string) is the text of the last run, or its error messages; `failed` (boolean) is true after an error.

### Usage

Use with a CDN (e.g. [jsdelivr](https://jsdelivr.com)):
```html
<link href="https://cdn.jsdelivr.net/npm/@webwriter/code/widgets/webwriter-code-csharp.css" rel="stylesheet">
<script type="module" src="https://cdn.jsdelivr.net/npm/@webwriter/code/widgets/webwriter-code-csharp.js"></script>
<webwriter-code-csharp></webwriter-code-csharp>
```

Or use with a bundler (e.g. [Vite](https://vite.dev)):

```
npm install @webwriter/code
```

```html
<link href="@webwriter/code/widgets/webwriter-code-csharp.css" rel="stylesheet">
<script type="module" src="@webwriter/code/widgets/webwriter-code-csharp.js"></script>
<webwriter-code-csharp></webwriter-code-csharp>
```

## Fields
| Name (Attribute Name) | Type | Description | Default | Reflects |
| :-------------------: | :--: | :---------: | :-----: | :------: |
| `WebwriterCodeCsharp.convertFrom` | - | - | - | ✗ |
| `WebwriterCodeCsharp.convertTo` | - | - | - | ✗ |
| `WebwriterCodeCsharp.settings` | - | - | `declarations` | ✗ |
| `settingsCore` | - | - | `new SettingsCore(this, { ...options, root: () => this.renderRoot, rendered: () => this.updateComplete })` | ✗ |
| `options` | - | - | - | ✗ |
| `WebwriterCodeCsharp.optionGroups` | `object` | - | `{ execution: { label: drawerText({ en: "Execution", de: "Ausführung" }, (msg) => msg("Execution")) }, editor: { label: (widget: DrawerTexts) => ({ _: widget.msg("Editor") }) }, results: { label: drawerText({ en: "Results", de: "Ergebnisse" }, (msg) => msg("Results")) }, }` | ✗ |
| `WebwriterCodeCsharp.actions` | `object` | - | `{ resetExecutionCount: { group: "results", label: drawerText( { en: "Reset execution count", de: "Anzahl der Ausführungen zurücksetzen" }, (msg) => msg("Reset execution count"), ), }, }` | ✗ |
| `msg` | - | - | - | ✗ |
| `signals` | `Record<string, { get(): unknown }>` | Signals other widgets can read: `output` (string) is the text of the last run's output, or its error messages;<br>`failed` (boolean) is true when the last run ended with an error or logged one to the console. | `{ output: computed(() => this.#output.get()), failed: computed(() => this.#failed.get()), }` | ✗ |
| `executionTime` | `number` | The execution time in milliseconds of the last code run. | `0` | ✗ |
| `executionCount` | `number` | The number of times the code has been executed. | `0` | ✗ |
| `results` | `CodeResult[]` | The results from the last code execution. | `[]` | ✗ |
| `diagnostics` | `Diagnostic[]` | Compilation or runtime errors from the last code execution. | `[]` | ✗ |
| `code` | - | The authored source in the JSON data block, or in a legacy code attribute. | - | ✗ |
| `lockedLines` | `number[]` | The authored, one-based line numbers locked for readers. | - | ✗ |
| `showExecutionCount` | - | Whether the run button displays the execution count. | - | ✗ |

*Fields including [properties](https://developer.mozilla.org/en-US/docs/Glossary/Property/JavaScript) and [attributes](https://developer.mozilla.org/en-US/docs/Glossary/Attribute) define the current state of the widget and offer customization options.*

## Methods
| Name | Description | Parameters |
| :--: | :---------: | :-------: |
| `offlineAssets` | - | `element: Element`
| `finalize` | - | -
| `loadPre` | Takes the program from a `pre` element (conversion). Declines when the fragment has none. | `fragment: DocumentFragment`
| `toPre` | The program as a `pre` element with a `code` child (conversion). | -
| `importSource` | Reads a source file and returns the function that replaces the program with it (import). | `file: File`
| `exportSource` | The program as a source file with the language's extension (export). Locked lines are not part of the file. | -
| `resetExecutionCount` | - | -

*[Methods](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Method_definitions) allow programmatic access to the widget.*

## CSS parts
| Name | Description |
| :--: | :---------: |
| editor | The code editor. |
| output | The area for results, console lines and tables. |

*[CSS parts](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_shadow_parts) allow freely styling internals of the widget with CSS.*

## Editing config
| Name | Value |
| :--: | :---------: |


*The [editing config](https://webwriter.app/docs/packages/configuring/#editingconfig) defines how explorable authoring tools such as [WebWriter](https://webwriter.app) treat the widget.*

*No public slots, events, or custom CSS properties.*


## `WebwriterCodePhp` (`<webwriter-code-php>`)
Code widget for PHP.

Runs PHP 8.4 from WordPress Playground.

Conversions: a `pre` element converts both ways, and a source file with the language's extension is imported or exported (the import replaces the program and clears locked lines; an export drops locked lines and run results).

Signals: `output` (string) is the text of the last run, or its error messages; `failed` (boolean) is true after an error.

### Usage

Use with a CDN (e.g. [jsdelivr](https://jsdelivr.com)):
```html
<link href="https://cdn.jsdelivr.net/npm/@webwriter/code/widgets/webwriter-code-php.css" rel="stylesheet">
<script type="module" src="https://cdn.jsdelivr.net/npm/@webwriter/code/widgets/webwriter-code-php.js"></script>
<webwriter-code-php></webwriter-code-php>
```

Or use with a bundler (e.g. [Vite](https://vite.dev)):

```
npm install @webwriter/code
```

```html
<link href="@webwriter/code/widgets/webwriter-code-php.css" rel="stylesheet">
<script type="module" src="@webwriter/code/widgets/webwriter-code-php.js"></script>
<webwriter-code-php></webwriter-code-php>
```

## Fields
| Name (Attribute Name) | Type | Description | Default | Reflects |
| :-------------------: | :--: | :---------: | :-----: | :------: |
| `WebwriterCodePhp.convertFrom` | - | - | - | ✗ |
| `WebwriterCodePhp.convertTo` | - | - | - | ✗ |
| `WebwriterCodePhp.settings` | - | - | `declarations` | ✗ |
| `settingsCore` | - | - | `new SettingsCore(this, { ...options, root: () => this.renderRoot, rendered: () => this.updateComplete })` | ✗ |
| `options` | - | - | - | ✗ |
| `WebwriterCodePhp.optionGroups` | `object` | - | `{ execution: { label: drawerText({ en: "Execution", de: "Ausführung" }, (msg) => msg("Execution")) }, editor: { label: (widget: DrawerTexts) => ({ _: widget.msg("Editor") }) }, results: { label: drawerText({ en: "Results", de: "Ergebnisse" }, (msg) => msg("Results")) }, }` | ✗ |
| `WebwriterCodePhp.actions` | `object` | - | `{ resetExecutionCount: { group: "results", label: drawerText( { en: "Reset execution count", de: "Anzahl der Ausführungen zurücksetzen" }, (msg) => msg("Reset execution count"), ), }, }` | ✗ |
| `msg` | - | - | - | ✗ |
| `signals` | `Record<string, { get(): unknown }>` | Signals other widgets can read: `output` (string) is the text of the last run's output, or its error messages;<br>`failed` (boolean) is true when the last run ended with an error or logged one to the console. | `{ output: computed(() => this.#output.get()), failed: computed(() => this.#failed.get()), }` | ✗ |
| `executionTime` | `number` | The execution time in milliseconds of the last code run. | `0` | ✗ |
| `executionCount` | `number` | The number of times the code has been executed. | `0` | ✗ |
| `results` | `CodeResult[]` | The results from the last code execution. | `[]` | ✗ |
| `diagnostics` | `Diagnostic[]` | Compilation or runtime errors from the last code execution. | `[]` | ✗ |
| `code` | - | The authored source in the JSON data block, or in a legacy code attribute. | - | ✗ |
| `lockedLines` | `number[]` | The authored, one-based line numbers locked for readers. | - | ✗ |
| `showExecutionCount` | - | Whether the run button displays the execution count. | - | ✗ |

*Fields including [properties](https://developer.mozilla.org/en-US/docs/Glossary/Property/JavaScript) and [attributes](https://developer.mozilla.org/en-US/docs/Glossary/Attribute) define the current state of the widget and offer customization options.*

## Methods
| Name | Description | Parameters |
| :--: | :---------: | :-------: |
| `offlineAssets` | - | `element: Element`
| `finalize` | - | -
| `loadPre` | Takes the program from a `pre` element (conversion). Declines when the fragment has none. | `fragment: DocumentFragment`
| `toPre` | The program as a `pre` element with a `code` child (conversion). | -
| `importSource` | Reads a source file and returns the function that replaces the program with it (import). | `file: File`
| `exportSource` | The program as a source file with the language's extension (export). Locked lines are not part of the file. | -
| `resetExecutionCount` | - | -

*[Methods](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Method_definitions) allow programmatic access to the widget.*

## CSS parts
| Name | Description |
| :--: | :---------: |
| editor | The code editor. |
| output | The area for results, console lines and tables. |

*[CSS parts](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_shadow_parts) allow freely styling internals of the widget with CSS.*

## Editing config
| Name | Value |
| :--: | :---------: |


*The [editing config](https://webwriter.app/docs/packages/configuring/#editingconfig) defines how explorable authoring tools such as [WebWriter](https://webwriter.app) treat the widget.*

*No public slots, events, or custom CSS properties.*


## `WebwriterCodeGo` (`<webwriter-code-go>`)
Code widget for Go.

Go 1.27.4 compiler and linker, with a subset of the standard library.

Conversions: a `pre` element converts both ways, and a source file with the language's extension is imported or exported (the import replaces the program and clears locked lines; an export drops locked lines and run results).

Signals: `output` (string) is the text of the last run, or its error messages; `failed` (boolean) is true after an error.

### Usage

Use with a CDN (e.g. [jsdelivr](https://jsdelivr.com)):
```html
<link href="https://cdn.jsdelivr.net/npm/@webwriter/code/widgets/webwriter-code-go.css" rel="stylesheet">
<script type="module" src="https://cdn.jsdelivr.net/npm/@webwriter/code/widgets/webwriter-code-go.js"></script>
<webwriter-code-go></webwriter-code-go>
```

Or use with a bundler (e.g. [Vite](https://vite.dev)):

```
npm install @webwriter/code
```

```html
<link href="@webwriter/code/widgets/webwriter-code-go.css" rel="stylesheet">
<script type="module" src="@webwriter/code/widgets/webwriter-code-go.js"></script>
<webwriter-code-go></webwriter-code-go>
```

## Fields
| Name (Attribute Name) | Type | Description | Default | Reflects |
| :-------------------: | :--: | :---------: | :-----: | :------: |
| `WebwriterCodeGo.convertFrom` | - | - | - | ✗ |
| `WebwriterCodeGo.convertTo` | - | - | - | ✗ |
| `WebwriterCodeGo.settings` | - | - | `declarations` | ✗ |
| `settingsCore` | - | - | `new SettingsCore(this, { ...options, root: () => this.renderRoot, rendered: () => this.updateComplete })` | ✗ |
| `options` | - | - | - | ✗ |
| `WebwriterCodeGo.optionGroups` | `object` | - | `{ execution: { label: drawerText({ en: "Execution", de: "Ausführung" }, (msg) => msg("Execution")) }, editor: { label: (widget: DrawerTexts) => ({ _: widget.msg("Editor") }) }, results: { label: drawerText({ en: "Results", de: "Ergebnisse" }, (msg) => msg("Results")) }, }` | ✗ |
| `WebwriterCodeGo.actions` | `object` | - | `{ resetExecutionCount: { group: "results", label: drawerText( { en: "Reset execution count", de: "Anzahl der Ausführungen zurücksetzen" }, (msg) => msg("Reset execution count"), ), }, }` | ✗ |
| `msg` | - | - | - | ✗ |
| `signals` | `Record<string, { get(): unknown }>` | Signals other widgets can read: `output` (string) is the text of the last run's output, or its error messages;<br>`failed` (boolean) is true when the last run ended with an error or logged one to the console. | `{ output: computed(() => this.#output.get()), failed: computed(() => this.#failed.get()), }` | ✗ |
| `executionTime` | `number` | The execution time in milliseconds of the last code run. | `0` | ✗ |
| `executionCount` | `number` | The number of times the code has been executed. | `0` | ✗ |
| `results` | `CodeResult[]` | The results from the last code execution. | `[]` | ✗ |
| `diagnostics` | `Diagnostic[]` | Compilation or runtime errors from the last code execution. | `[]` | ✗ |
| `code` | - | The authored source in the JSON data block, or in a legacy code attribute. | - | ✗ |
| `lockedLines` | `number[]` | The authored, one-based line numbers locked for readers. | - | ✗ |
| `showExecutionCount` | - | Whether the run button displays the execution count. | - | ✗ |

*Fields including [properties](https://developer.mozilla.org/en-US/docs/Glossary/Property/JavaScript) and [attributes](https://developer.mozilla.org/en-US/docs/Glossary/Attribute) define the current state of the widget and offer customization options.*

## Methods
| Name | Description | Parameters |
| :--: | :---------: | :-------: |
| `offlineAssets` | - | `element: Element`
| `finalize` | - | -
| `loadPre` | Takes the program from a `pre` element (conversion). Declines when the fragment has none. | `fragment: DocumentFragment`
| `toPre` | The program as a `pre` element with a `code` child (conversion). | -
| `importSource` | Reads a source file and returns the function that replaces the program with it (import). | `file: File`
| `exportSource` | The program as a source file with the language's extension (export). Locked lines are not part of the file. | -
| `resetExecutionCount` | - | -

*[Methods](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Method_definitions) allow programmatic access to the widget.*

## CSS parts
| Name | Description |
| :--: | :---------: |
| editor | The code editor. |
| output | The area for results, console lines and tables. |

*[CSS parts](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_shadow_parts) allow freely styling internals of the widget with CSS.*

## Editing config
| Name | Value |
| :--: | :---------: |


*The [editing config](https://webwriter.app/docs/packages/configuring/#editingconfig) defines how explorable authoring tools such as [WebWriter](https://webwriter.app) treat the widget.*

*No public slots, events, or custom CSS properties.*


## `WebwriterCodeRust` (`<webwriter-code-rust>`)
Code widget for Rust.

Runs rustc's Miri interpreter via LiveCodes on a single source file with the bundled standard library. Offline HTML export needs network access to fetch the toolchain from its CDN; the saved HTML runs with networking disabled.

Conversions: a `pre` element converts both ways, and a source file with the language's extension is imported or exported (the import replaces the program and clears locked lines; an export drops locked lines and run results).

Signals: `output` (string) is the text of the last run, or its error messages; `failed` (boolean) is true after an error.

### Usage

Use with a CDN (e.g. [jsdelivr](https://jsdelivr.com)):
```html
<link href="https://cdn.jsdelivr.net/npm/@webwriter/code/widgets/webwriter-code-rust.css" rel="stylesheet">
<script type="module" src="https://cdn.jsdelivr.net/npm/@webwriter/code/widgets/webwriter-code-rust.js"></script>
<webwriter-code-rust></webwriter-code-rust>
```

Or use with a bundler (e.g. [Vite](https://vite.dev)):

```
npm install @webwriter/code
```

```html
<link href="@webwriter/code/widgets/webwriter-code-rust.css" rel="stylesheet">
<script type="module" src="@webwriter/code/widgets/webwriter-code-rust.js"></script>
<webwriter-code-rust></webwriter-code-rust>
```

## Fields
| Name (Attribute Name) | Type | Description | Default | Reflects |
| :-------------------: | :--: | :---------: | :-----: | :------: |
| `WebwriterCodeRust.convertFrom` | - | - | - | ✗ |
| `WebwriterCodeRust.convertTo` | - | - | - | ✗ |
| `WebwriterCodeRust.settings` | - | - | `declarations` | ✗ |
| `settingsCore` | - | - | `new SettingsCore(this, { ...options, root: () => this.renderRoot, rendered: () => this.updateComplete })` | ✗ |
| `options` | - | - | - | ✗ |
| `WebwriterCodeRust.optionGroups` | `object` | - | `{ execution: { label: drawerText({ en: "Execution", de: "Ausführung" }, (msg) => msg("Execution")) }, editor: { label: (widget: DrawerTexts) => ({ _: widget.msg("Editor") }) }, results: { label: drawerText({ en: "Results", de: "Ergebnisse" }, (msg) => msg("Results")) }, }` | ✗ |
| `WebwriterCodeRust.actions` | `object` | - | `{ resetExecutionCount: { group: "results", label: drawerText( { en: "Reset execution count", de: "Anzahl der Ausführungen zurücksetzen" }, (msg) => msg("Reset execution count"), ), }, }` | ✗ |
| `msg` | - | - | - | ✗ |
| `signals` | `Record<string, { get(): unknown }>` | Signals other widgets can read: `output` (string) is the text of the last run's output, or its error messages;<br>`failed` (boolean) is true when the last run ended with an error or logged one to the console. | `{ output: computed(() => this.#output.get()), failed: computed(() => this.#failed.get()), }` | ✗ |
| `executionTime` | `number` | The execution time in milliseconds of the last code run. | `0` | ✗ |
| `executionCount` | `number` | The number of times the code has been executed. | `0` | ✗ |
| `results` | `CodeResult[]` | The results from the last code execution. | `[]` | ✗ |
| `diagnostics` | `Diagnostic[]` | Compilation or runtime errors from the last code execution. | `[]` | ✗ |
| `code` | - | The authored source in the JSON data block, or in a legacy code attribute. | - | ✗ |
| `lockedLines` | `number[]` | The authored, one-based line numbers locked for readers. | - | ✗ |
| `showExecutionCount` | - | Whether the run button displays the execution count. | - | ✗ |

*Fields including [properties](https://developer.mozilla.org/en-US/docs/Glossary/Property/JavaScript) and [attributes](https://developer.mozilla.org/en-US/docs/Glossary/Attribute) define the current state of the widget and offer customization options.*

## Methods
| Name | Description | Parameters |
| :--: | :---------: | :-------: |
| `offlineAssets` | - | `element: Element`
| `finalize` | - | -
| `loadPre` | Takes the program from a `pre` element (conversion). Declines when the fragment has none. | `fragment: DocumentFragment`
| `toPre` | The program as a `pre` element with a `code` child (conversion). | -
| `importSource` | Reads a source file and returns the function that replaces the program with it (import). | `file: File`
| `exportSource` | The program as a source file with the language's extension (export). Locked lines are not part of the file. | -
| `resetExecutionCount` | - | -

*[Methods](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Method_definitions) allow programmatic access to the widget.*

## CSS parts
| Name | Description |
| :--: | :---------: |
| editor | The code editor. |
| output | The area for results, console lines and tables. |

*[CSS parts](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_shadow_parts) allow freely styling internals of the widget with CSS.*

## Editing config
| Name | Value |
| :--: | :---------: |


*The [editing config](https://webwriter.app/docs/packages/configuring/#editingconfig) defines how explorable authoring tools such as [WebWriter](https://webwriter.app) treat the widget.*

*No public slots, events, or custom CSS properties.*


## `WebwriterCodeShell` (`<webwriter-code-shell>`)
Code widget for Bash.

Bash-compatible shell via just-bash, with a virtual filesystem and bundled commands.

Conversions: a `pre` element converts both ways, and a source file with the language's extension is imported or exported (the import replaces the program and clears locked lines; an export drops locked lines and run results).

Signals: `output` (string) is the text of the last run, or its error messages; `failed` (boolean) is true after an error.

### Usage

Use with a CDN (e.g. [jsdelivr](https://jsdelivr.com)):
```html
<link href="https://cdn.jsdelivr.net/npm/@webwriter/code/widgets/webwriter-code-shell.css" rel="stylesheet">
<script type="module" src="https://cdn.jsdelivr.net/npm/@webwriter/code/widgets/webwriter-code-shell.js"></script>
<webwriter-code-shell></webwriter-code-shell>
```

Or use with a bundler (e.g. [Vite](https://vite.dev)):

```
npm install @webwriter/code
```

```html
<link href="@webwriter/code/widgets/webwriter-code-shell.css" rel="stylesheet">
<script type="module" src="@webwriter/code/widgets/webwriter-code-shell.js"></script>
<webwriter-code-shell></webwriter-code-shell>
```

## Fields
| Name (Attribute Name) | Type | Description | Default | Reflects |
| :-------------------: | :--: | :---------: | :-----: | :------: |
| `WebwriterCodeShell.convertFrom` | - | - | - | ✗ |
| `WebwriterCodeShell.convertTo` | - | - | - | ✗ |
| `WebwriterCodeShell.settings` | - | - | `declarations` | ✗ |
| `settingsCore` | - | - | `new SettingsCore(this, { ...options, root: () => this.renderRoot, rendered: () => this.updateComplete })` | ✗ |
| `options` | - | - | - | ✗ |
| `WebwriterCodeShell.optionGroups` | `object` | - | `{ execution: { label: drawerText({ en: "Execution", de: "Ausführung" }, (msg) => msg("Execution")) }, editor: { label: (widget: DrawerTexts) => ({ _: widget.msg("Editor") }) }, results: { label: drawerText({ en: "Results", de: "Ergebnisse" }, (msg) => msg("Results")) }, }` | ✗ |
| `WebwriterCodeShell.actions` | `object` | - | `{ resetExecutionCount: { group: "results", label: drawerText( { en: "Reset execution count", de: "Anzahl der Ausführungen zurücksetzen" }, (msg) => msg("Reset execution count"), ), }, }` | ✗ |
| `msg` | - | - | - | ✗ |
| `signals` | `Record<string, { get(): unknown }>` | Signals other widgets can read: `output` (string) is the text of the last run's output, or its error messages;<br>`failed` (boolean) is true when the last run ended with an error or logged one to the console. | `{ output: computed(() => this.#output.get()), failed: computed(() => this.#failed.get()), }` | ✗ |
| `executionTime` | `number` | The execution time in milliseconds of the last code run. | `0` | ✗ |
| `executionCount` | `number` | The number of times the code has been executed. | `0` | ✗ |
| `results` | `CodeResult[]` | The results from the last code execution. | `[]` | ✗ |
| `diagnostics` | `Diagnostic[]` | Compilation or runtime errors from the last code execution. | `[]` | ✗ |
| `code` | - | The authored source in the JSON data block, or in a legacy code attribute. | - | ✗ |
| `lockedLines` | `number[]` | The authored, one-based line numbers locked for readers. | - | ✗ |
| `showExecutionCount` | - | Whether the run button displays the execution count. | - | ✗ |

*Fields including [properties](https://developer.mozilla.org/en-US/docs/Glossary/Property/JavaScript) and [attributes](https://developer.mozilla.org/en-US/docs/Glossary/Attribute) define the current state of the widget and offer customization options.*

## Methods
| Name | Description | Parameters |
| :--: | :---------: | :-------: |
| `offlineAssets` | - | `element: Element`
| `finalize` | - | -
| `loadPre` | Takes the program from a `pre` element (conversion). Declines when the fragment has none. | `fragment: DocumentFragment`
| `toPre` | The program as a `pre` element with a `code` child (conversion). | -
| `importSource` | Reads a source file and returns the function that replaces the program with it (import). | `file: File`
| `exportSource` | The program as a source file with the language's extension (export). Locked lines are not part of the file. | -
| `resetExecutionCount` | - | -

*[Methods](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Method_definitions) allow programmatic access to the widget.*

## CSS parts
| Name | Description |
| :--: | :---------: |
| editor | The code editor. |
| output | The area for results, console lines and tables. |

*[CSS parts](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_shadow_parts) allow freely styling internals of the widget with CSS.*

## Editing config
| Name | Value |
| :--: | :---------: |


*The [editing config](https://webwriter.app/docs/packages/configuring/#editingconfig) defines how explorable authoring tools such as [WebWriter](https://webwriter.app) treat the widget.*

*No public slots, events, or custom CSS properties.*


## `WebwriterCodeHaskell` (`<webwriter-code-haskell>`)
Code widget for Haskell, powered by MicroHs.

Runs a single `Main` module with `main :: IO ()`. The compiler includes MicroHs's base library and loads optional packages such as QuickCheck, Parsec and mtl on demand; offline HTML includes all 43 optional packages so readers can change imports after export. MicroHs supports extended Haskell 2010, with gaps including Template Haskell and type families. The cell captures text output; canvas and audio APIs are not available.

Conversions: a `pre` element converts both ways, and a source file with the language's extension is imported or exported (the import replaces the program and clears locked lines; an export drops locked lines and run results).

Signals: `output` (string) is the text of the last run, or its error messages; `failed` (boolean) is true after an error.

### Usage

Use with a CDN (e.g. [jsdelivr](https://jsdelivr.com)):
```html
<link href="https://cdn.jsdelivr.net/npm/@webwriter/code/widgets/webwriter-code-haskell.css" rel="stylesheet">
<script type="module" src="https://cdn.jsdelivr.net/npm/@webwriter/code/widgets/webwriter-code-haskell.js"></script>
<webwriter-code-haskell></webwriter-code-haskell>
```

Or use with a bundler (e.g. [Vite](https://vite.dev)):

```
npm install @webwriter/code
```

```html
<link href="@webwriter/code/widgets/webwriter-code-haskell.css" rel="stylesheet">
<script type="module" src="@webwriter/code/widgets/webwriter-code-haskell.js"></script>
<webwriter-code-haskell></webwriter-code-haskell>
```

## Fields
| Name (Attribute Name) | Type | Description | Default | Reflects |
| :-------------------: | :--: | :---------: | :-----: | :------: |
| `WebwriterCodeHaskell.convertFrom` | - | - | - | ✗ |
| `WebwriterCodeHaskell.convertTo` | - | - | - | ✗ |
| `WebwriterCodeHaskell.settings` | - | - | `declarations` | ✗ |
| `settingsCore` | - | - | `new SettingsCore(this, { ...options, root: () => this.renderRoot, rendered: () => this.updateComplete })` | ✗ |
| `options` | - | - | - | ✗ |
| `WebwriterCodeHaskell.optionGroups` | `object` | - | `{ execution: { label: drawerText({ en: "Execution", de: "Ausführung" }, (msg) => msg("Execution")) }, editor: { label: (widget: DrawerTexts) => ({ _: widget.msg("Editor") }) }, results: { label: drawerText({ en: "Results", de: "Ergebnisse" }, (msg) => msg("Results")) }, }` | ✗ |
| `WebwriterCodeHaskell.actions` | `object` | - | `{ resetExecutionCount: { group: "results", label: drawerText( { en: "Reset execution count", de: "Anzahl der Ausführungen zurücksetzen" }, (msg) => msg("Reset execution count"), ), }, }` | ✗ |
| `msg` | - | - | - | ✗ |
| `signals` | `Record<string, { get(): unknown }>` | Signals other widgets can read: `output` (string) is the text of the last run's output, or its error messages;<br>`failed` (boolean) is true when the last run ended with an error or logged one to the console. | `{ output: computed(() => this.#output.get()), failed: computed(() => this.#failed.get()), }` | ✗ |
| `executionTime` | `number` | The execution time in milliseconds of the last code run. | `0` | ✗ |
| `executionCount` | `number` | The number of times the code has been executed. | `0` | ✗ |
| `results` | `CodeResult[]` | The results from the last code execution. | `[]` | ✗ |
| `diagnostics` | `Diagnostic[]` | Compilation or runtime errors from the last code execution. | `[]` | ✗ |
| `code` | - | The authored source in the JSON data block, or in a legacy code attribute. | - | ✗ |
| `lockedLines` | `number[]` | The authored, one-based line numbers locked for readers. | - | ✗ |
| `showExecutionCount` | - | Whether the run button displays the execution count. | - | ✗ |

*Fields including [properties](https://developer.mozilla.org/en-US/docs/Glossary/Property/JavaScript) and [attributes](https://developer.mozilla.org/en-US/docs/Glossary/Attribute) define the current state of the widget and offer customization options.*

## Methods
| Name | Description | Parameters |
| :--: | :---------: | :-------: |
| `offlineAssets` | - | `element: Element`
| `finalize` | - | -
| `loadPre` | Takes the program from a `pre` element (conversion). Declines when the fragment has none. | `fragment: DocumentFragment`
| `toPre` | The program as a `pre` element with a `code` child (conversion). | -
| `importSource` | Reads a source file and returns the function that replaces the program with it (import). | `file: File`
| `exportSource` | The program as a source file with the language's extension (export). Locked lines are not part of the file. | -
| `resetExecutionCount` | - | -

*[Methods](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Method_definitions) allow programmatic access to the widget.*

## CSS parts
| Name | Description |
| :--: | :---------: |
| editor | The code editor. |
| output | The area for results, console lines and tables. |

*[CSS parts](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_shadow_parts) allow freely styling internals of the widget with CSS.*

## Editing config
| Name | Value |
| :--: | :---------: |


*The [editing config](https://webwriter.app/docs/packages/configuring/#editingconfig) defines how explorable authoring tools such as [WebWriter](https://webwriter.app) treat the widget.*

*No public slots, events, or custom CSS properties.*


---
*Generated with @webwriter/build@1.14.0*