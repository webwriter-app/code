import { javascript } from '@codemirror/lang-javascript';
import Code from '../ww-code';

// bind function to code cell
// capture console calls
// Redirect results to code cell output

const executeJavascript = (code: string, context: Code) => {
    const oldConsole = window.console;
    window.console = {
        log: (...objs: any[]) => {
            objs.forEach((obj) =>
                context.results.push({
                    color: 'inherit',
                    text: typeof obj === 'string' ? String(obj) : JSON.stringify(obj),
                })
            );
        },
        info: (...objs: any[]) => {
            objs.forEach((obj) =>
                context.results.push({
                    color: 'inherit',
                    text: typeof obj === 'string' ? String(obj) : JSON.stringify(obj),
                })
            );
        },
        warn: (...objs: any[]) => {
            objs.forEach((obj) =>
                context.results.push({
                    color: 'orange',
                    text: typeof obj === 'string' ? String(obj) : JSON.stringify(obj),
                })
            );
        },
        error: (...objs: any[]) => {
            objs.forEach((obj) =>
                context.results.push({
                    color: 'red',
                    text: typeof obj === 'string' ? String(obj) : JSON.stringify(obj),
                })
            );
        },
        trace: (...objs: any[]) => {
            objs.forEach((obj) =>
                context.results.push({
                    color: 'inherit',
                    text: typeof obj === 'string' ? String(obj) : JSON.stringify(obj),
                })
            );
        },
        table: (...objs: any[]) => {
            objs.forEach((obj) =>
                context.results.push({
                    color: 'inherit',
                    text: typeof obj === 'string' ? String(obj) : JSON.stringify(obj),
                })
            );
        },
        assert: (assertion: boolean, ...objs: any[]) => {
            assertion &&
                objs.forEach((obj) =>
                    context.results.push({
                        color: 'inherit',
                        text: typeof obj === 'string' ? String(obj) : JSON.stringify(obj),
                    })
                );
        },
        clear: () => {},
        count: () => {},
        countReset: () => {},
        debug: (...objs: any[]) => {
            objs.forEach((obj) =>
                context.results.push({
                    color: 'inherit',
                    text: typeof obj === 'string' ? String(obj) : JSON.stringify(obj),
                })
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
    try {
        const result = context.globalExecution ? unScopeEval(code, context) : scopedEval(code, context);
        context.results.push({ color: 'inherit', text: result });
        return result;
    } catch (e) {
        context.results.push({ color: 'red', text: e.message });
        return e;
    } finally {
        window.console = oldConsole;
    }

    context.results = [...context.results];
};

function scopedEval(code: string, context: Code) {
    return Function(`
      const codeToExecute = [${code
          .split('\n')
          .map((line) => `'${line.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`)
          .join(',')}];
      return eval(codeToExecute.join("\\n"));
    `)();
}

function unScopeEval(code: string, context: Code) {
    const st = document.createElement('script');
    st.innerHTML = code;

    document.body.appendChild(st);
    document.body.removeChild(st);

    //     //TODO this is a hacky way to do this, but it works for now

    //     let functionString = `const codeToExecute = [${code
    //         .split('\n')
    //         .map((line) => `'${line.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`)
    //         .join(',')}];
    //     return eval(codeToExecute.join("\\n"));
    //   `;

    //     //replace function definitions with globalThis.functionName = function() {}
    //     //and remove leading let, const, var if it exists
    //     functionString = functionString.replace(/(let|const|var)\s+(\w+)\s*=\s*function/g, 'globalThis.$2 = function');

    //     //replace function definitions with globalThis.functionName = function() {}
    //     functionString = functionString.replace(/function\s+(\w+)\s*\(/g, 'globalThis.$1 = function(');

    //     // console.log(functionString);

    // return Function(functionString).bind(window.globalThis)();
    return undefined;
}

export const javascriptModule = {
    name: 'JS',
    executionFunction: executeJavascript,
    languageExtension: javascript(),
};
