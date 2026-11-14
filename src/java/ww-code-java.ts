import { execute } from "./languageModules/javaModule";
import { offlineRuntimeAssets } from "../shared/runtime-assets";
import { javaAssets } from "./java-assets";
import { java } from "@codemirror/lang-java";
import { customElement } from "lit/decorators.js";
import Code from "../shared/ww-code-template";

/** Code widget for Java with compilation and execution capabilities using TeaVM (Java 21). */
@customElement("webwriter-code-java")
export class CodeJava extends Code {
    static offlineAssets(element: Element) {
        return offlineRuntimeAssets(element, javaAssets);
    }

    constructor() {
        super({
            name: "Java",
            languageExtension: java(),
            execute,
        });
    }
}
