//#region Types
// Code execution
export type ExecuteCodeMessage = {
    type: "execute";
    executionId: string;
    code: string;
};

export type ExecutionStatusMessage = {
    type: "executionStatus";
    executionId: string;
    status: "running" | "terminated";
};

// Logging

export type SerializedNull = { type: "null" };
export type SerializedUndefined = { type: "undefined" };
export type SerializedString = { type: "string"; value: string };
export type SerializedNumber = { type: "number"; value: number };
export type SerializedBoolean = { type: "boolean"; value: boolean };
export type SerializedBigInt = { type: "bigint"; value: string };
export type SerializedSymbol = { type: "symbol"; description: string };
export type SerializedFunction = { type: "function"; value: string };
export type SerializedArray = {
    type: "array";
    length: number;
    value: { realized: true; values: SerializedValue[]; expanded: boolean } | { realized: false; objectId: number };
};
export type SerializedObject = {
    type: "object";
    value:
        | { realized: true; properties: { key: string; value: SerializedValue }[]; expanded: boolean }
        | { realized: false; objectId: number };
};

export type SerializedValue =
    | SerializedNull
    | SerializedUndefined
    | SerializedString
    | SerializedNumber
    | SerializedBoolean
    | SerializedBigInt
    | SerializedSymbol
    | SerializedFunction
    | SerializedArray
    | SerializedObject;

export type LogMessage = {
    type: "log";
    executionId: string;
    label: "debug" | "info" | "warning" | "error";
    logs: SerializedValue[];
};

export type ConsoleClearMessage = {
    type: "consoleClear";
};

export type RealizeObjectMessage = {
    type: "realizeObject";
    objectId: number;
};

export type RealizedObjectMessage = {
    type: "realizedObject";
    objectId: number;
    value: SerializedObject | SerializedArray;
};

export type ToWorkerMessage = ExecuteCodeMessage | RealizeObjectMessage;
export type FromWorkerMessage = ExecutionStatusMessage | LogMessage | ConsoleClearMessage | RealizedObjectMessage;

//#endregion

const objectCache = new Map<number, any>();
let objectIdCounter = 0;

function serializeValue(value: any, resolveNested: boolean = false): SerializedValue {
    // Handle all primitive types first
    if (value === null) return { type: "null" };
    if (value === undefined) return { type: "undefined" };
    if (typeof value === "string") return { type: "string", value };
    if (typeof value === "number") return { type: "number", value };
    if (typeof value === "boolean") return { type: "boolean", value };
    if (typeof value === "bigint") return { type: "bigint", value: value.toString() };
    if (typeof value === "symbol") return { type: "symbol", description: value.description || "" };
    if (typeof value === "function") return { type: "function", value: value.toString() };

    if (value instanceof Error) {
        return { type: "string", value: value.message ?? value + "" };
    }

    // Rewrite "special" object to array or object
    if (value instanceof Map) value = Object.fromEntries(value.entries());
    if (value instanceof Set) value = Array.from(value);
    if (value instanceof Date) return { type: "string", value: value.toISOString() };
    if (value instanceof RegExp) return { type: "string", value: value.toString() };

    let objectId = -1;
    if (!resolveNested) {
        objectId = objectIdCounter++;
        objectCache.set(objectId, value);
    }

    if (Array.isArray(value)) {
        return {
            type: "array",
            length: value.length,
            value: resolveNested
                ? { realized: true, values: value.map((item) => serializeValue(item, false)), expanded: false }
                : { realized: false, objectId },
        };
    }

    return {
        type: "object",
        value: resolveNested
            ? {
                  realized: true,
                  properties: Object.entries(value).map(([key, val]) => ({
                      key,
                      value: serializeValue(val, false),
                  })),
                  expanded: false,
              }
            : { realized: false, objectId },
    };
}

const oldConsole = console;

self.onmessage = async (event) => {
    const message = event.data as ToWorkerMessage;

    if (message.type === "execute") {
        const { executionId, code } = message;

        function sendLog(label: string, ...args: any[]) {
            const serializedArgs = args.map((arg) => serializeValue(arg, true));
            self.postMessage({
                type: "log",
                executionId,
                label,
                logs: serializedArgs,
            } as LogMessage);
        }

        self.postMessage({ type: "executionStatus", executionId, status: "running" } as ExecutionStatusMessage);
        try {
            console = {
                log: (...args: any[]) => sendLog("info", ...args),
                warn: (...args: any[]) => sendLog("warning", ...args),
                error: (...args: any[]) => sendLog("error", ...args),
                info: (...args: any[]) => sendLog("debug", ...args),
                clear: () => self.postMessage({ type: "consoleClear" } as ConsoleClearMessage),
            } as any;
            await new Function(code).bind({})();
            self.postMessage({ type: "executionStatus", executionId, status: "terminated" } as ExecutionStatusMessage);
        } catch (error) {
            sendLog("error", error);
            self.postMessage({ type: "executionStatus", executionId, status: "terminated" } as ExecutionStatusMessage);
        }
    } else if (message.type === "realizeObject") {
        const { objectId } = message;
        const value = objectCache.get(objectId);
        if (value !== undefined) {
            self.postMessage({
                type: "realizedObject",
                objectId,
                value: serializeValue(value, true),
            } as RealizedObjectMessage);
        } else {
            oldConsole.error(`Object with ID ${objectId} not found in cache.`);
        }
    } else {
        oldConsole.error("Unknown message type:", event.data.type);
    }
};
