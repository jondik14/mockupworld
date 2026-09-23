# Handoff / decision log

Paper trail for the rebuild. Newest session first. User-facing docs are in
`README.md` (how to run and add images), `DESIGN.md` (craft bar) and
`CLAUDE.md` (agent rules).

## Session 3 (Opus): Luke's feedback → new-direction prototype

Luke saw the session-2 screenshots and said it's **not how he wants it**:

- Grid structure should be like https://www.cosmos.so/public-work (an
  infinite canvas you drag in every direction; images at natural ratios).
- The mockups should be like what real mockup sites sell.
- Users need an easy way to put their own UI in: maybe an AI-prompt
  button, or a Figma / Photoshop route.

Research: Mockuuups (drag-drop editor, Figma/Sketch/Adobe plugins), LS.Graphics
("Edit Online", 654 clay mockups), Mockup World (PSD smart objects). **Every
competitor lets users insert their own screen.** A catalog of baked-in-UI
images isn't what this market buys. Popular types: hands, flat lay,
floating 3D, clay, lifestyle, pocket. **Name clash:** "Mockup World"
(mockupworld.co) is an established free-mockup site, so the repo name needs
changing before launch.

Built `prototype/` (see its README), live at
https://claude.ai/artifact/6RKQS7e5mdbAKtZ23ME6Bi:
- A Public-Work-style draggable canvas, search + chips, and a focus panel.
  Similars dim the rest of the canvas, which is the "cluster" idea on the map.
- 22 clay iPhone renders made with three.js (not CSS fakes) across 7 sample
  app screens.
- Drop / upload / paste your own screen. It's warped with an exact
  homography + mask. Copy image to paste into Figma/PS. Figma plugin and PSD
  are listed as planned.

Recommendation given to Luke: **don't use AI to place the UI.** Generative
models redraw the pixels (text and icons get mangled), cost money per use,
and would open the public-gen surface the direction lock forbids. The
deterministic warp is exact, instant and free. If AI helps anywhere, it's
offline scene generation by Luke. The data-model change this implies is that
every mockup needs `quad` + `mask`.

Then Luke asked for it **on a live Vercel link to hand to the "grokbot team"**.
So the prototype was ported into the Next app as the homepage:
- `/` = Atlas (`components/atlas/*`, `lib/atlas.ts`, `data/atlas.json`,
  `public/atlas/`). The real site also gets a working **Download** button,
  which the artifact sandbox couldn't offer.
- The session-2 catalog moved to `/catalog` (legacy, kept for reference with
  `/lab`). `data/mockups.json` + `validate-seed` belong to that legacy route.
- `CLAUDE.md` rewritten for the new direction; `README.md` has deploy steps.
- **Not deployed from here**: this session has no Vercel credentials. Luke
  imports the GitHub repo in Vercel once (steps in README) and pushes then
  auto-deploy.

Open for Luke: feedback on canvas feel, clay style, and which mockup types
next (hands / lifestyle need a photo or AI-scene pipeline that also outputs
quad + mask). Product name.

## State at end of session 2

- `npm run lint`, `npm run build` and `npm run validate-seed` all green.
- Verified in a real browser (Playwright, 1440px + 390px) against the
  production build. Filters, jump, focus stage, similars (12), Esc, arrow
  keys, scroll lock, no horizontal overflow, no console errors. Image
  pipeline tested end to end with a throwaway `.webp` (tile and hero switch
  from pending to image, Download goes live), then the file was removed.
- **No real images exist.** All 60 tiles show the pending glyph. This is the
  one thing between the repo and "done" per the direction lock
  ("grid is image-backed").

### Next steps (for Luke / next session)

1. Generate and composite images per the pipeline research, then drop
   them in `public/mockups/{id}.webp`. `npm run validate-seed -- --missing`
   lists the filenames.
2. Retag each entry in `data/mockups.json` to match its real image. The
   placeholder style/mood are cycled evenly and carry no meaning yet.
3. Deploy to the existing Vercel project `ai-mockup-grid`. This repo isn't
   linked to it from here, so it needs the Vercel CLI/dashboard on Luke's side.
4. Open questions still with Luke/Boss (not decided here): seed target 50 vs
   150, hosting domain, timing vs LUNIC retainer work.
5. Cheap P1 follow-ups if wanted: `?m={id}` deep link to the focus stage;
   blur placeholders once images exist.

## Session 2 (Opus): review + finish

Took over from session 1 and reviewed before continuing. Changes:

- **Seed moved to `data/mockups.json`** (from a TS generator). The spec calls
  for a static JSON seed, and once real images land Luke has to retag
  individual cards, which a generator can't hold. The same 60 entries were
  frozen as-is. `lib/mockups.ts` now just loads the JSON + checks files.
- **`scripts/validate-seed.mjs`** (`npm run validate-seed`): unique ids, id
  format matches tags, enums valid, image src matches id, and a tag coverage
  report. Missing images are reported but don't fail it.
