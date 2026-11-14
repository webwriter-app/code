import prolog from "tau-prolog";
import lists from "tau-prolog/modules/lists.js";
import { replyWithResult } from "../shared/run-worker";

lists(prolog);

replyWithResult(async ({ code, goal }: { code: string; goal: string }) => {
    const session = prolog.create(100_000);
    const answers: { text: string }[] = [];
    let output = "";
    session.streams.user_input.stream = {
        get: () => "end_of_stream",
        eof: () => true,
    };
    const outputStream = {
        put(text: string) {
            output += text;
            return true;
        },
        flush() {
            return true;
        },
    };
    session.streams.user_output.stream = outputStream;
    session.streams.user_error.stream = outputStream;
    const rejectTerm = (reject: (reason: Error) => void) => (term: unknown) =>
        reject(new Error(session.format_answer(term)));
    await new Promise<void>((resolve, reject) =>
        session.consult(code, {
            file: false,
            script: false,
            url: false,
            html: false,
            success: resolve,
            error: rejectTerm(reject),
        }),
    );
    await new Promise<void>((resolve, reject) =>
        session.query(goal.endsWith(".") ? goal : goal + ".", {
            success: resolve,
            error: rejectTerm(reject),
        }),
    );

    await new Promise<void>((resolve, reject) => {
        const next = () =>
            session.answer({
                success: (answer) => {
                    if (answers.length === 100) {
                        answers.push({ text: "Only the first 100 answers are shown." });
                        resolve();
                    } else {
                        answers.push({ text: session.format_answer(answer) + "." });
                        next();
                    }
                },
                fail: () => {
                    if (answers.length === 0) answers.push({ text: "false." });
                    resolve();
                },
                limit: () => {
                    answers.push({ text: "Prolog reached its resolution limit." });
                    resolve();
                },
                error: rejectTerm(reject),
            });
        next();
    });
    if (output) answers.unshift({ text: output });
    return answers;
});
