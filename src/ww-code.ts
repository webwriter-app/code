import '@shoelace-style/shoelace/dist/themes/light.css';
import { LitElementWw } from '@webwriter/lit';
import { property, customElement, query } from 'lit/decorators.js';
import { EditorView } from 'codemirror';
import { EditorState, Compartment } from '@codemirror/state';
import { style } from './ww-code-css';
import { html } from 'lit';
import { basicSetup } from './codemirror-setup';
import { autocompletion } from '@codemirror/autocomplete';
import { highlightSelection } from './highlight';
import { oneDarkTheme, oneDarkHighlightStyle } from '@codemirror/theme-one-dark';
import { syntaxHighlighting, defaultHighlightStyle } from '@codemirror/language';
import readOnlyRangesExtension from 'codemirror-readonly-ranges';
import { javascriptModule } from './languageModules/javascriptModule';
import { pythonModule } from './languageModules/pythonModule';
import { htmlModule } from './languageModules/htmlModule';
import { cssModule } from './languageModules/cssModule';
import { exerciseTypes } from './exerciseTypes';
import {
    SlButton,
    SlCard,
    SlCheckbox,
    SlDivider,
    SlDropdown,
    SlIcon,
    SlMenu,
    SlMenuItem,
    SlSwitch,
} from '@shoelace-style/shoelace';

