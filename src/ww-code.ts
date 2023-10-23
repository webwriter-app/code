import '@shoelace-style/shoelace/dist/themes/light.css';
import { LitElementWw } from '@webwriter/lit';
import { property, customElement, query } from 'lit/decorators.js';
import { EditorView } from '@codemirror/view';
import { EditorState, Compartment } from '@codemirror/state';
import { style } from './ww-code-css';
import { PropertyValueMap, html } from 'lit';
import { basicSetup } from './codemirror-setup';
import { autocompletion } from '@codemirror/autocomplete';
import { highlightSelection } from './highlight';
import { oneDarkHighlightStyle } from '@codemirror/theme-one-dark';
import { LanguageSupport, syntaxHighlighting } from '@codemirror/language';
// import readOnlyRangesExtension from 'codemirror-readonly-ranges';
import { javascriptModule } from './languageModules/javascriptModule';
// import { pythonModule } from './languageModules/pythonModule';
import { htmlModule } from './languageModules/htmlModule';
import { cssModule } from './languageModules/cssModule';
import SlButton from "@shoelace-style/shoelace/dist/components/button/button.component.js"
import SlCard from "@shoelace-style/shoelace/dist/components/card/card.component.js"
import SlCheckbox from "@shoelace-style/shoelace/dist/components/checkbox/checkbox.component.js"
import SlDivider from "@shoelace-style/shoelace/dist/components/divider/divider.component.js"
import SlSelect from "@shoelace-style/shoelace/dist/components/select/select.component.js"
import SlIcon from "@shoelace-style/shoelace/dist/components/icon/icon.component.js"
import SlMenu from "@shoelace-style/shoelace/dist/components/menu/menu.component.js"
import SlMenuItem from "@shoelace-style/shoelace/dist/components/menu-item/menu-item.component.js"
import SlSwitch from "@shoelace-style/shoelace/dist/components/switch/switch.component.js"
import SlOption from "@shoelace-style/shoelace/dist/components/option/option.component.js"
import LockMarker from './CodeMirror/LockMarker';
import CustomGutter from './CodeMirror/CustomGutter';
// import { loadPyodide } from 'pyodide';

export type LanguageModule = {
    name: string;
    executionFunction: (code: string, context: Code) => any;
    languageExtension: LanguageSupport;
};

@customElement('ww-code')
export default class Code extends LitElementWw {
    static styles = style;

    static JSONConverter = {
        fromAttribute: (value: string) => {
            return JSON.parse(value);
        },
        toAttribute: (value: Array<number>) => {
            return JSON.stringify(value);
        },
    };

    static languages: LanguageModule[] = [javascriptModule, htmlModule, cssModule];
    codeMirror: EditorView = new EditorView();

    @property({ type: Array, attribute: true, reflect: true })
    lockedLines: number[] = [];

    @property({ type: Boolean, attribute: true, reflect: true })
    runnable = true;

    @property({ type: Boolean, attribute: true, reflect: true })
    autocomplete = false;

    @property({ type: Boolean, attribute: true, reflect: true })
    hideExecutionTime = true;

    @property({ type: Boolean, attribute: true, reflect: true })
    hideExecutionCount = true;

    @property({ attribute: true, reflect: true })
    code = this.codeMirror.state.doc.toString();

    @property({ type: Boolean, attribute: true, reflect: true })
    canChangeLanguage = true;

    @property({ type: Number, attribute: true, reflect: true })
    executionCount = 0;

    @property({ type: Boolean, attribute: true, reflect: true })
    globalExecution = true;

    private disabledLines: Array<number> = [];

    @property({ attribute: true, reflect: true })
    get languageName() {
        return this.languageModule.name;
    }

    set languageName(value: string) {
        this.languageModule = Code.languages.find((l) => l.name === value) || Code.languages[0];
    }

    @property({ attribute: false })
    languageModule: LanguageModule = Code.languages[0];

    private get codeRunner() {
        return this.languageModule.executionFunction;
    }

    @property({ type: Array, attribute: true, reflect: true, converter: Code.JSONConverter })
    results: Array<{ text: string; color: string } | undefined> = [];

    @property({ attribute: false })
    executionTime: number = 0;

    @query('#iframePreview')
    private iframePreview: HTMLIFrameElement | undefined;

