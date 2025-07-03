import { javascript } from "@codemirror/lang-javascript";
import { html, TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";
import { DiagnosticCategory, getLineAndCharacterOfPosition, ModuleKind, transpileModule } from "typescript";
import { style } from "../shared/ww-code-css-single";
import { jsTemplateStyle } from "./shared/ww-code-js-css";
import CodeJsTemplate from "./shared/ww-code-js-template";

type Diagnostic = {
    message: string;
    start: number;
    line: number;
    character: number;
};

@customElement("webwriter-code-typescript")
export default class CodeTypeScript extends CodeJsTemplate {
    static styles = [style, jsTemplateStyle] as any;

    constructor() {
        super("TypeScript", javascript());
    }

    @property({ type: Array, attribute: true, reflect: true })
    accessor diagnostics: Diagnostic[] = [];

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

    Result(): TemplateResult<1> {
        if (this.diagnostics.length > 0) {
            return this.Diagnostics();
        }

        return super.Result();
    }

    Diagnostics() {
        return html`
            <div class="diagnostics-container">
                TypeScript compilation failed with ${this.diagnostics.length}
                error${this.diagnostics.length > 1 ? "s" : ""}:
                <div class="diagnostics-list">
                    ${this.diagnostics.map(
                        (d) => html`
                            <sl-icon name="exclamation-triangle-fill" class="diagnostic-icon"></sl-icon>
                            <a
                                class="diagnostic-line-number"
                                href="#"
                                @click=${(event: Event) => {
                                    event.preventDefault();
                                    this.codeMirror.focus();
                                    this.codeMirror.dispatch({
                                        selection: {
                                            anchor: d.start,
                                        },
                                    });
                                }}
                                >${d.line}:${d.character}</a
                            >
                            <div class="diagnostic-message">${d.message}</div>
                        `,
                    )}
                </div>
            </div>
        `;
    }
}
