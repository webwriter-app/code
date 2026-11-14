import "@shoelace-style/shoelace/dist/themes/light.css";
import { LitElementWw } from "@webwriter/lit";
import { LitElement, PropertyValueMap, html } from "lit";
import { property, query, state } from "lit/decorators.js";

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
import "./shoelace-icons";

import type { MsgFn } from "@lit/localize";
import { createLocalizer, effectiveLanguage, drawerLabel, sourceMsg } from "../../localization/localizer";
import { readData, writeData } from "./data-block";

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
    // Inherited language must not be reflected as an authored attribute.
    static override properties = { lang: { attribute: false, noAccessor: true } };
    override get lang(): string { return effectiveLanguage(this); }
    override set lang(value: string) { this.setAttribute("lang", value); }

    static styles = style;

    /** @internal */
    static get scopedElements() {
        return {
            "sl-button": SlButton,
            "sl-input": SlInput,
            "sl-details": SlDetails,
            "sl-icon": SlIcon,
        };
    }

    /** @internal */
    static shadowRootOptions = { ...LitElement.shadowRootOptions, delegatesFocus: true };

    protected localize = createLocalizer(this, () => {
        Object.assign(this.optionGroups, Code.makeOptionGroups(this.msg, this.localize.getLocale()));
        Object.assign(this.actions, Code.makeActions(this.msg, this.localize.getLocale()));
        Object.assign(this.options, this.getDrawerOptions());
    });
    readonly msg = this.localize.msg;

    private codeMirror: EditorView = new EditorView();
    private languageModule!: LanguageModule;

    private static makeOptionGroups(msg: MsgFn, locale = "en") {
        return {
            execution: { label: drawerLabel(msg("Execution"), { en: "Execution", de: "Ausführung" }, locale) },
            editor: { label: { _: msg("Editor") } },
            results: { label: drawerLabel(msg("Results"), { en: "Results", de: "Ergebnisse" }, locale) },
        };
    }
    static optionGroups = Code.makeOptionGroups(sourceMsg);
    readonly optionGroups = Code.makeOptionGroups(sourceMsg);

    readonly options = {};

    private getDrawerOptions() {
        const { msg } = this;
        const locale = this.localize.getLocale();
        const unavailable = !this.codeRunner;
        return {
            disableExecution: { type: Boolean, group: "execution", disabled: unavailable, label: drawerLabel(msg("Disable code execution"), { en: "Disable code execution", de: "Codeausführung deaktivieren" }, locale) },
            autoRun: { type: Boolean, group: "execution", disabled: unavailable, label: drawerLabel(msg("Run on load"), { en: "Run on load", de: "Beim Laden ausführen" }, locale) },
            autocomplete: { type: Boolean, group: "editor", label: drawerLabel(msg("Autocompletion"), { en: "Autocompletion", de: "Autovervollständigung" }, locale) },
            hideCode: { type: Boolean, group: "editor", label: drawerLabel(msg("Hide code"), { en: "Hide code", de: "Code ausblenden" }, locale) },
            showExecutionTime: { type: Boolean, group: "results", label: drawerLabel(msg("Show execution time"), { en: "Show execution time", de: "Ausführungszeit anzeigen" }, locale) },
            showExecutionCount: { type: Boolean, group: "results", label: drawerLabel(msg("Show execution count"), { en: "Show execution count", de: "Anzahl der Ausführungen anzeigen" }, locale) },
        };
    }

    private static makeActions(msg: MsgFn, locale = "en") {
        return {
            resetExecutionCount: { group: "results", label: drawerLabel(msg("Reset execution count"), { en: "Reset execution count", de: "Anzahl der Ausführungen zurücksetzen" }, locale) },
        };
    }
    static actions = Code.makeActions(sourceMsg);

    readonly actions = Code.makeActions(sourceMsg);

    resetExecutionCount() {
        this.executionCount = 0;
    }

    @property({ type: Boolean, reflect: true, attribute: "hide-code" })
    accessor hideCode = false;

    @property({ type: Boolean, reflect: true, attribute: "disable-execution" })
    accessor disableExecution = false;

    private readProgram() {
        return readData<{ code: string; lockedLines: number[] }>(this);
    }

    get code() {
        const { code } = this.readProgram();
        return typeof code === "string" ? code : "";
    }

    set code(code: string) {
        if (code !== this.code) writeData(this, { ...this.readProgram(), code });
    }

    get lockedLines() {
        const { lockedLines } = this.readProgram();
        return Array.isArray(lockedLines) ? lockedLines : [];
    }

    set lockedLines(lockedLines: number[]) {
        if (JSON.stringify(lockedLines) !== JSON.stringify(this.lockedLines)) {
            writeData(this, { ...this.readProgram(), lockedLines });
        }
    }

    private programObserver = new MutationObserver(() => {
        this.requestUpdate("code", this.codeMirror.state.doc.toString());
        this.requestUpdate("lockedLines", undefined);
    });

    connectedCallback() {
        super.connectedCallback();
        this.programObserver.observe(this, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ["slot", "type", "src"] });
        if (this.hasUpdated) {
            this.requestUpdate("code", this.codeMirror.state.doc.toString());
            this.requestUpdate("lockedLines", undefined);
        }
    }

    disconnectedCallback() {
        this.programObserver.disconnect();
        super.disconnectedCallback();
    }

    /** Whether to automatically run the code when the component is first loaded. */
    @property({ type: Boolean, attribute: true, reflect: true })
    accessor autoRun = false;

    /** Whether autocompletion is enabled in the code editor. */
    @property({ type: Boolean, attribute: true, reflect: true })
    accessor autocomplete = false;

    /** Whether to display the execution time in the controls. */
    @property({ type: Boolean, attribute: true, reflect: true })
    accessor showExecutionTime = false;

    /** The execution time in milliseconds of the last code run. */
    @state()
    accessor executionTime: number = 0;

    /** Whether to display the execution count in the run button. */
    @property({ type: Boolean, attribute: true, reflect: true })
    accessor showExecutionCount = false;

    /** The number of times the code has been executed. */
    @state()
    accessor executionCount = 0;

    @state()
    private accessor running = false;

    /** The results from the last code execution. */
    @state()
    accessor results: any = [];

    /** Compilation or runtime errors from the last code execution. */
    @state()
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
        Object.assign(this.options, this.getDrawerOptions());
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
            () => this.msg("This section of code is locked and cannot be edited"),
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

        if (this.autoRun && !this.disableExecution) {
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
            return !this.hideCode ? "" : "opacity: 0.5";
        }
        return !this.hideCode ? "" : "display: none";
    }

    protected render() {
        return html`
            ${this.Code()} ${this.Controls()} ${this.codeRunner !== undefined ? this.Output() : null}
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
                ?disabled=${this.codeRunner === undefined || this.running}
                @click="${this.runCode}"
                style=${!this.disableExecution && this.codeRunner !== undefined ? "" : "display: none"}
            >
                <sl-icon name="${this.autoRun ? "play-circle" : "play-fill"}" slot="prefix"></sl-icon>
                ${this.msg("Run")} ${this.showExecutionCount ? `(${this.executionCount})` : ""}
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
                style=${!this.disableExecution && this.codeRunner !== undefined ? "" : "display: none"}
            >
                ${this.msg("Clear Output")}
            </sl-button>
        </div>`;
    }

    private Output() {
        return html`<output style=${this.getVisibleStyle()}>
            ${this.diagnostics?.length > 0 ? this.Diagnostics() : this.Result()}
        </output>`;
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
                            <pre class="diagnostic-message">${d.message}</pre>
                        `,
                    )}
                </div>
            </div>
        `;
    }

    private async runCode() {
        if (!this.codeRunner || this.running) {
            return;
        }

        this.running = true;

        try {
            this.results = [];
            this.diagnostics = [];

            this.executionCount++;
            const code = this.codeMirror.state.doc.toString();
            const startTime = performance.now();
            await this.codeRunner(code, this);
            const endTime = performance.now();
            this.executionTime = endTime - startTime;
        } finally {
            this.running = false;
        }
    }

    private setAutocompletion(value: boolean) {
        this.autocomplete = value;
        this.codeMirror.dispatch({
            effects: this.autocompletion.reconfigure(value ? autocompletion() : []),
        });
    }
}
