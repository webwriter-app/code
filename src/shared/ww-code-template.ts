import "@shoelace-style/shoelace/dist/themes/light.css";
import { LitElementWw } from "@webwriter/lit";
import { LitElement, PropertyValueMap, html } from "lit";
import { property, query } from "lit/decorators.js";

import { style } from "./ww-code-css-single";

// CodeMirror
import { autocompletion } from "@codemirror/autocomplete";
import { LanguageSupport, syntaxHighlighting } from "@codemirror/language";
import { Compartment, EditorState } from "@codemirror/state";
import { oneDarkHighlightStyle } from "@codemirror/theme-one-dark";
import { EditorView } from "@codemirror/view";
import { basicSetup } from "./codemirror-setup";

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

    localize = LOCALIZE;

    codeMirror: EditorView = new EditorView();

    @property({ type: Array, attribute: true, reflect: true })
    accessor lockedLines: number[] = [];

    @property({ type: Boolean })
    accessor didRunOnce: boolean = false;

    @property({ type: Boolean, attribute: true, reflect: true })
    accessor visible = true;

    @property({ type: Boolean, attribute: true, reflect: true })
    accessor autoRun = false;

    @property({ type: Boolean, attribute: true, reflect: true })
    accessor runnable = true;

    @property({ type: Boolean, attribute: true, reflect: true })
    accessor autocomplete = false;

    @property({ type: Boolean, attribute: true, reflect: true })
    accessor hideExecutionTime = true;

    @property({ type: Boolean, attribute: true, reflect: true })
    accessor hideExecutionCount = true;

    @property({ attribute: true, reflect: true })
    accessor code = this.codeMirror.state.doc.toString();

    @property({ type: Number, attribute: true, reflect: true })
    accessor executionCount = 0;

    static shadowRootOptions = { ...LitElement.shadowRootOptions, delegatesFocus: true };

    @property({ attribute: false })
    accessor languageModule!: LanguageModule;

    @property({ attribute: false })
    accessor languages: any;

    get codeRunner() {
        return this.languageModule.executionFunction;
    }

    @property({
        type: Array,
        attribute: true,
        reflect: true,
        converter: {
            fromAttribute: (value: string) => {
                return JSON.parse(value);
            },
            toAttribute: (value: Array<number>) => {
                return JSON.stringify(value);
            },
        },
    })
    accessor results: any = [];

    @property({ type: Array, attribute: true, reflect: true })
    accessor diagnostics: Diagnostic[] = [];

    @property({ attribute: false })
    accessor executionTime: number = 0;

    // @ts-expect-error
    @query("#iframePreview")
    accessor iframePreview: HTMLIFrameElement | undefined;

    language = new Compartment();
    autocompletion = new Compartment();
    // readOnlyRanges = new Compartment();
    theme = new Compartment();
    highlightStyle = new Compartment();

    static get scopedElements() {
        let componentList = {
            "sl-button": SlButton,
            "sl-input": SlInput,
            "sl-switch": SlSwitch,
            "sl-details": SlDetails,
            "sl-icon": SlIcon,
        } as any;

        return componentList;
    }

    isEditable() {
        return this.contentEditable === "true" || this.contentEditable === "";
    }

    @query("pre")
    accessor pre!: HTMLPreElement;

    firstUpdated() {
        this.codeMirror = this.createCodeMirror(this.pre);
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
    }

    getVisibleStyle() {
        if (this.isEditable()) {
            return this.visible ? "" : "opacity: 0.5";
        }
        return this.visible ? "" : "display: none";
    }

    render() {
        return html`
            ${this.Code()} ${this.Controls()} ${this.codeRunner !== undefined ? this.Output() : null}
            ${this.isEditable() ? this.Options() : ""}
        `;
    }

    Code() {
        return html`<pre style=${this.getVisibleStyle()}></pre>`;
    }

    Controls() {
        return html`<div class="controls" style=${this.getVisibleStyle()}>
            <sl-button
                variant="primary"
                size="small"
                ?disabled=${this.codeRunner === undefined}
                @click="${this.runCode}"
                style=${this.runnable && this.codeRunner !== undefined ? "" : "display: none"}
            >
                <sl-icon name="${this.autoRun ? "play-circle" : "play-fill"}" slot="prefix"></sl-icon>
                ${msg("Run")} ${this.hideExecutionCount ? "" : `(${this.executionCount})`}
            </sl-button>
            ${!this.hideExecutionTime ? html`<div class="executionTime">${this.executionTime.toFixed(1)}ms</div>` : ""}
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

    Output() {
        return html`<output style=${this.getVisibleStyle()}>
            ${this.diagnostics?.length > 0 ? this.Diagnostics() : this.Result()}
        </output>`;
    }

    Options() {
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
                @sl-change=${(e: any) => (this.hideExecutionTime = !e.target.checked)}
                ?checked=${!this.hideExecutionTime}
                >${msg("Show execution time")}</sl-switch
            >
            <sl-switch
                @sl-change=${(e: any) => (this.hideExecutionCount = !e.target.checked)}
                ?checked=${!this.hideExecutionCount}
                >${msg("Show execution count")}</sl-switch
            >
            <sl-button @click=${() => (this.executionCount = 0)}>${msg("Reset execution count")}</sl-button>
        </aside>`;
    }

    Result() {
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

    Diagnostics() {
        return html`
            <div class="diagnostics-container">
                ${this.languageModule.name} compilation failed with ${this.diagnostics.length}
                error${this.diagnostics.length > 1 ? "s" : ""}:
                <div class="diagnostics-list">
                    ${this.diagnostics.map(
                        (d) => html`
                            <sl-icon name="exclamation-triangle-fill" class="diagnostic-icon"></sl-icon>
                            ${d.start
                                ? html` <a
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
                                : ""}
                            <div class="diagnostic-message">${d.message}</div>
                        `,
                    )}
                </div>
            </div>
        `;
    }

    async runCode() {
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

        this.didRunOnce = true;
    }

    setAutocompletion(value: boolean) {
        this.autocomplete = value;
        this.codeMirror.dispatch({
            effects: this.autocompletion.reconfigure(value ? autocompletion() : []),
        });
    }

    createCodeMirror(parentObject: any) {
        const editorView = new EditorView({
            state: EditorState.create({
                doc: this.code,
                extensions: [
                    basicSetup,
                    this.language.of(this.languageModule.languageExtension),
                    this.autocompletion.of(autocompletion()),
                    this.theme.of([]),
                    this.highlightStyle.of(syntaxHighlighting(oneDarkHighlightStyle, { fallback: true })),
                    EditorView.updateListener.of((update) => {
                        if (update.docChanged) {
                            this.code = update.state.doc.toString();
                        }
                    }),
                ],
            }),
            parent: parentObject,
        });
        return editorView;
    }
}
