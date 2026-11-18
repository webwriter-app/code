import "@shoelace-style/shoelace/dist/themes/light.css";
import { LitElementWw, computed, signal } from "@webwriter/lit";
import { jsonData } from "@webwriter/lit/data";
import { Permissions } from "@webwriter/lit/permissions";
import { Settings } from "@webwriter/lit/settings";
import { LitElement, html } from "lit";
import type { CSSResultGroup, PropertyValues } from "lit";
import { query, state } from "lit/decorators.js";
import { ifDefined } from "lit/directives/if-defined.js";
import { styleMap } from "lit/directives/style-map.js";

import { style } from "./code.styles";

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
import PlayIcon from "@tabler/icons/filled/player-play.svg";
import PlayAutoIcon from "@tabler/icons/outline/player-play.svg";
import WarningIcon from "@tabler/icons/filled/alert-triangle.svg";

import type { MsgFn } from "@lit/localize";
import { localizer } from "@webwriter/lit/localize";
// @ts-ignore Lit generates JavaScript locale codes in this package.
import { sourceLocale, targetLocales } from "../../localization/generated/locale-codes.js";
import { drawerLabel } from "../../localization/localizer";
import { withRuntimeAssets, type LoadedRuntime, type RuntimeDownload } from "./runtime-download";
import type { RuntimeAsset } from "../model/runtime-assets";
import type { SerializedValue } from "../model/javascript/javascript.worker";
import type { SqlTable } from "../model/sql/sql-runtime";
import { resultText } from "../model/output-text";
import { fileNameOf, languageOf, readSource } from "../model/source-files";

export type CodeRunner = (code: string, context: Code, signal: AbortSignal) => void | Promise<void>;

export type LanguageModule = {
    name: string;
    languageExtension: LanguageSupport;
    execute: CodeRunner;
};

type TextResult = { text: string; color?: string };
export type LogResult = { label: string; logs: SerializedValue[] };
/** One entry of a run's output: HTML source, text, console log lines or a SQL table. */
type CodeResult = string | TextResult | LogResult | SqlTable;

export type Diagnostic = {
    message: string;
    start?: number;
    line?: number;
    character?: number;
};

/** What a drawer label reads from the widget: its catalog and its locale. */
type DrawerTexts = { msg: MsgFn; localize: { getLocale(): string } };
/** A drawer label in the widget's language: the catalog first, the older drawer translations as a fallback. */
const drawerText = (previous: Record<string, string>, translate: (msg: MsgFn) => string) => (widget: DrawerTexts) =>
    drawerLabel(translate(widget.msg), previous, widget.localize.getLocale());

