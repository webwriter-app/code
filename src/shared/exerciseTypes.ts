export const exerciseTypes = [
    {
        name: "(JS) No exercise type",
        templateText: "\n\n",
        features: {
            showCodeRunButton: true,
            showExecutionTime: true,
        },
    },
    {
        name: "(JS) Code From Scratch",
        templateText: "/* Please code following task from scratch: \n--Task--\n*/",
        features: {
            showCodeRunButton: true,
            showExecutionTime: true,
        },
    },
    {
        name: "(JS) Code Skeleton",
        templateText: `//Complete the function\nfunction isEven(variable) {\n\n}`,
        features: {
            showCodeRunButton: true,
            showExecutionTime: true,
        },
    },
    {
        name: "(JS) Fill The Blanks",
        templateText: `//Fill in the blanks\nconst array = [1,2,3]; \n  array.map((element) => { \n  return _________ \n}); \n\nfunction double(a) {\n return a * 2; \n}`,
        features: {
            showCodeRunButton: false,
            showExecutionTime: true,
        },
    },
    {
        name: "(JS) Code Baseline",
        templateText:
            "//Improve the code\nfunction add(a,b){\n let c = a; \n for( let i = 0; i < b; i++ ){ \n  c = c + 1; \n };\nreturn c;\n}",
        features: {
            showCodeRunButton: true,
            showExecutionTime: true,
        },
    },
    {
        name: "(JS) Find The Bug",
        templateText:
            "//Find the bug in the following code\nfunction add(a,b){\n let c = a; \n for( let i = 0; i > b; i++ ){ \n  c = c + 1; \n };\nreturn c;\n}",
        features: {
            showCodeRunButton: false,
            showExecutionTime: true,
        },
    },
    {
        name: "(JS) Buggy Code",
        templateText:
            "//Find and fix the bug\nconst array = [1,2,3]; \n array.map((element) => { \n  return element * 2 \n}); \n\nfunction double(a) {\n return a * 2; \n}",
        features: {
            showCodeRunButton: false,
            showExecutionTime: true,
        },
    },
    {
        name: "(JS) Compiling Errors",
        templateText:
            "//Explain the following error\nconst a = 5;\n a.map(object => {\n return a + 1;\n})\n// Result: TypeError: a.map is not a function",
        features: {
            showCodeRunButton: false,
            showExecutionTime: true,
        },
    },
    {
        name: "(JS) Code Interpretation",
        templateText:
            "//Explain the following code\nconst array = [1,2,3];\nconst newArray = array.map(element => element * 2);\nconsole.log(newArray);",
        features: {
            showCodeRunButton: false,
            showExecutionTime: true,
        },
    },
    {
        name: "(JS) Keyword Use",
        templateText:
            "//Use an if-else statement to check if a variable is a string\nfunction isString(variable) {\n\n}",
        features: {
            showCodeRunButton: true,
            showExecutionTime: true,
        },
    },
    {
        name: "(HTML) Skeleton",
        templateText:
            "<!DOCTYPE html>\n<html>\n<head>\n<title>Page Title</title>\n</head>\n<body>\n\n<h1>This is a Heading</h1>\n<p>This is a paragraph.</p>\n\n</body>\n</html>",
        features: {
            showCodeRunButton: true,
            showExecutionTime: true,
        },
    },
    {
        name: "(CSS) Skeleton",
        templateText:
            "/* Add your CSS code here */\n\n.cssPreview {\n    background-color: #eee;\n    border: 1px solid #999;\n    border-radius: 4px;\n    padding: 5px;\n    margin: 5px;\n    width: 50%;\n    height: 150px;\n    overflow: auto;\n}",
        features: {
            showCodeRunButton: true,
            showExecutionTime: true,
        },
    },
    //     {
    //         name: '(PY) Skeleton',
    //         templateText: 'def add(a, b):\n    return a + b\n\nadd(1, 2)',
    //         features: {
    //             showCodeRunButton: true,
    //             showExecutionTime: true,
    //         },
    //     },
];
