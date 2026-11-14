import "@shoelace-style/shoelace/dist/themes/light.css";
import { LitElementWw } from "@webwriter/lit";
import { LitElement, html } from "lit";
import type { CSSResultGroup, PropertyValues } from "lit";
import { property, query, state } from "lit/decorators.js";
import { ifDefined } from "lit/directives/if-defined.js";
import { styleMap } from "lit/directives/style-map.js";

import { style } from "./ww-code-css-single";

// CodeMirror
import { autocompletion } from "@codemirror/autocomplete";
import type { LanguageSupport } from "@codemirror/language";
import { Compartment, EditorSelection, Transaction } from "@codemirror/state";
import type { StateEffect } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import {
    editingMode,
    hostUpdate,
    lineLockEffect,
    lineLockField,
    lockedLineNumbers,
    setupCodeMirror,
} from "./codemirror-setup";

// Shoelace Components
import SlButton from "@shoelace-style/shoelace/dist/components/button/button.js";
import SlIcon from "@shoelace-style/shoelace/dist/components/icon/icon.js";
import "./shoelace-icons";

import type { MsgFn } from "@lit/localize";
import { createLocalizer, drawerLabel, sourceMsg } from "../../localization/localizer";
import { readData, writeData } from "./data-block";
import { withRuntimeAssets, type LoadedRuntime, type RuntimeDownload } from "./runtime-download";
import type { RuntimeAsset } from "./runtime-assets";

export type CodeRunner = (code: string, context: Code, signal: AbortSignal) => void | Promise<void>;

export type LanguageModule = {
    name: string;
    languageExtension: LanguageSupport;
    execute: CodeRunner;
};

export type Diagnostic = {
    message: string;
    start?: number;
    line?: number;
    character?: number;
};

export default abstract class Code extends LitElementWw {
    static styles: CSSResultGroup = style;

