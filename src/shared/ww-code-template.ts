import "@shoelace-style/shoelace/dist/themes/light.css";
import { LitElementWw } from "@webwriter/lit";
import { LitElement, PropertyValueMap, html } from "lit";
import { property, query } from "lit/decorators.js";

import { style } from "./ww-code-css-single";

// CodeMirror
import { autocompletion } from "@codemirror/autocomplete";
import { LanguageSupport } from "@codemirror/language";
import { Compartment, StateEffect } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { lineLockEffect, lineLockField, setupCodeMirror } from "./codemirror-setup";

// Shoelace Components
import SlButton from "@shoelace-style/shoelace/dist/components/button/button.js";
import SlDetails from "@shoelace-style/shoelace/dist/components/details/details.js";
import SlIcon from "@shoelace-style/shoelace/dist/components/icon/icon.js";
import SlInput from "@shoelace-style/shoelace/dist/components/input/input.js";
import SlSwitch from "@shoelace-style/shoelace/dist/components/switch/switch.js";
import "./shoelace-icons";

import { msg } from "@lit/localize";
import LOCALIZE from "../../localization/generated";

export type LanguageModule = {
    name: string;
    executionFunction: ((code: string, context: Code) => any) | undefined;
    languageExtension: LanguageSupport;
};

export type Diagnostic = {
    message: string;
    start?: number;
    line?: number;
    character?: number;
};

export default abstract class Code extends LitElementWw {
    static styles = style;

    /** @internal */
    static get scopedElements() {
        return {
            "sl-button": SlButton,
            "sl-input": SlInput,
            "sl-switch": SlSwitch,
            "sl-details": SlDetails,
            "sl-icon": SlIcon,
        };
    }

    /** @internal */
    static shadowRootOptions = { ...LitElement.shadowRootOptions, delegatesFocus: true };

    protected localize = LOCALIZE;

    private codeMirror: EditorView = new EditorView();
    private languageModule!: LanguageModule;

    /** The source code content displayed in the editor. */
    @property({ type: String, attribute: true, reflect: true })
    accessor code: string = this.codeMirror.state.doc.toString();

    /** Whether the code editor is visible to the user. */
    @property({ type: Boolean, attribute: true, reflect: true })
    accessor visible = true;

    /** Whether to automatically run the code when the component is first loaded. */
    @property({ type: Boolean, attribute: true, reflect: true })
    accessor autoRun = false;

    /** Whether the code execution is allowed and the run button is enabled. */
    @property({ type: Boolean, attribute: true, reflect: true })
    accessor runnable = true;

    /** Whether autocompletion is enabled in the code editor. */
    @property({ type: Boolean, attribute: true, reflect: true })
    accessor autocomplete = false;

    /** Array of line numbers that should be locked from editing. */
    @property({ type: Array, attribute: true, reflect: true })
    accessor lockedLines: number[] = [];

    /** Whether to display the execution time in the controls. */
    @property({ type: Boolean, attribute: true, reflect: true })
    accessor showExecutionTime = false;

    /** The execution time in milliseconds of the last code run. */
    @property({ type: Number, attribute: true, reflect: true })
    accessor executionTime: number = 0;

    /** Whether to display the execution count in the run button. */
    @property({ type: Boolean, attribute: true, reflect: true })
    accessor showExecutionCount = false;

    /** The number of times the code has been executed. */
    @property({ type: Number, attribute: true, reflect: true })
    accessor executionCount = 0;

    /** The results from the last code execution. */
    @property({ type: Array, attribute: true, reflect: true })
    accessor results: any = [];

    /** Compilation or runtime errors from the last code execution. */
    @property({ type: Array, attribute: true, reflect: true })
    accessor diagnostics: Diagnostic[] = [];

    @query("pre")
    private accessor pre!: HTMLPreElement;

    private get codeRunner() {
        return this.languageModule.executionFunction;
    }

    private language = new Compartment();
    private autocompletion = new Compartment();

    constructor(languageModule: LanguageModule) {
        super();
        this.languageModule = languageModule;
    }

    private isEditable() {
        return this.contentEditable === "true" || this.contentEditable === "";
    }

