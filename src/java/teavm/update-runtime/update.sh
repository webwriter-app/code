#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEST="$(cd "$SCRIPT_DIR/.." && pwd)"
CLONE_DIR="$(mktemp -d)"
IMAGE=teavm-javac-build
CONTAINER=teavm-javac-build-run

cleanup() {
    docker rm -f "$CONTAINER" >/dev/null 2>&1 || true
    rm -rf "$CLONE_DIR"
}
trap cleanup EXIT

git clone --depth 1 https://github.com/konsoletyper/teavm-javac.git "$CLONE_DIR"
cp "$SCRIPT_DIR/Dockerfile" "$CLONE_DIR/Dockerfile"

docker build -t "$IMAGE" "$CLONE_DIR"
docker run --name "$CONTAINER" "$IMAGE"

docker cp "$CONTAINER:/workspace/compiler/build/generated/teavm/wasm-gc/compiler.wasm" "$DEST/compiler.wasm.tiff"
docker cp "$CONTAINER:/workspace/compiler/build/generated/teavm/wasm-gc/compiler.wasm-runtime.js" "$DEST/compiler.wasm-runtime.js"
docker cp "$CONTAINER:/workspace/compiler/build/classlib/compile-classlib-teavm.bin" "$DEST/compile-classlib-teavm.bin.tiff"
docker cp "$CONTAINER:/workspace/compiler/build/classlib/runtime-classlib-teavm.bin" "$DEST/runtime-classlib-teavm.bin.tiff"

echo "Updated TeaVM runtime in $DEST"
