import { LanguageSupport } from "@codemirror/language";
import { html, TemplateResult } from "lit";
import JavaScriptWorker from "worker:./javascript.worker";
import Code from "../../shared/ww-code-template";
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

    constructor(name: string, languageExtension: LanguageSupport) {
        super();
        this.languageModule = {
            name,
            executionFunction: (code: string) => {
                this.worker?.terminate();
                this.objectRealizationRequests.clear();

                try {
                    code = this.build(code);
                } catch (e) {
                    return;
                }

                this.worker = new Worker(
                    URL.createObjectURL(new Blob([JavaScriptWorker], { type: "application/javascript" })),
                    { type: "module" },
                );
                this.worker.onmessage = this.handleMessage.bind(this);
                this.worker.postMessage({
                    type: "execute",
                    executionId: "main", // Currently, no simultaneous executions are supported
                    code: code,
                } as ExecuteCodeMessage);
            },
            languageExtension,
        };
        this.languages = [this.languageModule];
    }

    abstract build(code: string): string;

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

        console.log(message);

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
                return html`<div class="log-value log-null">null</div>`;
            case "undefined":
                return html`<div class="log-value log-undefined">undefined</div>`;
            case "string":
                if (topLevel) {
                    return html`<div class="log-value">${value.value}</div>`;
                } else {
                    return html`<div class="log-value log-string">"${value.value}"</div>`;
                }
            case "number":
                return html`<div class="log-value log-number">${value.value}</div>`;
            case "boolean":
                return html`<div class="log-value log-boolean">${value.value}</div>`;
            case "bigint":
                return html`<div class="log-value log-bigint">${value.value}n</div>`;
            case "symbol":
                return html`<div class="log-value log-symbol">Symbol(${value.description})</div>`;
            case "function":
                const lines = value.value.trim().split("\n");
                let name = lines[0] + (lines.length > 1 ? " … }" : "");
                return html`<div class="log-value log-function">${name}</div>`;
            case "array":
                if (value.value.realized) {
                    // TypeScript type guard
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
        if (inline || !object.value.realized) return html`{…}`;

        return html`<div class="log-value log-object">
            <div
                class="log-clickable"
                @click=${() => {
                    if (object.value.realized) {
                        object.value.expanded = !object.value.expanded;
                        for (const { value } of object.value.properties) {
                            if (value.type === "array" || value.type == "object") {
                                this.requestObjectRealization(value);
                            }
                        }
                    }
                    this.requestUpdate();
                }}
            >
                <sl-icon
                    name="${object.value.expanded ? "caret-down-fill" : "caret-right-fill"}"
                    class="log-expand-icon"
                ></sl-icon
                ><span>{</span>${object.value.properties.slice(0, 3).map(({ key, value }, index) => {
                    if (index == 2) return ", …";
                    return html`${index === 1 ? ", " : ""}${key}: ${this.LogValue(value, false, true)}`;
                })}<span>}</span>
            </div>
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
        if (inline || !array.value.realized) return html`[…]`;
        return html`<div class="log-value log-array">
            <div
                class="log-clickable"
                @click=${() => {
                    if (array.value.realized) {
                        array.value.expanded = !array.value.expanded;
                        for (const value of array.value.values) {
                            if (value.type === "array" || value.type == "object") {
                                this.requestObjectRealization(value);
                            }
                        }
                    }
                    this.requestUpdate();
                }}
            >
                <sl-icon
                    name="${array.value.expanded ? "caret-down-fill" : "caret-right-fill"}"
                    class="log-expand-icon"
                ></sl-icon
                ><span class="log-value">[</span>
                ${array.value.values.slice(0, 5).map((value, index) => {
                    if (index == 4) return ", …";
                    return html`${index > 0 ? ", " : ""}${this.LogValue(value, false, true)}`;
                })}
                <span>]</span>
            </div>
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
                return html`<sl-icon class="log-icon" name="exclamation-triangle-fill"></sl-icon>`;
            case "error":
                return html`<sl-icon class="log-icon" name="exclamation-circle-fill"></sl-icon>`;
            default:
                return html`<div class="log-icon-placeholder"></div>`;
        }
    }
}
