import { LitElementWw } from "webwriter-lit"
import { property, query, customElement, queryAll } from "lit/decorators.js"
import { EditorView, basicSetup } from "codemirror"
import { EditorState } from "@codemirror/state"
import { javascript } from "@codemirror/lang-javascript"
import { style } from "./ww-codewidget-css"
import { html } from "lit"


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
  exerciseType = "";

  @property()
  exerciseCode = "";

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
      <div class="chooseExercise" >
        <div class="exercises" >
          <h1 class="header" > Wählen / Erstellen Sie eine Aufgabe </h1>
            <div class="exerciseList" >
              ${this.exercises.map((exercise, index) => html`
          <button @click=${() => this.switchToExercise(index)}> ${exercise.description} </button>`)
      }
    </div>
      </div>
      <button button class="newExercise" @click=${() => { this.showExerciseCreation = true; }}>
        +
        </button>
        </div>`;
  };

  createExerciseTemplate() {
    return html`
    <div class="createExercise">
    <h1 class="header">Aufgabe erstellen:</h1>
    <div class="description">
      <label>Beschreibung:</label>
      <input type="text" @change=${(e: any) => { this.exerciseDescription = e.srcElement.value }} placeholder="Beschreibung" />
    </div>
    <div class="exerciseType">
      <label>Aufgabentyp:</label>
      <select>
        ${this.exerciseTypes.map((exerciseType) => html`
        <option @change=${(e: any) => { this.exerciseType = e.srcElement.value }} value=${exerciseType}>${exerciseType}</option>
        `)}
      </select>
    </div>
        <div class="extensions">
          <div class="language">
                <label>Language:</label>
                <input type="radio" @change=${(e: any) => { this.exerciseLanguage = e.srcElement.value }} value=${this.exerciseLanguage}>Javascript
          </div>
        </div>
        <div class="code">
          <label>Code:</label>
          <textarea @change=${(e: any) => { this.exerciseCode = e.srcElement.value }}></textarea>
        </div>
        <button @click=${this.createExercise}
      }>
    Aufgabe hinzufügen
      </button>
      </div>`;
  };

  private createExercise() {
    this.exercises.push({
      description: this.exerciseDescription,
      exerciseType: this.exerciseType,
      editorStates: {
        doc: this.exerciseCode,
        extensions: [basicSetup, javascript()]
      }
    })
    this.showExerciseCreation = false;
    this.requestUpdate();
  }

  private switchToExercise(exercise: number) {
    if (this.editable) {
      this.currentExercise = exercise;
      let editorState = this.exercises[exercise].editorStates;
      let startState = EditorState.create({
        doc: `${editorState.doc}`,
        extensions: editorState.extensions
      });
      this.createCodeMirror(startState);
      this.editable = false;
    }
  }

  private createCodeMirror(startState: EditorState) {
    let view = new EditorView({
      state: startState,
      parent: this.shadowRoot?.querySelector(".codeWrapper") as HTMLElement,
    })
    return view;
  }
}