import { pythonLanguage } from '@codemirror/lang-python';
import { CompletionContext, snippetCompletion } from '@codemirror/autocomplete';
import { LanguageSupport } from '@codemirror/language';
import Code from '../ww-code';
import workerurl from './pyWorker'

const pyodideWorker: Worker = new Worker(workerurl, {type: "classic"})

const callbacks: object = {};

pyodideWorker.onmessage = (event) => {
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
      pyodideWorker.postMessage({
        ...context,
        python: script,
        id,
      });
    });
  };
})();

//define the autocompletion for python
//these are probably not all the keywords
function pythonCompletions(context: CompletionContext) {
    let word = context.matchBefore(/\w*/);
    if (word?.from == word?.to && !context.explicit) return null;
    return {
        from: word?.from,
        options: [
            { label: 'match', type: 'keyword' },
            { label: 'case', type: 'keyword' },
            { label: 'class', type: 'keyword' },
            { label: 'def', type: 'keyword' },
            { label: 'for', type: 'keyword' },
            { label: 'if', type: 'keyword' },
            { label: 'lambda', type: 'keyword' },
            { label: 'try', type: 'keyword' },
            { label: 'while', type: 'keyword' },
            { label: 'with', type: 'keyword' },
            { label: 'yield', type: 'keyword' },
            { label: 'and', type: 'keyword' },
            { label: 'as', type: 'keyword' },
            { label: 'assert', type: 'keyword' },
            { label: 'break', type: 'keyword' },
            { label: 'continue', type: 'keyword' },
            { label: 'del', type: 'keyword' },
            { label: 'elif', type: 'keyword' },
            { label: 'else', type: 'keyword' },
            { label: 'except', type: 'keyword' },
            { label: 'finally', type: 'keyword' },
            { label: 'from', type: 'keyword' },
            { label: 'global', type: 'keyword' },
            { label: 'return', type: 'keyword' },
            //this way you can add your own snippets
            snippetCompletion('range(${variable})', {
                label: 'range',
                detail: 'definition',
                type: 'keyword',
            }),
        ],
    };
}

const executePython = async (code: string, context: Code) => {

    let res: object = await asyncRun(code, "undefiend") as object

    if(typeof res["error"] != "undefined"){
        let errText: string = "File "+res["error"].split("File").pop()
        context.results.push({text: errText, color: "red"})
    }else{
        context.results.push({text: res["results"], color: "0x0000"})  
    }
    // console.log(res)
    return "res"

};

//add the autocompletion to the language function
function python() {
    return new LanguageSupport(pythonLanguage, [pythonLanguage.data.of({ autocomplete: pythonCompletions })]);
}

export const pythonModule = {
    name: 'Python',
    executionFunction: executePython,
    languageExtension: python(),
};
