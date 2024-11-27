import { lineNumbers, highlightActiveLineGutter, highlightSpecialChars, drawSelection, dropCursor, rectangularSelection, crosshairCursor, highlightActiveLine, keymap } from '@codemirror/view';
export { EditorView } from '@codemirror/view';
import { EditorState } from '@codemirror/state';
import { foldGutter, indentOnInput, bracketMatching } from '@codemirror/language';
import { history, defaultKeymap, historyKeymap, indentWithTab } from '@codemirror/commands';
import { highlightSelectionMatches, searchKeymap } from '@codemirror/search';
import { closeBrackets, closeBracketsKeymap, completionKeymap } from '@codemirror/autocomplete';
//import { lintKeymap } from '@codemirror/lint';
import { indentationMarkers } from '@replit/codemirror-indentation-markers';

export const basicSetup = /*@__PURE__*/(() => [
    indentationMarkers(),
    lineNumbers(),
    highlightActiveLineGutter(),
    highlightSpecialChars(),
    history(),
    foldGutter(),
    drawSelection(),
    dropCursor(),
    EditorState.allowMultipleSelections.of(true),
    indentOnInput(),
    bracketMatching(),
    closeBrackets(),
    rectangularSelection(),
    crosshairCursor(),
    highlightActiveLine(),
    highlightSelectionMatches(),
    keymap.of([
        ...closeBracketsKeymap,
        ...defaultKeymap,
        ...searchKeymap,
        ...historyKeymap,
        //...foldKeymap, keymap doesn't work for me
        ...completionKeymap,
        //...lintKeymap, no linter implemented yet
        indentWithTab
    ])
])();


