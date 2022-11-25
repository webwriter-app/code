import { pythonLanguage } from "@codemirror/lang-python"
import { CompletionContext, snippetCompletion } from "@codemirror/autocomplete"
import { LanguageSupport } from '@codemirror/language';

//define the autocompletion for python
//these are probably not all the keywords
function pythonCompletions(context: CompletionContext) {
    let word = context.matchBefore(/\w*/)
    if (word?.from == word?.to && !context.explicit)
        return null
    return {
        from: word?.from,
        options: [
            { label: "match", type: "keyword" },
            { label: "case", type: "keyword" },
            { label: "class", type: "keyword" },
            { label: "def", type: "keyword" },
            { label: "for", type: "keyword" },
            { label: "if", type: "keyword" },
            { label: "lambda", type: "keyword" },
            { label: "try", type: "keyword" },
            { label: "while", type: "keyword" },
            { label: "with", type: "keyword" },
            { label: "yield", type: "keyword" },
            { label: "and", type: "keyword" },
            { label: "as", type: "keyword" },
            { label: "assert", type: "keyword" },
            { label: "break", type: "keyword" },
            { label: "continue", type: "keyword" },
            { label: "del", type: "keyword" },
            { label: "elif", type: "keyword" },
            { label: "else", type: "keyword" },
            { label: "except", type: "keyword" },
            { label: "finally", type: "keyword" },
            { label: "from", type: "keyword" },
            { label: "global", type: "keyword" },
            { label: "return", type: "keyword" },
            //this way you can add your own snippets
            snippetCompletion("range(${variable})", {
                label: "range",
                detail: "definition",
                type: "keyword"
            }),
        ]
    }
}

//currently no execution function, so return null to remove the execute button
const executePython = (code: string) => {
    return null
}

//add the autocompletion to the language function
function python() {
    return new LanguageSupport(pythonLanguage, [pythonLanguage.data.of({ autocomplete: pythonCompletions })]);
}

export const pythonModule = {
    name: "Python",
    executionFunction: executePython,
    languageExtension: python()
}
