# Design — craft bar

The bar is **expensive on first scroll**. That comes from the images, not
the chrome. Quiet gallery, big previews, type with spine. Condensed from
the direction lock and design-system brief (Sep 2026).

## Principles

- **Imagery first, chrome second.** The mockup is the product. Tiles carry
  no title strips or tag rows. Tags live in the focus stage.
- **No purple.** No AI-gradient sludge, soft neon, mesh backgrounds or
  zinc-starter emptiness. One electric accent, used sparingly.
- **Tessellation must feel intentional.** Clusters are visible as packs.
  Region boundaries are readable. A filter jump lands you on the grid.
- **Density without clutter.** Mobile-first. Max 2 chip rows on every width.
- **Honesty over faking.** No image means a quiet pending glyph. Never a
  CSS phone skeleton pretending to be a render.

## Tokens (`app/globals.css`)

| Token | Value | Use |
| --- | --- | --- |
| `--color-canvas` | `#07070a` | page |
| `--color-canvas-raised` | `#0e0e12` | tile / hero backing |
| `--color-ink` / `-muted` / `-faint` | `#f6f5f2` @ 100 / 62 / 36% | text hierarchy |
| `--color-accent` | `#4bd8ff` ice-blue | primary CTA, selected chip. Nothing else. |
| `--color-warm` | `#d99a5b` | reserved for desk-scene atmosphere (unused so far) |
| `--glass-bg` | `color-mix(in oklab, white 8%, transparent)` + 20px blur | shell chrome |
| radii | 10 / 16 / 24px (`rounded-sm/md/lg` are remapped to these) | chips are pills |
| shadows | cool-tinted `rgba(2,6,12,…)` | never brown |

Type: **Fraunces** (display serif: headline, region names, focus title) +
**Inter** (UI). Labels are small uppercase with wide tracking.

Global styles sit in `@layer base` / `@layer components`. In Tailwind 4,
unlayered CSS beats every utility, so don't add rules outside a layer.

## Glass + motion guardrail (non-negotiable)

- Glass and GSAP are **shell only**: nav, sticky filter band, page enter,
  focus stage open/close.
- Grid tiles are still images with a CSS hover (scale ≤ 1.02). No per-tile
  frost, bounce, magnetic pull or stagger.
- Timing: interactions finish under 1s. Ease is `power3.out`.
- `prefers-reduced-motion` snaps to end states.
- If motion fights the mockup, kill the motion. No React Bits /
  aceternity-style effect stacks.

## Image QA: ship only if all true

- Device proportions and camera module match the master iPhone plate
- UI is readable at 200px thumb **and** 1600px hero; no melted type
- Light direction matches screen reflections; the grade matches its pack siblings
- Hands and props are anatomically OK, or cropped out
- Tags in `data/mockups.json` are corrected to what the image actually shows
- Model + date logged. For a paid catalog use FLUX schnell/Pro or other
  commercially licensed output, **not** FLUX.1 [dev].

Expect to ship ~40–60% of composites. Ruthless curation is the brand.
