# Dropping in real mockups

This folder is the only place catalog images live. At build time the app
checks for each seed entry's file here. A card renders its image as soon as
a matching file lands. No code changes needed.

## Naming

```
public/mockups/{id}.webp
```

`id` comes from `data/mockups.json` and follows
`iphone-{environment}-{uiType}-{nn}`, e.g. `iphone-desk-paywall-01.webp`.

```bash
npm run validate-seed -- --missing   # lists every filename still expected
```

## Format

- `.webp`, portrait 4:5, ~1024×1280. That's the card and hero aspect. Other
  ratios get center-cropped.
- One file per id. A variant is a new entry with the next `-NN`, not an
  overwrite.
- If the real image's style or mood differs from its placeholder tags,
  update the entry in `data/mockups.json`. Similars are only as good as
  the tags.

## Until a file exists

The card shows a quiet outline glyph (title on hover). The focus stage shows
"Image pending" with a disabled Download button. This is deliberate: CSS
phone-frame skeletons were rejected as a shippable placeholder.