import { classMap } from 'lit/directives/class-map.js';
import LockMarker from './CodeMirror/LockMarker';
import CustomGutter from './CodeMirror/CustomGutter';

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

    exerciseLanguages = [javascriptModule, pythonModule, htmlModule, cssModule];
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
    themeState = { theme: 'light' };

    @property({ attribute: true, reflect: true })
    code = this.codeMirror.state.doc.toString();

    private disabledLines: Array<number> = [];

    @property({ type: Object, reflect: true, attribute: true })
    exerciseType = this.exerciseTypes[0];

    @property({ attribute: true, reflect: true })
    exerciseLanguageName = 'JavaScript';

    @property()
    exerciseLanguage = this.exerciseLanguages[0];

    private codeRunner = this.exerciseLanguage.executionFunction;

    @property({ attribute: true, reflect: true })
    codeResult: String = '';

    @property()
    executionTime: number = 0;

    @query('#iframePreview')
    private iframePreview: HTMLIFrameElement | undefined;

    language = new Compartment();
    autocompletion = new Compartment();
    readOnlyRanges = new Compartment();
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
        console.log('[ww-code] firstUpdated()');

        if (this.printable) {
            this.themeState = { theme: 'dark' };
        }

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
        return html`
            <script src="https://cdn.jsdelivr.net/pyodide/v0.23.2/full/pyodide.js"></script>
            <script type="text/javascript">
                async function main() {
                    let pyodide = await loadPyodide();
                    console.log(pyodide.runPython('1 + 2'));
                }
                main();
            </script>
            <style>
                ${style}
            </style>
            <div class=${'wrapper theme_' + this.themeState.theme}>
                <div class="editor">
                    <div id="code"></div>
                    <div class="codeViewFooter">
                        <div class="codeViewFooterButtons">
                            <div class="codeViewFooterButtonsLeft">
                                <sl-button
                                    @click=${this.runCode}
                                    class=${classMap(this.codeRunButtonState)}
                                    ?disabled=${this.codeRunner === undefined}
                                    ><sl-icon name="caret-right"></sl-icon> Run</sl-button
                                >
                                <sl-button @click=${this.saveCode}><sl-icon name="save"></sl-icon> Save</sl-button>
                            </div>
                            <div class="codeViewFooterButtonsRight">
                                <sl-dropdown label="Language">
                                    <sl-button slot="trigger" ?caret=${!this.printable} class="languageSelect"
                                        >${this.exerciseLanguage.name}</sl-button
                                    >
                                    <sl-menu>
                                        ${this.exerciseLanguages.map(
                                            (exerciseLanguage) => html`
                                                <sl-menu-item @click=${() => this.changeLanguage(exerciseLanguage)}
                                                    >${exerciseLanguage.name}</sl-menu-item
                                                >
                                            `
                                        )}
                                    </sl-menu>
                                </sl-dropdown>
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
        return html` <div class="editorFeatures" part="action">
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
                        this.saveCode();
                    }
                }}
                ?checked=${!this.codeRunButtonState.hidden}
                >Allow Code execution</sl-switch
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
                        this.setTheme(target.checked ? 'dark' : 'light');
                    }
                }}
                ?checked=${this.themeState.theme === 'dark'}
                >Toggle Theme</sl-switch
            >
            <sl-switch
                @sl-change=${(event: any) => {
                    if (event.target) {
                        let target = event.target as SlSwitch;
                        this.executionTimeState = { hidden: !target.checked };
                        this.saveCode();
                    }
                }}
                ?checked=${!this.executionTimeState.hidden}
                >Show execution time</sl-switch
            >
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

    private saveCode() {
        this.lockedLines = this.disabledLines;
        this.code = this.codeMirror.state.doc.toString();
    }

    private async runCode() {
        if (!this.codeRunner) {
            return;
        }

        const code = this.codeMirror.state.doc.toString();
        const startTime = performance.now();
        const codeResult = await this.codeRunner(code).toString();
        const endTime = performance.now();
        this.executionTime = endTime - startTime;
        this.codeResult = codeResult;
        this.saveCode();
    }

    private changeLanguage(language: any) {
        this.saveCode();
        this.codeResult = '';
        this.exerciseLanguage = language;
        this.exerciseLanguageName = language.name;
        this.codeRunner = this.exerciseLanguage.executionFunction;
        this.codeMirror.dispatch({ effects: this.language.reconfigure(this.exerciseLanguage.languageExtension) });
        this.codeMirror.focus();
    }

    private setAutocompletion(value: boolean) {
        this.saveCode();
        this.autocompletionState = { enabled: value };
        this.codeMirror.dispatch({
            effects: this.autocompletion.reconfigure(value ? autocompletion() : []),
        });
        this.codeMirror.focus();
    }

    private setTheme(theme: string) {
        this.saveCode();
        switch (theme) {
            case 'dark':
                this.codeMirror.dispatch({
                    effects: this.theme.reconfigure(oneDarkTheme),
                });
                this.codeMirror.dispatch({
                    effects: this.highlightStyle.reconfigure(
                        syntaxHighlighting(oneDarkHighlightStyle, { fallback: true })
                    ),
                });
                break;
            default:
                this.codeMirror.dispatch({
                    effects: this.theme.reconfigure([]),
                });
                this.codeMirror.dispatch({
                    effects: this.highlightStyle.reconfigure(
                        syntaxHighlighting(defaultHighlightStyle, { fallback: true })
                    ),
                });

                break;
        }
        this.themeState = { theme: theme };
    }

    private switchExerciseType(exerciseType: any) {
        console.log(exerciseType);

        this.exerciseType = exerciseType;
        this.code = exerciseType.templateText;
        this.codeRunButtonState = { hidden: !exerciseType.features.showCodeRunButton };
        this.executionTimeState = { hidden: !exerciseType.features.showExecutionTime };
        this.codeResult = '';
        this.codeMirror.focus();

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
        this.codeMirror.dispatch({
            effects: this.readOnlyRanges.reconfigure(readOnlyRangesExtension(this.getReadOnlyRanges)),
        });
    };

    private createCodeMirror(parentObject: any) {
        const editorView = new EditorView({
            state: EditorState.create({
                doc: this.code,
                extensions: [
                    basicSetup,
                    this.language.of(this.exerciseLanguage.languageExtension),
                    this.autocompletion.of(autocompletion()),
                    this.theme.of(this.themeState.theme === 'dark' ? oneDarkTheme : []),
                    this.highlightStyle.of(syntaxHighlighting(oneDarkHighlightStyle, { fallback: true })),
                    this.readOnlyRanges.of(readOnlyRangesExtension(this.getReadOnlyRanges)),
                    this.lockGutter.gutter,
                ],
            }),
            parent: parentObject,
        });

        return editorView;
    }
}
