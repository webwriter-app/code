/** The file extensions of each language widget. The first one is used for export. */
const extensions: Record<string, string[]> = {
    c: [".c"],
    cpp: [".cpp", ".cc", ".cxx"],
    csharp: [".cs"],
    go: [".go"],
    haskell: [".hs"],
    html: [".html", ".htm"],
    java: [".java"],
    javascript: [".js", ".mjs"],
    lua: [".lua"],
    php: [".php"],
    prolog: [".pl", ".pro"],
    python: [".py"],
    rust: [".rs"],
    scheme: [".scm", ".ss"],
    shell: [".sh"],
    sql: [".sql"],
    typescript: [".ts"],
    webassembly: [".wat", ".wast"],
};

/** The conversion maps of a language: a `pre` element and source files with the language's extensions. */
export function sourceConversions(language: string) {
    const [main, ...others] = extensions[language];
    return {
        convertFrom: {
            pre: "loadPre",
            ...Object.fromEntries([main, ...others].map((extension) => [extension, "importSource"])),
        },
        convertTo: { pre: "toPre", [main]: "exportSource" },
    };
}

export const languageOf = (tagName: string) => tagName.replace(/^webwriter-code-/, "");

export const extensionOf = (language: string) => extensions[language]?.[0] ?? ".txt";

/** Java requires the file of a public class to carry its name. */
export function fileNameOf(language: string, code: string) {
    const className = language === "java" ? /\bpublic\s+(?:final\s+|abstract\s+)?class\s+([A-Za-z_$][\w$]*)/.exec(code)?.[1] : undefined;
    return (className ?? (language === "java" ? "Main" : "code")) + extensionOf(language);
}

/** Largest source file an import accepts. */
export const maxSourceBytes = 1_000_000;

/** The program text of a source file: no byte order mark, line breaks as `\n`. Returns undefined for a file that is not text. */
export function readSource(bytes: Uint8Array) {
    if (bytes.byteLength > maxSourceBytes) return undefined;
    let text: string;
    try {
        text = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
    } catch {
        return undefined;
    }
    if (text.includes("\0")) return undefined;
    return text.replace(/^﻿/, "").replace(/\r\n?/g, "\n");
}
