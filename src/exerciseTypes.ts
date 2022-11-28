export const exerciseTypes = [
    {
        name: "No exercise type",
        templateText: "\n\n",
        features:
        {
            showDisableButton: true,
            showCodeRunButton: true,
            showExecutionTime: true,
        }
    },
    {
        name: "Fill The Blanks",
        templateText:
            `//Fill in the blanks\nconst array = [1,2,3]; \n  array.map((element) => { \n  return _________ \n}); \n\nfunction double(a) {\n return a * 2; \n}`,
        features:
        {
            showDisableButton: true,
            showCodeRunButton: false,
            showExecutionTime: true,
        }
    },
    {
        name: "Code Skeleton",
        templateText:
            `//Complete the function\nfunction isEven(variable) {\n\n}`,
        features:
        {
            showDisableButton: true,
            showCodeRunButton: true,
            showExecutionTime: true,
        }
    },
    {
        name: "Buggy Code",
        templateText: "//Find and fix the bug\nconst array = [1,2,3]; \n array.map((element) => { \n  return element * 2 \n}); \n\nfunction double(a) {\n return a * 2; \n}",
        features:
        {
            showDisableButton: true,
            showCodeRunButton: false,
            showExecutionTime: true,
        }
    },
    {
        name: "Code From Scratch",
        templateText: "/* Please code following task from scratch: \n--Task--\n*/",
        features:
        {
            showDisableButton: true,
            showCodeRunButton: true,
            showExecutionTime: true,
        }
    },
    {
        name: "Code Baseline",
        templateText: "//Improve the code\nfunction add(a,b){\n let c = a; \n for( let i = 0; i < b; i++ ){ \n  c = c + 1; \n };\nreturn c;\n}",
        features:
        {
            showDisableButton: true,
            showCodeRunButton: true,
            showExecutionTime: true,
        }
    },
    {
        name: "Find The Bug",
        templateText: "//Find the bug in the following code\nfunction add(a,b){\n let c = a; \n for( let i = 0; i > b; i++ ){ \n  c = c + 1; \n };\nreturn c;\n}",
        features:
        {
            showDisableButton: true,
            showCodeRunButton: false,
            showExecutionTime: true,
        }
    },
    {
        name: "Compiling Errors",
        templateText: "//Explain the following error\nconst a = 5;\n a.map(object => {\n return a + 1;\n})\n// Result: TypeError: a.map is not a function",
        features:
        {
            showDisableButton: true,
            showCodeRunButton: false,
            showExecutionTime: true,
        }
    },
    {
        name: "Code Interpretation",
        templateText: "//Explain the following code\nconst array = [1,2,3];\nconst newArray = array.map(element => element * 2);\nconsole.log(newArray);",
        features:
        {
            showDisableButton: true,
            showCodeRunButton: false,
            showExecutionTime: true,
        }
    },
    {
        name: "Keyword Use",
        templateText: "//Use an if-else statement to check if a variable is a string\nfunction isString(variable) {\n\n}",
        features:
        {
            showDisableButton: true,
            showCodeRunButton: true,
            showExecutionTime: true,
        }
    },
];