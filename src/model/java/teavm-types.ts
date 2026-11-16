export declare interface CompilerLibrary {
    createCompiler(): Compiler;
    installWorker(): void;
}

export declare class ListenerRegistration {
    destroy(): any;
}

export declare class Diagnostic {
    type: "javac" | "teavm";
    severity: "error" | "warning" | "other";
    fileName: string;
    lineNumber: number;
    message: string;
}

export declare class JavaDiagnostic extends Diagnostic {
    type: "javac";
    columnNumber: number;
    startPosition: number;
    position: number;
    endPosition: number;
}

export declare class TeaVMDiagnostic extends Diagnostic {
    type: "teavm";
}

export declare class Compiler {
    addSourceFile(path: string, content: string): any;

    clearSourceFiles(): any;

    // This can be not only `.class` file, but any file, e.g. some resources
    addClassFile(path: string, content: Int8Array): any;

    // Content is supposed to be a zip archive containing number of class files
    // It's equivalent for unpacking files from archive and passing each
    // file to `addClassFile`
    addJarFile(content: Int8Array): any;

    clearInputClassFiles(): any;

    // Set archive that includes definitions of standard Java library,
    // necessary for javac. This archive is generated with special tool,
    // the latest version can be found here:
    // https://teavm.org/playground/compile-classlib-teavm.bin
    setSdk(content: Int8Array): any;

    // Set archive that includes implementation of standard Java library,
    // necessary for TEaVM. This archive is generated with special tool,
    // the latest version can be found here:
    // https://teavm.org/playground/runtime-classlib-teavm.bin
    setTeaVMClasslib(content: Int8Array): any;

    onDiagnostic(listener: (Diagnostic: any) => void): ListenerRegistration;

    // Takes given source files and given input binary class files as dependencies.
    //
    // Returns `true` if compilation was successful.
    // During execution may call listeners, passed to `onDiagnostic` method
    // when compiler finds any error in input files.
    compile(): boolean;

    // Returns list of class files, produced by Java compiler
    listOutputFiles: string[];

    // Gets file, produced by Java compiler or 'null', if none found with given name
    getOutputFile(name: string): Int8Array;

    // Gets all files, produced by Java compiler, as a zip archive
    getOutputJar(): Int8Array;

    // Add class file to output files.
    // This can be useful when using this library only to produce WebAssembly
    // from existing class files
    addOutputClassFile(path: string, content: Int8Array): any;

    // Content is supposed to be a zip archive containing number of class files
    // It's equivalent for unpacking files from archive and passing each
    // file to `addOutputClassFile`
    addOutputJarFile(content: Int8Array): any;

    clearOutputFiles(): any;

    // Finds classes that contain valid `main` method among output class files.
    detectMainClasses(): string[];

    // Takes given output class files (either produced by calling `compile`
    // or written manually).
    //
    // Returns `true` if compilation was successful.
    // During execution may call listeners, passed to `onDiagnostic` method
    // when compiler finds any error in input files.
    generateWebAssembly(options: {
        outputName: string; // base name for WebAssembly module
        mainClass: string;
    }): boolean;

    listWebAssemblyOutputFiles(): string[];
    getWebAssemblyOutputFile(path: string): Int8Array;

    // Gets WebAssembly output files as a zip archive
    getWebAssemblyOutputArchive(): Int8Array;
}
