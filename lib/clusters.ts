import { Cluster, ENVIRONMENTS, Mockup, UI_TYPES } from "./types";

/**
 * Clusters are derived, not stored: environment x ui_type. Order follows
 * the fixed environment/ui_type lists so the tessellation reads the same
 * on every render (no shuffling between filter states).
 */
export function buildClusters(mockups: Mockup[]): Cluster[] {
  const clusters: Cluster[] = [];

  for (const { value: environment, label: envLabel } of ENVIRONMENTS) {
    for (const { value: uiType, label: uiLabel } of UI_TYPES) {
      const key = `${environment}:${uiType}`;
      const members = mockups.filter((m) => m.clusterKey === key);
      if (members.length === 0) continue;

      clusters.push({
        key,
        label: `${uiLabel} · ${envLabel}`,
        uiLabel,
        environment,
        uiType,
        mockups: members,
      });
    }
  }

  return clusters;
}
