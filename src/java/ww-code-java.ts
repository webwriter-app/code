import { localized } from "@lit/localize";
import { customElement } from "lit/decorators.js";
import Code from "../shared/ww-code-template";
import { initializeJavacWorker, javaModule } from "./languageModules/javaModule";

/** Code widget for Java with compilation and execution capabilities using TeaVM (Java 21). */
@customElement("webwriter-code-java")
@localized()
export class CodeJava extends Code {
    constructor() {
        super(javaModule);
    }

    protected firstUpdated(): void {
        super.firstUpdated();
        initializeJavacWorker();
    }
}