    protected firstUpdated() {
        this.codeMirror = setupCodeMirror(
            this.code,
            this.pre,
            this.isEditable(),
            [
                this.language.of(this.languageModule.languageExtension),
                this.autocompletion.of(autocompletion()),
                EditorView.updateListener.of((update) => {
                    if (update.docChanged) {
                        this.code = update.state.doc.toString();
                    }
                }),
            ],
            () => msg("This section of code is locked and cannot be edited"),
        );

        if (this.lockedLines.length > 0) {
            this.codeMirror.dispatch({
                effects: this.lockedLines
                    .map((lineNumber) => {
                        try {
                            const line = this.codeMirror.state.doc.line(lineNumber);
                            return lineLockEffect.of({ pos: line.from, on: true });
                        } catch (error) {
                            console.warn(`Line number ${lineNumber} is out of bounds for the document.`);
                            return null;
                        }
                    })
                    .filter((effect) => effect !== null),
            });
        }
        this.codeMirror.state.field(lineLockField).onLockedLinesChange = (lockedLines: number[]) => {
            this.lockedLines = lockedLines;
        };

        if (this.autoRun) {
            this.runCode();
        }
    }

    protected updated(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>): void {
        if (_changedProperties.has("autocomplete")) {
            this.setAutocompletion(this.autocomplete);
        }

        if (_changedProperties.has("code")) {
            if (this.codeMirror.state.doc.toString() !== this.code) {
                this.codeMirror.dispatch({
                    changes: { from: 0, to: this.codeMirror.state.doc.length, insert: this.code },
                });
            }
        }

        if (_changedProperties.has("lockedLines")) {
            let remainingLinesToLock = this.lockedLines;

            let effects: StateEffect<any>[] = [];
            this.codeMirror.state.field(lineLockField).markers.between(0, this.codeMirror.state.doc.length, (from) => {
                const line = this.codeMirror.state.doc.lineAt(from);
                if (!remainingLinesToLock.includes(line.number)) {
                    effects.push(lineLockEffect.of({ pos: from, on: false }));
                } else {
                    remainingLinesToLock = remainingLinesToLock.filter((l) => l !== line.number);
                }
            });

            remainingLinesToLock.forEach((lineNumber) => {
                if (lineNumber < 1 || lineNumber > this.codeMirror.state.doc.lines) {
                    console.warn(`Line number ${lineNumber} is out of bounds for the document.`);
                    return;
                }
                const line = this.codeMirror.state.doc.line(lineNumber);
                effects.push(lineLockEffect.of({ pos: line.from, on: true }));
            });

            if (effects.length > 0) this.codeMirror.dispatch({ effects });
        }
    }

    private getVisibleStyle() {
        if (this.isEditable()) {
            return this.visible ? "" : "opacity: 0.5";
        }
        return this.visible ? "" : "display: none";
    }

    protected render() {
        return html`
            ${this.Code()} ${this.Controls()} ${this.codeRunner !== undefined ? this.Output() : null}
            ${this.isEditable() ? this.Options() : ""}
        `;
    }

    private Code() {
        return html`<pre style=${this.getVisibleStyle()}></pre>`;
    }

    private Controls() {
        return html`<div class="controls" style=${this.getVisibleStyle()}>
            <sl-button
                variant="primary"
                size="small"
                ?disabled=${this.codeRunner === undefined}
                @click="${this.runCode}"
                style=${this.runnable && this.codeRunner !== undefined ? "" : "display: none"}
            >
                <sl-icon name="${this.autoRun ? "play-circle" : "play-fill"}" slot="prefix"></sl-icon>
                ${msg("Run")} ${this.showExecutionCount ? `(${this.executionCount})` : ""}
            </sl-button>
            ${this.showExecutionTime ? html`<div class="executionTime">${this.executionTime.toFixed(1)}ms</div>` : ""}
            <div class="language-label">${this.languageModule.name}</div>
            <sl-button
                size="small"
                @click=${() => {
                    this.results = [];
                    this.diagnostics = [];
                    this.executionTime = 0;
                }}
                style=${this.runnable && this.codeRunner !== undefined ? "" : "display: none"}
            >
                ${msg("Clear Output")}
            </sl-button>
        </div>`;
    }

