import { LitElementWw } from "webwriter-lit"
import { property, query, customElement, queryAll } from "lit/decorators.js"
import { EditorView, basicSetup } from "codemirror"
import { EditorState } from "@codemirror/state"
import { javascript } from "@codemirror/lang-javascript"
import { style } from "./ww-codewidget-css"
import { html } from "lit"
import { Ref, createRef, ref } from 'lit/directives/ref.js';


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

  descriptionRef: Ref<HTMLInputElement> = createRef();
  languageRef: Ref<HTMLInputElement> = createRef();
  exerciseTypeRef: Ref<HTMLInputElement> = createRef();
  codeRef: Ref<HTMLInputElement> = createRef();

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
      <input type="text" ${ref(this.descriptionRef)} placeholder="Beschreibung" />
    </div>
    <div class="exerciseType">
      <label>Aufgabentyp:</label>
      <select>
        ${this.exerciseTypes.map((exerciseType) => html`
        <option ${ref(this.exerciseTypeRef)} value=${exerciseType}>${exerciseType}</option>
        `)}
      </select>
    </div>
        <div class="extensions">
          <div class="language">
                <label>Language:</label>
                <input type="radio" ${ref(this.languageRef)} value="javascript">Javascript</input>
          </div>
        </div>
        <div class="code">
          <label>Code:</label>
          <textarea ${ref(this.codeRef)}></textarea>
        </div>
        <button @click=${() => {

        this.createExercise(
          this.descriptionRef?.value?.value as string,
          this.exerciseTypeRef?.value?.value as string,
          this.codeRef.value?.value, [
          basicSetup, javascript()]
        );
        this.showExerciseCreation = false;
      }
      }>
    Aufgabe hinzufügen
      </button>`;
  };

  createExercise(description: string, exerciseType: string, doc: any, extensions: Array<any>) {
    this.exercises.push({
      description: description,
      exerciseType: exerciseType,
      editorStates: {
        doc: doc,
        extensions: extensions
      }
    })
    this.requestUpdate();
  }

  switchToExercise(exercise: number) {
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

  createCodeMirror(startState: EditorState) {
    let view = new EditorView({
      state: startState,
      parent: this.shadowRoot?.querySelector(".codeWrapper") as HTMLElement,
    })
    return view;
  }
}