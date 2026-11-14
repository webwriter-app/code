import { closeBrackets, closeBracketsKeymap, completionKeymap } from "@codemirror/autocomplete";
import { defaultKeymap, history, historyKeymap, indentWithTab } from "@codemirror/commands";
import { bracketMatching, foldGutter, HighlightStyle, indentOnInput, syntaxHighlighting } from "@codemirror/language";
import { Annotation, EditorState, Facet, RangeSet, StateEffect, StateField } from "@codemirror/state";
import { color, oneDarkHighlightStyle } from "@codemirror/theme-one-dark";
import {
    crosshairCursor,
    Decoration,
    drawSelection,
    dropCursor,
    EditorView,
    gutter,
    GutterMarker,
    highlightActiveLine,
    highlightActiveLineGutter,
    highlightSpecialChars,
    keymap,
    lineNumbers,
    rectangularSelection,
    showTooltip,
    Tooltip,
    ViewPlugin,
} from "@codemirror/view";
import { tags } from "@lezer/highlight";
import { indentationMarkers } from "@replit/codemirror-indentation-markers";
import LockFillIcon from "../../assets/icons/lock-fill.svg";
export { EditorView } from "@codemirror/view";

const canLockLines = Facet.define<() => boolean, () => boolean>({ combine: (values) => values[0] ?? (() => false) });

export const hostUpdate = Annotation.define<boolean>();

export const lineLockEffect = StateEffect.define<{ pos: number; on: boolean }>({
    map: (val, mapping) => ({ pos: mapping.mapPos(val.pos), on: val.on }),
});

export const showLockedTooltipEffect = StateEffect.define<{ pos: number }>({
    map: (val, mapping) => ({ pos: mapping.mapPos(val.pos) }),
});
export const hideLockedTooltipEffect = StateEffect.define<{}>({});

const lineLockMarker = new (class extends GutterMarker {
    toDOM() {
        const icon = document.createElement("img");
        icon.src = LockFillIcon;
        icon.alt = "";
        return icon;
    }
})();

const lockedLineDecoration = Decoration.line({
    class: "cm-locked-line",
});

export const lineLockField = StateField.define<{
    markers: RangeSet<GutterMarker>;
    decorators: RangeSet<Decoration>;
}>({
    create: () => ({ markers: RangeSet.empty, decorators: RangeSet.empty }),

    update(state, tr) {
        let markers = state.markers.map(tr.changes);
        let decorators = state.decorators.map(tr.changes);
        for (const effect of tr.effects) {
            if (!effect.is(lineLockEffect)) continue;
            const { pos, on } = effect.value;
            if (on) {
                markers = markers.update({ add: [lineLockMarker.range(pos)] });
                decorators = decorators.update({ add: [lockedLineDecoration.range(pos)] });
            } else {
                markers = markers.update({ filter: (from) => from !== pos });
                decorators = decorators.update({ filter: (from) => from !== pos });
            }
        }
        return { markers, decorators };
    },

    provide: (f) => [
        gutter({
            class: "cm-lock-gutter",
            markers: (view) => view.state.field(f).markers,
            initialSpacer: () => lineLockMarker,
            domEventHandlers: {
                click(view, line) {
                    if (!view.state.facet(canLockLines)()) return false;
                    let locked = false;
                    view.state.field(f).markers.between(line.from, line.from, () => {
                        locked = true;
                    });
                    view.dispatch({
                        effects: lineLockEffect.of({ pos: line.from, on: !locked }),
                    });
                    return true;
                },
            },
        }),
        EditorView.decorations.from(f, (s) => s.decorators),
    ],
});

function getEffectiveLineRange(state: EditorState): { from: number; to: number } {
    let { from, to } = state.selection.main;

    if (from === to) {
        const line = state.doc.lineAt(from);
        return { from: line.number, to: line.number };
    }

    let fromLine = state.doc.lineAt(from);
    let toLine = state.doc.lineAt(to);

    if (to === toLine.from && to > from) {
        if (toLine.number > 1) {
            toLine = state.doc.line(toLine.number - 1);
        }
    }
    if (from === fromLine.to && from < to) {
        if (fromLine.number < state.doc.lines) {
            fromLine = state.doc.line(fromLine.number + 1);
        }
    }

    if (fromLine.number > toLine.number) {
        const originalFromLine = state.doc.lineAt(state.selection.main.from);
        return { from: originalFromLine.number, to: originalFromLine.number };
    }

    return { from: fromLine.number, to: toLine.number };
}