    private Output() {
        return html`<output style=${this.getVisibleStyle()}>
            ${this.diagnostics?.length > 0 ? this.Diagnostics() : this.Result()}
        </output>`;
    }

    private Options() {
        return html`<aside part="options" style="z-index: 1000">
            <h2>${msg("Execution")}</h2>
            <sl-switch
                @sl-change=${(event: any) => {
                    if (event.target) {
                        let target = event.target as SlSwitch;
                        this.runnable = target.checked;
                    }
                }}
                ?checked=${this.runnable}
                ?disabled=${this.codeRunner === undefined}
                >${msg("Allow Code execution")}</sl-switch
            >
            <sl-switch
                @sl-change=${(e: any) => (this.autoRun = e.target.checked)}
                ?checked=${this.autoRun}
                ?disabled=${this.codeRunner === undefined}
                >${msg("Run on load")}</sl-switch
            >
            <h2>${msg("Editor")}</h2>
            <sl-switch
                @sl-change=${(event: any) => {
                    if (event.target) {
                        let target = event.target as SlSwitch;
                        this.setAutocompletion(target.checked);
                    }
                }}
                ?checked=${this.autocomplete}
                >${msg("Autocompletion")}</sl-switch
            >

            <sl-switch @sl-change=${(e: any) => (this.visible = e.target.checked)} ?checked=${this.visible}
                >${msg("Visible")}</sl-switch
            >

            <h2>${msg("Results")}</h2>
            <sl-switch
                @sl-change=${(e: any) => (this.showExecutionTime = e.target.checked)}
                ?checked=${this.showExecutionTime}
                >${msg("Show execution time")}</sl-switch
            >
            <sl-switch
                @sl-change=${(e: any) => (this.showExecutionCount = e.target.checked)}
                ?checked=${this.showExecutionCount}
                >${msg("Show execution count")}</sl-switch
            >
            <sl-button @click=${() => (this.executionCount = 0)}
                ><span class="button-label-linebreak">${msg("Reset execution count")}</span></sl-button
            >
        </aside>`;
    }

    protected Result() {
        switch (this.languageModule.name) {
            case "Python":
            case "WebAssembly":
            case "Java":
                const outputs = this.results
                    .filter((r: any) => r !== undefined)
                    .map((r: any) => html`<pre style="color:${r?.color}">${r?.text}</pre>`);
                return html` <div class="outputs">${outputs}</div>`;
            case "HTML":
                return html` <iframe
                    id="iframePreview"
                    class="htmlPreview"
                    srcdoc=${this.results[0]}
                    sandbox="allow-scripts allow-modals"
                ></iframe>`;
            default:
                return html``;
        }
    }

    private Diagnostics() {
        return html`
            <div class="diagnostics-container">
                ${this.languageModule.name} compilation failed with ${this.diagnostics.length}
                error${this.diagnostics.length > 1 ? "s" : ""}:
                <div class="diagnostics-list">
                    ${this.diagnostics.map(
                        (d) => html`
                            <sl-icon name="exclamation-triangle-fill" class="diagnostic-icon"></sl-icon>
                            ${d.start
                                ? html`<a
                                      class="diagnostic-line-number"
                                      href="#"
                                      @click=${(event: Event) => {
                                          event.preventDefault();
                                          this.codeMirror.focus();
                                          if (typeof d.start === "number") {
                                              this.codeMirror.dispatch({
                                                  selection: { anchor: d.start },
                                              });
                                          }
                                      }}
                                      >${d.line}:${d.character}</a
                                  >`
                                : html`<a class="diagnostic-line-number"></a>`}
                            <div class="diagnostic-message">${d.message}</div>
                        `,
                    )}
                </div>
            </div>
        `;
    }

    private async runCode() {
        if (!this.codeRunner) {
            return;
        }
        this.results = [];
        this.diagnostics = [];

        this.executionCount++;
        const code = this.codeMirror.state.doc.toString();
        const startTime = performance.now();
        await this.codeRunner(code, this);
        const endTime = performance.now();
        this.executionTime = endTime - startTime;
    }

    private setAutocompletion(value: boolean) {
        this.autocomplete = value;
        this.codeMirror.dispatch({
            effects: this.autocompletion.reconfigure(value ? autocompletion() : []),
        });
    }
}
