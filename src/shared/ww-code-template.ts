import '@shoelace-style/shoelace/dist/themes/light.css';
import { LitElementWw } from '@webwriter/lit';
import { property, query } from 'lit/decorators.js';
import { LitElement, PropertyValueMap, html } from 'lit';

import { style } from './ww-code-css-single';
import { v4 as uuidv4 } from 'uuid';

// import readOnlyRangesExtension from 'codemirror-readonly-ranges';

// CodeMirror
import { syntaxHighlighting } from '@codemirror/language';
import { oneDarkHighlightStyle } from '@codemirror/theme-one-dark';
import { EditorState, Compartment } from '@codemirror/state';
import { autocompletion } from '@codemirror/autocomplete';
import { EditorView } from '@codemirror/view';
import { basicSetup } from './codemirror-setup';
import { highlightSelection } from './highlight';


// Shoelace Components
import SlButton from '@shoelace-style/shoelace/dist/components/button/button.component.js';
import SlSwitch from '@shoelace-style/shoelace/dist/components/switch/switch.component.js';
import SlInput from '@shoelace-style/shoelace/dist/components/input/input.component.js';
import SLDetails from '@shoelace-style/shoelace/dist/components/details/details.component.js';

import LockMarker from './CodeMirror/LockMarker';
import CustomGutter from './CodeMirror/CustomGutter';

import { faPlay, faCirclePlay } from './fontawesome.css';


export default abstract class Code extends LitElementWw {
    static styles = style;

    // static JSONConverter = {
    //     fromAttribute: (value: string) => {
    //         return JSON.parse(value);
    //     },
    //     toAttribute: (value: Array<number>) => {
    //         return JSON.stringify(value);
    //     },
    // };

    codeMirror: EditorView = new EditorView();

    @property({ type: Array, attribute: true, reflect: true })
    accessor lockedLines: number[] = [];

    @property({ type: String, attribute: true, reflect: true })
    accessor name: string = '';

    @property({ type: Boolean })
    accessor didRunOnce: boolean = false;

    @property({ type: Array, attribute: true, reflect: true })
    accessor dependencies: string[] = [];

    @property({ type: Object, attribute: true, reflect: true })
    accessor runAsModule = false;

    @property({ type: Object, attribute: true, reflect: true })
    accessor visible = true;

    @property({ type: Object, attribute: true, reflect: true })
    accessor autoRun = false;

    @property({ type: Object, attribute: true, reflect: true })
    accessor runnable = true;

    @property({ type: Object, attribute: true, reflect: true })
    accessor autocomplete = false;

    @property({ type: Object, attribute: true, reflect: true })
    accessor hideExecutionTime = true;

    @property({ type: Object, attribute: true, reflect: true })
    accessor hideExecutionCount = true;

    @property({ attribute: true, reflect: true })
    accessor code = this.codeMirror.state.doc.toString();

    @property({ type: Object, attribute: true, reflect: true })
    accessor canChangeLanguage = true;

    @property({ type: Number, attribute: true, reflect: true })
    accessor executionCount = 0;

    @property({ type: Object, attribute: true, reflect: true })
    accessor globalExecution = true;

     disabledLines: Array<number> = [];

    static shadowRootOptions = { ...LitElement.shadowRootOptions, delegatesFocus: true };

    @property({ attribute: false })
    accessor languageModule: any;

    @property({attribute: false})
    accessor languages: any

    @property({ attribute: false })
    accessor errorListener: any;

    @property({ attribute: false })
    accessor dependecyListening: boolean = false;

     get codeRunner() {
        return this.languageModule.executionFunction;
    }

    @property({ type: Array, attribute: true, reflect: true, converter:
        {
            fromAttribute: (value: string) => {
                return JSON.parse(value);
            },
            toAttribute: (value: Array<number>) => {
                return JSON.stringify(value);
            },
        }
    })
    accessor results: Array<{ text: string; color: string } | undefined> = [];

    @property({ attribute: false })
    accessor executionTime: number = 0;

    @query('#iframePreview')
     accessor iframePreview: HTMLIFrameElement | undefined;

    language = new Compartment();
    autocompletion = new Compartment();
    // readOnlyRanges = new Compartment(); 
    theme = new Compartment();
    highlightStyle = new Compartment();

     lockGutter = CustomGutter('lock', new LockMarker(), (_: EditorView, l: number) =>
        this.makeLineReadOnly(this.codeMirror.state.doc.lineAt(l).number)
    );

    static get scopedElements() {
        let componentList = {
            'sl-button': SlButton,
            'sl-input': SlInput,
            'sl-switch': SlSwitch,
            'sl-details': SLDetails,
        } as any;

        return componentList;
    }

     isEditable() {
        return this.contentEditable === 'true' || this.contentEditable === '';
    }

    focus() {
        // this.codeMirror?.focus();
    }

    @query('pre')
    accessor pre!: HTMLPreElement;


