import { LitElementWw } from "webwriter-lit"
import { property, query, customElement } from "lit/decorators.js"
import { EditorView, basicSetup } from "codemirror"
import { javascript } from "@codemirror/lang-javascript"
import { style } from "./ww-codewidget-css"
import { html } from "lit"
import "./exercises/fillTheBlanks/cw-filltheblanks"
import "./exercises/codeSkeleton/cw-codeskeleton"
import "./exercises/buggyCode/cw-buggycode"

@customElement("ww-codewidget")
export default class CodeWidget extends LitElementWw {

  @property({ type: Boolean, reflect: true, attribute: true })
  editable = false;

  @property({ type: String, reflect: true, attribute: true })
  exercise: string = "";

  private _onClick(exercise: string) {
    this.exercise = exercise;
    this.editable = false;
  }

  static styles = style;

  render() {
    return html`

      <div>
        <h1>Wählen Sie einen Aufgabentypen</h1>
        <list>
          <button @click=${() => this._onClick("filltheblanks")}> Aufgabe 1 </button>
          <button @click=${() => this._onClick("codeSkeleton")}> Aufgabe 2 </button>
          <button @click=${() => this._onClick("buggyCode")}> Aufgabe 3 </button>
        </list>
        </div>
            `
  }
}