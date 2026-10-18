#!/usr/bin/env bash
# Splash-only icon (does not change launcher mipmaps).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
LOGO="${ROOT}/assets/app-logo.jpeg"
OUT_DIR="${ROOT}/android/app/src/main/res/drawable-nodpi"
OUT_FILE="${OUT_DIR}/splash_icon.png"
OLD_FILE="${OUT_DIR}/splash_logo.png"

# Android 12 masks the splash icon to a circle with 2/3 of the canvas diameter.
# The logo keeps its original aspect ratio and fits inside that circle.
CANVAS=720
LOGO_BOX=360
RADIUS=28

if [[ ! -f "$LOGO" ]]; then
  echo "Logo not found: $LOGO" >&2
  exit 1
fi

mkdir -p "$OUT_DIR"
rm -f "$OLD_FILE"

SCALED="$(mktemp "${TMPDIR:-/tmp}/splash-scaled.XXXXXX.png")"
ROUNDED="$(mktemp "${TMPDIR:-/tmp}/splash-rounded.XXXXXX.png")"
trap 'rm -f "$SCALED" "$ROUNDED"' EXIT

magick "$LOGO" -resize "${LOGO_BOX}x${LOGO_BOX}" "$SCALED"
W="$(magick identify -format '%w' "$SCALED")"
H="$(magick identify -format '%h' "$SCALED")"

magick "$SCALED" \
  \( -size "${W}x${H}" xc:none -fill white \
     -draw "roundrectangle 0,0 $((W - 1)),$((H - 1)) ${RADIUS},${RADIUS}" \) \
  -alpha Off -compose CopyOpacity -composite "$ROUNDED"

magick -size "${CANVAS}x${CANVAS}" xc:none "$ROUNDED" -gravity center -composite "$OUT_FILE"

echo "Wrote ${OUT_FILE}"
