import { DiagnosticCategory, flattenDiagnosticMessageText, ModuleKind, transpileModule } from "typescript";

import { replyWithResult } from "../../shared/run-worker";

function build(code: string) {
    const out = transpileModule(code, {
        compilerOptions: { module: ModuleKind.CommonJS, strict: true },
        reportDiagnostics: true,
    });
    return {
        code: out.outputText,
        diagnostics: (out.diagnostics ?? [])
            .filter((d) => d.category === DiagnosticCategory.Error)
            .map((d) => {
                const message = flattenDiagnosticMessageText(d.messageText, "\n");
                if (!d.file || d.start === undefined) return { message };
                const { line, character } = d.file.getLineAndCharacterOfPosition(d.start);
                return { message, start: d.start, line: line + 1, character: character + 1 };
            }),
    };
}

replyWithResult(({ code }: { code: string }) => build(code));
