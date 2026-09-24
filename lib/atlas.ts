import seed from "@/data/atlas.json";

export type Point = [number, number];
export type Device = "iPhone" | "MacBook" | "Watch";

export interface AtlasItem {
  id: string;
  title: string;
  tags: { device: Device; angle: string; color: string; screen: string; tone: string };
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

interface SampleScreen {
  name: string;
  label: string;
}

// One sample-screen set per device, matched to that device's screen shape —
// a phone screenshot dropped on a Watch (or vice versa) would need heavy
// letterboxing to look right, so the panel only ever offers the matching set.
export const SAMPLE_SCREENS: Record<Device, SampleScreen[]> = {
  iPhone: [
    { name: "onboarding", label: "onboarding" },
    { name: "feed", label: "feed" },
    { name: "paywall", label: "paywall" },
    { name: "home", label: "home" },
    { name: "player", label: "player" },
    { name: "wallet", label: "wallet" },
    { name: "settings", label: "settings" },
  ],
  MacBook: [
    { name: "dashboard", label: "dashboard" },
    { name: "shopfront", label: "shopfront" },
    { name: "editor", label: "editor" },
  ],
  Watch: [
    { name: "watchface", label: "watch face" },
    { name: "workout", label: "workout" },
  ],
};

export const sampleScreenPath = (device: Device, name: string) => `/atlas/ui/${device.toLowerCase()}-${name}.webp`;

/** Screen aspect (w / h) a quad was authored at, from its own corners — not a global constant, since devices differ. */
export function quadAspect(quad: AtlasItem["quad"]): number {
  const [tl, tr, br, bl] = quad;
  const dist = (a: Point, b: Point) => Math.hypot(a[0] - b[0], a[1] - b[1]);
  const width = (dist(tl, tr) + dist(bl, br)) / 2;
  const height = (dist(tl, bl) + dist(tr, br)) / 2;
  return width / height;
}

export const DEVICES: Device[] = ["iPhone", "MacBook", "Watch"];

export const QUICK_FILTERS = [
  "iPhone", "MacBook", "Watch", "Flat lay", "Floating", "Standing", "Hero", "Duo", "Trio", "Close-up", "Dark", "Shopfront",
];

const haystack = (d: AtlasItem) => [d.title, ...Object.values(d.tags)].join(" ").toLowerCase();

export function search(items: AtlasItem[], query: string): AtlasItem[] {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  return items.filter((d) => terms.every((t) => haystack(d).includes(t)));
}

// Deterministic tag overlap: device 4, angle 3, screen 2, colour 1, tone 1.
// Device dominates — a MacBook should never rank as "similar" to a Watch.
function score(a: AtlasItem, b: AtlasItem): number {
  return (
    (a.tags.device === b.tags.device ? 4 : 0) +
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