function toggleLockKeyCommand(view: EditorView): boolean {
    const { state } = view;
    const field = state.field(lineLockField);

    const lineStates = new Map<number, boolean>();

    // TODO: Handle all selected lines, not just the main selection
    const { from: startLine, to: endLine } = getEffectiveLineRange(state);
    for (let lineNumber = startLine; lineNumber <= endLine; lineNumber++) {
        const line = state.doc.line(lineNumber);
        let locked = false;
        field.markers.between(line.from, line.from, () => {
            locked = true;
        });
        lineStates.set(lineNumber, locked);
    }

    let effects: any[] = [];

    // Check if there are any non-locked lines
    const unlockedLines = Array.from(lineStates.entries()).filter(([_, locked]) => !locked);
    if (unlockedLines.length === 0) {
        // If all selected lines are locked, unlock all of them
        effects = Array.from(lineStates.entries()).map(([lineNumber]) =>
            lineLockEffect.of({ pos: state.doc.line(lineNumber).from, on: false }),
        );
    } else {
        // If there are any unlocked lines, lock them
        effects = unlockedLines.map(([lineNumber]) =>
            lineLockEffect.of({ pos: state.doc.line(lineNumber).from, on: true }),
        );
    }

    if (effects.length > 0)
        view.dispatch({
            effects,
        });
    return true;
}

export function lockedLineNumbers(state: EditorState) {
    const lines = new Set<number>();
    state.field(lineLockField).markers.between(0, state.doc.length, (from) => {
        lines.add(state.doc.lineAt(from).number);
    });
    return [...lines];
}

export function editingMode(inEditView: boolean) {
    return inEditView ? [EditorView.editorAttributes.of({ class: "cm-author-mode" })] : [];
}

function createLockedLineProtection(inEditView: () => boolean, getLocalizedMessage: () => string) {
    let currentView: EditorView | undefined;
    let showTimeout: ReturnType<typeof setTimeout> | undefined;
    let hideTimeout: ReturnType<typeof setTimeout> | undefined;

    const tooltipField = createLockedLineTooltipField(getLocalizedMessage);

    return [
        tooltipField,
        ViewPlugin.define((view) => {
            currentView = view;
            return {
                destroy() {
                    clearTimeout(showTimeout);
                    clearTimeout(hideTimeout);
                    currentView = undefined;
                },
            };
        }),
        EditorState.transactionFilter.of((tr) => {
            const clear = () => {
                clearTimeout(showTimeout);
                clearTimeout(hideTimeout);
            };
            if (inEditView() || !tr.docChanged) return tr;

            const { markers } = tr.startState.field(lineLockField);
            let firstLockedPos: number | undefined;
            tr.changes.iterChangedRanges((from, to) => {
                if (firstLockedPos !== undefined) return;
                const first = tr.startState.doc.lineAt(from);
                const last = tr.startState.doc.lineAt(to);
                markers.between(first.from, last.to, () => {
                    firstLockedPos = from;
                });
            });

            if (firstLockedPos === undefined) return tr;
            const pos = firstLockedPos;
            clear();
            showTimeout = setTimeout(() => {
                if (!currentView || inEditView()) return;
                currentView.dispatch({
                    effects: showLockedTooltipEffect.of({ pos: Math.min(pos, currentView.state.doc.length) }),
                });
                hideTimeout = setTimeout(
                    () => currentView?.dispatch({ effects: hideLockedTooltipEffect.of({}) }),
                    2000,
                );
            }, 0);
            return [];
        }),
    ];
}

function createLockedLineTooltipField(getLocalizedMessage: () => string) {
    return StateField.define<Tooltip | null>({
        create: () => null,

        update(tooltip, tr) {
            let newTooltip = tr.docChanged || tr.selection ? null : tooltip;

            for (let effect of tr.effects) {
                if (effect.is(showLockedTooltipEffect)) {
                    const pos = effect.value.pos;
                    newTooltip = {
                        pos,
                        above: true,
                        create: () => {
                            const dom = document.createElement("div");
                            dom.className = "cm-locked-line-tooltip";
                            dom.textContent = getLocalizedMessage();
                            return { dom };
                        },
                    };
                } else if (effect.is(hideLockedTooltipEffect)) {
                    newTooltip = null;
                }
            }

            return newTooltip;
        },

        provide: (f) => showTooltip.from(f),
    });
}

// State field for locked line tooltip
// Replace the default 'chalky' color to be 'violet' instead
const customHighlightStyle = HighlightStyle.define([
    {
        tag: [
            tags.typeName,
            tags.className,
            tags.number,
            tags.changed,
            tags.annotation,
            tags.modifier,
            tags.self,
            tags.namespace,
        ],
        color: color.violet,
    },
]);

export function setupCodeMirror(
    code: string,
    parent: Element,
    inEditView: () => boolean,
    extensions: any[] = [],
    getLocalizedMessage: () => string,
): EditorView {
    return new EditorView({
        state: EditorState.create({
            doc: code,
            extensions: [
                lineLockField,
                canLockLines.of(inEditView),
                createLockedLineProtection(inEditView, getLocalizedMessage),
                syntaxHighlighting(customHighlightStyle),
                syntaxHighlighting(oneDarkHighlightStyle),
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
                keymap.of([
                    { key: "Mod-l", run: (view) => inEditView() && toggleLockKeyCommand(view) },
                    ...closeBracketsKeymap,
                    ...defaultKeymap,
                    ...historyKeymap,
                    ...completionKeymap,
                    indentWithTab,
                ]),
                ...extensions,
            ],
        }),
        parent,
    });
}
