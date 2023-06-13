import { html } from '@codemirror/lang-html';

const executeHTML = (code: string) => {
    return code;
};

export const htmlModule = {
    name: 'HTML',
    executionFunction: executeHTML,
    languageExtension: html(),
};
