import "@shoelace-style/shoelace/dist/themes/light.css"
import { LitElementWw } from "@webwriter/lit"
import { property, customElement } from "lit/decorators.js"
import { EditorView } from "codemirror"
import { EditorState, Compartment } from "@codemirror/state"
import { style } from "./ww-code-cell-css"
import { html } from "lit"
import { mySetup } from "./codemirror-setup"
import { autocompletion } from '@codemirror/autocomplete';
import { highlightSelection } from "./highlight"
import { oneDarkTheme, oneDarkHighlightStyle } from "@codemirror/theme-one-dark";
import { syntaxHighlighting, defaultHighlightStyle } from '@codemirror/language';
import readOnlyRangesExtension from 'codemirror-readonly-ranges'
import SlCheckbox from "@shoelace-style/shoelace/dist/components/checkbox/checkbox"
import SlDropdown from "@shoelace-style/shoelace/dist/components/dropdown/dropdown"
import SlMenu from "@shoelace-style/shoelace/dist/components/menu/menu"
import SlMenuItem from "@shoelace-style/shoelace/dist/components/menu-item/menu-item"
import SlButton from "@shoelace-style/shoelace/dist/components/button/button"
import SlDivider from "@shoelace-style/shoelace/dist/components/divider/divider"
import SlCard from "@shoelace-style/shoelace/dist/components/card/card"
import { javascriptModule } from "./languageModules/javascriptModule"
import { pythonModule } from "./languageModules/pythonModule"
import { htmlModule } from "./languageModules/htmlModule"



@customElement("ww-code-cell")
export default class CodeCell extends LitElementWw {
  static styles = style;

  exerciseTypes = [
    {
      name: "No exercise type",
      templateText: "\n\n",
      features:
      {
        showDisableButton: true,
        showCodeRunButton: true,
        showExecutionTime: true,
      }
    },
    {
      name: "Fill The Blanks",
      templateText:
        `//Fill in the blanks\nconst array = [1,2,3]; \n  array.map((element) => { \n  return _________ \n}); \n\nfunction double(a) {\n return a * 2; \n}`,
      features:
      {
        showDisableButton: true,
        showCodeRunButton: false,
        showExecutionTime: true,
      }
    },
    {
      name: "Code Skeleton",
      templateText:
        `//Complete the function\nfunction isEven(variable) {\n\n}`,
      features:
      {
        showDisableButton: true,
        showCodeRunButton: true,
        showExecutionTime: true,
      }
    },
    {
      name: "Buggy Code",
      templateText: "//Find and fix the bug\nconst array = [1,2,3]; \n array.map((element) => { \n  return element * 2 \n}); \n\nfunction double(a) {\n return a * 2; \n}",
      features:
      {
        showDisableButton: true,
        showCodeRunButton: false,
        showExecutionTime: true,
      }
    },
    {
      name: "Code From Scratch",
      templateText: "/* Please code following task from scratch: \n--Task--\n*/",
      features:
      {
        showDisableButton: true,
        showCodeRunButton: true,
        showExecutionTime: true,
      }
    },
    {
      name: "Code Baseline",
      templateText: "//Improve the code\nfunction add(a,b){\n let c = a; \n for( let i = 0; i < b; i++ ){ \n  c = c + 1; \n };\nreturn c;\n}",
      features:
      {
        showDisableButton: true,
        showCodeRunButton: true,
        showExecutionTime: true,
      }
    },
    {
      name: "Find The Bug",
      templateText: "//Find the bug in the following code\nfunction add(a,b){\n let c = a; \n for( let i = 0; i > b; i++ ){ \n  c = c + 1; \n };\nreturn c;\n}",
      features:
      {
        showDisableButton: true,
        showCodeRunButton: false,
        showExecutionTime: true,
      }
    },
    {
      name: "Compiling Errors",
      templateText: "//Explain the following error\nconst a = 5;\n a.map(object => {\n return a + 1;\n})\n// Result: TypeError: a.map is not a function",
      features:
      {
        showDisableButton: true,
        showCodeRunButton: false,
        showExecutionTime: true,
      }
    },
    {
      name: "Code Interpretation",
      templateText: "//Explain the following code\nconst array = [1,2,3];\nconst newArray = array.map(element => element * 2);\nconsole.log(newArray);",
      features:
      {
        showDisableButton: true,
        showCodeRunButton: false,
        showExecutionTime: true,
      }
    },
    {
      name: "Keyword Use",
      templateText: "//Use an if-else statement to check if a variable is a string\nfunction isString(variable) {\n\n}",
      features:
      {
        showDisableButton: true,
        showCodeRunButton: true,
        showExecutionTime: true,
      }
    },
  ];

