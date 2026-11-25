/// <reference types="mocha" />
import "mocha/mocha.js";
import { getMochaConfig } from "@webwriter/build/test";
import { defineRuns } from "./helpers";

mocha.setup(getMochaConfig());

defineRuns(["java", "python", "csharp", "go", "c", "cpp", "php", "rust", "haskell"]);

mocha.run();