- **FocusStage fixes.** The arrow-key cursor started at 0 (first press
  skipped the closest match) and meant nothing after a refocus. Arrows now
  move keyboard focus through the similars strip, and Enter opens. The
  overlay no longer re-flashes when you click a similar (it opens once, then
  the content crossfades and scrolls to the top). Added a double-close guard,
  body scroll lock and `role="dialog"`. Lint's `set-state-in-effect` error
  is gone.
- **CSS layering bug.** The global `* { border-color }` and `.glass` rules
  were unlayered, and in Tailwind 4 unlayered CSS beats every utility, so
  border-color utilities were silently ignored. Moved them into `@layer base`
  / `@layer components`.
- **Real tessellation.** Session 1 rendered each 1–2 card cluster as its own
  5-column row (35 mostly empty strips). Now each environment is a region
  and its ui_type clusters are packs tiling one shared grid (`dense` flow,
  pack spans its card count, labels per pack).
- **Sticky full-bleed filter band** under the nav. Without it, the jump-to-
  grid scroll pushed the chips off-screen. On mobile each chip row scrolls
  horizontally, keeping "max 2 chip rows" at every width.
- **Focus stage layout + CTA.** Two columns on desktop (hero | meta, CTA,
  4-col similars) so everything fits above the fold. Added the download CTA
  from the direction lock's v1 IA: a real `download` link when the image
  exists, a disabled "image pending" button otherwise. No fake checkout.
- **Quieter pending tiles.** The outline glyph only, title on hover/focus
  (was "IMAGE PENDING" text × 59).
- `/lab` now also demos ClusterSection and FocusStage. `CLAUDE.md` now holds
  real agent rules (plan task 1). Wrote the README (was create-next-app
  boilerplate), `DESIGN.md`, and updated `public/mockups/README.md`.

## Session 1 (Sonnet): scaffold

The user pasted a "Boss bot" chat dump, then uploaded the real specs
mid-session. The Desktop paths in chat don't exist in this cloud container,
and the repo was empty (README only), so the project was scaffolded fresh
(`create-next-app`: Next 16.3.6, React 19.2.8, Tailwind 4) and built to the
specs. Early guesses at the tag enums were corrected once the files arrived.

### Spec files (uploaded to ephemeral session storage; summarized here)

1. **CLAUDE-CODE-DIRECTION.md** (direction lock). Premium curated iPhone UI
   catalog, browse-only. IA: grid → chips → focus + 8–12 similars → download
   / soft-paywall placeholder (no fake checkout). Landing line
   "iPhone UI, in the wild." Never: model keys, `/api/generate`, gen forms,
   playground. CSS PhoneFrame placeholders are not shippable.
2. **CLAUDE-CODE-PLAN.md** (G/H/J). Data model, ordered tasks, CLAUDE.md
   draft. Tags: device `iphone`; environment `desk|cafe|transit|outdoor|
   dark`; ui_type `home|onboarding|feed|settings|paywall|empty|error`;
   style `clean|glass|bold|minimal|data-heavy`; mood `calm|energetic|
   premium|playful`. Weights ui_type 3, environment 2, style 1, mood 1.
   Cluster = environment × ui_type. id `iphone-{env}-{ui}-{nn}`.
3. **DESIGN-SYSTEM-CLAUDE.md**. Glass design system, GSAP. Near-black
   canvas, one cyan/ice-blue accent (not purple), component list, `/lab`
   route. Guardrail (stated twice): glass/GSAP on shell only; tiles quiet.
4. **IMAGE-PIPELINE.md**. Competitor pricing (Placeit, Mockuuups, Rotato,
   Angle, Pebblely, PhotoAI) and a generation pipeline (Flux schnell/Pro via
   fal, ComfyUI IP-Adapter/ControlNet for device consistency, Figma UI
   composited into the screen, QA checklist, weekly batch ritual). Licensing
   note: FLUX.1 [dev] is non-commercial.
5. **MVP-SPEC.md**. Niche lock; chips for environment + ui_type only (max 2
   rows); no free-text search; bounded similars; no accounts/payments.
6. **README.md** (old scaffold). Seed distribution home/onboarding/feed/
   settings/paywall = 10 each, empty/error = 5 each (kept).
7. **RESEARCH-PACK.md**. The narrative version plus open questions (above).

### Judgment calls still standing

- Filter chips filter clusters **and** scroll to the grid. There's no
  spatial camera map; an infinite canvas is explicitly P2.
- Mood is not a filter chip (the direction doc mentions it once, but the
  plan and MVP spec both say environment + ui_type only).
- `gsap` used directly, not `@gsap/react`. No ScrollTrigger parallax (the
  guardrail deprioritizes it).
- No private `Prompt`/hash storage yet. No real generation data exists.
- Tailwind's `--radius-sm/md/lg` are intentionally remapped to 10/16/24px.