    /** @internal */
    static get scopedElements() {
        return {
            "sl-button": SlButton,
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

    private codeMirror?: EditorView;
    private readonly languageModule: LanguageModule;
    private connection = new AbortController();
    private hasAutoRun = false;
    private runProgram?: string;
    private editableMode = false;

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
        return {
            disableExecution: {
                type: Boolean,
                attribute: "disable-execution",
                group: "execution",
                label: drawerLabel(
                    msg("Disable code execution"),
                    { en: "Disable code execution", de: "Codeausführung deaktivieren" },
                    locale,
                ),
            },
            autoRun: {
                type: Boolean,
                attribute: "autorun",
                group: "execution",
                label: drawerLabel(msg("Run on load"), { en: "Run on load", de: "Beim Laden ausführen" }, locale),
            },
            autocomplete: {
                type: Boolean,
                attribute: "autocomplete",
                group: "editor",
                label: drawerLabel(
                    msg("Autocompletion"),
                    { en: "Autocompletion", de: "Autovervollständigung" },
                    locale,
                ),
            },
            hideCode: {
                type: Boolean,
                attribute: "hide-code",
                group: "editor",
                label: drawerLabel(msg("Hide code"), { en: "Hide code", de: "Code ausblenden" }, locale),
            },
            showExecutionTime: {
                type: Boolean,
                attribute: "showexecutiontime",
                group: "results",
                label: drawerLabel(
                    msg("Show execution time"),
                    { en: "Show execution time", de: "Ausführungszeit anzeigen" },
                    locale,
                ),
            },
            hideExecutionCount: {
                type: Boolean,
                attribute: "hide-execution-count",
                group: "results",
                label: drawerLabel(
                    msg("Hide execution count"),
                    { en: "Hide execution count", de: "Anzahl der Ausführungen ausblenden" },
                    locale,
                ),
            },
        };
    }

    private static makeActions(msg: MsgFn, locale = "en") {
        return {
            resetExecutionCount: {
                group: "results",
                label: drawerLabel(
                    msg("Reset execution count"),
                    { en: "Reset execution count", de: "Anzahl der Ausführungen zurücksetzen" },
                    locale,
                ),
            },
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

    /** The authored source in the JSON data block, or in a legacy code attribute. */
    get code() {
        const { code } = this.readProgram();
        return typeof code === "string" ? code : (this.getAttribute("code") ?? "");
    }

    set code(code: string) {
        if (code !== this.code) writeData(this, { ...this.readProgram(), code });
    }

    /** The authored, one-based line numbers locked for readers. */
    get lockedLines(): number[] {
        const { lockedLines } = this.readProgram();
        const lines = lockedLines ?? this.legacyLockedLines();
        return Array.isArray(lines) ? lines.filter((line) => Number.isSafeInteger(line) && line > 0) : [];
    }

    set lockedLines(lockedLines: number[]) {
        if (JSON.stringify(lockedLines) !== JSON.stringify(this.lockedLines)) {
            writeData(this, { ...this.readProgram(), lockedLines });
        }
    }

    private legacyLockedLines(): unknown {
        try {
            return JSON.parse(this.getAttribute("lockedlines") ?? "[]");
        } catch {
            return [];
        }
    }

    private programObserver = new MutationObserver(() => this.requestUpdate());

    connectedCallback() {
        super.connectedCallback();
        this.connection = new AbortController();
        this.programObserver.observe(this, {
            childList: true,
            subtree: true,
            characterData: true,
            attributes: true,
            attributeFilter: ["slot", "type", "src", "code", "lockedlines", "contenteditable", "style"],
        });
        this.requestUpdate();
    }

    disconnectedCallback() {
        this.programObserver.disconnect();
        this.connection.abort();
        this.codeMirror?.destroy();
        this.codeMirror = undefined;
        this.running = false;
        this.runtimeDownload = undefined;
        super.disconnectedCallback();
    }

    /** Whether to automatically run the code when the component is first loaded. */
    @property({ type: Boolean, attribute: "autorun", reflect: true })
    accessor autoRun = false;

    /** Whether autocompletion is enabled in the code editor. */
    @property({ type: Boolean, attribute: "autocomplete", reflect: true })
    accessor autocomplete = false;

    /** Whether to display the execution time in the controls. */
    @property({ type: Boolean, attribute: "showexecutiontime", reflect: true })
    accessor showExecutionTime = false;

    /** The execution time in milliseconds of the last code run. */
    @state()
    accessor executionTime: number = 0;

    /** Whether to hide the execution count in the run button. */
    @property({ type: Boolean, attribute: "hide-execution-count", reflect: true })
    accessor hideExecutionCount = false;

    /** Whether the run button displays the execution count. */
    get showExecutionCount() {
        return !this.hideExecutionCount;
    }

    set showExecutionCount(value: boolean) {
        this.hideExecutionCount = !value;
    }

    /** The number of times the code has been executed. */
    @state()
    accessor executionCount = 0;

    @state()
    private accessor running = false;

    @state()
    private accessor runtimeDownload: RuntimeDownload | undefined;

    /** @internal */
    withRuntimeAssets<T>(
        assets: readonly RuntimeAsset[],
        signal: AbortSignal,
        use: (runtime: LoadedRuntime) => Promise<T>,
    ) {
        return withRuntimeAssets(
            assets,
            this.ownerDocument,
            signal,
            (download) => {
                this.runtimeDownload = download;
            },
            use,
        );
    }

    @state()
    private accessor runtimeError = "";

    /** The results from the last code execution. */
    @state()
    accessor results: any = [];

    /** Compilation or runtime errors from the last code execution. */
    @state()
    accessor diagnostics: Diagnostic[] = [];

    @query(".editor")
    private accessor editorPane!: HTMLDivElement;

    private autocompletion = new Compartment();
    private editMode = new Compartment();

    constructor(languageModule: LanguageModule) {
        super();
        this.languageModule = languageModule;
        Object.assign(this.options, this.getDrawerOptions());
    }

    private get inEditMode() {
        const mode = this.getAttribute("contenteditable");
        return mode === "" || mode?.toLowerCase() === "true";
    }

    protected updated(changed: PropertyValues) {
        if (!this.isConnected) return;
        if (!this.codeMirror) {
            this.editableMode = this.inEditMode;
            this.codeMirror = setupCodeMirror(
                this.editorSource(),
                this.editorPane,
                () => this.inEditMode,
                [
                    this.languageModule.languageExtension,
                    this.editMode.of(editingMode(this.editableMode)),
                    this.autocompletion.of(this.autocomplete ? autocompletion() : []),
                    EditorView.contentAttributes.of({
                        "aria-label": this.languageModule.name + " " + this.msg("Editor"),
                    }),
                    EditorView.updateListener.of((update) => {
                        if (update.transactions.some((tr) => tr.annotation(hostUpdate))) return;
                        if (update.docChanged) {
                            // If a host update has arrived but has not rendered yet,
                            // leave the authored program in place for syncProgram.
                            if (update.startState.doc.toString() !== this.editorSource()) {
                                this.requestUpdate();
                                return;
                            }
                            this.code = update.state.doc.toString();
                        }
                        if (
                            update.docChanged ||
                            update.transactions.some((tr) => tr.effects.some((effect) => effect.is(lineLockEffect)))
                        ) {
                            this.lockedLines = lockedLineNumbers(update.state);
                        }
                    }),
                ],
                () => this.msg("This section of code is locked and cannot be edited"),
            );
        }

        const view = this.codeMirror;
        if (this.editableMode !== this.inEditMode) {
            this.editableMode = this.inEditMode;
            view.dispatch({ effects: this.editMode.reconfigure(editingMode(this.editableMode)) });
        }
        if (changed.has("autocomplete")) {
            view.dispatch({ effects: this.autocompletion.reconfigure(this.autocomplete ? autocompletion() : []) });
        }

        this.syncProgram(view);

        if (!this.hasAutoRun) {
            this.hasAutoRun = true;
            if (this.autoRun) void this.runCode();
        }
    }

    private editorSource() {
        return this.code.replace(/\r\n?/g, "\n");
    }

    private syncProgram(view: EditorView) {
        const code = this.editorSource();
        const old = view.state.doc.toString();
        if (old !== code) {
            let from = 0;
            while (from < old.length && from < code.length && old[from] === code[from]) from++;
            let to = old.length;
            let end = code.length;
            while (to > from && end > from && old[to - 1] === code[end - 1]) {
                to--;
                end--;
            }
            view.dispatch({
                changes: { from, to, insert: code.slice(from, end) },
                annotations: [hostUpdate.of(true), Transaction.addToHistory.of(false)],
                filter: false,
            });
        }

        const { doc } = view.state;
        const wanted = new Set(this.lockedLines.filter((line) => line > 0 && line <= doc.lines));
        const effects: StateEffect<{ pos: number; on: boolean }>[] = [];
        view.state.field(lineLockField).markers.between(0, doc.length, (from) => {
            const line = doc.lineAt(from);
            if (line.from !== from || !wanted.delete(line.number))
                effects.push(lineLockEffect.of({ pos: from, on: false }));
        });
        for (const line of wanted) effects.push(lineLockEffect.of({ pos: doc.line(line).from, on: true }));
        if (effects.length) view.dispatch({ effects, annotations: hostUpdate.of(true) });
    }

    protected render() {
        // WebWriter resizes widgets in document flow by setting max-height.
        // Give the layout that target size so it can also grow past its natural height.
        const { height, maxHeight } = this.style;
        return html`<div
            class="layout"
            ?hidden=${this.hideCode && !this.inEditMode}
            style=${styleMap({
                "--resize-height":
                    (!height || height === "auto") && maxHeight.endsWith("px")
                        ? `calc(${maxHeight} - 2 * var(--code-border-width))`
                        : undefined,
                opacity: this.hideCode ? "0.5" : undefined,
            })}
        >
            <div class="editor"></div>
            ${this.Controls()} ${this.Output()}
        </div>`;
    }

    protected renderRunInput() {
        return html``;
    }

    private Controls() {
        const download = this.runtimeDownload;
        const fraction = download?.total ? Math.min(1, download.received / download.total) : undefined;
        const percent = fraction === undefined ? undefined : Math.floor(fraction * 100);
        const downloadLabel = this.msg("Downloading runtime");
        const runningLabel = this.msg("Running…");
        const label = download
            ? downloadLabel + (percent === undefined ? "…" : ` ${percent}%`)
            : this.running
              ? runningLabel
              : this.msg("Run") + (this.showExecutionCount ? ` (${this.executionCount})` : "");
        const status = download ? downloadLabel : this.running ? runningLabel : "";
        return html`<div class="controls">
            ${this.renderRunInput()}
            <span class="run-control" ?hidden=${this.disableExecution}>
                <sl-button
                    class="run-button"
                    variant="primary"
                    size="small"
                    aria-busy=${this.running}
                    ?data-progress=${fraction !== undefined}
                    style=${styleMap({
                        "--runtime-progress": fraction === undefined ? undefined : `${fraction * 100}%`,
                    })}
                    @click=${this.runCode}
                >
                    ${download && fraction === undefined
                        ? html`<span class="runtime-spinner" slot="prefix" aria-hidden="true"></span>`
                        : html`<sl-icon
                              library="code"
                              aria-hidden="true"
                              name="${this.autoRun ? "play-circle" : "play-fill"}"
                              slot="prefix"
                          ></sl-icon>`}
                    ${label}
                </sl-button>
                ${download
                    ? html`<progress
                          class="visually-hidden"
                          aria-label=${downloadLabel}
                          value=${ifDefined(fraction)}
                      ></progress>`
                    : ""}
                <span class="visually-hidden" role="status">${status}</span>
            </span>
            ${this.showExecutionTime ? html`<div class="executionTime">${this.executionTime.toFixed(1)}ms</div>` : ""}
            <div class="language-label">${this.languageModule.name}</div>
            <sl-button
                size="small"
                @click=${() => {
                    this.results = [];
                    this.diagnostics = [];
                    this.runtimeError = "";
                    this.executionTime = 0;
                }}
                style=${!this.disableExecution ? "" : "display: none"}
            >
                ${this.msg("Clear Output")}
            </sl-button>
        </div>`;
    }

    private Output() {
        return html`<output aria-live="polite">
            ${this.runtimeError
                ? html`<div class="diagnostics-container">
                      <pre class="diagnostic-message">${this.runtimeError}</pre>
                  </div>`
                : this.diagnostics.length
                  ? this.Diagnostics()
                  : this.Result()}
        </output>`;
    }

    protected Result() {
        if (this.languageModule.name === "HTML") {
            return html` <iframe
                id="iframePreview"
                class="htmlPreview"
                title=${this.languageModule.name}
                srcdoc=${this.results[0] ?? ""}
                sandbox="allow-scripts allow-modals"
            ></iframe>`;
        }
        const outputs = this.results
            .filter((r: any) => r !== undefined)
            .map((r: any) => html`<pre style="color:${r?.color}">${r?.text}</pre>`);
        return html` <div class="outputs">${outputs}</div>`;
    }

    private Diagnostics() {
        return html`
            <div class="diagnostics-container">
                ${this.languageModule.name} compilation failed with ${this.diagnostics.length}
                error${this.diagnostics.length > 1 ? "s" : ""}:
                <div class="diagnostics-list">
                    ${this.diagnostics.map(
                        (d) => html`
                            <sl-icon
                                library="code"
                                aria-hidden="true"
                                name="exclamation-triangle-fill"
                                class="diagnostic-icon"
                            ></sl-icon>
                            ${d.start !== undefined && this.runProgram === this.code
                                ? html`<a
                                      class="diagnostic-line-number"
                                      href="#"
                                      @click=${(event: Event) => {
                                          event.preventDefault();
                                          const view = this.codeMirror;
                                          if (!view || this.runProgram !== this.code || d.start === undefined) return;
                                          this.syncProgram(view);
                                          view.focus();
                                          view.dispatch({
                                              selection: EditorSelection.cursor(
                                                  Math.max(0, Math.min(d.start, view.state.doc.length)),
                                              ),
                                              scrollIntoView: true,
                                          });
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

    protected async runCode() {
        if (!this.isConnected || this.disableExecution || this.running) return;

        const { signal } = this.connection;
        const code = (this.runProgram = this.code);
        this.running = true;
        this.results = [];
        this.diagnostics = [];
        this.runtimeError = "";
        this.executionCount++;
        const start = performance.now();

        try {
            await this.languageModule.execute(code, this, signal);
        } catch (error) {
            if (!signal.aborted) {
                this.runtimeError = error instanceof Error ? error.message : String(error);
            }
        } finally {
            if (!signal.aborted) {
                this.executionTime = performance.now() - start;
                this.running = false;
            }
        }
    }
}
