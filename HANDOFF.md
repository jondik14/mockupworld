# Handoff — mockupworld rebuild in progress

Session context: user pasted a multi-message "Boss bot" chat dump asking for
an AI mockup-grid rebuild, then uploaded the real spec files mid-turn (paths
under `/root/.claude/uploads/...` — those are this session's ephemeral
upload slots and will NOT be readable in a future session/container, so
their content is summarized in full below). User then said they're
switching to Opus and asked for a paper trail before handing off.

## Spec files read in full (summarized — originals not durably reachable)

1. **CLAUDE-CODE-DIRECTION.md** — "direction lock." Premium curated iPhone
   UI catalog, browse-only (no public gen). v1 IA: home grid → chips
   (environment/ui_type) → focus w/ 8–12 similars by tag overlap → download/
   soft-paywall placeholder (no fake checkout). Landing line locked:
   **"iPhone UI, in the wild."** Hard boundary: no Replicate/fal/OpenAI keys,
   no `/api/generate`, no gen forms/model pickers/credit UX/playground.
   CSS PhoneFrame placeholders explicitly **not shippable**.
2. **CLAUDE-CODE-PLAN.md** (sections G/H/J) — full data model + ordered task
   list + paste-ready CLAUDE.md draft. Locked tag vocabulary:
   `device: "iphone"` (single value v1), `environment: desk|cafe|transit|
   outdoor|dark`, `ui_type: home|onboarding|feed|settings|paywall|empty|
   error`, `style: clean|glass|bold|minimal|data-heavy`, `mood: calm|
   energetic|premium|playful`. Similarity weights: `ui_type=3, environment=2,
   style=1, mood=1`, top 8–12, score>0, stable sort by id. Cluster key =
   `environment:ui_type`. mockup_id format `iphone-{env}-{ui}-{nn}`.
3. **DESIGN-SYSTEM-CLAUDE.md** — bold glass design system, GSAP-forward for
   *shell only*. Tokens: near-black canvas, one electric accent (cyan/ice-
   blue, **not purple**), glass via `color-mix(in oklab, white 8%,
   transparent)` + blur 16–24px. Component list: Button, Chip, GlassPanel,
   MockupCard, ClusterSection, FocusStage, NavBar, Tag/Stat/EmptyState,
   motion primitives (FadeUp, StaggerChildren, MagneticButton, PageEnter).
   **Non-negotiable guardrail** (stated twice in the doc): glass+GSAP is
   shell-only (nav, page enter/exit, focus open/close, filter chrome).
   **Grid tiles must stay quiet/preview-first** — still images, hover ≤1.02
   scale, no per-tile frost/bounce/magnetic/stagger.
4. **IMAGE-PIPELINE.md** — monetisation/competitor research (Placeit,
   Mockuuups, Rotato, Pebblely, PhotoAI) + a real image-gen pipeline
   (Flux/ComfyUI/Ideogram, IP-Adapter, seed locking, QA checklist, weekly
   batch ritual). Not implemented here (needs Luke's actual asset
   generation) — only the *drop pipeline contract* matters for this repo:
   `public/mockups/{mockup_id}.webp`.
5. **MVP-SPEC.md** — 1-pager, confirms niche lock (iPhone, 5 environments),
   tag schema, "chip filters for environment + ui_type (max 2 chip rows)",
   no free-text search, bounded similars (~8–12), non-goals (accounts,
   payments, uploads, prompt playground).
6. **README.md** (original scaffold) — confirms prior stack facts: Next 16 /
   React 19 / Tailwind 4, 60-card seed, env×ui_type distribution observed as
   `home/onboarding/feed/settings/paywall=10 each, empty/error=5 each`
   (reproduced deliberately in the new seed generator).
7. **RESEARCH-PACK.md** — full narrative version of the above plus open
   questions for Luke/Boss (seed count 50 vs 150, hosting domain, timing vs
   LUNIC) — **not resolved here**, not this session's call.

## What's built (this repo, branch `claude/modest-tesla-a0j3y5`)

- Scaffolded fresh with `create-next-app` (Next 16.3.6, React 19.2.8,
  Tailwind 4, TS, App Router, Turbopack) since the repo was empty (just a
  placeholder README) — the "Desktop" project paths referenced in chat
  don't exist in this cloud container.
