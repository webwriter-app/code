import { registerIconLibrary } from "@shoelace-style/shoelace";

import PlayCircleIcon from "../../assets/icons/play-circle.svg";
import PlayFillIcon from "../../assets/icons/play-fill.svg";

registerIconLibrary("default", {
    resolver: (name) =>
        ({
            "play-circle": PlayCircleIcon,
            "play-fill": PlayFillIcon,
        })[name]!,
});
