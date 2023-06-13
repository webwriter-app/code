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
    }

    .theme_dark {
        --theme-background-color: #292c34;
        --theme-color: #abb2bf;
    }

    .editorFeatures {
        display: flex;
        flex-direction: column;
        justify-content: space-evenly;
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

    .codeViewHeader {
        display: flex;
        flex-direction: row;
        align-items: flex-end;
        justify-content: flex-end;
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
        justify-content: flex-start;
    }

    .codeViewFooterButtons sl-button::part(base) {
        background-color: var(--theme-background-color, #f8f8f8);
        color: var(--theme-color, #000);
        border: none;
        border-radius: 0;
    }

    .codeViewFooterButtons sl-button::part(base):hover {
        background-color: filter(var(--theme-background-color, #f8f8f8), brightness(2));
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
`;
