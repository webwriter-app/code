import { LitElement, html } from 'lit';
import { customElement } from 'lit/decorators.js';

@customElement('ww-code-widget')
class codeWidget extends LitElement {
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