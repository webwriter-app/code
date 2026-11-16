/// <reference types="mocha" />
import "mocha/mocha.js";
import { getMochaConfig } from "@webwriter/build/test";
import { defineRuns } from "./helpers";

mocha.setup(getMochaConfig());

defineRuns(["html", "javascript", "typescript", "webassembly", "sql", "lua", "prolog", "scheme", "shell"]);

mocha.run();
