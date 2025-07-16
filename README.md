# Code Widget

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
