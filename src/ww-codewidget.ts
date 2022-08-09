import { LitElementWw } from "webwriter-lit"
import { html, css } from "lit"
import { property, query, customElement } from "lit/decorators.js"


@customElement("ww-codewidget")
export default class CodeWidget extends LitElementWw {
  handleClick() {
    console.log("Test");
  }

  render() {
    return html`
        <p>Test23</p>
        <button @click=${this.handleClick}>Click me!</button>
        `;
  }
}