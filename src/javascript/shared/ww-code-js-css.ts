import { css } from "lit";

export const jsTemplateStyle = css`
    output {
        max-height: 300px;
        overflow-y: scroll;
    }

    .log-line {
        display: grid;
        grid-template-columns: 1em 1fr;
        padding: var(--sl-spacing-x-small);
        gap: var(--sl-spacing-x-small);
        width: 100%;
        box-sizing: border-box;

        font-family: var(--sl-font-mono);
        line-height: 1;
        border-bottom: 1px solid var(--sl-color-neutral-300);

        line-break: anywhere;
    }

    .log-line:last-child {
        border-bottom: none;
    }

    .log-level-warning {
        background-color: var(--sl-color-warning-100);
    }

    .log-level-warning .log-icon {
        color: var(--sl-color-warning-600);
    }

    .log-level-error {
        background-color: var(--sl-color-danger-100);
    }

    .log-level-error .log-icon {
        color: var(--sl-color-danger-600);
    }

    .log-values {
        display: block;
    }

    .log-value {
        display: inline-block;
        vertical-align: text-top;
        align-content: end;
        min-height: 1.2em;
    }

    .log-null,
    .log-undefined {
        color: var(--sl-color-neutral-500);
    }

    .log-number,
    .log-boolean,
    .log-bigint {
        color: var(--sl-color-blue-700);
    }

    .log-string {
        color: var(--sl-color-green-700);
    }

    .log-symbol {
        color: var(--sl-color-red-700);
    }

    .log-function {
        font-style: italic;
    }

    .log-function::before {
        content: "ƒ ";
        color: var(--sl-color-purple-700);
    }

    .log-clickable {
        font-style: italic;
        cursor: pointer;
    }

    .log-expand-icon {
        transform: translateY(2px);
    }

    .log-properties {
        padding-top: 0.5em;
        padding-left: 1em;
    }

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
