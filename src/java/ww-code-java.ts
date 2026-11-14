import { java } from "@codemirror/lang-java";
import { customElement } from "lit/decorators.js";
import Code from "../shared/ww-code-template";

/** Code widget for Java with compilation and execution capabilities using TeaVM (Java 21). */
@customElement("webwriter-code-java")
export class CodeJava extends Code {
    static offlineImports(element: Element) {
        return Code.runtimeImports(element, "./ww-code-java.js");
    }

    constructor() {
        super({
            name: "Java",
            languageExtension: java(),
            loadRuntime: () => import("./languageModules/javaModule"),
        });
    }
}
