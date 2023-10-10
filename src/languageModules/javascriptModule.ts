import { javascript } from '@codemirror/lang-javascript';
import Code from '../ww-code';

// bind function to code cell
// capture console calls
// Redirect results to code cell output


const executeJavascript = (code: string, context: Code) => {
  const oldConsole = window.console
  window.console = {
    log: (...objs: any[]) => {
      objs.forEach(obj => context.results.push(String(obj)))
    },
    info: (...objs: any[]) => {
      objs.forEach(obj => context.results.push(String(obj)))
    },
    warn: (...objs: any[]) => {
      objs.forEach(obj => context.results.push(String(obj)))
    },
    error: (...objs: any[]) => {
      objs.forEach(obj => context.results.push(String(obj)))
    },
    trace: (...objs: any[]) => {
      objs.forEach(obj => context.results.push(String(obj)))
    },
    table: (...objs: any[]) => {
      objs.forEach(obj => context.results.push(String(obj)))
    },
    assert: (assertion: boolean, ...objs: any[]) => {
      assertion && objs.forEach(obj => context.results.push(String(obj)))
    },
    clear: () => {},
    count: () => {},
    countReset: () => {},
    debug: (...objs: any[]) => {
      objs.forEach(obj => context.results.push(String(obj)))
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
    Console: window.console.Console
  }
  try {
    const result = scopedEval(code, context)
    context.results.push(result)
    return result
  } catch (e) {
      context.results.push(String(e))
      return e;
  } finally {
    window.console = oldConsole
  }
}

function scopedEval(code: string, context: Code) {
    return Function(code)(context);
}

export const javascriptModule = {
    name: 'JS',
    executionFunction: executeJavascript,
    languageExtension: javascript(),
};
