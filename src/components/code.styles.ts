import { css } from "lit";
export const style = css`
    /* --- Widget --- */
    :host {
        --code-border-width: 1px;
        display: block;
        box-sizing: border-box;
        min-width: 300px;
        max-width: 2100px;
        min-height: min-content;
        color: var(--ww-text-color, inherit);
        font-family: var(--ww-font-family, inherit);
        border: solid var(--code-border-width) var(--sl-color-neutral-300);
        border-radius: var(--sl-border-radius-medium);
    }

    .layout {
        container-type: inline-size;
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

    .print-code {
        display: none;
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

    .run-control {
        position: relative;
    }

    .run-control[hidden] {
        display: none;
    }

    .run-button[aria-busy="true"]::part(base) {
        cursor: progress;
    }

    .runtime-spinner {
        inline-size: 0.75em;
        block-size: 0.75em;
        box-sizing: border-box;
        border: 1px solid currentColor;
        border-inline-end-color: transparent;
        border-radius: 50%;
    }

    @media (prefers-reduced-motion: no-preference) {
        .runtime-spinner {
            animation: runtime-spin 0.8s linear infinite;
        }
    }

    @keyframes runtime-spin {
        to {
            transform: rotate(1turn);
        }
    }

    .run-button[data-progress]::part(base) {
        --runtime-fill-direction: to right;
        background-image: linear-gradient(
            var(--runtime-fill-direction),
            var(--sl-color-primary-800) var(--runtime-progress),
            transparent var(--runtime-progress)
        );
    }

    .run-button[data-progress]:dir(rtl)::part(base) {
        --runtime-fill-direction: to left;
    }

    @media (forced-colors: active) {
        .run-button[data-progress]::part(base) {
            background-image: none;
        }
    }

    .visually-hidden {
        position: absolute;
        inline-size: 1px;
        block-size: 1px;
        overflow: hidden;
        clip-path: inset(50%);
        white-space: nowrap;
    }

    .language-label {
        flex-grow: 1;
        text-align: right;
        text-transform: uppercase;
        font-weight: 600;
        font-size: var(--sl-font-size-x-small);
        color: var(--sl-color-neutral-600);
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
        display: inline-flex;
        align-items: center;
        min-inline-size: 24px;
        min-block-size: 24px;
        color: var(--ww-link-color, var(--sl-color-primary-700));
        text-decoration: underline;
    }

    .diagnostic-message {
        white-space: pre-wrap;
        overflow-wrap: anywhere;
    }

    /* --- Narrow containers --- */
    @container (max-width: 24rem) {
        .language-label {
            flex-basis: 100%;
            order: -1;
            text-align: start;
        }
    }

    /* --- Touch --- */
    @media (pointer: coarse) {
        .controls sl-button::part(base) {
            min-block-size: 2.75rem;
        }

        .cm-author-mode .cm-lock-gutter .cm-gutterElement,
        .cm-foldGutter .cm-gutterElement {
            min-inline-size: 1.75rem;
        }

        .diagnostic-line-number {
            min-inline-size: 44px;
            min-block-size: 44px;
        }
    }

    /* --- Print --- */
    @media print {
        :host {
            max-width: none;
            max-height: none !important;
            break-inside: avoid;
        }

        .layout {
            display: block;
            block-size: auto;
            max-block-size: none;
            min-block-size: 0;
        }

        .editor {
            display: none;
        }

        /* CodeMirror renders only the lines near the viewport, so paper gets a plain copy of the program. */
        .print-code {
            display: block;
            margin: 0;
            padding: var(--sl-spacing-x-small);
            font-family: var(--sl-font-mono);
            font-size: var(--sl-font-size-small);
            white-space: pre-wrap;
            overflow-wrap: anywhere;
            tab-size: 4;
        }

        .run-control,
        .controls sl-button,
        .executionTime {
            display: none;
        }

        .language-label {
            text-align: start;
        }

        output[data-empty] {
            display: none;
        }

        output .outputs,
        .diagnostics-container {
            break-inside: avoid;
        }

        .htmlPreview {
            break-inside: avoid;
        }
    }
`;
