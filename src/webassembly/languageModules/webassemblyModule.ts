import Code from '../ww-code-webassembly';

//Import WebAssembly from code mirror for syntax highlighting
import { wast } from '@codemirror/lang-wast';
import { WABT } from "./libwabt";
// bind function to code cell
// capture console calls
// Redirect results to code cell output

const wabt = await WABT()

const executeWebassembly = (code: string, context: Code) => {
    try {
        let file = wabt.parseWat("file.wasm", code)
        let binary = file.toBinary({log: true})
        console.log(binary.log)
        let wasm = new WebAssembly.Module(binary.buffer)
        let instance = new WebAssembly.Instance(wasm, {})
        let { main } = instance.exports
        var res = main()
    } catch (e) {
        context.results.push({text: e.message, color: "red"})
        return undefined        
    }
    context.results.push({text: res, color: "0x000000"})
    return res

    return undefined;
};

export const webassemblyModule = {
    name: 'WebAssembly',
    executionFunction: executeWebassembly,
    languageExtension: wast(),
};
