import type { SerializedValue } from "./javascript/javascript.worker";

/** A console value as plain text, the way the output area shows it. Unloaded objects stay abbreviated. */
export function valueText(value: SerializedValue, topLevel = true): string {
    switch (value.type) {
        case "null":
        case "undefined":
            return value.type;
        case "string":
            return topLevel ? value.value : JSON.stringify(value.value);
        case "number":
        case "boolean":
            return String(value.value);
        case "bigint":
            return `${value.value}n`;
        case "symbol":
            return `Symbol(${value.description})`;
        case "function":
            return value.value.trim().split("\n")[0];
        case "array":
            return value.value.realized ? `[${value.value.values.map((item) => valueText(item, false)).join(", ")}]` : "[…]";
        case "object":
            return value.value.realized
                ? `{${value.value.properties.map(({ key, value }) => `${key}: ${valueText(value, false)}`).join(", ")}}`
                : "{…}";
        default:
            return "";
    }
}

/** One entry of a run's output as plain text; undefined for entries without text such as HTML source. */
export function resultText(result: unknown): string | undefined {
    if (typeof result === "string" || !result || typeof result !== "object") return undefined;
    if ("logs" in result) return (result.logs as SerializedValue[]).map((value) => valueText(value)).join(" ");
    if ("columns" in result) {
        const table = result as { columns: string[]; rows: unknown[][] };
        return [table.columns, ...table.rows].map((row) => row.join("\t")).join("\n");
    }
    if ("text" in result) return String(result.text);
    return undefined;
}
