#!/bin/bash
# Resize + convert brand assets to WebP. Source of truth stays in assets-src/.
set -e
SRC=assets-src; OUT=assets
rm -rf "$OUT"; mkdir -p "$OUT"
TMP=$(mktemp -d)

conv () { # conv <relpath> <maxwidth> <quality>
  local rel="$1" w="$2" q="$3"
  local in="$SRC/$rel" dir out base
  [ -f "$in" ] || return 0
  dir="$OUT/$(dirname "$rel")"; mkdir -p "$dir"
  base="$(basename "${rel%.*}")"
  out="$dir/$base.webp"
  local t="$TMP/$base.png"
  sips -s format png --resampleWidth "$w" "$in" --out "$t" >/dev/null 2>&1 || cp "$in" "$t"
  cwebp -quiet -q "$q" -m 6 "$t" -o "$out"
}

for f in "$SRC"/soup/*;  do conv "soup/$(basename "$f")"  640 82; done
for f in "$SRC"/snack/*; do conv "snack/$(basename "$f")" 420 82; done
for f in "$SRC"/rice/*;  do conv "rice/$(basename "$f")"  420 82; done
for f in "$SRC"/store/*; do conv "store/$(basename "$f")" 800 80; done
conv brand/mascot.png       760 90
conv brand/logo.png         320 92
conv brand/qr-appstore.png  260 92
conv brand/qr-googleplay.png 260 92
mkdir -p "$OUT/fonts" && cp "$SRC"/fonts/*.woff2 "$OUT/fonts/" 2>/dev/null
rm -rf "$TMP"
echo "optimised:"; du -sh "$OUT"; find "$OUT" -type f | wc -l
