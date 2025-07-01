import { Line, RangeSet, StateEffect, StateField } from "@codemirror/state";
import { EditorView, GutterMarker, gutter } from "@codemirror/view";

export default function CustomGutter(
    name: String,
    marker: GutterMarker,
    callback: (view: EditorView, pos: number) => void,
) {
    const effect = StateEffect.define<{ pos: number; on: boolean }>({
        map: (val, mapping) => ({ pos: mapping.mapPos(val.pos), on: val.on }),
    });

    const state = StateField.define<RangeSet<GutterMarker>>({
        create() {
            return RangeSet.empty;
        },
        update(set, transaction) {
            set = set.map(transaction.changes);
            for (let e of transaction.effects) {
                if (e.is(effect)) {
                    if (e.value.on) set = set.update({ add: [marker.range(e.value.pos)] });
                    else set = set.update({ filter: (from) => from != e.value.pos });
                }
            }
            return set;
        },
    });

    let markerPositions = new Set<number>();
    let tempMarkerPositions = new Set<number>();
    let lastLine: Line;

    function toggleGutter(view: EditorView, pos: number) {
        let gutters = view.state.field(state);
        let hasGutter = false;
        gutters.between(pos, pos, () => {
            hasGutter = true;
        });

        view.dispatch({
            effects: effect.of({ pos, on: !hasGutter }),
        });
    }

    return {
        effect: effect,
        state: state,
        gutter: [
            state,
            gutter({
                class: `cm-${name}-gutter`,
                markers: (v) => v.state.field(state),
                initialSpacer: () => marker,
                domEventHandlers: {
                    mousedown(view, line) {
                        if (callback) {
                            callback(view, line.from);
                        } else {
                            toggleGutter(view, line.from);
                        }
                        return true;
                    },
                },
            }),
        ],
    };
}
