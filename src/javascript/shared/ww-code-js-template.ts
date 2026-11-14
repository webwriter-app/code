import type { LanguageSupport } from "@codemirror/language";
import { html, TemplateResult } from "lit";
import { createCodeWorker } from "../../shared/code-worker";
import Code, { type Diagnostic } from "../../shared/ww-code-template";
import type {
    ExecuteCodeMessage,
    FromWorkerMessage,
    RealizeObjectMessage,
    SerializedArray,
    SerializedObject,
    SerializedValue,
} from "./javascript.worker";

export default abstract class CodeJsTemplate extends Code {
    private worker: Worker | null = null;

    private workerAlive = false;

    constructor(
        name: string,
        languageExtension: LanguageSupport,
        load: () => Promise<{ workerSource: string; build(code: string): { code: string; diagnostics: Diagnostic[] } }>,
    ) {
        super({
            name,
            loadRuntime: async () => {
                const { build, workerSource } = await load();
                return {
                    execute: (code, _context, signal) => {
                        this.stopWorker();
                        const compiled = build(code);
                        this.diagnostics = compiled.diagnostics;
                        if (this.diagnostics.length) return;

                        const worker = (this.worker = createCodeWorker(workerSource));
                        this.workerAlive = true;
                        const listeners = new AbortController();
                        return new Promise<void>((resolve, reject) => {
                            const abort = () => reject(signal.reason);
                            const fail = (event: Event) => {
                                event.preventDefault();
                                this.stopWorker();
                                reject(
                                    new Error(
                                        (event as ErrorEvent).message || "Could not start the JavaScript runtime",
                                    ),
                                );
                            };
                            signal.addEventListener("abort", abort, { signal: listeners.signal });
                            worker.onmessage = (event: MessageEvent<FromWorkerMessage>) => {
                                if (event.data.type === "executionStatus" && event.data.status === "terminated") {
                                    resolve();
                                } else {
                                    this.handleMessage(event);
                                }
                            };
                            worker.onerror = worker.onmessageerror = fail;
                            worker.postMessage({
                                type: "execute",
                                executionId: "main",
                                code: compiled.code,
                            } satisfies ExecuteCodeMessage);
                        }).finally(() => {
                            listeners.abort();
                            if (this.worker === worker) {
                                worker.onerror = worker.onmessageerror = null;
                            }
                        });
                    },
                };
            },
            languageExtension,
        });
    }

    disconnectedCallback() {
        this.stopWorker();
        super.disconnectedCallback();
    }

    private stopWorker() {
        this.worker?.terminate();
        this.worker = null;
        this.workerAlive = false;
        this.objectRealizationRequests.clear();
    }

    private objectRealizationRequests = new Map<number, SerializedObject | SerializedArray>();

    private requestObjectRealization(ref: SerializedObject | SerializedArray) {
        if (ref.value.realized || this.objectRealizationRequests.has(ref.value.objectId)) return;

        this.objectRealizationRequests.set(ref.value.objectId, ref);
        this.worker?.postMessage({
            type: "realizeObject",
            objectId: ref.value.objectId,
        } as RealizeObjectMessage);
    }

    private handleMessage(event: MessageEvent) {
        const message = event.data as FromWorkerMessage;

        if (message.type == "log") {
            this.results = [...this.results, { label: message.label, logs: message.logs }];
        } else if (message.type === "consoleClear") {
            this.results = [];
        } else if (message.type == "realizedObject") {
            if (!this.objectRealizationRequests.has(message.objectId)) {
                console.warn("Received invalid object id", message.objectId);
                return;
            }

            this.objectRealizationRequests.get(message.objectId)!.value = message.value.value;
            this.results = [...this.results];
            this.requestUpdate();
        }
    }

    Result(): TemplateResult<1> {
        return this.results.map((result: { label: string; logs: SerializedValue[] }) => {
            return html`<div class="log-line log-level-${result.label}">
                ${this.LogIcon(result.label)}
                <div class="log-values">
                    ${result.logs.map((log: SerializedValue) => html`${this.LogValue(log, true)} `)}
                </div>
            </div>`;
        });
    }