    language = new Compartment();
    autocompletion = new Compartment();
    // readOnlyRanges = new Compartment();
    theme = new Compartment();
    highlightStyle = new Compartment();

    private lockGutter = CustomGutter('lock', new LockMarker(), (_: EditorView, l: number) =>
        this.makeLineReadOnly(this.codeMirror.state.doc.lineAt(l).number)
    );

    static get scopedElements() {
      return {
        'sl-checkbox': SlCheckbox,
        'sl-select': SlSelect,
        'sl-menu': SlMenu,
        'sl-menu-item': SlMenuItem,
        'sl-button': SlButton,
        'sl-divider': SlDivider,
        'sl-card': SlCard,
        'sl-switch': SlSwitch,
        'sl-icon': SlIcon,
        'sl-option': SlOption
      };
    }

    focus() {
        this.codeMirror?.focus();
    }

    @query('pre')
    pre?: HTMLPreElement;

    firstUpdated() {
        this.codeMirror = this.createCodeMirror(this.pre);
        this.codeMirror.focus();
        if (this.iframePreview) {
            this.iframePreview.addEventListener('load', () => {
                if (this.iframePreview && this.iframePreview.contentWindow) {
                    this.iframePreview.height = this.iframePreview.contentWindow.document.body.scrollHeight + 16 + 'px';
                }
            });
        }
        for (const line of this.lockedLines) {
            this.makeLineReadOnly(line);
        }
    }

    protected updated(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>): void {
        if (_changedProperties.has('autocomplete')) {
            this.setAutocompletion(this.autocomplete);
        }

        if (_changedProperties.has('code')) {
            if (this.codeMirror.state.doc.toString() !== this.code) {
                this.codeMirror.dispatch({
                    changes: {
                        from: 0,
                        to: undefined,
                        insert: this.code,
                    },
                });
            }
        }
    }

    render() {
        return html`
            <style>
                ${style}
            </style>
            ${this.Code()} ${this.Footer()} ${this.Output()} ${this.editable ? this.Options() : ''}
        `;
    }

    Code() {
        return html`<pre></pre>`;
    }

    Footer() {
      return html`<footer>
        <sl-button
          @click=${this.runCode}
          ?disabled=${this.codeRunner === undefined}
          ><sl-icon name="caret-right"></sl-icon> Run
          ${this.hideExecutionCount ? '' : `(${this.executionCount})`}
        </sl-button>
        <sl-button
            @click=${() => {
              this.results = [];
              this.executionTime = 0;
              this.codeMirror.focus();
            }}
            >Clear Output</sl-button
        >
        <sl-select value=${this.languageName} ?disabled=${!this.canChangeLanguage}>
          ${Code.languages.map(l => html`
            <sl-option value=${l.name} @click=${() => this.changeLanguage(l)}>
              ${l.name}
            </sl-option>`
          )}
        </sl-select>
      </footer>`
    }

    Output() {
        return html`<output> ${this.Result()} </output>`;
    }

    Options() {
        return html`<aside part="action" style="z-index: 1000">
            <sl-button @click=${() => (this.executionCount = 0)}>Reset execution count</sl-button>
            <sl-switch
                @sl-change=${(event: any) => {
                    if (event.target) {
                        let target = event.target as SlSwitch;
                        this.runnable = !target.checked;
                    }
                }}
                ?checked=${this.runnable}
                >Allow Code execution</sl-switch
            >
            <sl-switch
                @sl-change=${(event: any) => {
                    if (event.target) {
                        let target = event.target as SlSwitch;
                        this.globalExecution = target.checked;
                    }
                }}
                ?checked=${this.globalExecution}
                >Global execution</sl-switch
            >
            <sl-switch
                @sl-change=${(event: any) => {
                    if (event.target) {
                        let target = event.target as SlSwitch;
                        this.canChangeLanguage = target.checked;
                    }
                }}
                ?checked=${this.canChangeLanguage}
                >Allow Language change</sl-switch
            >
            <sl-switch
                @sl-change=${(event: any) => {
                    if (event.target) {
                        let target = event.target as SlSwitch;
                        this.setAutocompletion(target.checked);
                    }
                }}
                ?checked=${this.autocomplete}
                >Autocompletion</sl-switch
            >
            <sl-switch
                @sl-change=${(e: any) => (this.hideExecutionTime = !e.target.checked)}
                ?checked=${!this.hideExecutionTime}
                >Show execution time</sl-switch
            >
            <sl-switch
                @sl-change=${(e: any) => (this.hideExecutionCount = !e.target.checked)}
                ?checked=${!this.hideExecutionCount}
                >Show execution count</sl-switch
            >
        </aside>`;
    }

