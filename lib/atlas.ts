import seed from "@/data/atlas.json";

export type Point = [number, number];

export interface AtlasItem {
  id: string;
  title: string;
  tags: { angle: string; color: string; screen: string; tone: string };
  /** Dominant backdrop colour, used as the tile placeholder while loading. */
  bg: string;
  w: number;
  h: number;
  /** Screen corners in image pixels: TL, TR, BR, BL of the UI. */
  quad: [Point, Point, Point, Point];
}

export const ATLAS: AtlasItem[] = seed as AtlasItem[];

export const assetPath = {
  full: (id: string) => `/atlas/m/${id}.webp`,
  thumb: (id: string) => `/atlas/m/${id}-t.webp`,
  mask: (id: string) => `/atlas/m/${id}-mask.png`,
};

export const SAMPLE_SCREENS = ["onboarding", "feed", "paywall", "home", "player", "wallet", "settings"] as const;
export const sampleScreenPath = (name: string) => `/atlas/ui/${name}.webp`;

/** Width / height of the phone screen the quads were measured on. */
export const SCREEN_ASPECT = 393 / 852;

export const QUICK_FILTERS = [
  "Flat lay", "Floating", "Standing", "Perspective", "Duo", "Trio", "Close-up", "Dark", "Paywall", "Onboarding", "Wallet",
];

const haystack = (d: AtlasItem) => [d.title, ...Object.values(d.tags)].join(" ").toLowerCase();

export function search(items: AtlasItem[], query: string): AtlasItem[] {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  return items.filter((d) => terms.every((t) => haystack(d).includes(t)));
}

// Deterministic tag overlap: angle 3, screen 2, colour 1, tone 1.
function score(a: AtlasItem, b: AtlasItem): number {
  return (
    (a.tags.angle === b.tags.angle ? 3 : 0) +
    (a.tags.screen === b.tags.screen ? 2 : 0) +
    (a.tags.color === b.tags.color ? 1 : 0) +
    (a.tags.tone === b.tags.tone ? 1 : 0)
  );
}

export function similars(target: AtlasItem, items: AtlasItem[], limit = 9): AtlasItem[] {
  return items
    .filter((x) => x.id !== target.id)
    .map((x) => [x, score(target, x)] as const)
    .filter(([, s]) => s > 0)
    .sort((p, q) => q[1] - p[1] || p[0].id.localeCompare(q[0].id))
    .slice(0, limit)
    .map(([x]) => x);
}
