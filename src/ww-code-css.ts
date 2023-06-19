import { css } from 'lit';
export const style = css`
    .wrapper {
        display: flex;
        flex-direction: column;
        font-family: monospace;
        align-items: top;
        justify-content: space-between;
        min-width: 400px;
    }

    .theme_light {
        --theme-background-color: #f8f8f8;
        --theme-color: #000;
        --theme-color-hover: #fff;
    }

    .theme_dark {
        --theme-background-color: #292c34;
        --theme-color: #abb2bf;
        --theme-color-hover: #000;
    }

    .editorFeatures {
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        align-items: flex-start;
        margin-top: 2rem;
    }

    :host[editable='false'] .editorFeatures {
        display: none !important;
    }

    .editorFeatures sl-divider {
        width: 100%;
    }

    .editorFeatures > * {
        margin: 0.5rem;
    }

    .codeViewFooter {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        background-color: var(--theme-background-color, #f8f8f8);
        color: var(--theme-color, #000);
    }

    .codeViewFooterButtons {
        display: flex;
        flex-direction: row;
        align-items: center;
        width: 100%;
        justify-content: space-between;
    }

    .codeViewFooterButtons sl-button::part(base) {
        background-color: var(--theme-background-color, #f8f8f8);
        color: var(--theme-color, #000);
        border: none;
        border-radius: 0;
    }

    .codeViewFooterButtons sl-button::part(base):hover,
    .codeViewFooterButtons sl-button::part(base):focus {
        background-color: var(--theme-color-hover, #000);
    }

    sl-button.languageSelect::part(base) {
        background-color: var(--theme-background-color, #f8f8f8);
        color: var(--theme-color, #000);
        border: none;
        border-radius: 0;
    }

    .hidden {
        display: none !important;
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

    .codeViewFooterResult {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
        width: 100%;
    }

    .codeViewFooterResult div {
        color: var(--theme-color, #000);
        margin: 1rem;
    }

    @media print {
        .codeViewFooterButtons,
        div.cm-gutter.cm-lock-gutter,
        div.cm-gutter.cm-foldGutter,
        .editorFeatures {
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
`;
