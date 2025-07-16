import { registerIconLibrary } from "@shoelace-style/shoelace";

import CaretDownFillIcon from "../../assets/icons/caret-down-fill.svg";
import CaretRightFillIcon from "../../assets/icons/caret-right-fill.svg";
import ExclamationCircleFillIcon from "../../assets/icons/exclamation-circle-fill.svg";
import ExclamationTriangleFillIcon from "../../assets/icons/exclamation-triangle-fill.svg";
import PlayCircleIcon from "../../assets/icons/play-circle.svg";
import PlayFillIcon from "../../assets/icons/play-fill.svg";

registerIconLibrary("default", {
    resolver: (name) =>
        ({
            "caret-down-fill": CaretDownFillIcon,
            "caret-right-fill": CaretRightFillIcon,
            "exclamation-circle-fill": ExclamationCircleFillIcon,
            "exclamation-triangle-fill": ExclamationTriangleFillIcon,
            "play-circle": PlayCircleIcon,
            "play-fill": PlayFillIcon,
        })[name]!,
});
