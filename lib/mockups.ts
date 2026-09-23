import fs from "node:fs";
import path from "node:path";
import {
  ENVIRONMENTS,
  Environment,
  Mockup,
  MOODS,
  STYLES,
  UI_TYPES,
  UiType,
} from "./types";

// Per-environment ui_type distribution (12 cards/env x 5 envs = 60 total).
// Mirrors the shape of the original scaffold seed: the five everyday
// screens (home/onboarding/feed/settings/paywall) get double weight,
// empty/error stay rarer.
const UI_TYPE_COUNTS: Record<UiType, number> = {
  home: 2,
  onboarding: 2,
  feed: 2,
  settings: 2,
  paywall: 2,
  empty: 1,
  error: 1,
};

function uiTypeSequenceForEnvironment(): UiType[] {
  const sequence: UiType[] = [];
  for (const { value } of UI_TYPES) {
    for (let i = 0; i < UI_TYPE_COUNTS[value]; i += 1) {
      sequence.push(value);
    }
  }
  return sequence;
}

const MOCKUPS_DIR = path.join(process.cwd(), "public", "mockups");

function fileExists(filename: string): boolean {
  try {
    return fs.existsSync(path.join(MOCKUPS_DIR, filename));
  } catch {
    return false;
  }
}

function buildSeed(): Omit<Mockup, "hasImage">[] {
  const items: Omit<Mockup, "hasImage">[] = [];
  let globalIndex = 0;

  for (const { value: environment, label: envLabel } of ENVIRONMENTS) {
    const uiSequence = uiTypeSequenceForEnvironment();
    const perUiTypeCounter: Partial<Record<UiType, number>> = {};

    for (const uiType of uiSequence) {
      const uiLabel = UI_TYPES.find((u) => u.value === uiType)!.label;
      const nn = (perUiTypeCounter[uiType] ?? 0) + 1;
      perUiTypeCounter[uiType] = nn;

      const id = `iphone-${environment}-${uiType}-${String(nn).padStart(2, "0")}`;
      const style = STYLES[globalIndex % STYLES.length];
      const mood = MOODS[globalIndex % MOODS.length];

      items.push({
        id,
        title: `${uiLabel} · ${envLabel}`,
        device: "iphone",
        environment,
        uiType,
        style,
        mood,
        image: {
          src: `/mockups/${id}.webp`,
          width: 1024,
          height: 1280,
        },
        clusterKey: `${environment}:${uiType}`,
      });

      globalIndex += 1;
    }
  }

  return items;
}

let cache: Mockup[] | null = null;

export function getMockups(): Mockup[] {
  if (cache) return cache;
  cache = buildSeed().map((item) => ({
    ...item,
    hasImage: fileExists(`${item.id}.webp`),
  }));
  return cache;
}
