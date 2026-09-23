import fs from "node:fs";
import path from "node:path";
import seed from "@/data/mockups.json";
import { Mockup } from "./types";

type SeedEntry = Omit<Mockup, "clusterKey" | "hasImage">;

const PUBLIC_DIR = path.join(process.cwd(), "public");

let cache: Mockup[] | null = null;

/** Server-only: checks public/ for each image so cards light up as files land. */
export function getMockups(): Mockup[] {
  if (cache) return cache;
  cache = (seed as SeedEntry[]).map((entry) => ({
    ...entry,
    clusterKey: `${entry.environment}:${entry.uiType}`,
    hasImage: fs.existsSync(path.join(PUBLIC_DIR, entry.image.src)),
  }));
  return cache;
}
