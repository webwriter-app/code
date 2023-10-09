import '@shoelace-style/shoelace/dist/themes/light.css';
import { LitElementWw } from '@webwriter/lit';
import { property, customElement, query } from 'lit/decorators.js';
import { EditorView } from '@codemirror/view';
import { EditorState, Compartment } from '@codemirror/state';
import { style } from './ww-code-css';
import { html } from 'lit';
import { basicSetup } from './codemirror-setup';
import { autocompletion } from '@codemirror/autocomplete';
import { highlightSelection } from './highlight';
import { oneDarkHighlightStyle } from '@codemirror/theme-one-dark';
import { syntaxHighlighting } from '@codemirror/language';
// import readOnlyRangesExtension from 'codemirror-readonly-ranges';
import { javascriptModule } from './languageModules/javascriptModule';
// import { pythonModule } from './languageModules/pythonModule';
import { htmlModule } from './languageModules/htmlModule';
import { cssModule } from './languageModules/cssModule';
import { exerciseTypes } from './exerciseTypes';
import SlButton from "@shoelace-style/shoelace/dist/components/button/button.js"
import SlCard from "@shoelace-style/shoelace/dist/components/card/card.js"
import SlCheckbox from "@shoelace-style/shoelace/dist/components/checkbox/checkbox.js"
import SlDivider from "@shoelace-style/shoelace/dist/components/divider/divider.js"
import SlDropdown from "@shoelace-style/shoelace/dist/components/dropdown/dropdown.js"
import SlIcon from "@shoelace-style/shoelace/dist/components/icon/icon.js"
import SlMenu from "@shoelace-style/shoelace/dist/components/menu/menu.js"
import SlMenuItem from "@shoelace-style/shoelace/dist/components/menu-item/menu-item.js"
import SlSwitch from "@shoelace-style/shoelace/dist/components/switch/switch.js"

import { classMap } from 'lit/directives/class-map.js';
import LockMarker from './CodeMirror/LockMarker';
import CustomGutter from './CodeMirror/CustomGutter';
// import { loadPyodide } from 'pyodide';

@customElement('ww-code')
export default class CodeCell extends LitElementWw {
    static styles = style;

    static JSONConverter = {
        fromAttribute: (value: string) => {
            return JSON.parse(value);
        },
        toAttribute: (value: Array<number>) => {
            return JSON.stringify(value);
        },
    };

    exerciseTypes = exerciseTypes;

    exerciseLanguages = [javascriptModule, htmlModule, cssModule];
    codeMirror: EditorView = new EditorView();

    @property({ attribute: true, reflect: true, converter: CodeCell.JSONConverter })
    lockedLines: Array<number> = [];

    @property({ attribute: true, reflect: true, converter: CodeCell.JSONConverter })
    codeRunButtonState = { hidden: false };

    @property({ attribute: true, reflect: true, converter: CodeCell.JSONConverter })
    autocompletionState = { enabled: false };

    @property({ attribute: true, reflect: true, converter: CodeCell.JSONConverter })
    executionTimeState = { hidden: false };

    @property({ attribute: true, reflect: true, converter: CodeCell.JSONConverter })
    executionCountState = { hidden: false };

    @property({ type: Boolean, attribute: true, reflect: true })
    globalExecution = false;

    @property({ attribute: true, reflect: true })
    code = this.codeMirror.state.doc.toString();

    @property({ type: Boolean, attribute: true, reflect: true })
    canChangeLanguage = true;

    @property({ type: Number, attribute: true, reflect: true })
    executionCount = 0;

    private disabledLines: Array<number> = [];

    @property({ type: Object, reflect: true, attribute: true })
    exerciseType = this.exerciseTypes[0];

    @property({ attribute: true, reflect: true })
    exerciseLanguageName = 'JavaScript';

    @property({attribute: false})
    exerciseLanguage = this.exerciseLanguages[0];

    private codeRunner = this.exerciseLanguage.executionFunction;

