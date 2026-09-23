@AGENTS.md

# Atlas (repo: mockupworld): agent rules

Endless draggable canvas of iPhone mockups (Public-Work-style). Click →
closest matches + drop your own screen in. Luke Niccol's side project. Keep
changes tight. Read `HANDOFF.md` for the decision log before large changes.

## Direction (Luke, 23 Sep 2026; supersedes the earlier "Boss" docs)

- Structure: infinite canvas like cosmos.so/public-work. Not a paged grid.
- Mockups: the kinds real mockup sites sell (clay, flat lay, floating,
  hands, lifestyle…). Users must be able to put **their own UI** in.
- The earlier niche lock (5 environments × 7 ui_types, baked-in UI) is
  retired. It survives only in the legacy `/catalog` route.

## Hard boundaries (never cross)

- No public generation: no prompt boxes, `/api/generate`, model pickers,
  credits or "create your own". Placing a user's screen is deterministic
  (homography + mask) on purpose: AI would redraw their pixels.
- No model or API keys in the repo or client.
- No auth, Stripe or fake checkout until Luke asks.
- Never fake imagery with CSS phone drawings. Mockups are real renders or photos.
- Don't invent metrics or features Luke didn't ask for.

## Data

- `data/atlas.json` + `public/atlas/m/` is the catalog. Every mockup needs
  an image, a thumb, a screen `quad` (TL, TR, BR, BL px) and a mask PNG.
- Similarity is deterministic tag overlap in `lib/atlas.ts`. No embeddings.

## Craft

Imagery first, chrome quiet and monochrome, no purple. Tiles stay still
(opacity dim only). Motion only for drag inertia and the panel slide. Respect
`prefers-reduced-motion`. In `atlas.module.css`, keep element resets
inside `:where()` so single-class component styles win.

## Before pushing

`npm run lint && npm run build` green. Click through `/` in a browser:
drag, search, open a mockup, place a sample screen.
