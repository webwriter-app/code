import '@shoelace-style/shoelace/dist/themes/light.css';
import { customElement } from 'lit/decorators.js';
import { PropertyValueMap } from 'lit';

import Code from '../shared/ww-code-template'

import { style } from '../shared/ww-code-css-single';

// CodeMirror
import { LanguageSupport } from '@codemirror/language';


// Language Modules
import { pythonModule } from './languageModules/pythonModule';

export type LanguageModule = {
    name: string;
    executionFunction: ((code: string, context: CodePython) => any) | undefined;
    languageExtension: LanguageSupport;
};

@customElement('webwriter-code-python')
export default class CodePython extends Code {
    static styles = style;

    constructor(){
        super()
        this.languages= [pythonModule];
        this.languageModule = this.languages[0]
    }


}