    firstUpdated() {
        this.name = uuidv4();
        this.codeMirror = this.createCodeMirror(this.pre);
        // this.codeMirror.focus();
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

        window.addEventListener('error', (e) => {
            //Check if language is JS
            if (this.languageModule.name !== 'JS') {
                return;
            }

            this.results.push({ color: 'red', text: e.message });
        });

        if (this.autoRun) {
            this.runCode();
        }
    }

    protected updated(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>): void {
        if (_changedProperties.has('autocomplete')) {
            this.setAutocompletion(this.autocomplete);
        }

        if (_changedProperties.has('code')) {
            if (this.codeMirror.state.doc.toString() !== this.code) {
                this.codeMirror.dispatch({
                    changes: { from: 0, to: this.codeMirror.state.doc.length, insert: this.code },
                });
            }
        }

        if (_changedProperties.has('languageName')) {
            this.codeMirror.dispatch({ effects: this.language.reconfigure(this.languageModule.languageExtension) });
        }

        // console.log(_changedProperties);
    }

    changeLanguage(language: any) {
        this.results = [];
        this.languageModule = language;
        this.codeMirror.dispatch({ effects: this.language.reconfigure(this.languageModule.languageExtension) });
        // this.codeMirror.focus();
    }

    handleKeyPress(e: KeyboardEvent) {
        if(e.ctrlKey && e.key==="v"){
            navigator.clipboard
            .readText()
            .then((clipText) => {
                this.codeMirror.dispatch({
                    changes: { from: 0, to: this.codeMirror.state.doc.length, insert: this.codeMirror.state.doc.toString()+clipText },
                });
            });
        }
        if(e.ctrlKey && e.key==="c"){
            if(window.getSelection){
                navigator.clipboard
                .writeText(window.getSelection().toString())
            }
        }
    }

    getVisibleStyle() {
        if (this.isEditable()) {
            return this.visible ? '' : 'opacity: 0.5';
        }
        return this.visible ? '' : 'display: none';
    }

    render() {
        return html`
            <style>
                ${style}
            </style>
            ${this.Code()} ${this.Footer()} ${this.codeRunner !== undefined ? this.Output() : null}
            ${this.isEditable() ? this.Options() : ''}
        `;
    }

    Code() {
        return html`<pre style=${this.getVisibleStyle()} @keydown=${(e: KeyboardEvent)=>(this.handleKeyPress(e))}></pre>`;
    }

    Footer() {
        return html`<footer style=${this.getVisibleStyle()}>
            <button
                class="ww-code-button"
                ?disabled=${this.codeRunner === undefined}
                @click="${this.runCode}"
                style=${this.runnable && this.codeRunner !== undefined ? '' : 'display: none'}
            >
                ${this.autoRun ? faCirclePlay : faPlay} Run
                ${this.globalExecution ? '' : 'in isolation'}${this.runAsModule && this.globalExecution
                    ? ' as module'
                    : ''}
                ${this.hideExecutionCount ? '' : `(${this.executionCount})`}
            </button>
            <button
                class="ww-code-button"
                @click=${() => {
                    this.results = [];
                    this.executionTime = 0;
                    // this.codeMirror.focus();
                }}
                style=${this.runnable && this.codeRunner !== undefined ? '' : 'display: none'}
            >
                Clear Output
            </button>
            <select
                value=${this.languageModule.name}
                ?disabled=${true}
                class="ww-code-select"
                @change=${(e: any) => {
                    this.changeLanguage(this.languageModule.name.find((l) => l.name === e.target.value));
                }}
            >
                ${this.languages.map(
                    (l) => html` <option value="${l.name}" ?selected=${l.name === this.languageModule.name}>${l.name}</option>`
                )}
            </select>
        </footer>`;
    }

    Output() {
        return html`<output style=${this.getVisibleStyle()}> ${this.Result()} </output>`;
    }

