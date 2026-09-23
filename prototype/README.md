# Prototype v1: Public-Work-style canvas + clay mockups

Live (private to Luke until shared): https://claude.ai/artifact/6RKQS7e5mdbAKtZ23ME6Bi

A throwaway, single-file prototype for **feedback on direction**. It is not
wired into the Next app yet. It tests four things Luke asked for on 23 Sep:

1. **Structure like cosmos.so/public-work**: a full-screen canvas you drag in
   any direction, staggered columns that repeat forever, and a floating search bar.
2. **Mockups like real mockup sites**: 22 clay-style iPhone renders (flat lay,
   floating, standing, leaning, perspective, isometric, duo, trio, back and
   front, close-up), made in three.js for this demo.
3. **Users can put their own UI in**: drop, upload or paste (⌘V, including
   Figma's ⇧⌘C "Copy as PNG") a screenshot. It's warped onto the phone screen
   with an exact perspective homography plus a per-mockup mask. The warp is
   deterministic, so the UI's pixels are never altered.
4. **Getting it into Figma / Photoshop**: "Copy image", then paste. A Figma
   plugin and PSD smart objects are listed as planned, not built.

## How a mockup is stored

Each mockup is `base image + screen quad + mask`:

- `m/{id}.webp`: full render (default sample UI baked in)
- `m/{id}-t.webp`: 640px thumb for the canvas
- `m/{id}-mask.png`: white where the screen is visible (handles rounded
  corners and anything overlapping the screen)
- `data.json` `quad`: the screen's TL, TR, BR, BL corners in image pixels

This works the same for AI or photographed mockups later. Whoever makes the
image also records the four screen corners and a mask.

## Regenerate the renders

```bash
cd prototype/render
npm i three@0.170 playwright sharp
cp <Inter + Fraunces woff2> inter.woff2 fraunces.woff2   # used by screens.html
python3 -m http.server 8765 &
node shot-screens.mjs                      # sample UI -> screens/*.png
node run.mjs scenes.json out               # renders + masks + meta.json
cd .. && node render/export.cjs            # -> site/m, site/ui, site/data.json
python3 -c "s=open('site/src.html').read();open('site/index.html','w').write(s.replace('/*DATA*/',open('site/data.json').read()))"
```

Add or tweak a composition in `render/scenes.json`: camera, phone rotations,
clay colour, sample screen, tags. Headless Chromium runs WebGL through
SwiftShader. Each render takes about 3–5s.
