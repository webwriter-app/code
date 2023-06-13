import { css } from '@codemirror/lang-css';

const executeCSS = (code: string) => {
    return code;
};

export const cssModule = {
    name: 'CSS',
    executionFunction: executeCSS,
    languageExtension: css(),
};