    @property({ attribute: true, reflect: true })
    codeResult: String = '';

    @property({attribute: false})
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
            'sl-dropdown': SlDropdown,
            'sl-menu': SlMenu,
            'sl-menu-item': SlMenuItem,
            'sl-button': SlButton,
            'sl-divider': SlDivider,
            'sl-card': SlCard,
            'sl-switch': SlSwitch,
            'sl-icon': SlIcon,
        };
    }

    focus() {
        this.codeMirror?.focus();
    }

    firstUpdated() {
        this.exerciseLanguage = this.exerciseLanguages.find(
            (exerciseLanguage) => exerciseLanguage.name === this.exerciseLanguageName
        )!;

        this.codeMirror = this.createCodeMirror(this.shadowRoot?.getElementById('code'));
        this.codeMirror.focus();

        this.codeRunner = this.exerciseLanguage.executionFunction;

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

    render() {
        console.log("render")
        return html`
            <style>
                ${style}
            </style>
            <div class=${'wrapper theme_light'}>
                <div class="editor">
                    <div id="code"></div>
                    <div class="codeViewFooter">
                        <div class="codeViewFooterButtons">
                            <div class="codeViewFooterButtonsLeft">
                                <sl-button
                                    @click=${this.runCode}
                                    class=${classMap(this.codeRunButtonState)}
                                    ?disabled=${this.codeRunner === undefined}
                                    ><sl-icon name="caret-right"></sl-icon> Run
                                    ${this.globalExecution ? 'in global context' : 'in local context'}
                                    ${this.executionCountState.hidden ? '' : `(${this.executionCount})`}
                                </sl-button>
                                <sl-button
                                    @click=${() => {
                                        this.codeResult = '';
                                        this.executionTime = 0;
                                        this.codeMirror.focus();
                                    }}
                                    class=${classMap(this.codeRunButtonState)}
                                    >Clear Output</sl-button
                                >
                            </div>
                            <div class="codeViewFooterButtonsRight">
                                ${this.canChangeLanguage
                                    ? html`
                                          <sl-dropdown label="Language">
                                              <sl-button slot="trigger" ?caret=${!this.printable} class="languageSelect"
                                                  >${this.exerciseLanguage.name}</sl-button
                                              >
                                              <sl-menu>
                                                  ${this.exerciseLanguages.map(
                                                      (exerciseLanguage) => html`
                                                          <sl-menu-item
                                                              @click=${() => this.changeLanguage(exerciseLanguage)}
                                                              >${exerciseLanguage.name}</sl-menu-item
                                                          >
                                                      `
                                                  )}
                                              </sl-menu>
                                          </sl-dropdown>
                                      `
                                    : html` <sl-button>${this.exerciseLanguage.name}</sl-button> `}
                            </div>
                        </div>
                        <div class=${classMap({ ...this.codeRunButtonState, codeViewFooterResult: true })}>
                            ${this.codeResultTemplate()}
                        </div>
                    </div>
                </div>
                ${this.editable ? this.exerciseCreationTemplate() : html``}
            </div>
        `;
    }

    exerciseCreationTemplate() {
        return html` <div class="editorFeatures" part="action" style="z-index: 1000">
            <sl-dropdown label="exerciseType">
                <sl-button slot="trigger" caret class="dropdown">${this.exerciseType.name}</sl-button>
                <sl-menu>
                    ${this.exerciseTypes.map(
                        (exerciseType) => html` <sl-menu-item
                            @click=${() => {
                                this.switchExerciseType(exerciseType);
                            }}
                        >
                            ${exerciseType.name}
                        </sl-menu-item>`
                    )}
                </sl-menu>
            </sl-dropdown>
            <sl-switch
                @sl-change=${(event: any) => {
                    if (event.target) {
                        let target = event.target as SlSwitch;
                        this.codeRunButtonState = { hidden: !target.checked };
                    }
                }}
                ?checked=${!this.codeRunButtonState.hidden}
                >Allow Code execution</sl-switch
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
                        this.globalExecution = target.checked;
                    }
                }}
                ?checked=${this.globalExecution}
                >Global Execution</sl-switch
            >
            <sl-switch
                @sl-change=${(event: any) => {
                    if (event.target) {
                        let target = event.target as SlSwitch;
                        this.setAutocompletion(target.checked);
                    }
                }}
                ?checked=${this.autocompletionState.enabled}
                >Autocompletion</sl-switch
            >
            <sl-switch
                @sl-change=${(event: any) => {
                    if (event.target) {
                        let target = event.target as SlSwitch;
                        this.executionTimeState = { hidden: !target.checked };
                    }
                }}
                ?checked=${!this.executionTimeState.hidden}
                >Show execution time</sl-switch
            >
            <sl-switch
                @sl-change=${(event: any) => {
                    if (event.target) {
                        let target = event.target as SlSwitch;
                        this.executionCountState = { hidden: !target.checked };
                    }
                }}
                ?checked=${!this.executionCountState.hidden}
                >Show execution count</sl-switch
            >
            <sl-button @click=${() => (this.executionCount = 0)}>Reset execution count</sl-button>
        </div>`;
    }

    codeResultTemplate() {
        switch (this.exerciseLanguageName) {
            case 'JavaScript':
                return html` <div class="codeViewFooterResultText">${this.codeResult}</div>
                    <div class=${classMap({ ...this.executionTimeState, codeViewFooterExecutionTime: true })}>
                        ${this.executionTime.toFixed(1)}ms
                    </div>`;
            case 'Python':
                return html` <div class="codeViewFooterResultText">${this.codeResult}</div>
                    <div class=${classMap({ ...this.executionTimeState, codeViewFooterExecutionTime: true })}>
                        ${this.executionTime.toFixed(1)}ms
                    </div>`;
            case 'HTML':
                return html` <iframe id="iframePreview" class="htmlPreview" srcdoc="${this.codeResult}"></iframe>`;
            case 'CSS':
                const src = `
                    <style>
                        html, body {
                            overflow: hidden;
                        }
                        ${this.codeResult}
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

        const code = this.codeMirror.state.doc.toString();
        const startTime = performance.now();
        let codeResult = await this.codeRunner(code, this.globalExecution);

        const endTime = performance.now();
        this.executionTime = endTime - startTime;
        this.codeResult = codeResult;

        this.executionCount++;
    }

    private changeLanguage(language: any) {
        this.codeResult = '';
        this.exerciseLanguage = language;
        this.exerciseLanguageName = language.name;
        this.codeRunner = this.exerciseLanguage.executionFunction;
        this.codeMirror.dispatch({ effects: this.language.reconfigure(this.exerciseLanguage.languageExtension) });
        this.codeMirror.focus();
    }

    private setAutocompletion(value: boolean) {
        this.autocompletionState = { enabled: value };
        this.codeMirror.dispatch({
            effects: this.autocompletion.reconfigure(value ? autocompletion() : []),
        });
        this.codeMirror.focus();
    }

    private switchExerciseType(exerciseType: any) {
        this.exerciseType = exerciseType;
        this.code = exerciseType.templateText;
        this.codeRunButtonState = { hidden: !exerciseType.features.showCodeRunButton };
        this.executionTimeState = { hidden: !exerciseType.features.showExecutionTime };
        this.codeResult = '';
        this.codeMirror.focus();

        this.codeMirror.dispatch({
            changes: {
                from: 0,
                to: this.codeMirror.state.doc.length,
                insert: exerciseType.templateText,
            },
        });

        this.lockedLines = [];
        this.disabledLines = [];
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
      console.log("createCodeMirror")
        const editorView = new EditorView({
            state: EditorState.create({
                doc: this.code,
                extensions: [
                    basicSetup,
                    this.language.of(this.exerciseLanguage.languageExtension),
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
