"""Prepara o avatar para virar ASCII legível.

Recorta cabeça e barba, abre bastante as sombras (barba e cabelo escuros
sumiriam no fundo preto), realça bordas, apaga o fundo com uma vinheta e
tinge de verde fósforo. A CLI do asciify-engine usa a cor de cada pixel
para pintar cada caractere, então o brilho vira cor e o rosto fica legível.

Uso: python -I scripts/prepare-portrait.py   (gera scripts/portrait-source.png)
Depois: npm run ascii                         (gera public/portrait.svg)
"""
from PIL import Image, ImageDraw, ImageFilter, ImageOps

src = Image.open("public/avatar.jpg").convert("L")
w, h = src.size
img = src.crop((int(w * 0.22), 0, int(w * 0.86), int(h * 0.82)))
cw, ch = img.size

img = ImageOps.autocontrast(img, cutoff=1)
img = img.point(lambda v: int(255 * ((v / 255) ** 0.55)))
img = img.filter(ImageFilter.UnsharpMask(radius=2, percent=120, threshold=2))

mask = Image.new("L", (cw, ch), 0)
cx, cy, rx, ry = cw * 0.5, ch * 0.47, cw * 0.40, ch * 0.50
ImageDraw.Draw(mask).ellipse((cx - rx, cy - ry, cx + rx, cy + ry), fill=255)
mask = mask.filter(ImageFilter.GaussianBlur(cw * 0.05))
img = Image.composite(img, Image.new("L", (cw, ch), 0), mask)

img = img.resize((420, round(420 * ch / cw)), Image.LANCZOS)
img = ImageOps.colorize(img, black="#000000", mid="#1f8f4e", white="#c8ffd9", midpoint=110)
img.save("scripts/portrait-source.png", optimize=True)
print("scripts/portrait-source.png", img.size)
