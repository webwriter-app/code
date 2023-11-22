import Code from '../ww-code';

//Import WebAssembly from code mirror for syntax highlighting
import { wast } from '@codemirror/lang-wast';

// bind function to code cell
// capture console calls
// Redirect results to code cell output

const executeWebassembly = (code: string, context: Code) => {
    return undefined;
};

export const webassemblyModule = {
    name: 'WebAssembly',
    executionFunction: undefined,
    languageExtension: wast(),
};
