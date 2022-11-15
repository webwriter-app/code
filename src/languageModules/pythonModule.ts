import { python } from "@codemirror/lang-python"

const executePython = (code: string) => {
    return null
}

export const pythonModule = {
    name: "Python",
    executionFunction: executePython,
    highlightExtensions: python(),
}
