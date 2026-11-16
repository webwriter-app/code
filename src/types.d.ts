declare module "worker:*" {
    const content: string;
    export default content;
}

declare module "biwascheme" {
    const BiwaScheme: {
        Interpreter: new (onError: (error: Error) => void) => {
            evaluate(code: string, after: (result: unknown) => void): void;
        };
        Port: {
            CustomOutput: new (write: (text: string) => void) => object;
            NullInput: new () => object;
            current_input: object;
            current_output: object;
            current_error: object;
        };
        undef: unknown;
        to_write(value: unknown): string;
    };
    export default BiwaScheme;
}

declare module "tau-prolog" {
    type Callbacks = { success(): void; error(term: unknown): void };
    type Output = { stream: { put(text: string): boolean; flush(): boolean } };
    const prolog: {
        create(limit: number): {
            streams: {
                user_input: { stream: { get(): string; eof(): boolean } };
                user_output: Output;
                user_error: Output;
            };
            consult(
                code: string,
                options: Callbacks & { file: boolean; script: boolean; url: boolean; html: boolean },
            ): void;
            query(code: string, options: Callbacks): void;
            answer(
                options: Omit<Callbacks, "success"> & { success(answer: unknown): void; fail(): void; limit(): void },
            ): void;
            format_answer(answer: unknown): string;
        };
    };
    export default prolog;
}

declare module "tau-prolog/modules/lists.js" {
    import prolog from "tau-prolog";
    export default function register(prologRuntime: typeof prolog): void;
}

declare module "@webwriter/build/test" {
    export function getMochaConfig(): Mocha.MochaOptions;
}
