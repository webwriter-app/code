import { EditorView, Decoration, DecorationSet } from "@codemirror/view"
import { StateField, StateEffect, Compartment } from "@codemirror/state"

const addUnderline = StateEffect.define<{ from: number, to: number }>({
    map: ({ from, to }, change) => ({ from: change.mapPos(from), to: change.mapPos(to) })
})

const removeUnderline = StateEffect.define<{ from: number, to: number }>({
    map: ({ from, to }, change) => ({ from: change.mapPos(from), to: change.mapPos(to) })
})

const underlineField = StateField.define<DecorationSet>({
    create() {
        return Decoration.none
    },
    update(underlines, tr) {
        underlines = underlines.map(tr.changes)
        for (let e of tr.effects) {
            if (e.is(addUnderline)) {
                underlines = underlines.update({
                    add: [underlineMark.range(e.value.from, e.value.to)]
                })
            } else if (e.is(removeUnderline)) {
                underlines = underlines.update({
                    add: [noUnderlineMark.range(e.value.from, e.value.to)]
                })
            }
        }
        return underlines
    },
    provide: f => EditorView.decorations.from(f)
})

const underlineMark = Decoration.mark({ class: "cm-underline" })

const underlineTheme = EditorView.baseTheme({
    ".cm-underline": { background: "#80808050" }
})

const noUnderlineTheme = EditorView.baseTheme({
    ".cm-underline": { background: "none" }
})

const noUnderlineMark = Decoration.mark({ noUnderlineTheme })

export function underlineSelection(view: EditorView, lines: Array<any>, underline: Boolean) {
    let effects: StateEffect<any>[];
    const test = new Compartment();
    if (underline) {
        effects = lines.map(({ from, to }) => addUnderline.of({ from, to }))
    } else {
        effects = lines.map(({ from, to }) => removeUnderline.of({ from, to }))
    }
    if (!view.state.field(underlineField, false))
        effects.push(StateEffect.appendConfig.of([
            underlineField,
            underlineTheme,
            noUnderlineTheme
        ]))
    view.dispatch({ effects })
    return true
}
