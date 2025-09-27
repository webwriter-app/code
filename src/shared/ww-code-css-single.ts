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
    aside[part="options"] {
        width: 100%;
        box-sizing: border-box;
        padding-left: 5px;
    }

    aside[part="options"] h2 {
        font-size: var(--sl-font-size-large);
        font-weight: 600;
        margin: 0;
        margin-top: var(--sl-spacing-medium);
    }

    aside[part="options"] sl-button {
        margin-top: var(--sl-spacing-x-small);
        width: 100%;
        box-sizing: border-box;
    }

    .button-label-linebreak {
        white-space: normal;
        line-height: 1.5em;
        margin: 0.5em 0;
        display: inline-block;
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

    .cm-lock-gutter {
        user-select: none;
        font-size: var(--sl-font-size-x-small);
    }

    .cm-lock-gutter .cm-gutterElement {
        padding-left: 0.5em;
    }

    .cm-locked-line {
        color: #808080;
    }

    .cm-locked-line * {
        opacity: 0.5;
    }

    .cm-locked-line-tooltip {
        font-size: var(--sl-font-size-small);
        background: var(--sl-color-danger-100);
        color: var(--sl-color-danger-600);
        padding: 4px 8px;
        border-radius: var(--sl-border-radius-small);
        font-family: var(--sl-font-sans);
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
        min-height: 1.5em;
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

    .executionTime {
        color: var(--sl-color-neutral-500);
        font-size: var(--sl-font-size-medium);
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

    .diagnostic-message {
        white-space: pre-wrap;
    }
`;
