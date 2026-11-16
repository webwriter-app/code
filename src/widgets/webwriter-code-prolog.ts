import { execute } from "../model/prolog/prolog-runtime";
import { prologWorker } from "../model/prolog/prolog-assets";
import { offlineRuntimeAssets } from "../model/runtime-assets";
import { prolog } from "codemirror-lang-prolog";
import { css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { live } from "lit/directives/live.js";
import { Code } from "../components/code-template";

/**
 * Code widget for Prolog facts, rules and queries, powered by Tau Prolog.
 *
 * Enter facts and rules in the editor and the goal in the Query field. The goal is saved in the `goal` attribute.
 */
@customElement("webwriter-code-prolog")
export class WebwriterCodeProlog extends Code {
    static styles = [
        Code.styles,
        css`
            label {
                flex: 1 0 100%;
                display: flex;
                align-items: center;
                gap: var(--sl-spacing-x-small);
            }

            input {
                flex: 1;
                min-inline-size: 0;
                padding: var(--sl-spacing-2x-small);
                font: inherit;
                font-family: var(--sl-font-mono);
            }
        `,
    ];

    static offlineAssets(element: Element) {
        return offlineRuntimeAssets(element, [prologWorker]);
    }

    /** The Prolog goal evaluated when Run is pressed. */
    @property({ type: String, reflect: true })
    accessor goal = "";

    constructor() {
        super({
            name: "Prolog",
            languageExtension: prolog(),
            execute,
        });
    }

    protected renderRunInput() {
        return html`
            <label>
                ${this.msg("Query")}
                <input
                    type="text"
                    spellcheck="false"
                    autocapitalize="off"
                    autocomplete="off"
                    .value=${live(this.goal ?? "")}
                    @input=${(event: Event) => {
                        this.goal = (event.currentTarget as HTMLInputElement).value;
                    }}
                    @keydown=${(event: KeyboardEvent) => {
                        if (event.key !== "Enter" || event.isComposing) return;
                        event.preventDefault();
                        void this.runCode();
                    }}
                />
            </label>
        `;
    }
}
