import { EditorView, Decoration, DecorationSet } from "@codemirror/view"
import { StateField, StateEffect } from "@codemirror/state"

const addHighlight = StateEffect.define<{ from: number, to: number }>({
    map: ({ from, to }, change) => ({ from: change.mapPos(from), to: change.mapPos(to) })
})


const highlightField = StateField.define<DecorationSet>({
    create() {
        return Decoration.none
    },
    update(highlights, tr) {
        highlights = highlights.map(tr.changes)
        for (let e of tr.effects) {
            if (e.is(addHighlight)) {
                highlights = highlights.update({
                    add: [highlightMark.range(e.value.from, e.value.to)]
                })
            }
        }
        return highlights
    },
    provide: f => EditorView.decorations.from(f)
})

const highlightMark = Decoration.mark({ class: "cm-underline" })

const highlightTheme = EditorView.baseTheme({
    ".cm-underline": { background: "#80808050" }
})

export function highlightSelection(view: EditorView, lines: Array<any>) {
    let effects: StateEffect<any>[];
    effects = lines.map(({ from, to }) => addHighlight.of({ from, to }))

    if (!view.state.field(highlightField, false))
        effects.push(StateEffect.appendConfig.of([
            highlightField,
            highlightTheme,
        ]))
    view.dispatch({ effects })
    return true
}
