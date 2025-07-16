import { closeBrackets, closeBracketsKeymap, completionKeymap } from "@codemirror/autocomplete";
import { defaultKeymap, history, historyKeymap, indentWithTab } from "@codemirror/commands";
import { bracketMatching, foldGutter, indentOnInput } from "@codemirror/language";
import { EditorState, RangeSet, StateEffect, StateField, Transaction } from "@codemirror/state";
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
} from "@codemirror/view";
import { indentationMarkers } from "@replit/codemirror-indentation-markers";
import LockFillIcon from "../../assets/icons/lock-fill.svg";
export { EditorView } from "@codemirror/view";

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
        return icon;
    }
})();

const lockedLineDecoration = Decoration.line({
    class: "cm-locked-line",
});

export const lineLockField = StateField.define<{
    markers: RangeSet<GutterMarker>;
    decorators: RangeSet<Decoration>;
    onLockedLinesChange?: (lockedLines: number[]) => void;
}>({
    create: () => {
        const field = {
            markers: RangeSet.empty,
            decorators: RangeSet.empty,
            onLockedLinesChange: undefined as ((lockedLines: number[]) => void) | undefined,
        };
        return field;
    },

    update(state, tr) {
        let markers = state.markers.map(tr.changes);
        let decorators = state.decorators.map(tr.changes);
        let hasChanges = false;

        for (let e of tr.effects) {
            if (!e.is(lineLockEffect)) continue;
            hasChanges = true;
            const { pos, on } = e.value;
            if (on) {
                markers = markers.update({ add: [lineLockMarker.range(pos)] });
                decorators = decorators.update({ add: [lockedLineDecoration.range(pos)] });
            } else {
                markers = markers.update({ filter: (from) => from !== pos });
                decorators = decorators.update({ filter: (from) => from !== pos });
            }
        }

        const newState = { ...state, markers, decorators };

        // Call callback if there were changes and callback exists
        if (hasChanges && state.onLockedLinesChange) {
            const lockedLines: number[] = [];
            markers.between(0, tr.state.doc.length, (from) => {
                const line = tr.state.doc.lineAt(from);
                lockedLines.push(line.number);
            });
            // Use setTimeout to avoid calling during state update
            setTimeout(() => state.onLockedLinesChange?.(lockedLines), 0);
        }

        return newState;
    },

    provide: (f) => [
        gutter({
            class: "cm-lock-gutter",
            markers: (view) => view.state.field(f).markers,
            initialSpacer: () => lineLockMarker,
            domEventHandlers: {
                click(view, line) {
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

function createLockedLineProtection(inEditView: boolean) {
    if (inEditView) {
        return [];
    }

    let tooltipTimeout: number | null = null;
    let currentView: EditorView | null = null;

    return [
        lockedLineTooltipField,
        EditorView.updateListener.of((update) => {
            // Store view reference
            currentView = update.view;

            // Clear tooltip on any cursor movement or document change that isn't blocked
            if (update.selectionSet || update.docChanged) {
                if (tooltipTimeout) {
                    clearTimeout(tooltipTimeout);
                    tooltipTimeout = null;
                }
                if (update.state.field(lockedLineTooltipField, false)) {
                    update.view.dispatch({
                        effects: [hideLockedTooltipEffect.of({})],
                    });
                }
            }
        }),
        EditorState.transactionFilter.of((tr: Transaction) => {
            if (!tr.docChanged) {
                return tr;
            }

            const field = tr.startState.field(lineLockField);
            let hasLockedLineEdit = false;
            let firstLockedPos = -1;

            tr.changes.iterChanges((fromA, toA) => {
                // Check if the change affects any locked lines
                const fromLine = tr.startState.doc.lineAt(fromA);
                const toLine = tr.startState.doc.lineAt(toA);

                for (let lineNum = fromLine.number; lineNum <= toLine.number; lineNum++) {
                    const line = tr.startState.doc.line(lineNum);
                    field.markers.between(line.from, line.from, () => {
                        if (!hasLockedLineEdit) {
                            hasLockedLineEdit = true;
                            firstLockedPos = fromA;
                        }
                    });
                    if (hasLockedLineEdit) break;
                }
            });

            // If trying to edit a locked line, block the transaction and show tooltip
            if (hasLockedLineEdit) {
                setTimeout(() => {
                    if (currentView) {
                        currentView.dispatch({
                            effects: [showLockedTooltipEffect.of({ pos: firstLockedPos })],
                        });

                        // Clear any existing timeout
                        if (tooltipTimeout) clearTimeout(tooltipTimeout);

                        tooltipTimeout = window.setTimeout(() => {
                            if (currentView) {
                                currentView.dispatch({
                                    effects: [hideLockedTooltipEffect.of({})],
                                });
                            }
                            tooltipTimeout = null;
                        }, 2000);
                    }
                }, 0);

                return [];
            }

            return tr;
        }),
    ];
}

// State field for locked line tooltip
const lockedLineTooltipField = StateField.define<Tooltip | null>({
    create: () => null,

    update(tooltip, tr) {
        let newTooltip = tooltip;

        for (let effect of tr.effects) {
            if (effect.is(showLockedTooltipEffect)) {
                const pos = effect.value.pos;
                newTooltip = {
                    pos,
                    above: true,
                    create: () => {
                        const dom = document.createElement("div");
                        dom.className = "cm-locked-line-tooltip";
                        dom.textContent = "This line is locked and cannot be edited";
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

export function setupCodeMirror(
    code: string,
    parent: Element,
    inEditView: boolean,
    extensions: any[] = [],
): EditorView {
    return new EditorView({
        state: EditorState.create({
            doc: code,
            extensions: [
                lineLockField,
                createLockedLineProtection(inEditView),

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
                    ...(inEditView ? [{ key: "Mod-l", run: toggleLockKeyCommand }] : []),
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