  exerciseLanguages = [
    javascriptModule,
    pythonModule,
    htmlModule,
  ];

  private disabledLines: Array<number> = [];

  @property({ type: Boolean, reflect: true, attribute: true })
  editable = true;

  @property({ type: Object, reflect: true, attribute: true })
  exerciseType = this.exerciseTypes[0];

  @property({ attribute: true })
  exerciseLanguage = this.exerciseLanguages[0];

  @property({ type: EditorView, attribute: true, reflect: true })
  codeMirror: EditorView = new EditorView();

  @property({ attribute: true, reflect: true })
  private codeRunner = this.exerciseLanguage.executionFunction;

  @property()
  autocompletionEnabled = true;

  @property()
  showDisableButton = true;

  @property()
  showCodeRunButton = true;

  @property()
  showExecutionTime = true;

  @property()
  codeResult: String = "";

  @property()
  executionTime: number = 0;

  language = new Compartment();
  autocompletion = new Compartment();
  readOnlyRanges = new Compartment();
  theme = new Compartment();
  highlightStyle = new Compartment();


  static get scopedElements() {
    return {
      "sl-checkbox": SlCheckbox,
      "sl-dropdown": SlDropdown,
      "sl-menu": SlMenu,
      "sl-menu-item": SlMenuItem,
      "sl-button": SlButton,
      "sl-divider": SlDivider,
      "sl-card": SlCard,
    };
  }

  focus() {
    this.codeMirror?.focus()
  }

  firstUpdated() {
    this.codeMirror = this.createCodeMirror(this.shadowRoot?.getElementById('code'));
    this.codeMirror.focus();
  }

  render() {
    return html`
    <div class="Wrapper">
      ${this.editable ? this.exerciseCreationTemplate() : html``} 
      <div id="code"></div>
      <div class="codeExecutionWrapper">
        ${this.codeRunner("") && this.showCodeRunButton ? html`
        <div id="runCode">
          <sl-button @click=${() => this.runCode()}>></sl-button>
        </div>` : html``}
      ${this.codeResult !== "" && this.codeRunner("") ? this.resultFieldTemplate() : html``}
      </div>
    </div>`;
  }

  exerciseCreationTemplate() {
    return html`
    <div class="createExercise" part="action">
      <div class="exerciseChoice">
        ${this.exerciseTypeTemplate()}
        ${this.exerciseLanguageTemplate()}
      </div>
      ${this.editorFeaturesTemplate()}
      </div>`;
  };

  exerciseTypeTemplate() {
    return html`
        <sl-dropdown label="exerciseType">
          <sl-button slot="trigger" caret class="dropdown">${this.exerciseType.name}</sl-button>
          <sl-menu>
            ${this.exerciseTypes.map((exerciseType) => html`
              <sl-menu-item @click=${() => { this.switchExerciseType(exerciseType) }}>
                ${exerciseType.name}
              </sl-menu-item>`)}   
          </sl-menu>
        </sl-dropdown>`;
  }

  exerciseLanguageTemplate() {
    return html`
      <sl-dropdown label="Language">
        <sl-button slot="trigger" caret class="dropdown">${this.exerciseLanguage.name}</sl-button>
        <sl-menu>
          ${this.exerciseLanguages.map((exerciseLanguage) => html`
            <sl-menu-item @click=${() => this.changeLanguage(exerciseLanguage)}>${exerciseLanguage.name}</sl-menu-item>
          `)}
        </sl-menu>
      </sl-dropdown>`;
  }

  editorFeaturesTemplate() {
    return html`
      <sl-divider></sl-divider>
      <div part="action" class="editorFeatures">
        ${this.showDisableButton ? html`<sl-button @click=${() => { this.disableLine() }} class="dropdown">Disable line</sl-button>` : html``}
        ${this.codeRunner("") ? html`<sl-button @click=${() => { this.toggleRunCode() }} class="dropdown">Toggle code running</sl-button>` : html``}
        <sl-button @click=${() => { this.toggleTheme() }} class="dropdown">Toggle theme</sl-button>
        <sl-button @click=${() => { this.toggleExecutionTime() }} class="dropdown">Toggle execution time</sl-button>
        <sl-checkbox checked @sl-change=${() => { this.toggleAutocompletion() }} class="dropdown">Autocompletion</sl-checkbox>
      </div>
    `;
  }

