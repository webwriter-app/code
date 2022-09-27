
export const parseExercise = (code: String, parsingConfig: String) => {
    const filteredConfig = parseConfig.filter(element => { return element.name === parsingConfig });
    const parsing = filteredConfig[0].parsing;

    let parsedCode = code;
    parsing.in.forEach((value, index) => {
        parsedCode = parsedCode.replace(value, parsing.out[index]);
    })
    return parsedCode;
}

const parseConfig = [
    {
        name: "Fill The Blanks",
        parsing: {
            in:

                [
                    "a",
                    "_",
                ],
            out:
                [
                    "b",
                    "//commentary\n",
                ]
        }
    },
    {
        name: "Code Skeleton",
        parsing: {
            in:
                [
                    "a",
                ],
            out:
                [
                    "c"
                ]
        }
    }
];