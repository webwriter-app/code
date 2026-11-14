# Go and C# runtime assets

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
