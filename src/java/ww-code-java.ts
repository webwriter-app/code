import { localized } from "@lit/localize";
import { customElement } from "lit/decorators.js";
import Code from "../shared/ww-code-template";
import { initializeJavacWorker, javaModule } from "./languageModules/javaModule";

@customElement("webwriter-code-java")
@localized()
export class CodeJava extends Code {
    constructor() {
        super();
        this.languageModule = javaModule;
        this.languages = [this.languageModule];
    }

    firstUpdated(): void {
        super.firstUpdated();
        initializeJavacWorker();
    }
}
