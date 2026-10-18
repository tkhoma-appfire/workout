#!/usr/bin/env bash
# Splash-only oval icon (does not change launcher mipmaps).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
LOGO="${ROOT}/assets/app-logo.jpeg"
OUT_DIR="${ROOT}/android/app/src/main/res/drawable-nodpi"
OUT_FILE="${OUT_DIR}/splash_icon.png"
OLD_FILE="${OUT_DIR}/splash_logo.png"

# Android 12 clips the splash icon to a circle using the inner 2/3 of the
# 240dp viewport. Keep the oval inside that circle so it is not cropped.
CANVAS=720
OVAL_W=480
OVAL_H=360

if [[ ! -f "$LOGO" ]]; then
  echo "Logo not found: $LOGO" >&2
  exit 1
fi

mkdir -p "$OUT_DIR"
rm -f "$OLD_FILE"

STRETCHED="$(mktemp "${TMPDIR:-/tmp}/splash-stretched.XXXXXX.png")"
OVAL="$(mktemp "${TMPDIR:-/tmp}/splash-oval.XXXXXX.png")"
trap 'rm -f "$STRETCHED" "$OVAL"' EXIT

# Stretch the launcher logo to the oval bounds (ignore aspect ratio).
magick "$LOGO" -resize "${OVAL_W}x${OVAL_H}!" "$STRETCHED"

# Mask to an ellipse. Image first, mask second, DstIn keeps the photo.
magick "$STRETCHED" \
  \( -size "${OVAL_W}x${OVAL_H}" xc:none -fill white \
     -draw "ellipse $((OVAL_W / 2)),$((OVAL_H / 2)) $((OVAL_W / 2)),$((OVAL_H / 2)) 0,360" \) \
  -alpha Off -compose CopyOpacity -composite "$OVAL"

magick -size "${CANVAS}x${CANVAS}" xc:none "$OVAL" -gravity center -composite "$OUT_FILE"

echo "Wrote ${OUT_FILE}"
