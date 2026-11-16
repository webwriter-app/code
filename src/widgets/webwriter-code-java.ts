import { execute } from "../model/java/java-module";
import { offlineRuntimeAssets } from "../model/runtime-assets";
import { javaAssets } from "../model/java/java-assets";
import { java } from "@codemirror/lang-java";
import { customElement } from "lit/decorators.js";
import { Code } from "../components/code-template";

/**
 * Code widget for Java with compilation and execution capabilities using TeaVM (Java 21).
 *
 * Compiles Java 21 with TeaVM.
 */
@customElement("webwriter-code-java")
export class WebwriterCodeJava extends Code {
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
