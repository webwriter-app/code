export default URL.createObjectURL(
    new Blob(
        [
            function () {
                if (typeof importScripts === "function") {
                    const localConsole = { results: [] };

                    self.console = {
                        log: (...objs) => {
                            objs.forEach((obj) =>
                                localConsole.results.push({
                                    color: "inherit",
                                    text: typeof obj === "string" ? String(obj) : JSON.stringify(obj),
                                }),
                            );
                        },
                        info: (...objs) => {
                            objs.forEach((obj) =>
                                localConsole.results.push({
                                    color: "inherit",
                                    text: typeof obj === "string" ? String(obj) : JSON.stringify(obj),
                                }),
                            );
                        },
                        warn: (...objs) => {
                            objs.forEach((obj) =>
                                localConsole.results.push({
                                    color: "orange",
                                    text: typeof obj === "string" ? String(obj) : JSON.stringify(obj),
                                }),
                            );
                        },
                        error: (...objs) => {
                            objs.forEach((obj) =>
                                localConsole.results.push({
                                    color: "red",
                                    text: typeof obj === "string" ? String(obj) : JSON.stringify(obj),
                                }),
                            );
                        },
                        trace: (...objs) => {
                            objs.forEach((obj) =>
                                localConsole.results.push({
                                    color: "inherit",
                                    text: typeof obj === "string" ? String(obj) : JSON.stringify(obj),
                                }),
                            );
                        },
                        table: (...objs) => {
                            objs.forEach((obj) =>
                                localConsole.results.push({
                                    color: "inherit",
                                    text: typeof obj === "string" ? String(obj) : JSON.stringify(obj),
                                }),
                            );
                        },
                        assert: (assertion, ...objs) => {
                            assertion &&
                                objs.forEach((obj) =>
                                    localConsole.results.push({
                                        color: "inherit",
                                        text: typeof obj === "string" ? String(obj) : JSON.stringify(obj),
                                    }),
                                );
                        },
                        clear: () => {
                            localConsole.results = [];
                        },
                        count: () => {},
                        countReset: () => {},
                        debug: (...objs) => {
                            objs.forEach((obj) =>
                                localConsole.results.push({
                                    color: "inherit",
                                    text: typeof obj === "string" ? String(obj) : JSON.stringify(obj),
                                }),
                            );
                        },
                        dir: () => {},
                        dirxml: () => {},
                        group: () => {},
                        groupCollapsed: () => {},
                        groupEnd: () => {},
                        profile: () => {},
                        profileEnd: () => {},
                        time: () => {},
                        timeEnd: () => {},
                        timeLog: () => {},
                        timeStamp: () => {},
                        Console: self.console.Console,
                    };
                    self.onmessage = async (event) => {
                        let { id, code, ...context } = event.data;
                        for (let key of Object.keys(context)) {
                            self[key] = context[key];
                        }
                        // let codeToExecute = [code
                        //   .split('\n')
                        //   .map((line) => line.replace(/\\/g, '\\\\').replace(/"/g, "'"))
                        // ].join('\n')
                        try {
                            eval(code);
                        } catch (e) {
                            console.error(e.toString());
                        }

                        self.postMessage({ results: JSON.stringify(localConsole.results), id });
                        console.clear();
                    };
                }
            }
                .toString()
                .replace("let", " let")
                .slice(12, -1),
        ],
        { type: "text/javascript" },
    ),
);
