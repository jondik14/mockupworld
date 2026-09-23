import { Mockup } from "./types";

// Deterministic tag-overlap scoring — no model call, no embeddings.
const WEIGHTS = {
  uiType: 3,
  environment: 2,
  style: 1,
  mood: 1,
} as const;

export function overlapScore(a: Mockup, b: Mockup): number {
  if (a.id === b.id) return -1;
  let score = 0;
  if (a.uiType === b.uiType) score += WEIGHTS.uiType;
  if (a.environment === b.environment) score += WEIGHTS.environment;
  if (a.style === b.style) score += WEIGHTS.style;
  if (a.mood === b.mood) score += WEIGHTS.mood;
  return score;
}

export function getSimilar(target: Mockup, pool: Mockup[], limit = 12): Mockup[] {
  return pool
    .map((candidate) => ({ candidate, score: overlapScore(target, candidate) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || a.candidate.id.localeCompare(b.candidate.id))
    .slice(0, limit)
    .map(({ candidate }) => candidate);
}
