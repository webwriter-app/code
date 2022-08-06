import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('codeWidget')

export class CodeWidget extends LitElement {
    @property()
    version = 'STARTING';

    render() {
        return html`
        <p>Welcome to the Lit!</p>
        <p>This is the ${this.version} code.</p>
        `;
    }
}