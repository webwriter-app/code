import { css } from "lit";
export const style = css`
    /* --- Widget --- */
    :host {
        --code-border-width: 1px;
        display: block;
        box-sizing: border-box;
        min-width: 300px;
        min-height: min-content;
        border: solid var(--code-border-width) var(--sl-color-neutral-300);
        border-radius: var(--sl-border-radius-medium);
    }

    .layout {
        display: grid;
        grid-template-columns: minmax(0, 1fr);
        grid-template-rows: minmax(4rem, 1fr) max-content max-content;
        block-size: var(--resize-height, 100%);
        max-block-size: 100%;
        min-block-size: min-content;
    }

    .layout[hidden] {
        display: none;
    }

    .editor,
    .editor .cm-editor {
        display: flex;
        flex-direction: column;
        min-block-size: 0;
    }

    .editor .cm-editor,
    .editor .cm-scroller {
        flex: 1 1 auto;
        min-block-size: 0;
    }

    .editor .cm-scroller {
        overflow: auto;
    }

    /* --- Editor --- */
    .cm-lock-gutter .cm-gutterElement {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
    }

    .cm-author-mode .cm-lock-gutter .cm-gutterElement {
        cursor: pointer;
    }

    .editor .cm-editor.cm-focused {
        outline: none;
    }

    .cm-lineNumbers .cm-gutterElement {
        border-inline-start: 3px solid transparent;
    }

    .cm-focused .cm-lineNumbers .cm-activeLineGutter {
        border-inline-start-color: var(--sl-color-neutral-900, currentColor);
    }

    @media (forced-colors: active) {
        .cm-focused .cm-lineNumbers .cm-activeLineGutter {
            border-inline-start-color: CanvasText;
        }
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
        flex-wrap: wrap;

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

    output .outputs pre {
        white-space: pre-wrap;
        overflow-wrap: anywhere;
    }

    .htmlPreview {
        display: block;
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
        overflow-wrap: anywhere;
    }
`;
