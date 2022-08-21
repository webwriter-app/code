import { LitElementWw } from "webwriter-lit"
import { property, query, customElement } from "lit/decorators.js"
import { EditorView, basicSetup } from "codemirror"
import { EditorState } from "@codemirror/state"
import { javascript } from "@codemirror/lang-javascript"
import { style } from "./ww-codewidget-css"
import { html } from "lit"
@customElement("ww-codewidget")
export default class CodeWidget extends LitElementWw {

  @property({ type: Boolean, reflect: true, attribute: true })
  editable = false;

  @property({ type: String, reflect: true, attribute: true })
  currentExercise: string = "";

  @property({ type: Array })
  exercises = [
    {
      type: "filltheblanks",
      description: "Fill the blanks"
    },
    {
      type: "codeSkeleton",
      description: "Code skeleton"
    },
    {
      type: "buggyCode",
      description: "Buggy code"
    },
    {
      type: "findTheBug",
      description: "Find the bug"
    }
  ]

  static styles = style;

  render() {
    return html`
      <div class="box">
        <h1>Wählen Sie einen Aufgabentypen</h1>
        <div class="list">
          ${this.exercises.map(exercise => html` 
            <button @click=${() => this._onClick(exercise.type)}> ${exercise.description} </button>
          `)}
        </div>
      </div>`
  }

  private _onClick(exercise: string) {
    this.currentExercise = exercise;


    let startState = EditorState.create({
      doc: this.currentExercise,
      extensions: [basicSetup, javascript()]
    })
    const codeMirror = this._createCodeMirror(startState);
    console.log(this.querySelector('#shadow-root'));
    this.editable = false;
  }


  /*   private _createExercise(exercise: string) {
      this.exercises.push({
        type: exercise,
        description: "New exercise"
      });
    } */

  _createCodeMirror(startState: EditorState) {
    let view = new EditorView({
      state: startState,
      //parent: document.body//.querySelector('#shadow-root') as Element,
    })
    return view;
  }
}