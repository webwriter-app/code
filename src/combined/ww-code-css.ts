import { css } from 'lit';
export const style = css`
    :host {
        display: flex;
        flex-direction: column;
        font-family: monospace;
        align-items: top;
        justify-content: space-between;
        min-width: 400px;
        --theme-background-color: #f8f8f8;
        --theme-color: #000;
        --theme-color-hover: #fff;
    }

    aside[part='action'] {
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        align-items: flex-start;
    }

    :host(:not([editable])) aside[part='action'] {
        display: none !important;
    }

    aside[part='action'] sl-divider {
        width: 100%;
    }

    aside[part='action'] > * {
        margin: 0.5rem;
    }

    pre {
        margin: 0;
    }

    footer {
        display: flex;
        flex-direction: row;
        align-items: flex-start;
        background-color: var(--theme-background-color, #f8f8f8);
        color: var(--theme-color, #000);
    }

    footer sl-button::part(base) {
        background-color: var(--theme-background-color, #f8f8f8);
        color: var(--theme-color, #000);
        border: none;
        border-radius: 0;
    }

    sl-button::part(base):hover,
    sl-button::part(base):focus {
        background-color: var(--theme-color-hover, #000);
    }

    footer sl-select {
        margin-left: auto;
        max-width: 150px;
    }

    footer sl-option::part(checked-icon) {
        display: none;
    }

    footer sl-select[disabled] {
        color: inherit;
    }

    footer sl-select[disabled]::part(expand-icon) {
        color: inherit;
        display: none;
    }

    footer sl-select::part(display-input) {
        text-align: right;
    }

    footer sl-select::part(combobox) {
        background: none;
        border: none;
    }

    sl-button.languageSelect::part(base) {
        background-color: var(--theme-background-color, #f8f8f8);
        color: var(--theme-color, #000);
        border: none;
        border-radius: 0;
    }

    :host([hideExecutionTime]) .executionTime {
        display: none;
    }

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

    output {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
        width: 100%;
        color: var(--theme-color, #000);
        background-color: var(--theme-background-color, #f8f8f8);
        padding: 0.5rem;
        box-sizing: border-box;
        min-height: 2.75rem;
    }

    output .outputs {
        display: flex;
        flex-direction: column;
    }

    @media print {
        footer,
        div.cm-gutter.cm-lock-gutter,
        div.cm-gutter.cm-foldGutter,
        aside[part='action'] {
            display: none !important;
        }

        :host {
            outline: none !important;
        }

        .wrapper {
            --theme-background-color: transparent !important;
            --theme-color: #000 !important;
        }

        #code {
            outline: 1px solid black !important;
            z-index: 1000;
        }
    }

    .htmlPreview {
        width: 100%;
        margin: 1rem;
    }

    .cssPreviewWrapper {
        width: 100%;
        margin: 1rem;

        display: block;
    }

    .cssPreview {
        height: 100px;
        width: 100px;

        border: 1px solid black;
    }

    .ww-code-button {
        background: none;
        outline: none;
        border: none;

        height: auto;
        min-height: var(--sl-input-height-medium);
        font-size: var(--sl-button-font-size-medium);
        line-height: calc(var(--sl-input-height-medium) - var(--sl-input-border-width) * 2);
        border-radius: var(--sl-input-border-radius-medium);

        padding: 0 var(--sl-spacing-medium);

        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-family: var(--sl-input-font-family);
        font-weight: var(--sl-font-weight-semibold);
        text-decoration: none;
        user-select: none;
        white-space: nowrap;
        vertical-align: middle;
        transition: var(--sl-transition-x-fast) background-color, var(--sl-transition-x-fast) color,
            var(--sl-transition-x-fast) border, var(--sl-transition-x-fast) box-shadow;
        cursor: inherit;

        justify-self: flex-start;
    }

    .ww-code-button:hover {
        cursor: pointer;
        background-color: white;
    }

    .ww-code-button.hidden {
        display: none;
    }

    .ww-code-button svg {
        padding-right: 0.5rem;
    }

    .ww-code-select {
        background: none;
        outline: none;
        border: none;
        /* appearance: none; */

        height: auto;
        min-height: var(--sl-input-height-medium);
        font-size: var(--sl-button-font-size-medium);
        line-height: calc(var(--sl-input-height-medium) - var(--sl-input-border-width) * 2);
        border-radius: var(--sl-input-border-radius-medium);

        padding: 0 var(--sl-spacing-medium);

        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-family: var(--sl-input-font-family);
        font-weight: var(--sl-font-weight-semibold);
        text-decoration: none;
        user-select: none;
        white-space: nowrap;
        vertical-align: middle;
        transition: var(--sl-transition-x-fast) background-color, var(--sl-transition-x-fast) color,
            var(--sl-transition-x-fast) border, var(--sl-transition-x-fast) box-shadow;
        cursor: inherit;

        float: right;
        justify-self: flex-end;
    }

    .ww-code-select:hover {
        cursor: pointer;
        background-color: white;
    }

    .ww-code-select:disabled {
        cursor: default;
        background: none;
    }

    footer {
        display: flex;
        width: 100%;
    }

    footer select {
        margin-left: auto;
        max-width: 150px;
    }

    sl-details {
        width: 100%;
    }

    sl-input {
        width: 100%;
    }

    sl-details::part(content) {
        display: flex;
        flex-direction: column;
    }

    sl-details > sl-switch {
        margin-bottom: 0.5rem;
    }
`;
