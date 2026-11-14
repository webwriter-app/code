#!/bin/sh
# Run from the widget root after activating Emscripten 4.0.23.
set -eu

output="$PWD/assets/runtime/haskell"
work=$(mktemp -d)
trap 'rm -rf "$work"' 0

fetch_source() {
    mkdir -p "$2"
    curl --fail --silent --show-error --location "$1" -o "$work/source.tar.gz"
    tar -xzf "$work/source.tar.gz" --strip-components=1 -C "$2"
}

fetch_source https://codeload.github.com/augustss/MicroHs/tar.gz/455782164e75998b140d869c1b7cdde0c8a21508 "$work/microhs"
fetch_source https://codeload.github.com/augustss/canvhs/tar.gz/86a369f10848b265634eb5cb619d3bc4adefb355 "$work/canvhs"
mkdir "$work/packages"

cd "$work/microhs"
make bin/mhs
export MHSDIR="$PWD"
export PATH="$PWD/bin:$PATH"
mhs -Q generated/base.pkg "$work/packages"

(
    cd "$work/canvhs"
    mhs -Pcanvhs-0.2.1.0 -ocanvhs.pkg -i -isrc "-a$work/packages" \
        Graphics.CanvHs Graphics.CanvHs.Color Graphics.CanvHs.Picture Graphics.CanvHs.Demo \
        Audio.AudHs.FFI Audio.AudHs.Sound
    mhs -Q canvhs.pkg "$work/packages"
)

# Garbage-collection reductions recurse over combinator graphs and can overflow
# Chromium's worker stack during startup. The normal GC uses the evaluator stack.
sed 's/^#define GCRED    1/#define GCRED    0/' src/runtime/unix/config.h > "$work/config.h"
grep -q '^#define GCRED    0' "$work/config.h"
cp "$work/config.h" src/runtime/unix/config.h
# Suspending a deep compiler call also needs room to save its Wasm frames.
mhs "-a$work/packages" -temscripten_web -optc -sASYNCIFY_STACK_SIZE=65536 \
    -z -i -imhs -isrc MicroHs.Main \
    "-o$work/mhs-embed.js" --embed-packages base:canvhs

mkdir -p "$output"
gzip -n -9 -c "$work/mhs-embed.js" > "$output/mhs-embed.js.gz"
gzip -n -9 -c "$work/mhs-embed.wasm" > "$output/mhs-embed.wasm.gz"
cp LICENSE "$output/LICENSE.microhs"
cp "$work/canvhs/LICENSE" "$output/LICENSE.canvhs"
