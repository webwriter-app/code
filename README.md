# Code (`@webwriter/code@3.0.1`)
[License: MIT](LICENSE) | Version: 3.0.1

The Code Widget enables interactive code exercises directly in the browser. Users can effortlessly write, execute, and explore code in multiple programming languages, including:

- JavaScript or TypeScript
- HTML
- Python (powered by [Pyodide](https://pyodide.org/en/stable/))
- Java (powered by [TeaVM](https://teavm.org/))
- WebAssembly Text Format (WAT)

## Features

- **Intuitive Editor:** Based on CodeMirror, offering syntax highlighting and optional autocompletion for a smoother coding experience.
- **Line Locking:** Allows instructors to lock specific lines, creating read-only templates to guide students effectively.
- **Rich Output Display:** Outputs appear neatly below each code cell, with JavaScript execution featuring a fully interactive console inspector.
- **100% Client-Side Execution:** Everything executes locally within the browser, ensuring complete offline capability and no reliance on servers.

## Development

To set up the development environment, clone the repository and execute the following commands:

```bash
npm install
npm run dev # runs @webwriter/build dev
```

Finally, import the `code` directory into WebWriter to begin.


## Snippets
[Snippets](https://webwriter.app/docs/snippets/snippets/) are examples and templates using the package's widgets.

| Name | Import Path |
| :--: | :---------: |
| HTML | @webwriter/code/snippets/HTML.html |



## `CodeHTML` (`<webwriter-code-html>`)
Code widget for HTML with live preview functionality.

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
| `code` (`code`) | `String` | The source code content displayed in the editor. | - | ✓ |
| `visible` (`visible`) | `boolean` | Whether the code editor is visible to the user. | `true` | ✓ |
| `autoRun` (`autoRun`) | `boolean` | Whether to automatically run the code when the component is first loaded. | `false` | ✓ |
| `runnable` (`runnable`) | `boolean` | Whether the code execution is allowed and the run button is enabled. | `true` | ✓ |
| `autocomplete` (`autocomplete`) | `boolean` | Whether autocompletion is enabled in the code editor. | `false` | ✓ |
| `lockedLines` (`lockedLines`) | `number[]` | Array of line numbers that should be locked from editing. | `[]` | ✓ |
| `showExecutionTime` (`showExecutionTime`) | `boolean` | Whether to display the execution time in the controls. | `false` | ✓ |
| `executionTime` (`executionTime`) | `number` | The execution time in milliseconds of the last code run. | `0` | ✓ |
| `showExecutionCount` (`showExecutionCount`) | `boolean` | Whether to display the execution count in the run button. | `false` | ✓ |
| `executionCount` (`executionCount`) | `number` | The number of times the code has been executed. | `0` | ✓ |
| `results` (`results`) | `any` | The results from the last code execution. | `[]` | ✓ |
| `diagnostics` (`diagnostics`) | `Diagnostic[]` | Compilation or runtime errors from the last code execution. | `[]` | ✓ |

*Fields including [properties](https://developer.mozilla.org/en-US/docs/Glossary/Property/JavaScript) and [attributes](https://developer.mozilla.org/en-US/docs/Glossary/Attribute) define the current state of the widget and offer customization options.*

## Editing config
| Name | Value |
| :--: | :---------: |


*The [editing config](https://webwriter.app/docs/packages/configuring/#editingconfig) defines how explorable authoring tools such as [WebWriter](https://webwriter.app) treat the widget.*

*No public methods, slots, events, custom CSS properties, or CSS parts.*


## `CodeJavaScript` (`<webwriter-code-javascript>`)
Code widget for JavaScript with execution capabilities.

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
| `code` (`code`) | `String` | The source code content displayed in the editor. | - | ✓ |
| `visible` (`visible`) | `boolean` | Whether the code editor is visible to the user. | `true` | ✓ |
| `autoRun` (`autoRun`) | `boolean` | Whether to automatically run the code when the component is first loaded. | `false` | ✓ |
| `runnable` (`runnable`) | `boolean` | Whether the code execution is allowed and the run button is enabled. | `true` | ✓ |
| `autocomplete` (`autocomplete`) | `boolean` | Whether autocompletion is enabled in the code editor. | `false` | ✓ |
| `lockedLines` (`lockedLines`) | `number[]` | Array of line numbers that should be locked from editing. | `[]` | ✓ |
| `showExecutionTime` (`showExecutionTime`) | `boolean` | Whether to display the execution time in the controls. | `false` | ✓ |
| `executionTime` (`executionTime`) | `number` | The execution time in milliseconds of the last code run. | `0` | ✓ |
| `showExecutionCount` (`showExecutionCount`) | `boolean` | Whether to display the execution count in the run button. | `false` | ✓ |
| `executionCount` (`executionCount`) | `number` | The number of times the code has been executed. | `0` | ✓ |
| `results` (`results`) | `any` | The results from the last code execution. | `[]` | ✓ |
| `diagnostics` (`diagnostics`) | `Diagnostic[]` | Compilation or runtime errors from the last code execution. | `[]` | ✓ |

*Fields including [properties](https://developer.mozilla.org/en-US/docs/Glossary/Property/JavaScript) and [attributes](https://developer.mozilla.org/en-US/docs/Glossary/Attribute) define the current state of the widget and offer customization options.*

## Editing config
| Name | Value |
| :--: | :---------: |


*The [editing config](https://webwriter.app/docs/packages/configuring/#editingconfig) defines how explorable authoring tools such as [WebWriter](https://webwriter.app) treat the widget.*

*No public methods, slots, events, custom CSS properties, or CSS parts.*


## `CodeJava` (`<webwriter-code-java>`)
Code widget for Java with compilation and execution capabilities using TeaVM (Java 21).

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
| `code` (`code`) | `String` | The source code content displayed in the editor. | - | ✓ |
| `visible` (`visible`) | `boolean` | Whether the code editor is visible to the user. | `true` | ✓ |
| `autoRun` (`autoRun`) | `boolean` | Whether to automatically run the code when the component is first loaded. | `false` | ✓ |
| `runnable` (`runnable`) | `boolean` | Whether the code execution is allowed and the run button is enabled. | `true` | ✓ |
| `autocomplete` (`autocomplete`) | `boolean` | Whether autocompletion is enabled in the code editor. | `false` | ✓ |
| `lockedLines` (`lockedLines`) | `number[]` | Array of line numbers that should be locked from editing. | `[]` | ✓ |
| `showExecutionTime` (`showExecutionTime`) | `boolean` | Whether to display the execution time in the controls. | `false` | ✓ |
| `executionTime` (`executionTime`) | `number` | The execution time in milliseconds of the last code run. | `0` | ✓ |
| `showExecutionCount` (`showExecutionCount`) | `boolean` | Whether to display the execution count in the run button. | `false` | ✓ |
| `executionCount` (`executionCount`) | `number` | The number of times the code has been executed. | `0` | ✓ |
| `results` (`results`) | `any` | The results from the last code execution. | `[]` | ✓ |
| `diagnostics` (`diagnostics`) | `Diagnostic[]` | Compilation or runtime errors from the last code execution. | `[]` | ✓ |

*Fields including [properties](https://developer.mozilla.org/en-US/docs/Glossary/Property/JavaScript) and [attributes](https://developer.mozilla.org/en-US/docs/Glossary/Attribute) define the current state of the widget and offer customization options.*

## Editing config
| Name | Value |
| :--: | :---------: |


*The [editing config](https://webwriter.app/docs/packages/configuring/#editingconfig) defines how explorable authoring tools such as [WebWriter](https://webwriter.app) treat the widget.*

*No public methods, slots, events, custom CSS properties, or CSS parts.*


## `CodeTypeScript` (`<webwriter-code-typescript>`)
Code widget for TypeScript with compilation and execution capabilities.

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
| `code` (`code`) | `String` | The source code content displayed in the editor. | - | ✓ |
| `visible` (`visible`) | `boolean` | Whether the code editor is visible to the user. | `true` | ✓ |
| `autoRun` (`autoRun`) | `boolean` | Whether to automatically run the code when the component is first loaded. | `false` | ✓ |
| `runnable` (`runnable`) | `boolean` | Whether the code execution is allowed and the run button is enabled. | `true` | ✓ |
| `autocomplete` (`autocomplete`) | `boolean` | Whether autocompletion is enabled in the code editor. | `false` | ✓ |
| `lockedLines` (`lockedLines`) | `number[]` | Array of line numbers that should be locked from editing. | `[]` | ✓ |
| `showExecutionTime` (`showExecutionTime`) | `boolean` | Whether to display the execution time in the controls. | `false` | ✓ |
| `executionTime` (`executionTime`) | `number` | The execution time in milliseconds of the last code run. | `0` | ✓ |
| `showExecutionCount` (`showExecutionCount`) | `boolean` | Whether to display the execution count in the run button. | `false` | ✓ |
| `executionCount` (`executionCount`) | `number` | The number of times the code has been executed. | `0` | ✓ |
| `results` (`results`) | `any` | The results from the last code execution. | `[]` | ✓ |
| `diagnostics` (`diagnostics`) | `Diagnostic[]` | Compilation or runtime errors from the last code execution. | `[]` | ✓ |

*Fields including [properties](https://developer.mozilla.org/en-US/docs/Glossary/Property/JavaScript) and [attributes](https://developer.mozilla.org/en-US/docs/Glossary/Attribute) define the current state of the widget and offer customization options.*

## Editing config
| Name | Value |
| :--: | :---------: |


*The [editing config](https://webwriter.app/docs/packages/configuring/#editingconfig) defines how explorable authoring tools such as [WebWriter](https://webwriter.app) treat the widget.*

*No public methods, slots, events, custom CSS properties, or CSS parts.*


## `CodePython` (`<webwriter-code-python>`)
Code widget for Python with execution capabilities using Pyodide.

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
| `code` (`code`) | `String` | The source code content displayed in the editor. | - | ✓ |
| `visible` (`visible`) | `boolean` | Whether the code editor is visible to the user. | `true` | ✓ |
| `autoRun` (`autoRun`) | `boolean` | Whether to automatically run the code when the component is first loaded. | `false` | ✓ |
| `runnable` (`runnable`) | `boolean` | Whether the code execution is allowed and the run button is enabled. | `true` | ✓ |
| `autocomplete` (`autocomplete`) | `boolean` | Whether autocompletion is enabled in the code editor. | `false` | ✓ |
| `lockedLines` (`lockedLines`) | `number[]` | Array of line numbers that should be locked from editing. | `[]` | ✓ |
| `showExecutionTime` (`showExecutionTime`) | `boolean` | Whether to display the execution time in the controls. | `false` | ✓ |
| `executionTime` (`executionTime`) | `number` | The execution time in milliseconds of the last code run. | `0` | ✓ |
| `showExecutionCount` (`showExecutionCount`) | `boolean` | Whether to display the execution count in the run button. | `false` | ✓ |
| `executionCount` (`executionCount`) | `number` | The number of times the code has been executed. | `0` | ✓ |
| `results` (`results`) | `any` | The results from the last code execution. | `[]` | ✓ |
| `diagnostics` (`diagnostics`) | `Diagnostic[]` | Compilation or runtime errors from the last code execution. | `[]` | ✓ |

*Fields including [properties](https://developer.mozilla.org/en-US/docs/Glossary/Property/JavaScript) and [attributes](https://developer.mozilla.org/en-US/docs/Glossary/Attribute) define the current state of the widget and offer customization options.*

## Editing config
| Name | Value |
| :--: | :---------: |


*The [editing config](https://webwriter.app/docs/packages/configuring/#editingconfig) defines how explorable authoring tools such as [WebWriter](https://webwriter.app) treat the widget.*

*No public methods, slots, events, custom CSS properties, or CSS parts.*


## `CodeWebAssembly` (`<webwriter-code-webassembly>`)
Code widget for WebAssembly with compilation and execution capabilities.

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
| `code` (`code`) | `String` | The source code content displayed in the editor. | - | ✓ |
| `visible` (`visible`) | `boolean` | Whether the code editor is visible to the user. | `true` | ✓ |
| `autoRun` (`autoRun`) | `boolean` | Whether to automatically run the code when the component is first loaded. | `false` | ✓ |
| `runnable` (`runnable`) | `boolean` | Whether the code execution is allowed and the run button is enabled. | `true` | ✓ |
| `autocomplete` (`autocomplete`) | `boolean` | Whether autocompletion is enabled in the code editor. | `false` | ✓ |
| `lockedLines` (`lockedLines`) | `number[]` | Array of line numbers that should be locked from editing. | `[]` | ✓ |
| `showExecutionTime` (`showExecutionTime`) | `boolean` | Whether to display the execution time in the controls. | `false` | ✓ |
| `executionTime` (`executionTime`) | `number` | The execution time in milliseconds of the last code run. | `0` | ✓ |
| `showExecutionCount` (`showExecutionCount`) | `boolean` | Whether to display the execution count in the run button. | `false` | ✓ |
| `executionCount` (`executionCount`) | `number` | The number of times the code has been executed. | `0` | ✓ |
| `results` (`results`) | `any` | The results from the last code execution. | `[]` | ✓ |
| `diagnostics` (`diagnostics`) | `Diagnostic[]` | Compilation or runtime errors from the last code execution. | `[]` | ✓ |

*Fields including [properties](https://developer.mozilla.org/en-US/docs/Glossary/Property/JavaScript) and [attributes](https://developer.mozilla.org/en-US/docs/Glossary/Attribute) define the current state of the widget and offer customization options.*

## Editing config
| Name | Value |
| :--: | :---------: |


*The [editing config](https://webwriter.app/docs/packages/configuring/#editingconfig) defines how explorable authoring tools such as [WebWriter](https://webwriter.app) treat the widget.*

*No public methods, slots, events, custom CSS properties, or CSS parts.*


---
*Generated with @webwriter/build@1.8.1*