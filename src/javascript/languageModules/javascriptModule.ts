import { javascript } from "@codemirror/lang-javascript";
import Code from "../ww-code-javascript";
import workerurl from "./jsWorker";

// bind function to code cell
// capture console calls
// Redirect results to code cell output

const javascriptWorker: Worker = new Worker(workerurl, { type: "classic" });

const callbacks: object = {};

javascriptWorker.onmessage = (event) => {
    const { id, ...data } = event.data;
    const onSuccess = callbacks[id];
    delete callbacks[id];
    onSuccess(data);
};

const asyncRun = (() => {
    let id = 0;
    return (script: any, context: any) => {
        id = (id + 1) % Number.MAX_SAFE_INTEGER;
        return new Promise((onSuccess) => {
            callbacks[id] = onSuccess;
            javascriptWorker.postMessage({
                ...context,
                code: script,
                id,
            });
        });
    };
})();

const executeJavascript = async (code: string, context: Code) => {
    const oldConsole = window.console;
    window.console = customConsole(context);
    try {
        const result = context.globalExecution ? unScopeEval(code, context) : await asyncRun(code, "undefined");

        context.globalExecution
            ? {}
            : JSON.parse(result["results"]).forEach((entry) => {
                  if (!context.results.includes(entry)) {
                      context.results.push(entry);
                  }
              });
        return result;
    } catch (e) {
        context.results.push({ color: "red", text: e.message });
        return e;
    } finally {
        window.console = oldConsole;
    }

    context.results = [...context.results];
};

function scopedEval(code: string, context: Code) {
    return Function(`
      const codeToExecute = [${code
          .split("\n")
          .map((line) => `'${line.replace(/\\/g, "\\\\").replace(/'/g, "\\'")}'`)
          .join(",")}];
      return eval(codeToExecute.join("\\n"));
    `)();
}

function unScopeEval(code: string, context: Code) {
    const st = document.createElement("script");
    st.innerHTML = code;

    if (context.runAsModule) {
        st.type = "module";
    }

    document.body.appendChild(st);
    document.body.removeChild(st);

    return undefined;
}

export const javascriptModule = {
    name: "JS",
    executionFunction: executeJavascript,
    languageExtension: javascript(),
};

function customConsole(context: Code) {
    return {
        log: (...objs: any[]) => {
            objs.forEach((obj) =>
                context.results.push({
                    color: "inherit",
                    text: typeof obj === "string" ? String(obj) : JSON.stringify(obj),
                }),
            );
        },
        info: (...objs: any[]) => {
            objs.forEach((obj) =>
                context.results.push({
                    color: "inherit",
                    text: typeof obj === "string" ? String(obj) : JSON.stringify(obj),
                }),
            );
        },
        warn: (...objs: any[]) => {
            objs.forEach((obj) =>
                context.results.push({
                    color: "orange",
                    text: typeof obj === "string" ? String(obj) : JSON.stringify(obj),
                }),
            );
        },
        error: (...objs: any[]) => {
            objs.forEach((obj) =>
                context.results.push({
                    color: "red",
                    text: typeof obj === "string" ? String(obj) : JSON.stringify(obj),
                }),
            );
        },
        trace: (...objs: any[]) => {
            objs.forEach((obj) =>
                context.results.push({
                    color: "inherit",
                    text: typeof obj === "string" ? String(obj) : JSON.stringify(obj),
                }),
            );
        },
        table: (...objs: any[]) => {
            objs.forEach((obj) =>
                context.results.push({
                    color: "inherit",
                    text: typeof obj === "string" ? String(obj) : JSON.stringify(obj),
                }),
            );
        },
        assert: (assertion: boolean, ...objs: any[]) => {
            assertion &&
                objs.forEach((obj) =>
                    context.results.push({
                        color: "inherit",
                        text: typeof obj === "string" ? String(obj) : JSON.stringify(obj),
                    }),
                );
        },
        clear: () => {},
        count: () => {},
        countReset: () => {},
        debug: (...objs: any[]) => {
            objs.forEach((obj) =>
                context.results.push({
                    color: "inherit",
                    text: typeof obj === "string" ? String(obj) : JSON.stringify(obj),
                }),
            );
        },
        dir: () => {},
        dirxml: () => {},
        group: () => {},
        groupCollapsed: () => {},
        groupEnd: () => {},
        profile: () => {},
        profileEnd: () => {},
        time: () => {},
        timeEnd: () => {},
        timeLog: () => {},
        timeStamp: () => {},
        Console: window.console.Console,
    };
}