    Options() {
        return html`<aside part="options" style="z-index: 1000">
            <!-- <sl-input
                @sl-input=${(e: any) => (this.name = e.target.value)}
                value=${this.name}
                placeholder="Code Cell Name"
            ></sl-input> -->
            <sl-details summary="Execution" ?disabled=${this.codeRunner === undefined}>
                <sl-switch
                    @sl-change=${(event: any) => {
                        if (event.target) {
                            let target = event.target as SlSwitch;
                            this.runnable = target.checked;
                        }
                    }}
                    ?checked=${this.runnable}
                    ?disabled=${this.codeRunner === undefined}
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
                    ?disabled=${this.codeRunner === undefined}
                    >Global execution</sl-switch
                >
                <!-- <sl-switch
                    @sl-change=${(event: any) => {
                        if (event.target) {
                            let target = event.target as SlSwitch;
                            this.runAsModule = target.checked;
                        }
                    }}
                    ?disabled=${!this.globalExecution || this.codeRunner === undefined}
                    ?checked=${this.runAsModule}
                    >Run as module</sl-switch
                > -->
                <sl-switch
                    @sl-change=${(e: any) => (this.autoRun = e.target.checked)}
                    ?checked=${this.autoRun}
                    ?disabled=${this.codeRunner === undefined}
                    >Run on load</sl-switch
                >
            </sl-details>
            <sl-details summary="Editor">
                <!-- <sl-switch
                    @sl-change=${(event: any) => {
                        if (event.target) {
                            let target = event.target as SlSwitch;
                            this.canChangeLanguage = target.checked;
                        }
                    }}
                    ?checked=${this.canChangeLanguage}
                    >Allow Language change</sl-switch
                > -->
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

                <sl-switch @sl-change=${(e: any) => (this.visible = e.target.checked)} ?checked=${this.visible}
                    >Visible</sl-switch
                >
            </sl-details>
            <sl-details summary="Results" ?disabled=${this.codeRunner === undefined}>
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
                <sl-button @click=${() => (this.executionCount = 0)}>Reset execution count</sl-button>
            </sl-details>
            <!-- <sl-details summary="Dependencies" ?disabled=${this.codeRunner === undefined}>
                <table>
                    <tbody>
                        ${this.dependencies.map(
                            (d) => html`<tr>
                                <td>${d}#${(document.getElementById(d) as Code)?.name}</td>
                                <td>
                                    <sl-button
                                        @click=${() =>
                                            (this.dependencies = this.dependencies.filter((dep) => dep !== d))}
                                        size="small"
                                    >
                                        X
                                    </sl-button>
                                </td>
                            </tr>`
                        )}
                        ${this.dependencies.length === 0
                            ? html`<tr>
                                  <td colspan="2"><i>No dependencies</i></td>
                              </tr>`
                            : ''}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td>
                                <sl-button
                                    @click=${() => {
                                        this.dependencies = [];
                                    }}
                                    size="small"
                                    variant="danger"
                                    outline
                                    >Clear dependencies</sl-button
                                >
                            </td>
                            <td>
                                <sl-button
                                    @click=${this.addDependencyAddListener}
                                    variant=${this.dependecyListening ? 'primary' : 'neutral'}
                                    size="small"
                                    outline
                                    >Add</sl-button
                                >
                            </td>
                        </tr>
                    </tfoot>
                </table>
            </sl-details> -->
        </aside>`;
    }

    Result() {
        switch (this.languageModule.name) {
            case 'JS':
            case 'TS':
            case 'Python':
            case 'WebAssembly':
                const outputs = this.results
                    .filter((r) => r !== undefined)
                    .map((r) => html`<pre style="color:${r?.color}">${r?.text}</pre>`);
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

     addDependency(codeCell: Code) {
        console.log(codeCell, this.dependencies);

        if (codeCell === this) {
            console.warn('Cannot add self as dependency');
            return;
        }

        if (this.dependencies.includes(codeCell.name)) {
            console.warn('Dependency already added');
        } else {
            //Check for circular dependencies
            if (codeCell.dependencies.includes(this.name)) {
                console.warn('Circular dependency detected');
                return;
            }

            this.dependencies.push(codeCell.name);
            this.dependencies = [...this.dependencies];
        }
    }

     addDependencyAddListener() {
        //one time event listener on click
        window.addEventListener(
            'mousedown',
            (e) => {
                console.log(e.target);
                //check if the target is a code cell
                if (e.target && (e.target as HTMLElement).tagName === 'WEBWRITER-CODE') {
                    const target = e.target as Code;
                    this.addDependency(target);
                } else {
                    console.warn('Target is not a code cell');
                }

                document.body.style.cursor = 'default';
                this.dependecyListening = false;
            },
            { once: true }
        );

        document.body.style.cursor = 'crosshair';
        this.dependecyListening = true;
    }

     async runCode() {
        if (!this.codeRunner) {
            return;
        }
        this.results = [];
        console.log(this.dependencies);
        let allRun = true;
        if (this.dependencies.length > 0) {
            for (const dependency of this.dependencies) {
                const dependencyElement = document.getElementById(dependency);
                if (dependencyElement) {
                    if (!(dependencyElement as Code).didRunOnce) {
                        this.results.push({
                            color: 'red',
                            text: `Dependency ${
                                (document.getElementById(dependency) as Code).name
                            } did not run yet. Please run it first.`,
                        });
                        allRun = false;
                    }
                }
            }
        }

        if (!allRun) {
            return;
        }

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
        // this.codeMirror.focus();
    }

     getReadOnlyRanges = (
        targetState: EditorState
    ): Array<{ from: number | undefined; to: number | undefined }> => {
        return this.disabledLines.map((line) => {
            return { from: targetState.doc.line(line).from, to: targetState.doc.line(line).to };
        });
    };

     makeLineReadOnly = (line: number) => {
        if (!this.isEditable()) {
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
