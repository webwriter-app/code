import { GutterMarker } from "@codemirror/view";

/*
 * This is a custom gutter marker that displays a lock icon.
 * It is used to indicate that a line is read-only.
 */
export default class LockMarker extends GutterMarker {
    toDOM() {
        let icon = document.createElement("sl-icon");
        icon.name = "lock";
        return icon;
    }
}
