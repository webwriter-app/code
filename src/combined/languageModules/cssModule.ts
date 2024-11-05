import { css } from '@codemirror/lang-css';
import Code from '../ww-code';

const executeCSS = (code: string, context: Code) => {
  context.results.push(code)
  return code;
};

export const cssModule = {
    name: 'CSS',
    executionFunction: undefined,
    languageExtension: css(),
};
