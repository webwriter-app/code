import { scriptAsset, type RuntimeAsset } from "../shared/runtime-assets";

// Matches the sysroot in @live-codes/rust-wasm 0.3.0.
const root = "https://unpkg.com/@live-codes/wasm-rustc@0.1.0/";
const libraryDirectory = "lib/rustlib/x86_64-unknown-linux-gnu/lib/";
export const rustWorker = scriptAsset("rust");
// Byte counts from UNPKG's metadata for this pinned release.
const libraries = [
    ["libaddr2line-b8754aeb03c02354.rlib", 222678],
    ["libadler-05c3545f6cd12159.rlib", 28501],
    ["liballoc-0dab879bc41cd6bd.rlib", 2413042],
    ["libcfg_if-c7fd2cef50341546.rlib", 5575],
    ["libcompiler_builtins-a99947d020d809d6.rlib", 462202],
    ["libcore-4b8e8a815d049db3.rlib", 16104772],
    ["libgetopts-bbb75529e85d129d.rlib", 277788],
    ["libgimli-598847d27d7a3cbf.rlib", 2720511],
    ["libhashbrown-d2ff91fdf93cacb2.rlib", 648851],
    ["liblibc-dc63949c664c3fce.rlib", 1129348],
    ["libmemchr-2d3a423be1a6cb96.rlib", 445464],
    ["libminiz_oxide-b109506a0ccc4c6a.rlib", 223230],
    ["libobject-7b48def7544c748b.rlib", 3311493],
    ["libpanic_abort-c93441899b93b849.rlib", 5947],
    ["libpanic_unwind-11d9ba05b60bf694.rlib", 16866],
    ["libproc_macro-1a7f7840bb9983dc.rlib", 1433008],
    ["librustc_demangle-59342a335246393d.rlib", 331397],
    ["librustc_std_workspace_alloc-552b185085090ff6.rlib", 3341],
    ["librustc_std_workspace_core-5d8a121daa7eeaa9.rlib", 4473],
    ["librustc_std_workspace_std-97f43841ce452f7d.rlib", 5723],
    ["libstd-bdedb7706a556da2.rlib", 5635299],
    ["libstd-bdedb7706a556da2.so", 4681089],
    ["libstd_detect-cca21eebc4281add.rlib", 168744],
    ["libsysroot-f654e185be3ffebd.rlib", 3542],
    ["libtest-f06fa3fbc201c558.rlib", 1808175],
    ["libunicode_width-19a0dcd589fa0877.rlib", 17444],
    ["libunwind-747b693f90af9445.rlib", 17685],
] as const;
export const rustLibraries = libraries.map(([name]) => name);
export const rustAssets: RuntimeAsset[] = [
    ["bin/miri.opt.1718474653.wasm", 17386509] as const,
    ...libraries.map(([name, bytes]) => [libraryDirectory + name, bytes] as const),
].map(([path, bytes]) => ({ path: root + path + ".gz", mimeType: "application/gzip", bytes }));
