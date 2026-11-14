# Go, C#, and Haskell runtime assets

Run the following commands from the Code widget repository root. Runtime
archives are published as static resources, so WebWriter requests them only for
execution or Offline HTML export.

## Go

Install Go 1.27.4. `WEBWRITER_GO` can point to its executable.

```sh
node scripts/toolchains/build-go.mjs
```

This generates a compiler, linker, and standard-library archive in
`assets/runtime/go/`. The package list in the build script defines which
standard-library imports are available to Go cells.

## C#

Install .NET SDK 10.0.404 and the `wasm-tools` workload. Publish the bridge
and use the reference directory matching the runtime in the SDK.

```sh
dotnet workload install wasm-tools
dotnet publish scripts/toolchains/CSharpRunner.csproj -c Release -o /tmp/ww-code-csharp
node scripts/toolchains/pack-csharp.mjs \
  /tmp/ww-code-csharp/wwwroot/_framework \
  /path/to/dotnet/packs/Microsoft.NETCore.App.Ref/10.0.15/ref/net10.0
```

The packer adapts two loader paths to support blob modules inside an Offline HTML
worker. It combines the Roslyn bridge, .NET framework, and Roslyn's reference
assemblies into `assets/runtime/csharp/framework.gz`. Update the notices beside
the archive when changing the SDK.


## Haskell

The compiler in `assets/runtime/haskell/` uses the MicroHs 0.16.6.0 revision
pinned by Browser Haskell. It disables garbage-collection reductions so the
compiler can start within Chromium's worker stack limit. It also reserves room
for suspending deep compiler calls. The checked-in compiler keeps normal builds
independent of a local Emscripten installation.

Activate Emscripten 4.0.23 and run `sh scripts/toolchains/build-haskell.sh` to
rebuild the assets. The JavaScript REPL adapter and optional packages come from
the pinned `@live-codes/browser-haskell` npm dependency. When updating it,
compare `src/haskell/package-files.json` with the new package index and verify
that the rebuilt compiler still reads the published package format.
