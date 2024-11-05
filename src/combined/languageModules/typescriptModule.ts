import * as ts from 'typescript';

import { javascript } from '@codemirror/lang-javascript';
import { javascriptModule } from './javascriptModule';

import Code from '../ww-code';

// bind function to code cell
// capture console calls
// Redirect results to code cell output

const executeTypescript = (code: string, context: Code) => {
    // compile typescript to javascript
    const jsCode = ts.transpileModule(code, {
        compilerOptions: {
            module: ts.ModuleKind.CommonJS,
        },
        reportDiagnostics: true,
    });

    // check for errors
    if (jsCode.diagnostics && jsCode.diagnostics.length > 0) {
        jsCode.diagnostics.forEach((diagnostic) => {
            if (diagnostic.category === ts.DiagnosticCategory.Error) {
                context.results.push({
                    color: 'red',
                    text: `${ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n')}`,
                });
            } else if (diagnostic.category === ts.DiagnosticCategory.Warning) {
                context.results.push({
                    color: 'orange',
                    text: `${ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n')}`,
                });
            } else {
                context.results.push({
                    color: 'inherit',
                    text: `${ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n')}`,
                });
            }
        });
    }

    console.log(jsCode);

    // execute javascript
    javascriptModule.executionFunction(jsCode.outputText, context);
};

export const typescriptModule = {
    name: 'TS',
    executionFunction: executeTypescript,
    languageExtension: javascript({
        typescript: true,
    }),
};
