export { default as workerSource } from "worker:./javascript.worker";

export function build(code: string) {
    return { code, diagnostics: [] };
}
