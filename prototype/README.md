# Render pipeline: clay device mockups + drop-your-own-screen

The source of the 35 mockups shown at `/` in the real app (`public/atlas/`,
`data/atlas.json`). This folder is the **pipeline**, not the app —
`prototype/site/` is a separate, earlier single-file artifact snapshot kept
for reference (the URL Luke first saw); the live app supersedes it.

It covers four things Luke asked for (23 Sep, then again on device variety):

1. **Structure like cosmos.so/public-work**: an endless canvas you drag in
   any direction (built into the real app, not this pipeline).
2. **Mockups like real mockup sites, across device types**: iPhone, MacBook
   and Apple Watch, each with several angles (flat lay, floating, standing,
   perspective, isometric, duo/trio, back-and-front, close-up), rendered in
   three.js — not CSS fakes, not baked photos.
3. **Users can put their own UI in**: any screenshot is warped onto the
   mockup's screen with an exact perspective homography plus a per-mockup
   mask. Deterministic — the UI's pixels are never redrawn (see
   `components/atlas/compositor.ts` in the app).
4. **Getting it into Figma / Photoshop**: copy/download the composited PNG.
   A Figma plugin and PSD smart objects are listed as planned, not built.

## How a mockup is stored

Each mockup is `base image + screen quad + mask`, device-agnostic:

- `{id}.webp`: full render (a default sample screen baked in)
- `{id}-t.webp`: 640px thumb for the canvas
- `{id}-mask.png`: white where the screen is visible (handles rounded
  corners and anything overlapping the screen — a strap, a second device)
- `data.json` `quad`: the screen's TL, TR, BR, BL corners in image pixels

This works the same for a photographed or AI-generated mockup later:
whoever makes the image also records the four screen corners and a mask.

## Adding a device type

`render/render.html` has one `make*` builder per device (`makePhone`,
`makeMacBook`, `makeWatch`), each returning `{ group, screenMesh,
screenSize }`. A scene picks one via `kind: "iphone" | "macbook" | "watch"`
on a `devices[]` entry. **Every thin trim mesh (screen, bezel, crystal,
deck, camera plateau…) must sit further out than the parent shape's
`bevelThickness`**, or it renders invisible — `ExtrudeGeometry`'s bevel
extends *past* the nominal face, and depth-tests occlude anything closer
than that. Comments at each offset in `render.html` note the clearance
needed; if you add a new trim mesh, do the same.

## Regenerate everything

```bash
cd prototype/render
npm i three@0.170 playwright sharp
cp <Inter + Fraunces woff2> inter.woff2 fraunces.woff2   # for screens.html
python3 -m http.server 8765 &
node shot-screens.mjs        # 7 iPhone sample screens -> screens/*.png
node gen-desktop.mjs && node gen-watch.mjs   # writes screens-desktop.html, screens-watch.html
node shot-new-screens.mjs    # MacBook + Watch sample screens -> screens/*.png
node run.mjs scenes.json out # renders + masks + meta.json (~3-6s per scene)
cd .. && node render/export.cjs   # -> site/m, site/ui, site/data.json

# copy into the real app:
cp site/m/* ../public/atlas/m/
cp site/ui/* ../public/atlas/ui/
cp site/data.json ../data/atlas.json
```

Add or tweak a composition in `render/scenes.json`: `devices[]` (kind,
color, screen, camera-facing rotation, lidAngle for MacBook), `tags`
(`device` drives filtering/similarity in `lib/atlas.ts` — keep it one of
`iPhone | MacBook | Watch`), `cam`, `light`, optional `wall` and
`groundColor` (a ground tone distinct from the backdrop, e.g. for an
outdoor set — not used in the current 35, but wired up).

Headless Chromium runs WebGL through SwiftShader. Each render takes about
3–6s. After changing `render.html`, sanity-check a couple of scenes and
look at the actual PNG (not just that the quad numbers look plausible)
before rendering the full batch — a wrong camera or hinge sign still
produces valid-looking quad coordinates for an empty or wrong image.
