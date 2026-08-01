"""Render the .dot figures with Graphviz, verify no node overlaps, save JPGs.

Usage: python assets/figures/render.py
Requires: graphviz in PATH, Pillow.
"""

import pathlib
import re
import subprocess
import xml.etree.ElementTree as ET

from PIL import Image

OUT = pathlib.Path(r"C:\Users\KOLKATA\Desktop\opencode\NutriBasket\assets\figures")
DPIS = {1: 200, 2: 200, 3: 200, 4: 200, 5: 200}

NS = {"svg": "http://www.w3.org/2000/svg"}


def node_bboxes(svg_path):
    tree = ET.parse(svg_path)
    root = tree.getroot()
    scale = 1.0
    boxes = {}
    for g in root.findall(".//svg:g", NS):
        if g.get("class") != "node":
            continue
        title = g.find("svg:title", NS)
        name = title.text if title is not None else "?"
        bx = []
        for el in g.iter():
            tag = el.tag.rsplit("}", 1)[-1]
            if tag == "polygon":
                pts = [tuple(float(v) for v in p.split(",")) for p in el.get("points").split()]
                xs = [p[0] for p in pts]
                ys = [p[1] for p in pts]
                bx.append((min(xs), min(ys), max(xs), max(ys)))
            elif tag == "ellipse":
                cx, cy = float(el.get("cx")), float(el.get("cy"))
                rx, ry = float(el.get("rx")), float(el.get("ry"))
                bx.append((cx - rx, cy - ry, cx + rx, cy + ry))
        if bx:
            boxes[name] = (min(b[0] for b in bx), min(b[1] for b in bx),
                           max(b[2] for b in bx), max(b[3] for b in bx))
    return boxes


def check_overlaps(name, boxes, tol=1.0):
    names = list(boxes)
    problems = []
    for i in range(len(names)):
        for j in range(i + 1, len(names)):
            a, b = names[i], names[j]
            x1a, y1a, x2a, y2a = boxes[a]
            x1b, y1b, x2b, y2b = boxes[b]
            ox = min(x2a, x2b) - max(x1a, x1b)
            oy = min(y2a, y2b) - max(y1a, y1b)
            if ox > tol and oy > tol:
                problems.append(f"{a} <-> {b} overlap {ox:.0f}x{oy:.0f}px")
    if problems:
        print(f"  OVERLAPS in {name}:")
        for p in problems:
            print(f"    {p}")
    else:
        print(f"  {name}: no overlaps (all connections handled by graphviz)")
    return not problems


def main():
    ok = True
    for i in range(1, 6):
        dot = OUT / f"fig-4-{i}.dot"
        svg = OUT / f"fig-4-{i}.svg"
        png = OUT / f"fig-4-{i}.png"
        jpg = OUT / f"fig-4-{i}.jpg"
        subprocess.run(["dot", "-Tsvg", "-o", str(svg), str(dot)], check=True)
        boxes = node_bboxes(svg)
        ok &= check_overlaps(f"fig-4-{i}", boxes)
        subprocess.run(["dot", f"-Gdpi={DPIS[i]}", "-Tpng", "-o", str(png), str(dot)], check=True)
        img = Image.open(png).convert("RGBA")
        bg = Image.new("RGB", img.size, (255, 255, 255))
        bg.paste(img, mask=img.split()[-1])
        bg.save(jpg, "JPEG", quality=92)
        print(f"  fig-4-{i}.jpg {img.size[0]}x{img.size[1]}")
        svg.unlink()
        png.unlink()
    print("OK" if ok else "FIX NEEDED")


if __name__ == "__main__":
    main()
