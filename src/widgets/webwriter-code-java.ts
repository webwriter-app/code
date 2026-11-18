import { execute } from "../model/java/java-module";
import { offlineRuntimeAssets } from "../model/runtime-assets";
import { javaAssets } from "../model/java/java-assets";
import { java } from "@codemirror/lang-java";
import { customElement } from "lit/decorators.js";
import { Code } from "../components/code-template";
import { sourceConversions } from "../model/source-files";

/**
 * Code widget for Java with compilation and execution capabilities using TeaVM (Java 21).
 *
 * Compiles Java 21 with TeaVM.
 *
 * Conversions: a `pre` element converts both ways, and a source file with the language's extension is imported or exported (the import replaces the program and clears locked lines; an export drops locked lines and run results).
 *
 * Signals: `output` (string) is the text of the last run, or its error messages; `failed` (boolean) is true after an error.
 *
 * @part editor - The code editor.
 * @part output - The area for results, console lines and tables.
 */
@customElement("webwriter-code-java")
export class WebwriterCodeJava extends Code {
    static convertFrom = sourceConversions("java").convertFrom;
    static convertTo = sourceConversions("java").convertTo;

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
