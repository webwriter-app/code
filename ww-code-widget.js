var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { LitElement, html } from 'lit';
import { customElement } from 'lit/decorators.js';
let codeWidget = class codeWidget extends LitElement {
    handleClick() {
        console.log("Test");
    }
    render() {
        return html `
        <p>Test2</p>
        <button @click=${this.handleClick}>Click me!</button>
        `;
    }
};
codeWidget = __decorate([
    customElement('ww-code-widget')
], codeWidget);
//# sourceMappingURL=ww-code-widget.js.map