- `lib/types.ts` — corrected tag vocabulary (see above).
- `lib/mockups.ts` — seed generator: 60 cards, 12/environment, mockup_id
  `iphone-{env}-{ui}-{nn}`, style cycles 5-wide / mood cycles 4-wide across
  the 60 items (even coverage — fixes the original scaffold's mood bug
  where only 2 of 4 mood values were ever used). `hasImage` is computed via
  `fs.existsSync` against `public/mockups/{id}.webp` — **no image files
  exist yet**, so every card currently renders the honest "pending" state.
- `lib/similarity.ts` — deterministic weighted tag overlap, matches spec
  exactly.
- `lib/clusters.ts` — derives clusters (`environment:ui_type`) in a fixed
  order for stable tessellation.
- `components/ds/*` — Button, Chip, GlassPanel, Tag, Stat, EmptyState,
  NavBar (sticky, glass on scroll), MockupCard (quiet tile; honest
  "image pending" placeholder — **not** a fake CSS phone UI — when
  `hasImage` is false), ClusterSection, FocusStage (modal: hero preview +
  similars strip, GSAP open/close, Esc + arrow-key cycling between
  similars), `motion/{PageEnter,FadeUp,StaggerChildren,MagneticButton}`.
- `components/CatalogView.tsx` — client component wiring filters (chip rows
  for environment + ui_type only — mood filter was mentioned once in the
  direction doc but the more detailed plan/spec docs both say environment+
  ui_type only, so that's what's implemented), cluster grid, focus stage,
  count line (`N of M mockups`).
- `app/page.tsx` — server component, loads seed + clusters, renders
  `CatalogView`. Landing line "iPhone UI, in the wild." + one-line
  interaction hint, per spec.
- `app/lab/page.tsx` — `/lab` showcase of every ds component.
- `app/globals.css` — design tokens (canvas `#07070a`, ink, one electric
  accent `#4bd8ff`, glass via `color-mix`, `prefers-reduced-motion` handled
  globally).
- `public/mockups/README.md` — documents the image drop pipeline naming
  convention for Luke.
- **`npm run build` passes clean** (verified just before this handoff —
  3 static routes: `/`, `/lab`, `/_not-found`).

## Judgment calls / deviations (flag these to the user if it matters)

- Used `gsap` directly with `useEffect`/`useLayoutEffect` instead of
  `@gsap/react` + ScrollTrigger (the design doc mentioned both). Simpler,
  one fewer dependency, and no scroll-triggered parallax was implemented
  since the guardrail deprioritizes it ("don't parallax every card"). Easy
  to add `@gsap/react`'s `useGSAP` later if wanted.
- Filter chip interaction: on chip select, this filters the visible
  clusters *and* smooth-scrolls to the top of the catalog. The plan doc's
  wording ("jump to cluster region, don't dump an infinite list") was a bit
  ambiguous between true filtering vs. a spatial camera-jump; a true
  infinite-canvas map engine is explicitly P2/out of scope, so plain
  filter+scroll was chosen as the bounded, deterministic interpretation.
- No `Prompt` type / private prompt-hash storage implemented — there's no
  real generation data yet, so this felt premature; noted as a P1 item
  instead of building for a hypothetical.
- Tailwind's built-in `--radius-sm/md/lg` CSS variable names were
  deliberately redefined in `:root` to the design system's larger radii
  (10/16/24px) — this globally reskins `rounded-sm/md/lg` utilities, which
  is intentional here (consistent premium radius scale) but worth knowing
  if anyone reaches for a "default" Tailwind radius later.

## Not done yet (tasks #9–#11 in the task list)

9. `DESIGN.md` (craft bar, full pipeline doc) + rewrite root `README.md` for
   the new stack (still has the create-next-app boilerplate text right now).
10. `scripts/validate-seed.mjs` — assert unique ids, required tags present,
    report which `mockup_id`s are still missing an image file.
11. Final build re-check, `git add`, commit, push to
    `claude/modest-tesla-a0j3y5`.

**As of this handoff**: build is green but nothing has been committed yet.
Committing this handoff + all work-in-progress now as a checkpoint so it
survives the model switch, per the user's request for a paper trail.
