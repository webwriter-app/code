import { localized } from "@lit/localize";
import { customElement } from "lit/decorators.js";
import Code from "../shared/ww-code-template";
import { webassemblyModule } from "./languageModules/webassemblyModule";

@customElement("webwriter-code-webassembly")
@localized()
export default class CodeHTML extends Code {
    constructor() {
        super();
        this.languages = [webassemblyModule];
        this.languageModule = this.languages[0];
    }
}
