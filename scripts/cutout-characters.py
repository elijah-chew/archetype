#!/usr/bin/env python3
"""Remove backgrounds from character source images and write transparent PNGs."""

from __future__ import annotations

import io
import sys
from pathlib import Path

from PIL import Image
from rembg import remove

ROOT = Path(__file__).resolve().parents[1] / 'public' / 'characters'


def main() -> int:
    sources = sorted(ROOT.glob('*.jpg')) + sorted(ROOT.glob('*.jpeg')) + sorted(ROOT.glob('*.png'))
    if not sources:
        print('No images in', ROOT, file=sys.stderr)
        return 1
    for src in sources:
        if src.stem.endswith('-source'):
            continue
        out = ROOT / f'{src.stem}.png'
        print(f'{src.name} -> {out.name}')
        data = remove(src.read_bytes())
        im = Image.open(io.BytesIO(data))
        im.save(out, optimize=True)
    print('Done.')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
