import { SQLite, sql } from "@codemirror/lang-sql";
import { css, html } from "lit";
import { customElement } from "lit/decorators.js";
import Code from "../shared/ww-code-template";
import type { SqlTable } from "./sql-runtime";

/** Code widget for SQLite with tabular query results. */
@customElement("webwriter-code-sql")
export default class CodeSql extends Code {
    static styles = [
        Code.styles,
        css`
            .table-results {
                display: grid;
                grid-template-columns: minmax(0, 1fr);
                gap: var(--sl-spacing-x-small);
                padding: var(--sl-spacing-x-small);
            }

            .table-wrapper {
                overflow: auto;
                max-block-size: 16rem;
                border: 1px solid var(--sl-color-neutral-300);
            }

            .table-wrapper:focus-visible {
                outline: 2px solid var(--sl-color-primary-600);
                outline-offset: -2px;
            }

            table {
                min-inline-size: 100%;
                border-collapse: separate;
                border-spacing: 0;
                font-family: var(--sl-font-mono);
                font-size: var(--sl-font-size-small);
            }

            caption,
            th,
            td {
                padding: var(--sl-spacing-2x-small) var(--sl-spacing-x-small);
                text-align: start;
            }

            caption,
            th {
                font-weight: 600;
            }

            th,
            td {
                border-block-end: 1px solid var(--sl-color-neutral-300);
                white-space: pre-wrap;
                overflow-wrap: anywhere;
            }

            th {
                background: var(--sl-color-neutral-100);
            }

            .row-note {
                margin: 0;
            }
        `,
    ];

    static offlineImports(element: Element) {
        return Code.runtimeImports(element, "./ww-code-sql.js");
    }

    constructor() {
        super({
            name: "SQL",
            languageExtension: sql({ dialect: SQLite }),
            loadRuntime: () => import("./sql-runtime"),
        });
    }

    protected Result() {
        const tables = this.results as SqlTable[];
        return html`
            <div class="table-results">
                ${tables.map(
                    ({ columns, rows, hasMore }, index) => html`
                        <div class="table-wrapper" role="region" tabindex="0" aria-labelledby="result-${index}">
                            <table>
                                <caption id="result-${index}">
                                    ${this.msg("Query result")} ${index + 1}
                                </caption>
                                <thead>
                                    <tr>
                                        ${columns.map((column) => html`<th scope="col">${column}</th>`)}
                                    </tr>
                                </thead>
                                <tbody>
                                    ${rows.map(
                                        (row) =>
                                            html`<tr>
                                                ${row.map((value) => html`<td>${value}</td>`)}
                                            </tr>`,
                                    )}
                                    ${rows.length
                                        ? ""
                                        : html`<tr>
                                              <td colspan=${columns.length}>${this.msg("No rows")}</td>
                                          </tr>`}
                                </tbody>
                            </table>
                        </div>
                        ${hasMore
                            ? html`<p class="row-note">${this.msg("Only the first 500 rows are shown.")}</p>`
                            : ""}
                    `,
                )}
            </div>
        `;
    }
}
