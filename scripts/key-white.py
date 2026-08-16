#!/usr/bin/env python3
"""Turn a pure-white background transparent (chroma key by distance from white).

Usage: python3 scripts/key-white.py assets/img/hero-meadow-far.png [more.png ...]
Overwrites each file in place with an alpha-keyed version.
"""
import sys
from PIL import Image

for path in sys.argv[1:]:
    img = Image.open(path).convert("RGBA")
    px = img.load()
    w, h = img.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            # distance from pure white drives opacity; flat shapes stay solid,
            # antialiased edge pixels get partial alpha
            d = ((255 - r) ** 2 + (255 - g) ** 2 + (255 - b) ** 2) ** 0.5
            alpha = min(255, int(d * 2.4))
            px[x, y] = (r, g, b, min(a, alpha))
    img.save(path)
    print("keyed", path)
