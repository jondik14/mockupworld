# Atlas (working name): iPhone mockups

> Working name. "Mockup World" (mockupworld.co) is an existing mockup site,
> so the product needs a real name before launch.

An endless, draggable canvas of iPhone mockups (structure modelled on
[Public Work by Cosmos](https://www.cosmos.so/public-work)). Click any
mockup to open its **closest matches** (deterministic tag overlap, dimmed
in place on the canvas), then **drop your own screen in**. It's placed
with exact perspective, so the user's UI pixels are never redrawn.

Live: see the Vercel project (set up below).
Decision log: `HANDOFF.md`. Agent rules: `CLAUDE.md`.

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind 4 (legacy pages)
+ CSS Modules (Atlas) · WebGL1 for the screen compositor. No backend, no
env vars, no API keys.

## Run

```bash
npm install
npm run dev     # http://localhost:3000
npm run lint && npm run build
```

## Routes

| Route | What |
| --- | --- |
| `/` | Atlas: infinite canvas, search + quick filters, focus panel, drop-your-screen |
| `/#<mockup-id>` | Deep link straight to a mockup's focus panel |
| `/catalog` | **Legacy** session-2 catalog (rejected design), kept for reference |
| `/lab` | **Legacy** design-system showcase for `/catalog` |

## How it's built

| Piece | File |
| --- | --- |
| Mockup data (tags, size, screen quad) | `data/atlas.json`, typed in `lib/atlas.ts` |
| Search + similarity (angle 3 · screen 2 · colour 1 · tone 1) | `lib/atlas.ts` |
| Infinite canvas (imperative, virtualised, drag + inertia + wheel) | `components/atlas/canvas.ts` |
| Screen placement (homography + mask, WebGL) | `components/atlas/compositor.ts` |
| UI | `components/atlas/Atlas.tsx`, `FocusPanel.tsx`, `atlas.module.css` |
| Assets | `public/atlas/m/{id}.webp` (full), `{id}-t.webp` (640px thumb), `{id}-mask.png`; `public/atlas/ui/*.webp` sample screens |

### A mockup = image + screen quad + mask

Every mockup needs, alongside its image:

- `quad`: the screen's four corners (TL, TR, BR, BL of the UI) in image pixels
- a mask PNG: white where the screen is visible, black elsewhere (rounded
  corners, fingers or other phones in front)

That's all the compositor needs to place any screenshot with correct
perspective, for 3D renders, AI scenes or photos alike. The current 22 clay
mockups come from the three.js pipeline in `prototype/render/`, which writes
all three automatically. See `prototype/README.md`.

To add a mockup: add its three files to `public/atlas/m/` and an entry to
`data/atlas.json`.

## Deploy (Vercel)

No environment variables needed. One-time setup:

1. vercel.com → **Add New… → Project** → import `jondik14/mockupworld`.
2. Framework: Next.js (auto-detected). Leave build settings at defaults.
3. Production branch: `main`. Until this work is merged, either set
   **Settings → Git → Production Branch** to `claude/modest-tesla-a0j3y5` or
   use that branch's Preview URL.

Every push then deploys automatically (a Preview for branches, Production for
the production branch).

## Not in scope (yet)

Accounts, payments, public AI generation (hard no, see `CLAUDE.md`), Figma
plugin and PSD export (shown as "planned" in the UI), real photographic /
hand-held mockups (need a generation or photo pipeline that also records
quad + mask).
