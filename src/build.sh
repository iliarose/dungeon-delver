#!/usr/bin/env bash
# Rebuild the GitHub Pages bundle into ../assets/game.js and ../index.html.
set -euo pipefail
cd "$(dirname "$0")"
ROOT="$(cd .. && pwd)"
mkdir -p "$ROOT/assets"
if [[ ! -d node_modules/react ]]; then
  npm install --no-fund --no-audit
fi
npx tsc --noEmit --strict --jsx react-jsx --target es2020 --module esnext --moduleResolution bundler --esModuleInterop --skipLibCheck --lib es2020,dom game.canvas.tsx shim.ts main.tsx
npx esbuild main.tsx --bundle --minify --outfile="$ROOT/assets/game.js" --jsx=automatic --target=es2020 --legal-comments=none --log-level=warning
# Rebuild index.html head + script tag (favicon data URI is regenerated if missing).
python3 - <<'PY'
from pathlib import Path
root = Path("..").resolve()
# Tiny 16x16 pixel sword favicon as PNG data URI (hand-rolled minimal PNG).
import struct, zlib, base64
def png(w,h,rgba_rows):
    def chunk(tag, data):
        return struct.pack(">I", len(data)) + tag + data + struct.pack(">I", zlib.crc32(tag+data) & 0xffffffff)
    raw = b"".join(b"\x00"+bytes(row) for row in rgba_rows)
    return b"\x89PNG\r\n\x1a\n" + chunk(b"IHDR", struct.pack(">IIBBBBB", w,h,8,6,0,0,0)) + chunk(b"IDAT", zlib.compress(raw,9)) + chunk(b"IEND", b"")
# Simple yellow coin / gem style pixel favicon on dark bg
px = []
palette = {
  '.': (26,16,24,255),
  'y': (255,216,74,255),
  'Y': (224,160,48,255),
  'w': (255,246,224,255),
  'k': (42,26,31,255),
}
art = [
"................",
"................",
"......yyyy......",
".....yYwwYy.....",
"....yYyyyyYy....",
"...yYyyyyyyYy...",
"...yyyyyyyyyy...",
"...YyyyyyyyyY...",
"....YyyyyyyY....",
".....YYYYYY.....",
"................",
"................",
"................",
"................",
"................",
"................",
]
rows=[]
for line in art:
    row=[]
    for ch in line:
        row.extend(palette[ch])
    rows.append(row)
data_uri = "data:image/png;base64," + base64.b64encode(png(16,16,rows)).decode()
html = f'''<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
  <meta name="theme-color" content="#1a1018" />
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
  <meta name="mobile-web-app-capable" content="yes" />
  <meta name="description" content="Dungeon Delver — a 20-floor Atari-style d20 dungeon crawl. Fight, puzzle, and claim the Orb of Tarmin." />
  <title>Dungeon Delver</title>
  <link rel="icon" type="image/png" href="{data_uri}" />
  <link rel="apple-touch-icon" href="{data_uri}" />
  <style>
    html, body {{ margin: 0; padding: 0; width: 100%; height: 100%; background: #1a1018; color: #fff6e0; overflow: hidden; touch-action: none; -webkit-user-select: none; user-select: none; }}
    #root {{ width: 100%; height: 100%; }}
    noscript {{ display:block; padding: 2rem; font-family: system-ui, sans-serif; }}
  </style>
</head>
<body>
  <noscript>Dungeon Delver needs JavaScript enabled.</noscript>
  <div id="root"></div>
  <script src="assets/game.js"></script>
</body>
</html>
'''
(root / "index.html").write_text(html)
print("Wrote", root / "index.html")
print("Bundle", (root / "assets" / "game.js").stat().st_size, "bytes")
PY
echo BUILT
