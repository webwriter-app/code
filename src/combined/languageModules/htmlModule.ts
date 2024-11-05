import { html } from '@codemirror/lang-html';
import Code from '../ww-code';

const executeHTML = (code: string, context: Code) => {
  context.results.push(code)
  return code;
};

export const htmlModule = {
    name: 'HTML',
    executionFunction: executeHTML,
    languageExtension: html(),
};
