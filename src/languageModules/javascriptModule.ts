import { javascript } from '@codemirror/lang-javascript';

const executeJavascript = (code: string, globalExecution: Boolean) => {
    try {
        const result = scopeEval(globalExecution ? window : {}, code);

        if (result === undefined) {
            return 'No value returned';
        } else if (result === null) {
            return 'null';
        }
        return result;
    } catch (e) {
        return e;
    }
};

function scopeEval(scope: Object, code: string) {
    return Function(code).bind(scope)();
}

export const javascriptModule = {
    name: 'JavaScript',
    executionFunction: executeJavascript,
    languageExtension: javascript(),
};
