#!/usr/bin/env sh
# Rebuild the subset web fonts in public/fonts from the full files.
# Needs fonttools with WOFF2 support:  pip install "fonttools[woff]"
#
#   anek-latin-core.woff2   Anek Latin, the characters the site uses, weights 300–800, widths 100–106%
#   anek-latin-rupee.woff2  just ₹ (U+20B9), so the rupee sign doesn't fetch the 82 KB extended-Latin file
#   anek-latin-ext.woff2    the extended-Latin file as published, for rare characters in names
#   caveat-latin-650.woff2  Caveat (margin notes), one static cut at weight 650
#
# If you add a new character, weight or width to the CSS, widen the ranges below
# and in the @font-face rules in src/styles/global.css, then run this again.
set -eu
cd "$(dirname "$0")/.."
SRC=node_modules/@fontsource-variable/anek-latin/files
CAVEAT_SRC=${CAVEAT_SRC:-caveat-latin-full.woff2}   # the full Caveat latin variable file, if you have it
TMP=$(mktemp -d)
CORE="U+0020-007E,U+00A0-00FF,U+0131,U+0152-0153,U+02C6,U+02DA,U+02DC,U+2010-2027,U+2030-203A,U+2044,U+20AC,U+2122,U+2190-2193,U+2212,U+2215,U+2264-2265,U+FEFF"

pyftsubset "$SRC/anek-latin-latin-standard-normal.woff2" --unicodes="$CORE" --layout-features='*' --flavor=woff2 --output-file="$TMP/core.woff2"
fonttools varLib.instancer "$TMP/core.woff2" wght=300:800 wdth=100:106 -o "$TMP/core.ttf" -q
pyftsubset "$TMP/core.ttf" --unicodes='*' --layout-features='*' --flavor=woff2 --output-file=public/fonts/anek-latin-core.woff2

pyftsubset "$SRC/anek-latin-latin-ext-standard-normal.woff2" --unicodes="U+20B9" --layout-features='*' --flavor=woff2 --output-file="$TMP/rupee.woff2"
fonttools varLib.instancer "$TMP/rupee.woff2" wght=300:800 wdth=100:106 -o "$TMP/rupee.ttf" -q
pyftsubset "$TMP/rupee.ttf" --unicodes='*' --layout-features='*' --flavor=woff2 --output-file=public/fonts/anek-latin-rupee.woff2

cp "$SRC/anek-latin-latin-ext-standard-normal.woff2" public/fonts/anek-latin-ext.woff2

if [ -f "$CAVEAT_SRC" ]; then
  pyftsubset "$CAVEAT_SRC" --unicodes="U+0020-007E,U+00A0-00FF,U+2013-2014,U+2018-201D,U+2022,U+2026,U+2192,U+20B9" --layout-features='*' --flavor=woff2 --output-file="$TMP/caveat.woff2"
  fonttools varLib.instancer "$TMP/caveat.woff2" wght=650 -o "$TMP/caveat.ttf" -q
  pyftsubset "$TMP/caveat.ttf" --unicodes='*' --layout-features='*' --flavor=woff2 --output-file=public/fonts/caveat-latin-650.woff2
fi
ls -l public/fonts/*.woff2