    private LogValue(value: SerializedValue, topLevel: boolean = false, inline: boolean = false) {
        switch (value.type) {
            case "null":
                return html`<span class="log-value log-null">null</span>`;
            case "undefined":
                return html`<span class="log-value log-undefined">undefined</span>`;
            case "string":
                if (topLevel) {
                    return html`<span class="log-value">${value.value}</span>`;
                } else {
                    return html`<span class="log-value log-string">"${value.value}"</span>`;
                }
            case "number":
                return html`<span class="log-value log-number">${value.value}</span>`;
            case "boolean":
                return html`<span class="log-value log-boolean">${value.value}</span>`;
            case "bigint":
                return html`<span class="log-value log-bigint">${value.value}n</span>`;
            case "symbol":
                return html`<span class="log-value log-symbol">Symbol(${value.description})</span>`;
            case "function":
                const lines = value.value.trim().split("\n");
                let name = lines[0] + (lines.length > 1 ? " … }" : "");
                return html`<span class="log-value log-function">${name}</span>`;
            case "array":
                if (value.value.realized) {
                    return this.ArrayValue(
                        {
                            ...value,
                            value: value.value as { realized: true; values: SerializedValue[]; expanded: boolean },
                        },
                        topLevel,
                        inline,
                    );
                } else {
                    return this.ArrayValue(value, topLevel, inline);
                }
            case "object":
                return this.ObjectValue(value, topLevel, inline);
            default:
                return html``;
        }
    }

    private ObjectValue(object: SerializedObject, _topLevel: boolean, inline: boolean): TemplateResult<1> {
        if (inline) return html`{…}`;
        if (!object.value.realized) return html`<span class="log-unrealizable">{…}</span>`;
        if (object.value.properties.length === 0) return html`{}`;

        return html`<div class="log-value log-object">
            <button
                type="button"
                aria-expanded=${object.value.expanded}
                class="log-clickable"
                @click=${() => {
                    if (object.value.realized) {
                        object.value.expanded = !object.value.expanded;
                        if (this.workerAlive) {
                            for (const { value } of object.value.properties) {
                                if (value.type === "array" || value.type == "object") {
                                    this.requestObjectRealization(value);
                                }
                            }
                        }
                    }
                    this.requestUpdate();
                }}
            >
                <sl-icon
                    library="code"
                    aria-hidden="true"
                    name="${object.value.expanded ? "caret-down-fill" : "caret-right-fill"}"
                    class="log-expand-icon"
                ></sl-icon
                >{${object.value.properties.slice(0, 3).map(({ key, value }, index) => {
                    if (index == 2) return ", …";
                    return html`${index === 1 ? ", " : ""}${key}: ${this.LogValue(value, false, true)}`;
                })}}
            </button>
            ${!object.value.expanded
                ? undefined
                : html`<div class="log-properties">
                      ${object.value.properties.map(({ key, value }) => {
                          return html`<div class="log-field">${key}: ${this.LogValue(value, false, false)}</div>`;
                      })}
                  </div>`}
        </div>`;
    }

    private ArrayValue(array: SerializedArray, _topLevel: boolean, inline: boolean): TemplateResult<1> {
        if (inline) return html`[…]`;
        if (!array.value.realized) return html`<span class="log-unrealizable">[…]</span>`;
        if (array.value.values.length === 0) return html`[]`;

        return html`<div class="log-value log-array">
            <button
                type="button"
                aria-expanded=${array.value.expanded}
                class="log-clickable"
                @click=${() => {
                    if (array.value.realized) {
                        array.value.expanded = !array.value.expanded;
                        if (this.workerAlive) {
                            for (const value of array.value.values) {
                                if (value.type === "array" || value.type == "object") {
                                    this.requestObjectRealization(value);
                                }
                            }
                        }
                    }
                    this.requestUpdate();
                }}
            >
                <sl-icon
                    library="code"
                    aria-hidden="true"
                    name="${array.value.expanded ? "caret-down-fill" : "caret-right-fill"}"
                    class="log-expand-icon"
                ></sl-icon
                >[
                ${array.value.values.slice(0, 5).map((value, index) => {
                    if (index == 4) return ", …";
                    return html`${index > 0 ? ", " : ""}${this.LogValue(value, false, true)}`;
                })}
                ]
            </button>
            ${!array.value.expanded
                ? undefined
                : html`<div class="log-properties">
                      ${array.value.values.map((value, idx) => {
                          return html`<div class="log-field">${idx}: ${this.LogValue(value, false, false)}</div>`;
                      })}
                  </div>`}
        </div>`;
    }

    private LogIcon(label: string) {
        switch (label) {
            case "warning":
                return html`<sl-icon
                    library="code"
                    aria-hidden="true"
                    class="log-icon"
                    name="exclamation-triangle-fill"
                ></sl-icon>`;
            case "error":
                return html`<sl-icon
                    library="code"
                    aria-hidden="true"
                    class="log-icon"
                    name="exclamation-circle-fill"
                ></sl-icon>`;
            default:
                return html`<div class="log-icon-placeholder"></div>`;
        }
    }
}
