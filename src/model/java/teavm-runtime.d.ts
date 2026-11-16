export type TeaVMImports = {
    teavmConsole: { putcharStdout(char: number): void; putcharStderr(char: number): void };
};

export type TeaVMOptions = { installImports?(imports: TeaVMImports): void };

/** Instantiates a TeaVM WebAssembly module given by URL, bytes or compiled module. */
export function load(
    source: string | BufferSource | WebAssembly.Module,
    options?: TeaVMOptions,
): Promise<{ exports: unknown }>;
