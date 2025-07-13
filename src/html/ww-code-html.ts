import { localized } from "@lit/localize";
import { customElement } from "lit/decorators.js";
import Code from "../shared/ww-code-template";
import { htmlModule } from "./languageModules/htmlModule";

@customElement("webwriter-code-html")
@localized()
export default class CodeHTML extends Code {
    constructor() {
        super();
        this.languages = [htmlModule];
        this.languageModule = this.languages[0];
    }
}