  resultFieldTemplate() {
    return html`
        <sl-card class="card">
          <div class="cardElements">
          <div class="cardBody">
          Result: ${this.codeResult}
          ${this.showExecutionTime ? html`<div>Execution time: ${this.executionTime}ms</div>` : html``}
          </div>
          <sl-button @click=${() => this.codeResult = ""}>X</sl-button>
          </div>
        </sl-card>
    `
  }

  private async runCode() {
    const code = this.codeMirror.state.doc.toString();
    const startTime = performance.now();
    const codeResult = await this.codeRunner(code).toString();
    const endTime = performance.now();
    this.executionTime = endTime - startTime;
    this.codeResult = codeResult;
  }

  private changeLanguage(language: any) {
    this.exerciseLanguage = language;
    this.codeRunner = this.exerciseLanguage.executionFunction;
    this.codeMirror.dispatch({ effects: this.language.reconfigure(this.exerciseLanguage.languageExtension) });
    this.codeMirror.focus();
  }

  private toggleAutocompletion() {
    this.autocompletionEnabled = !this.autocompletionEnabled;
    this.codeMirror.dispatch({ effects: this.autocompletion.reconfigure(this.autocompletionEnabled ? autocompletion() : []) });
    this.codeMirror.focus();
  }

  private toggleTheme() {
    this.codeMirror.dispatch({ effects: this.theme.reconfigure(this.theme.get(this.codeMirror.state) === oneDarkTheme ? ([]) : oneDarkTheme) });
    this.codeMirror.dispatch({ effects: this.highlightStyle.reconfigure(this.theme.get(this.codeMirror.state) === oneDarkTheme ? (syntaxHighlighting(oneDarkHighlightStyle, { fallback: true })) : (syntaxHighlighting(defaultHighlightStyle, { fallback: true }))) });
    this.codeMirror.focus();
  }

  private toggleRunCode() {
    this.showCodeRunButton = !this.showCodeRunButton;
    this.codeMirror.focus();
  };

  private toggleExecutionTime() {
    this.showExecutionTime = !this.showExecutionTime;
    this.codeMirror.focus();
  };

  private switchExerciseType(exerciseType: any) {
    this.exerciseType = exerciseType;
    this.showCodeRunButton = exerciseType.features.showCodeRunButton;
    this.showDisableButton = this.exerciseType.features.showDisableButton;
    this.showExecutionTime = this.exerciseType.features.showExecutionTime;
    this.codeResult = "";
    this.codeMirror.dispatch({
      changes: {
        from: 0,
        to: this.codeMirror.state.doc.length,
        insert: this.exerciseType.templateText
      }
    });
    this.codeMirror.focus();
  }

  private async disableLine() {
    const state = this.codeMirror.state;
    state.selection.ranges.forEach((range) => {
      const currentline = state.doc.lineAt(range.head).number;
      if (!this.disabledLines.includes(currentline)) {
        this.disabledLines.push(currentline);
        highlightSelection(this.codeMirror, [{ from: state.doc.line(currentline).from, to: state.doc.line(currentline).to }]);
      } else {
        // dirty fix to remove the highlight
        this.disabledLines = this.disabledLines.filter((line) => line !== currentline);
        this.codeMirror.dispatch({
          changes: {
            from: state.doc.line(currentline).from,
            to: state.doc.line(currentline).to,
            insert: ""
          }
        })
        this.codeMirror.dispatch({
          changes: {
            from: state.doc.line(currentline).from,
            to: undefined,
            insert: state.doc.line(currentline).text
          }
        })
      }
    });
    this.codeMirror.dispatch({ effects: this.readOnlyRanges.reconfigure(readOnlyRangesExtension(this.getReadOnlyRanges)) });
  }

  private getReadOnlyRanges = (targetState: EditorState): Array<{ from: number | undefined, to: number | undefined }> => {
    return this.disabledLines.map((line) => {
      return { from: targetState.doc.line(line).from, to: targetState.doc.line(line).to };
    });
  };

  private createCodeMirror(parentObject: any) {
    return new EditorView({
      state: EditorState.create({
        doc: `\n\n`,
        extensions: [
          mySetup,
          this.language.of(this.exerciseLanguage.languageExtension),
          this.autocompletion.of(autocompletion()),
          this.theme.of(oneDarkTheme),
          this.highlightStyle.of(syntaxHighlighting(oneDarkHighlightStyle, { fallback: true })),
          this.readOnlyRanges.of(readOnlyRangesExtension(this.getReadOnlyRanges))],
      }),
      parent: parentObject,
    })
  }

}