    Result() {
        switch (this.languageName) {
            case 'JS':
            case 'Python':
                const outputs = this.results
                    .filter((r) => r !== undefined)
                    .map((r) => html`<code style="color:${r?.color}">${r?.text}</code>`);
                return html` <div class="outputs">${outputs}</div>
                    <div class="executionTime">${this.executionTime.toFixed(1)}ms</div>`;
            case 'HTML':
                return html` <iframe id="iframePreview" class="htmlPreview" srcdoc=${this.results[0]}></iframe>`;
            case 'CSS':
                const src = `
                    <style>
                        html, body {
                            overflow: hidden;
                        }
                        ${this.results[0]}
                    </style>
                    <div class="cssPreview"></div>
                `;
                return html` <iframe id="iframePreview" class="cssPreviewWrapper" srcdoc=${src} seamless></iframe> `;
            default:
                return html``;
        }
    }

    private async runCode() {
        if (!this.codeRunner) {
            return;
        }

        this.executionCount++;
        this.results = [];
        const code = this.codeMirror.state.doc.toString();
        const startTime = performance.now();
        await this.codeRunner(code, this);
        const endTime = performance.now();
        this.executionTime = endTime - startTime;
    }

    private changeLanguage(language: any) {
        this.results = [];
        this.languageModule = language;
        this.codeMirror.dispatch({ effects: this.language.reconfigure(this.languageModule.languageExtension) });
        this.codeMirror.focus();
    }

    private setAutocompletion(value: boolean) {
        this.autocomplete = value;
        this.codeMirror.dispatch({
            effects: this.autocompletion.reconfigure(value ? autocompletion() : []),
        });
        this.codeMirror.focus();
    }

    private getReadOnlyRanges = (
        targetState: EditorState
    ): Array<{ from: number | undefined; to: number | undefined }> => {
        return this.disabledLines.map((line) => {
            return { from: targetState.doc.line(line).from, to: targetState.doc.line(line).to };
        });
    };

    private makeLineReadOnly = (line: number) => {
        if (!this.editable) {
            return;
        }

        const state = this.codeMirror.state;
        const lineStart = this.codeMirror.state.doc.line(line).from;
        const lineEnd = this.codeMirror.state.doc.line(line).to;

        if (!this.disabledLines.includes(line)) {
            this.disabledLines.push(line);
            if (this.codeMirror.state.doc.line(line).text !== '') {
                highlightSelection(this.codeMirror, [{ from: lineStart, to: lineEnd }]);
            }
            this.codeMirror.dispatch({
                effects: this.lockGutter.effect.of({ pos: lineStart, on: true }),
            });
        } else {
            // dirty fix to remove the highlight
            this.disabledLines = this.disabledLines.filter((l) => l !== line);
            this.codeMirror.dispatch({
                changes: {
                    from: state.doc.line(line).from,
                    to: state.doc.line(line).to,
                    insert: '',
                },
            });
            this.codeMirror.dispatch({
                changes: {
                    from: state.doc.line(line).from,
                    to: undefined,
                    insert: state.doc.line(line).text,
                },
            });
            this.codeMirror.dispatch({
                effects: this.lockGutter.effect.of({ pos: lineStart, on: false }),
            });
        }

        /* this.codeMirror.dispatch({
            effects: this.readOnlyRanges.reconfigure(readOnlyRangesExtension(this.getReadOnlyRanges)),
        });*/

        this.lockedLines = [...this.disabledLines];
    };

    private createCodeMirror(parentObject: any) {
        const editorView = new EditorView({
            state: EditorState.create({
                doc: this.code,
                extensions: [
                    basicSetup,
                    this.language.of(this.languageModule.languageExtension),
                    this.autocompletion.of(autocompletion()),
                    this.theme.of([]),
                    this.highlightStyle.of(syntaxHighlighting(oneDarkHighlightStyle, { fallback: true })),
                    // this.readOnlyRanges.of(readOnlyRangesExtension(this.getReadOnlyRanges)),
                    // this.lockGutter.gutter,
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
