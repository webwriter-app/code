declare module "*.apng" {
    const content: string;
    export default content;
}
declare module "*.jpg" {
    const content: string;
    export default content;
}
declare module "*.jpeg" {
    const content: string;
    export default content;
}
declare module "*.jfif" {
    const content: string;
    export default content;
}
declare module "*.pjpeg" {
    const content: string;
    export default content;
}
declare module "*.pjp" {
    const content: string;
    export default content;
}
declare module "*.png" {
    const content: string;
    export default content;
}
declare module "*.svg" {
    const content: string;
    export default content;
}
declare module "*.webp" {
    const content: string;
    export default content;
}
declare module "*.bmp" {
    const content: string;
    export default content;
}
declare module "*.ico" {
    const content: string;
    export default content;
}
declare module "*.cur" {
    const content: string;
    export default content;
}
declare module "*.tif" {
    const content: string;
    export default content;
}
declare module "*.tiff" {
    const content: string;
    export default content;
}
declare module "*.wav" {
    const content: string;
    export default content;
}
declare module "*.wave" {
    const content: string;
    export default content;
}
declare module "*.mp3" {
    const content: string;
    export default content;
}
declare module "*.aac" {
    const content: string;
    export default content;
}
declare module "*.aacp" {
    const content: string;
    export default content;
}
declare module "*.oga" {
    const content: string;
    export default content;
}
declare module "*.flac" {
    const content: string;
    export default content;
}
declare module "*.weba" {
    const content: string;
    export default content;
}
declare module "*.mp4" {
    const content: string;
    export default content;
}
declare module "*.webm" {
    const content: string;
    export default content;
}
declare module "*.avif" {
    const content: string;
    export default content;
}
declare module "*.gif" {
    const content: string;
    export default content;
}
declare module "*.mov" {
    const content: string;
    export default content;
}
declare module "*.avi" {
    const content: string;
    export default content;
}
declare module "*.ogv" {
    const content: string;
    export default content;
}
declare module "*.mkv" {
    const content: string;
    export default content;
}
declare module "*.opus" {
    const content: string;
    export default content;
}
declare module "*.mpeg" {
    const content: string;
    export default content;
}
declare module "*.woff" {
    const content: string;
    export default content;
}
declare module "*.woff2" {
    const content: string;
    export default content;
}
declare module "*.ttf" {
    const content: string;
    export default content;
}
declare module "*.otf" {
    const content: string;
    export default content;
}
declare module "*.pdf" {
    const content: string;
    export default content;
}
declare module "*.json" {
    const content: { [key: string]: any };
    export default content;
}
declare module "*.jsonld" {
    const content: { [key: string]: any };
    export default content;
}
declare module "*.txt" {
    const content: string;
    export default content;
}
declare module "*.csv" {
    const content: string;
    export default content;
}
declare module "*.htm" {
    const content: string;
    export default content;
}
declare module "*.html" {
    const content: string;
    export default content;
}
declare module "*.xml" {
    const content: string;
    export default content;
}

declare module "worker:*" {
    const content: string;
    export default content;
}

declare module "*.wasm" {
    const url: string;
    export default url;
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
