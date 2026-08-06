#!/usr/bin/env bash
#
# Normalise every image dropped into public/photos/ so it is safe to commit.
#
# A phone shot is 3-5 MB and 4000px wide; the gallery draws it at roughly 280px,
# and public/ is served untouched — Astro does not re-encode anything on build,
# so whatever is committed is what gets downloaded. This shrinks the long side,
# re-encodes as JPEG and drops the metadata.
#
# Safe to re-run: a file that is already a small enough .jpg is left alone, so
# repeated runs do not re-compress the same photo over and over.
#
#   npm run photos            # normalise public/photos/
#   npm run photos -- public/team
#
set -euo pipefail

DIR="${1:-public/photos}"
MAX_SIDE=1200 # px on the long side — twice what the gallery draws, for retina
QUALITY=82
SKIP_BYTES=500000 # a .jpg already under this and small enough is left alone

[ -d "$DIR" ] || {
  echo "No such directory: $DIR" >&2
  exit 1
}

shopt -s nullglob nocaseglob

renamed=()
touched=0

for file in "$DIR"/*.{jpg,jpeg,png,heic,heif,webp}; do
  target="${file%.*}.jpg"
  width=$(identify -format '%w' "${file}[0]" 2>/dev/null || echo 0)
  bytes=$(stat -c '%s' "$file")

  # Already normalised? Leave it: re-encoding a JPEG is always a small loss.
  if [ "$file" = "$target" ] && [ "$width" -le "$MAX_SIDE" ] && [ "$bytes" -lt "$SKIP_BYTES" ]; then
    continue
  fi

  # -auto-orient MUST come before -strip. Phones store the rotation in EXIF and
  # leave the pixels sideways; strip first and the photo lands on its side.
  tmp=$(mktemp --suffix=.jpg)
  convert "${file}[0]" \
    -auto-orient \
    -resize "${MAX_SIDE}x${MAX_SIDE}>" \
    -quality "$QUALITY" \
    -sampling-factor 4:2:0 \
    -strip \
    "$tmp"

  mv "$tmp" "$target"
  chmod 644 "$target" # mktemp makes it 600, which is not what we want to commit
  [ "$file" = "$target" ] || {
    rm -f "$file"
    renamed+=("$(basename "$file") -> $(basename "$target")")
  }

  after=$(stat -c '%s' "$target")
  printf '%-34s %5s KB -> %4s KB\n' "$(basename "$target")" "$((bytes / 1024))" "$((after / 1024))"
  touched=$((touched + 1))
done

[ "$touched" -eq 0 ] && echo "Nothing to do — everything in $DIR is already normalised."

if [ ${#renamed[@]} -gt 0 ]; then
  echo
  echo "Renamed — update 'src' in src/content/gallery/*.md:"
  printf '  %s\n' "${renamed[@]}"
fi