export abstract class Code extends Settings(LitElementWw, {
    disableExecution: {
        type: Boolean,
        attribute: "disable-execution",
        group: "execution",
        label: drawerText({ en: "Disable code execution", de: "Codeausführung deaktivieren" }, (msg) => msg("Disable code execution")),
    },
    autoRun: {
        type: Boolean,
        attribute: "autorun",
        group: "execution",
        label: drawerText({ en: "Run on load", de: "Beim Laden ausführen" }, (msg) => msg("Run on load")),
    },
    autocomplete: {
        type: Boolean,
        attribute: "autocomplete",
        group: "editor",
        label: drawerText({ en: "Autocompletion", de: "Autovervollständigung" }, (msg) => msg("Autocompletion")),
    },
    hideCode: {
        type: Boolean,
        attribute: "hide-code",
        group: "editor",
        label: drawerText({ en: "Hide code", de: "Code ausblenden" }, (msg) => msg("Hide code")),
    },
    showExecutionTime: {
        type: Boolean,
        attribute: "showexecutiontime",
        group: "results",
        label: drawerText({ en: "Show execution time", de: "Ausführungszeit anzeigen" }, (msg) => msg("Show execution time")),
    },
    hideExecutionCount: {
        type: Boolean,
        attribute: "hide-execution-count",
        group: "results",
        label: drawerText({ en: "Hide execution count", de: "Anzahl der Ausführungen ausblenden" }, (msg) => msg("Hide execution count")),
    },
}) {
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

    static optionGroups = {
        execution: { label: drawerText({ en: "Execution", de: "Ausführung" }, (msg) => msg("Execution")) },
        editor: { label: (widget: DrawerTexts) => ({ _: widget.msg("Editor") }) },
        results: { label: drawerText({ en: "Results", de: "Ergebnisse" }, (msg) => msg("Results")) },
    };

    static actions = {
        resetExecutionCount: {
            group: "results",
            label: drawerText(
                { en: "Reset execution count", de: "Anzahl der Ausführungen zurücksetzen" },
                (msg) => msg("Reset execution count"),
            ),
        },
    };

    protected localize = localizer(this, {
        sourceLocale,
        targetLocales,
        load: (locale) => import(`../../localization/generated/${locale}.ts`),
        drawer: true,
    });
    readonly msg = this.localize.msg;

    #permissions = new Permissions(this);
    #output = signal("");
    #failed = signal(false);

    /**
     * Signals other widgets can read: `output` (string) is the text of the last run's output, or its error messages;
     * `failed` (boolean) is true when the last run ended with an error or logged one to the console.
     */
    signals: Record<string, { get(): unknown }> = {
        output: computed(() => this.#output.get()),
        failed: computed(() => this.#failed.get()),
    };
    #program = jsonData<{ code?: string; lockedLines?: number[] }>(this, { defaults: {} });

    /** The execution time in milliseconds of the last code run. */
    @state()
    accessor executionTime: number = 0;

    /** The number of times the code has been executed. */
    @state()
    accessor executionCount = 0;

    @state()
    private accessor running = false;

    @state()
    private accessor runtimeDownload: RuntimeDownload | undefined;

    @state()
    private accessor runtimeError = "";

    /** The results from the last code execution. */
    @state()
    accessor results: CodeResult[] = [];

    /** Compilation or runtime errors from the last code execution. */
    @state()
    accessor diagnostics: Diagnostic[] = [];

    @query(".editor")
    private accessor editorPane!: HTMLDivElement;

    /** The authored source in the JSON data block, or in a legacy code attribute. */
    get code() {
        const { code } = this.#program.get();
        return typeof code === "string" ? code : (this.getAttribute("code") ?? "");
    }

    set code(code: string) {
        if (code !== this.code) this.#program.set({ code });
    }

    /** The authored, one-based line numbers locked for readers. */
    get lockedLines(): number[] {
        const { lockedLines } = this.#program.get();
        const lines = lockedLines ?? this.legacyLockedLines();
        return Array.isArray(lines) ? lines.filter((line) => Number.isSafeInteger(line) && line > 0) : [];
    }

    set lockedLines(lockedLines: number[]) {
        if (JSON.stringify(lockedLines) !== JSON.stringify(this.lockedLines)) {
            this.#program.set({ lockedLines });
        }
    }

    private legacyLockedLines(): unknown {
        try {
            return JSON.parse(this.getAttribute("lockedlines") ?? "[]");
        } catch {
            return [];
        }
    }

    /** Whether the run button displays the execution count. */
    get showExecutionCount() {
        return !this.hideExecutionCount;
    }

    set showExecutionCount(value: boolean) {
        this.hideExecutionCount = !value;
    }

    private codeMirror?: EditorView;
    private readonly languageModule: LanguageModule;
    private connection = new AbortController();
    private hasAutoRun = false;
    private runProgram?: string;
    private editableMode = false;
    private programObserver = new MutationObserver(() => this.requestUpdate());
    private autocompletion = new Compartment();
    private editMode = new Compartment();

    constructor(languageModule: LanguageModule) {
        super();
        this.languageModule = languageModule;
    }

    connectedCallback() {
        super.connectedCallback();
        this.connection = new AbortController();
        this.programObserver.observe(this, { attributes: true, attributeFilter: ["code", "lockedlines", "style"] });
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

    protected willUpdate(changed: PropertyValues) {
        super.willUpdate(changed);
        if (changed.has("results") || changed.has("diagnostics") || changed.has("runtimeError")) this.publishOutput();
    }

    private publishOutput() {
        const errors = [this.runtimeError, ...this.diagnostics.map((diagnostic) => diagnostic.message)].filter(Boolean);
        const lines = errors.length
            ? errors
            : this.results.map(resultText).filter((text) => text !== undefined);
        this.#output.set(lines.join("\n"));
        // A JavaScript run reports an uncaught error as a console line of level "error".
        this.#failed.set(errors.length > 0 || this.results.some((result) => (result as LogResult).label === "error"));
    }

    protected updated(changed: PropertyValues) {
        if (!this.isConnected) return;
        if (!this.codeMirror) {
            this.editableMode = this.#permissions.editing;
            this.codeMirror = setupCodeMirror(
                this.editorSource(),
                this.editorPane,
                () => this.#permissions.editing,
                [
                    this.languageModule.languageExtension,
                    this.editMode.of(editingMode(this.editableMode)),
                    this.autocompletion.of(this.autocomplete ? autocompletion() : []),
                    EditorView.contentAttributes.of({
                        "aria-label": this.languageModule.name + " " + this.msg("Editor"),
                        "aria-description": this.msg("Press Escape, then Tab to leave the editor."),
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
        if (this.editableMode !== this.#permissions.editing) {
            this.editableMode = this.#permissions.editing;
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

    /** Takes the program from a `pre` element (conversion). Declines when the fragment has none. */
    loadPre(fragment: DocumentFragment) {
        const pre = fragment.querySelector("pre");
        if (!pre) return false;
        this.applySource(pre.textContent ?? "");
    }

    /** The program as a `pre` element with a `code` child (conversion). */
    toPre() {
        const pre = this.ownerDocument.createElement("pre");
        const code = pre.appendChild(this.ownerDocument.createElement("code"));
        code.className = "language-" + languageOf(this.localName);
        code.textContent = this.editorSource();
        return pre;
    }

    /** Reads a source file and returns the function that replaces the program with it (import). */
    async importSource(file: File) {
        const text = readSource(new Uint8Array(await file.arrayBuffer()));
        if (text === undefined) throw new Error(this.msg("The file is not a text file, or it is larger than 1 MB."));
        return () => this.applySource(text);
    }

    /** The program as a source file with the language's extension (export). Locked lines are not part of the file. */
    exportSource() {
        const code = this.editorSource();
        return new File([code], fileNameOf(languageOf(this.localName), code), { type: "text/plain" });
    }

    private applySource(text: string) {
        this.code = text;
        this.lockedLines = [];
    }

    resetExecutionCount() {
        this.executionCount = 0;
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
            ?hidden=${this.hideCode && !this.#permissions.editing}
            style=${styleMap({
                "--resize-height":
                    (!height || height === "auto") && maxHeight.endsWith("px")
                        ? `calc(${maxHeight} - 2 * var(--code-border-width))`
                        : undefined,
                opacity: this.hideCode ? "0.5" : undefined,
            })}
        >
            <div class="editor" part="editor"></div>
            <pre class="print-code">${this.editorSource()}</pre>
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
                              aria-hidden="true"
                              src=${this.autoRun ? PlayAutoIcon : PlayIcon}
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
        const empty = !this.runtimeError && !this.diagnostics.length && !this.results.length;
        return html`<output part="output" aria-live="polite" ?data-empty=${empty}>
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
                part="preview"
                title=${this.languageModule.name}
                srcdoc=${String(this.results[0] ?? "")}
                sandbox="allow-scripts allow-modals"
            ></iframe>`;
        }
        const outputs = (this.results as TextResult[])
            .filter((r) => r !== undefined)
            .map((r) => html`<pre style="color:${r?.color}">${r?.text}</pre>`);
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
                                aria-hidden="true"
                                src=${WarningIcon}
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
}
