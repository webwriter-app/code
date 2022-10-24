import { LitElementWw } from "@webwriter/lit"
import { property, customElement } from "lit/decorators.js"
import { EditorView } from "codemirror"
import { EditorState, Compartment } from "@codemirror/state"
import { javascript } from "@codemirror/lang-javascript"
import { python } from "@codemirror/lang-python"
import { style } from "./ww-code-cell-css"
import { html } from "lit"
import { mySetup } from "./codemirror"
import readOnlyRangesExtension from 'codemirror-readonly-ranges'
import { autocompletion } from '@codemirror/autocomplete';


//part=action einfügen

@customElement("ww-code-cell")
export default class CodeCell extends LitElementWw {
  static styles = style;

  @property({ type: Boolean, reflect: true, attribute: true })
  editable = false;

  @property({ type: Number, reflect: true, attribute: true })
  currentExercise = 1;

  @property({ type: Boolean, reflect: true, attribute: true })
  showExerciseCreation = false;

  @property({ type: Array })
  exercises: any[] = [
    {
      description: "Test",
      exerciseType: "Test",
      editorStates: {
        doc: "Test",
        extensions: [mySetup, javascript(), autocompletion()]
      }
    }
  ];

  @property({ type: Array })
  exerciseTypes = [
    "Fill The Blanks",
    "Code Skeleton",
    "Buggy Code",
    "Code From Scratch",
    "Code Baseline",
    "Find The Bug",
    "Compiling Error",
    "Code Interpretation",
    "Keyword Use",
  ];

  @property()
  exerciseDescription = "";

  @property({ type: String })
  exerciseLanguage = "javascript";

  @property()
  exerciseType = "Fill The Blanks";

  @property({ type: EditorView })
  codeMirror: EditorView;

  @property()
  autocompletionEnabled = true;

  language = new Compartment();
  autocompletion = new Compartment();
  disabledLines = new Compartment();

  render() {
    return html`
      ${this.editable ? html`
        <div class="Wrapper">
          ${this.exerciseCreationTemplate()}
        </div>` : html``}
        <div id="codeWrapper"></div>`;
  }

  firstUpdated() {
    this.codeMirror = this.createCodeMirror(this.shadowRoot?.getElementById('code'));
    this.codeMirror.focus();
  }

  exerciseCreationTemplate() {
    return html`
    <div class="createExercise">
      ${this.exerciseChoiceTemplate()}
      ${this.languageChoiceTemplate()}
      ${this.editorFeatureTemplate()}
      <div id="code"></div>
      <button @click=${() => {
        this.switchToExercise(this.currentExercise)
      }}>Aufgabe hinzufügen</button>
    </div>`;
  };

  editorFeatureTemplate() {
    return html`
      <div>
        <button class="disableButton"
        @click=${() => { this.disableLine() }}>Disable editing</button>
      <label class="container">Autocompletion
      <input type="checkbox" checked @change=${() => { this.disableAutocomplete() }}>
    </div>
    `;
  }

  exerciseChoiceTemplate() {
    return html`
    <h1 class="header">Aufgabe erstellen:</h1>
      Wählen Sie einen Aufgabentypen:
     <div class="exerciseType">
        ${this.exerciseTypes.map(
      (exerciseType) => html`
           <button @click=${(e: any) => {
          this.exerciseType = e.srcElement.value;
          this.switchExerciseCodeMirror();
        }
        } value=${exerciseType}>${exerciseType}</button>
          `)}
      </div>`;
  }

  languageChoiceTemplate() {
    return html`
    <div class="extensions">
    <div class="language">
      <fieldset>
        <legend>Wählen Sie eine Sprache:</legend>
        <div>
        <input name="language" checked type="radio" id="javascript" @change=${() => { this.changeCodeMirrorLanguage("Javascript") }} 
              value=javascript>Javascript
          <input name="language" type="radio" id="python" @change=${() => { this.changeCodeMirrorLanguage("Python") }}
              value=python>Python
        </div>
      </fieldset>
    </div>
  </div>`;
  }

  private disableLine() {
    this.disabledLines.push({ from: this.codeMirror.state.selection.main.from, to: this.codeMirror.state.selection.main.to });
  }

  private changeCodeMirrorLanguage(lang: String) {
    if (lang === "Javascript") {
      this.codeMirror.dispatch({ effects: this.language.reconfigure(javascript()) });
    } else {
      this.codeMirror.dispatch({ effects: this.language.reconfigure(python()) });
    }
    this.codeMirror.focus();
  }

  private disableAutocomplete() {
    this.autocompletionEnabled = !this.autocompletionEnabled;
    if (this.autocompletionEnabled) {
      this.codeMirror.dispatch({ effects: this.autocompletion.reconfigure(autocompletion()) });
    } else {
      this.codeMirror.dispatch({ effects: this.autocompletion.reconfigure([]) });
    }
    this.codeMirror.focus();
  }

  private switchExerciseCodeMirror() {
    this.codeMirror.dispatch({ changes: { from: 0, to: this.codeMirror.state.doc.length, insert: this.exerciseType } })
    this.codeMirror.focus();
  }


  getReadOnlyRanges = (targetState: EditorState): Array<{ from: number | undefined, to: number | undefined }> => {
    return this.disabledLines;
  }

  private switchToExercise(exercise: number) {
    this.editable = false;
    this.currentExercise = exercise;
    this.shadowRoot?.getElementById('codeWrapper')?.append(this.codeMirror.dom);
    this.codeMirror.focus();
  }

  private createCodeMirror(parentObject: any) {
    return new EditorView({
      state: EditorState.create({
        doc: ``,
        extensions: [mySetup, this.language.of(javascript()), this.autocompletion.of(autocompletion())]
      }),
      parent: parentObject,
    })
  }
}