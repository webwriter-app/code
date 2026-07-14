# Updating the TeaVM runtime

`../compiler.wasm.tiff`, `../compiler.wasm-runtime.js`, `../compile-classlib-teavm.bin.tiff`
and `../runtime-classlib-teavm.bin.tiff` are prebuilt artifacts from
[`teavm-javac`](https://github.com/konsoletyper/teavm-javac), which can be updated by running:

```bash
./update.sh
```

(requires `git` and `docker` to be installed).

- Future versions of `teavm-javac` may require a different Java versions, so adjust the Dockerfile if necessary.

- `@webwriter/build` may output the error: `Could not resolve "node:fs/promises"`. This can be fixed by simply removing the corresponding line from the `compiler.wasm-runtime.js` file.
