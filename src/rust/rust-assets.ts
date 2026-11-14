import { scriptAsset } from "../shared/runtime-assets";

// Matches the sysroot in @live-codes/rust-wasm 0.3.0.
const root = "https://unpkg.com/@live-codes/wasm-rustc@0.1.0/";
const libraryDirectory = "lib/rustlib/x86_64-unknown-linux-gnu/lib/";
export const rustWorker = scriptAsset("rust");
export const rustLibraries = [
    "libaddr2line-b8754aeb03c02354.rlib",
    "libadler-05c3545f6cd12159.rlib",
    "liballoc-0dab879bc41cd6bd.rlib",
    "libcfg_if-c7fd2cef50341546.rlib",
    "libcompiler_builtins-a99947d020d809d6.rlib",
    "libcore-4b8e8a815d049db3.rlib",
    "libgetopts-bbb75529e85d129d.rlib",
    "libgimli-598847d27d7a3cbf.rlib",
    "libhashbrown-d2ff91fdf93cacb2.rlib",
    "liblibc-dc63949c664c3fce.rlib",
    "libmemchr-2d3a423be1a6cb96.rlib",
    "libminiz_oxide-b109506a0ccc4c6a.rlib",
    "libobject-7b48def7544c748b.rlib",
    "libpanic_abort-c93441899b93b849.rlib",
    "libpanic_unwind-11d9ba05b60bf694.rlib",
    "libproc_macro-1a7f7840bb9983dc.rlib",
    "librustc_demangle-59342a335246393d.rlib",
    "librustc_std_workspace_alloc-552b185085090ff6.rlib",
    "librustc_std_workspace_core-5d8a121daa7eeaa9.rlib",
    "librustc_std_workspace_std-97f43841ce452f7d.rlib",
    "libstd-bdedb7706a556da2.rlib",
    "libstd-bdedb7706a556da2.so",
    "libstd_detect-cca21eebc4281add.rlib",
    "libsysroot-f654e185be3ffebd.rlib",
    "libtest-f06fa3fbc201c558.rlib",
    "libunicode_width-19a0dcd589fa0877.rlib",
    "libunwind-747b693f90af9445.rlib",
];
export const rustAssets = ["bin/miri.opt.1718474653.wasm", ...rustLibraries.map((name) => libraryDirectory + name)].map(
    (path) => ({ path: root + path + ".gz", mimeType: "application/gzip" }),
);
