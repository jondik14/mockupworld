# Dropping in real mockups

This folder is the **only** place real catalog images live. The app checks
this folder at build/render time — a card renders its image the moment a
matching file lands here, no code changes required.

## Naming

Every file must be named exactly after its `mockup_id`:

```
public/mockups/{mockup_id}.webp
```

`mockup_id` follows `iphone-{environment}-{ui_type}-{nn}`, e.g.
`iphone-desk-paywall-01.webp`. The full list of expected ids is generated
in `lib/mockups.ts` — run `node scripts/validate-seed.mjs` to print which
ids are still missing an image.

## Format

- `.webp`, portrait, ~1024x1280 (4:5) to match the card aspect ratio used
  in `components/ds/MockupCard.tsx`.
- One export per id. No device/UI variants under the same id — give it a
  new `mockup_id` instead (edit `lib/mockups.ts`'s seed if you need a new
  slot, or extend the per-environment counts).

## Until a file exists

Cards with no matching file render an honest "image pending" state (a
thin device outline, no fake photoreal UI) — see `MockupCard.tsx`. This is
intentional per the craft direction: CSS phone-frame skeuomorphs are not a
shippable placeholder, so we show nothing rather than fake it.
