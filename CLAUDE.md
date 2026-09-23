@AGENTS.md

# Mockupworld — agent rules

Curated catalog of iPhone UI mockups in five scenes. Luke makes the library
offline; visitors browse → filter → focus → similars → download. Side
project, not LUNIC's primary product: keep changes tight.

## Hard boundaries (never cross)

- No public generation: no prompt boxes, `/api/generate`, model pickers,
  credit UX or "create your own".
- No Replicate / fal / OpenAI / other model keys in the repo or client.
- No auth, Stripe or fake checkout until explicitly asked. Hooks/stubs only.
- Niche lock: iPhone only · environments `desk cafe transit outdoor dark` ·
  ui_types `home onboarding feed settings paywall empty error`. No Android,
  desktop or tablet packs.
- Never fake imagery with CSS phone UIs. Missing image means the pending
  glyph.
- Don't invent metrics or features Luke didn't ask for.

## Craft

Read `DESIGN.md` before touching UI. In short: imagery first, no purple,
glass + GSAP on shell chrome only, grid tiles quiet (hover scale ≤ 1.02),
global CSS stays inside `@layer`.

## Data

- `data/mockups.json` is the seed/CMS. `npm run validate-seed` must pass.
- Similarity is deterministic tag overlap (`lib/similarity.ts`). No
  embeddings or model calls.
- Images: `public/mockups/{id}.webp`. See `public/mockups/README.md`.

## Before pushing

`npm run lint && npm run build && npm run validate-seed` all green.
