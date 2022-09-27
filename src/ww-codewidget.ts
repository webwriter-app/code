import { LitElementWw } from "webwriter-lit"
import { property, customElement } from "lit/decorators.js"
import { EditorView } from "codemirror"
import { EditorState, Extension } from "@codemirror/state"
import { javascript } from "@codemirror/lang-javascript"
import { style } from "./ww-codewidget-css"
import { html } from "lit"
import { parseExercise } from "./parser"
import { mySetup } from "./codemirror"
import readOnlyRangesExtension from 'codemirror-readonly-ranges'


@customElement("ww-codewidget")
export default class CodeWidget extends LitElementWw {
  static styles = style;

  @property({ type: Boolean, reflect: true, attribute: true })
  editable = false;

  @property({ type: Number, reflect: true, attribute: true })
  currentExercise = -1;

  @property({ type: Boolean, reflect: true, attribute: true })
  showExerciseCreation = false;

  @property({ type: Array })
  exercises: any[] = [];

  @property({ type: Array })
  exerciseTypes = [
    "Fill The Blanks",
    "Code Skeleton",
    "Buggy Code",
  ];

  @property()
  exerciseDescription = "";

  @property({ type: String, reflect: true })
  exerciseLanguage = "a";

  @property()
  exerciseType = "Fill The Blanks";

  @property({ type: EditorView })
  codeMirror: EditorView;

  @property()
  selectedFrom = 0;

  @property()
  selectedTo = 0;

  render() {
    return html`
      ${this.editable ? html`
        <div class="Wrapper">
          ${!this.showExerciseCreation ? this.chooseExerciseTemplate() : this.createExerciseTemplate()}
        </div>`: html``}
        <div class="codeWrapper"></div>
    `;
  }

  chooseExerciseTemplate() {
    return html`
      <div class="chooseExercise">
        <div class="exercises">
          <h1 class="header"> Wählen / Erstellen Sie eine Aufgabe </h1>
          <div class="exerciseList">
            ${this.exercises.map((exercise, index) => html`
            <button @click=${() => this.switchToExercise(index)}> ${exercise.description} </button>`)}
          </div>
        </div>
        <button button class="newExercise" @click=${() => { this.showExerciseCreation = true; }}>+</button>
      </div>`;
  };

  createExerciseTemplate() {
    return html`
    <div class="createExercise">
      <h1 class="header">Aufgabe erstellen:</h1>
      <div class="description">
        <label>Beschreibung:</label>
        <input type="text" @change=${(e: any) => { this.exerciseDescription = e.srcElement.value }}
        placeholder="Beschreibung" />
      </div>
      <div class="exerciseType">
        <label>Aufgabentyp:</label>
        ${this.exerciseTypes.map((exerciseType) => html`
          <button @click=${
            (e: any) => { 
            this.exerciseType = e.srcElement.value;           
            this.exerciseCreationCodeMirror();
            }} value=${exerciseType}>${exerciseType}</button>
          `)}
      </div>
      <div class="extensions">
        <div class="language">
          <label>Language:</label>
          <input type="radio" @change=${(e: any) => { this.exerciseLanguage = e.srcElement.value }}
          value=${this.exerciseLanguage}>Javascript
        </div>
      </div>
      <div class="code" @change=${()=>{
        console.log("Test");
      }}></div>
      <button @click=${() => {this.createExercise();}}>
        Aufgabe hinzufügen
      </button>
    </div>`;
  };

  private exerciseCreationCodeMirror() {
    console.log(this.codeMirror);
    if(this.codeMirror instanceof EditorView) this.codeMirror.dispatch({changes: {from: 0, to: this.codeMirror.state.doc.length, insert: this.exerciseType}})
    else this.codeMirror = this.createCodeMirror(this.exerciseType, mySetup, this.renderRoot.querySelector(".code"));
    this.codeMirror.focus();
  }

  private createExercise() {
    this.selectedFrom = this.codeMirror.state.selection.main.from;
    this.selectedTo = this.codeMirror.state.selection.main.to;
    this.exercises.push({
      description: this.exerciseDescription,
      exerciseType: this.exerciseType,
      editorStates: {
        doc: this.codeMirror.state.doc,
        extensions: [mySetup.concat(readOnlyRangesExtension(this.getReadOnlyRanges)), javascript()]
      }
    })
    this.codeMirror.destroy();
    this.codeMirror = undefined;
    this.showExerciseCreation = false;
    this.requestUpdate();
  }

  getReadOnlyRanges = (targetState: EditorState): Array<{ from: number | undefined, to: number | undefined }> => {
    return [
        {
            from: this.selectedFrom,
            to: this.selectedTo
        }
    ]
}

  private switchToExercise(exercise: number) {
    if (this.editable) {
      this.editable = false;
      this.currentExercise = exercise;
      let editorState = this.exercises[this.currentExercise].editorStates;
      this.codeMirror = this.createCodeMirror(editorState.doc, editorState.extensions, this.renderRoot?.querySelector(".codeWrapper"));
      this.codeMirror.focus();
    }
  }

  private createCodeMirror(initialDoc: String, initialExtensions: Extension, parentObject: any) {
    let view = new EditorView({
      state: EditorState.create({
        doc: `${initialDoc}`,
        extensions: [initialExtensions],
      }),
      parent: parentObject,
    })
    return view;
  }
}