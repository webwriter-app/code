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

  @property({ type: Number, reflect: true, attribute: true })
  currentExercise = -1;

  @property({ type: Array })
  exercises = [
    {
      description: "Fill the blanks",
      editorStates: {
        doc: `\n\nfillTheBlanks\n\n`,
        extensions: [basicSetup, javascript()]
      }
    },
    {
      description: "Code skeleton",
      editorStates: {
        doc: `\n\ncodeSkeleton\n\n`,
        extensions: [basicSetup, javascript()]
      }
    }, {
      description: "Buggy code",
      editorStates: {
        doc: `\n\nbuggyCode\n\n`,
        extensions: [basicSetup, javascript()]
      }
    },
    {
      description: "Find the bug",
      editorStates: {
        doc: `\n\findTheBug\n\n`,
        extensions: [basicSetup, javascript()]
      }
    }
  ]

  static styles = style;

  render() {
    return html`
        <div class="box">
          <div class="exercises">
            <h1>Wählen Sie einen Aufgabentypen</h1>
            <div class="list">
              ${this.exercises.map((exercise, index) => html`
              <button @click=${() => this._onClick(index)}> ${exercise.description} </button>
              `)}
            </div>
          </div>
          <button class="newExercise" @click=${() => this._createExercise("Test", "\n\nDocTest\n\n", [basicSetup,
            javascript()])}>
            +
          </button>
        </div>
        </div>
        <div class="codeWrapper">
        </div>`
  }

  _createExercise(description: string, doc: any, extensions: Array<any>) {
    this.exercises.push({
      description: description,
      editorStates: {
        doc: doc,
        extensions: extensions
      }
    })
    this.requestUpdate();
  }

  _onClick(exercise: number) {
    if (this.editable) {
      this.currentExercise = exercise;
      let editorState = this.exercises[exercise].editorStates;

      let startState = EditorState.create({
        doc: `${editorState.doc}`,
        extensions: editorState.extensions
      });
      this._createCodeMirror(startState);
      this.editable = false;
    }
  }

  _createCodeMirror(startState: EditorState) {
    let view = new EditorView({
      state: startState,
      parent: this.shadowRoot?.querySelector(".codeWrapper") as HTMLElement,
    })
    return view;
  }
}