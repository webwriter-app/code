import BiwaScheme from "biwascheme";
import { replyWithResult } from "../shared/run-worker";

replyWithResult(async ({ code }: { code: string }) => {
    let output = "";
    const port = new BiwaScheme.Port.CustomOutput((text) => {
        output += text;
    });
    BiwaScheme.Port.current_input = new BiwaScheme.Port.NullInput();
    BiwaScheme.Port.current_output = port;
    BiwaScheme.Port.current_error = port;
    const result = await new Promise<unknown>((resolve, reject) => {
        new BiwaScheme.Interpreter(reject).evaluate(code, resolve);
    });
    if (result !== BiwaScheme.undef) {
        return output + (output && !output.endsWith("\n") ? "\n" : "") + BiwaScheme.to_write(result);
    }
    return output;
});
