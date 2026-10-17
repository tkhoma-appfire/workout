#!/usr/bin/env bash
# Generate Android launcher icons from the web app logo.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
LOGO="${ROOT}/assets/app-logo.jpeg"
RES="${ROOT}/android/app/src/main/res"
ICON_BG="#525657"

if [[ ! -f "$LOGO" ]]; then
  echo "Logo not found: $LOGO" >&2
  exit 1
fi

generate() {
  local dpi="$1"
  local legacy="$2"
  local fg="$3"
  local dir="${RES}/mipmap-${dpi}"

  magick "$LOGO" -resize "${legacy}x${legacy}>" -background "$ICON_BG" -gravity center \
    -extent "${legacy}x${legacy}" "${dir}/ic_launcher.png"

  magick "${dir}/ic_launcher.png" \
    \( -size "${legacy}x${legacy}" xc:none -draw "fill white circle $((legacy/2)),$((legacy/2)) $((legacy/2)),0" \) \
    -alpha Off -compose CopyOpacity -composite "${dir}/ic_launcher_round.png"

  magick "$LOGO" -resize "${fg}x${fg}>" -background "$ICON_BG" -gravity center \
    -extent "${fg}x${fg}" "${dir}/ic_launcher_foreground.png"
}

generate mdpi 48 108
generate hdpi 72 162
generate xhdpi 96 216
generate xxhdpi 144 324
generate xxxhdpi 192 432

echo "Icons written under ${RES}/mipmap-*"
