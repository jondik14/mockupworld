# Mockupworld

**iPhone UI, in the wild.** A curated, tagged catalog of iPhone UI mockups
shot in five real-world scenes. Browse by scene and screen, tap any mockup
to pull up its 8–12 closest matches by deterministic tag overlap, download
the one that fits.

Catalog-first: the library is made offline by Luke; visitors browse and
pick. There is deliberately **no public generation surface** — no prompt
box, no `/api/generate`, no model keys in the repo or client.

## Stack

Next.js 16 (App Router, Turbopack) · React 19 · Tailwind 4 · TypeScript ·
GSAP · static JSON seed · local images via `next/image`.

## Run

```bash
npm install
npm run dev            # http://localhost:3000   (/lab = design system)
npm run build          # must stay green
npm run lint
npm run validate-seed  # checks data/mockups.json; add -- --missing to list absent images
```

## Adding real images

1. Export the finished mockup as a portrait `.webp` (~1024×1280, 4:5).
2. Name it after its id and drop it in `public/mockups/`, e.g.
   `public/mockups/iphone-desk-paywall-01.webp`.
3. Rebuild. The card switches from the "pending" glyph to the image and the
   focus stage's **Download** button goes live. No code changes.

`npm run validate-seed -- --missing` prints every filename still expected.
Full contract: [`public/mockups/README.md`](public/mockups/README.md).

## Editing the catalog

`data/mockups.json` is the whole CMS. Each entry:

```json
{
  "id": "iphone-desk-home-01",
  "title": "Home · Desk",
  "device": "iphone",
  "environment": "desk",
  "uiType": "home",
  "style": "clean",
  "mood": "calm",
  "image": { "src": "/mockups/iphone-desk-home-01.webp", "width": 1024, "height": 1280 }
}
```

- `environment`: `desk | cafe | transit | outdoor | dark`
- `uiType`: `home | onboarding | feed | settings | paywall | empty | error`
- `style`: `clean | glass | bold | minimal | data-heavy`
- `mood`: `calm | energetic | premium | playful`

Retag an entry when its real image lands. The current 60 are placeholder
slots with evenly cycled style/mood, so their similars are only as
meaningful as those tags. To add a slot, append an entry with the next
`-NN` for that environment + screen. The validator enforces the id format
and enums (the enum lists live in both `lib/types.ts` and
`scripts/validate-seed.mjs`, so change them together).

## How it works

| Piece | File |
| --- | --- |
| Seed loader (+ checks which images exist) | `lib/mockups.ts` |
| Similarity: `ui_type` 3 · `environment` 2 · `style` 1 · `mood` 1, top 12, score > 0, ties by id | `lib/similarity.ts` |
| Clusters = `environment × ui_type` | `lib/clusters.ts` |
| Catalog shell: filters, regions, focus | `components/CatalogView.tsx` |
| Design system | `components/ds/*`, tokens in `app/globals.css` |

Layout: each environment is a region. Its `ui_type` clusters are packs that
tile one shared grid (`grid-auto-flow: dense`, each pack spans its card
count), so a scene reads as one dense block, not rows of strips. The chips
(max 2 rows, sticky) filter which clusters show and jump the view to the grid.

## Motion (GSAP)

GSAP is used directly (`gsap` + `useEffect`/`useLayoutEffect`), not via
`@gsap/react`. It's reserved for shell chrome:

- `PageEnter`: page fade/rise on load
- `StaggerChildren`: filter chip rows
- `FocusStage`: overlay + panel open/close, content crossfade on refocus
- `MagneticButton`: available for shell CTAs; currently unused on the catalog page

Grid tiles never animate beyond a CSS hover (scale ≤ 1.02).
`prefers-reduced-motion` snaps every GSAP recipe to its end state and zeroes
CSS transitions globally.

## Not in scope (yet)

Auth, Stripe/paywall, CDN (R2/Blob), admin gen queue, free-text search,
Android/desktop packs. See `DESIGN.md` for the craft bar and `HANDOFF.md`
for the decision log.
