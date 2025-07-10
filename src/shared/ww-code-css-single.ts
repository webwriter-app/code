import { css } from "lit";
export const style = css`
    /* --- Widget --- */
    :host {
        display: block;
        border: solid 1px var(--sl-color-neutral-300);
        border-radius: var(--sl-border-radius-medium);
        overflow: hidden;
    }

    /* --- Aside menu --- */
    aside[part="action"] {
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        align-items: flex-start;
    }

    :host(:not([editable])) aside[part="action"] {
        display: none !important;
    }

    aside[part="action"] sl-divider {
        width: 100%;
    }

    aside[part="action"] > * {
        margin: 0.5rem;
    }

    sl-details {
        width: 100%;
    }

    sl-details::part(content) {
        display: flex;
        flex-direction: column;
    }

    sl-details > sl-switch {
        margin-bottom: 0.5rem;
    }

    /* --- Editor --- */
    .cm-lock-gutter .cm-gutterElement {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        cursor: pointer;
    }

    .cm-editor.cm-focused {
        outline: none !important;
    }

    /* --- Controls --- */
    .controls {
        display: flex;
        align-items: center;

        padding: var(--sl-spacing-x-small);
        gap: var(--sl-spacing-x-small);

        border-top: solid 1px var(--sl-color-neutral-300);
    }

    .language-label {
        flex-grow: 1;
        text-align: right;
        text-transform: uppercase;
        font-weight: 600;
        font-size: var(--sl-font-size-x-small);
        color: var(--sl-color-neutral-400);
    }

    :host([hideExecutionTime]) .executionTime {
        display: none;
    }

    pre {
        margin: 0;
    }

    output {
        display: block;
        width: 100%;
        box-sizing: border-box;
        min-height: 2.75rem;
        border-top: solid 1px var(--sl-color-neutral-300);
    }

    output .outputs {
        padding: var(--sl-spacing-x-small);
        display: flex;
        flex-direction: column;
    }

    .htmlPreview {
        border: none;
        background-color: white;
        width: 100%;
        min-height: 200px;
        margin: 0;
    }

    /* TODO: Handle printing well */

    /* --- Diagnostics --- */

    .diagnostics-container {
        font-family: var(--sl-font-mono);
        padding: var(--sl-spacing-x-small);
    }

    .diagnostics-list {
        display: grid;
        grid-template-columns: auto auto 1fr;
        gap: var(--sl-spacing-x-small);
    }

    .diagnostic-icon {
        color: var(--sl-color-danger-600);
        transform: translateY(5px);
    }

    .diagnostic-line-number {
        color: var(--sl-color-primary-700);
        text-decoration: underline;
    }
`;
