import { Bash } from "just-bash/browser";
import { replyWithResult } from "../shared/run-worker";

replyWithResult(async ({ code }: { code: string }) => {
    const { stdout, stderr, exitCode } = await new Bash().exec(code);
    return stdout + stderr + (exitCode ? `\nProcess exited with status ${exitCode}` : "");
});
