import { javascript } from '@codemirror/lang-javascript';
import Code from '../ww-code';

// bind function to code cell
// capture console calls
// Redirect results to code cell output

const executeJavascript = (code: string, context: Code) => {
    const oldConsole = window.console;
    window.console = {
        log: (...objs: any[]) => {
            objs.forEach((obj) => context.results.push({ color: 'inherit', text: String(obj) }));
        },
        info: (...objs: any[]) => {
            objs.forEach((obj) => context.results.push({ color: 'inherit', text: String(obj) }));
        },
        warn: (...objs: any[]) => {
            objs.forEach((obj) => context.results.push({ color: 'orange', text: String(obj) }));
        },
        error: (...objs: any[]) => {
            objs.forEach((obj) => context.results.push({ color: 'red', text: String(obj) }));
        },
        trace: (...objs: any[]) => {
            objs.forEach((obj) => context.results.push({ color: 'inherit', text: String(obj) }));
        },
        table: (...objs: any[]) => {
            objs.forEach((obj) => context.results.push({ color: 'inherit', text: String(obj) }));
        },
        assert: (assertion: boolean, ...objs: any[]) => {
            assertion && objs.forEach((obj) => context.results.push({ color: 'inherit', text: String(obj) }));
        },
        clear: () => {},
        count: () => {},
        countReset: () => {},
        debug: (...objs: any[]) => {
            objs.forEach((obj) => context.results.push({ color: 'inherit', text: String(obj) }));
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
        const result = context.globalExecution ? unScopeEval(code) : scopedEval(code, context);
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
          .map((line) => `"${line}"`)
          .join(',')}];
      return eval(codeToExecute.join("\\n"));
    `)();
}

function unScopeEval(code: string) {
    return eval(code);
}

export const javascriptModule = {
    name: 'JS',
    executionFunction: executeJavascript,
    languageExtension: javascript(),
};
