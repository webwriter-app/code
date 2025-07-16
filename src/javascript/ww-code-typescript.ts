import { javascript } from "@codemirror/lang-javascript";
import { localized } from "@lit/localize";
import { customElement } from "lit/decorators.js";
import { DiagnosticCategory, getLineAndCharacterOfPosition, ModuleKind, transpileModule } from "typescript";
import { style } from "../shared/ww-code-css-single";
import { jsTemplateStyle } from "./shared/ww-code-js-css";
import CodeJsTemplate from "./shared/ww-code-js-template";

/** Code widget for TypeScript with compilation and execution capabilities. */
@customElement("webwriter-code-typescript")
@localized()
export default class CodeTypeScript extends CodeJsTemplate {
    static styles = [style, jsTemplateStyle] as any;

    constructor() {
        super("TypeScript", javascript());
    }

    build(code: string): string {
        this.diagnostics = [];

        const out = transpileModule(code, {
            compilerOptions: {
                module: ModuleKind.CommonJS,
                strict: true,
            },
            reportDiagnostics: true,
        });

        if (out.diagnostics?.find((d) => d.category === DiagnosticCategory.Error)) {
            this.diagnostics = out.diagnostics
                .filter((d) => d.category === DiagnosticCategory.Error)
                .filter((d) => d.file && d.start && d.messageText)
                .map((d) => ({
                    message: d.messageText.toString(),
                    start: d.start!,
                    line: getLineAndCharacterOfPosition(d.file!, d.start!).line + 1,
                    character: getLineAndCharacterOfPosition(d.file!, d.start!).character + 1,
                }));
            throw "Compilation failed";
        } else {
            return out.outputText;
        }
    }
}
