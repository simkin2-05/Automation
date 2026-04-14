#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUTPUT_DIR="$ROOT_DIR/dist-sdk"
ARCHIVE_NAME="taxi-rush-sdk"
DATE_TAG="$(date +%Y%m%d-%H%M%S)"
ARCHIVE_PATH="$OUTPUT_DIR/${ARCHIVE_NAME}-${DATE_TAG}.zip"
LATEST_PATH="$OUTPUT_DIR/${ARCHIVE_NAME}-latest.zip"

mkdir -p "$OUTPUT_DIR"

TMP_DIR="$(mktemp -d)"
STAGE_DIR="$TMP_DIR/${ARCHIVE_NAME}"
mkdir -p "$STAGE_DIR"

(
  cd "$ROOT_DIR"
  tar -cf - \
    --exclude=".git" \
    --exclude="node_modules" \
    --exclude="dist" \
    --exclude="dist-sdk" \
    --exclude=".expo" \
    --exclude="*.log" \
    .
) | (
  cd "$STAGE_DIR"
  tar -xf -
)

(
  cd "$TMP_DIR"
  zip -qr "$ARCHIVE_PATH" "${ARCHIVE_NAME}"
)

cp "$ARCHIVE_PATH" "$LATEST_PATH"
rm -rf "$TMP_DIR"

echo "SDK package created: $ARCHIVE_PATH"
echo "Latest SDK package: $LATEST_PATH"
