"use client";

import { useMemo, useState } from "react";
import { Cluster, ENVIRONMENTS, Environment, Mockup, UI_TYPES, UiType } from "@/lib/types";
import { getSimilar } from "@/lib/similarity";
import { NavBar } from "./ds/NavBar";
import { Chip } from "./ds/Chip";
import { Stat } from "./ds/Stat";
import { ClusterSection } from "./ds/ClusterSection";
import { FocusStage } from "./ds/FocusStage";
import { EmptyState } from "./ds/EmptyState";
import { StaggerChildren } from "./ds/motion/StaggerChildren";
import { PageEnter } from "./ds/motion/PageEnter";

export function CatalogView({
  mockups,
  clusters,
}: {
  mockups: Mockup[];
  clusters: Cluster[];
}) {
  const [environment, setEnvironment] = useState<Environment | null>(null);
  const [uiType, setUiType] = useState<UiType | null>(null);
  const [focused, setFocused] = useState<Mockup | null>(null);

  const visibleClusters = useMemo(
    () =>
      clusters.filter(
        (c) => (!environment || c.environment === environment) && (!uiType || c.uiType === uiType),
      ),
    [clusters, environment, uiType],
  );

  const regions = useMemo(
    () =>
      ENVIRONMENTS.map(({ value, label }) => ({
        environment: value,
        label,
        clusters: visibleClusters.filter((c) => c.environment === value),
      })).filter((r) => r.clusters.length > 0),
    [visibleClusters],
  );

  const visibleCount = useMemo(
    () => visibleClusters.reduce((sum, c) => sum + c.mockups.length, 0),
    [visibleClusters],
  );

  const similars = useMemo(
    () => (focused ? getSimilar(focused, mockups, 12) : []),
    [focused, mockups],
  );

  function jumpTo(env: Environment | null, ui: UiType | null) {
    setEnvironment(env);
    setUiType(ui);
    requestAnimationFrame(() => {
      document.getElementById("catalog-grid")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  return (
    <>
      <NavBar right={<Stat label={`${visibleCount} of ${mockups.length} mockups`} />} />

      <PageEnter>
        <div className="mx-auto max-w-6xl px-4 pb-24 pt-10 sm:px-6">
          <div id="catalog-top" className="scroll-mt-20">
            <h1 className="font-display text-4xl leading-tight text-ink sm:text-6xl">
              iPhone UI, in the wild.
            </h1>
            <p className="mt-4 max-w-md text-ink-muted">
              Browse by scene and screen. Tap any mockup to pull up its closest matches.
            </p>
          </div>

          <div className="sticky top-14 z-20 mt-8 w-screen border-b border-white/8 bg-canvas/85 py-3 backdrop-blur-xl [margin-left:calc(50%-50vw)]">
          <StaggerChildren className="mx-auto flex max-w-6xl flex-col gap-2 px-4 sm:px-6">
            <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
              <Chip selected={environment === null} onClick={() => jumpTo(null, uiType)}>
                All scenes
              </Chip>
              {ENVIRONMENTS.map(({ value, label }) => (
                <Chip
                  key={value}
                  selected={environment === value}
                  onClick={() => jumpTo(environment === value ? null : value, uiType)}
                >
                  {label}
                </Chip>
              ))}
            </div>
            <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
              <Chip selected={uiType === null} onClick={() => jumpTo(environment, null)}>
                All screens
              </Chip>
              {UI_TYPES.map(({ value, label }) => (
                <Chip
                  key={value}
                  selected={uiType === value}
                  onClick={() => jumpTo(environment, uiType === value ? null : value)}
                >
                  {label}
                </Chip>
              ))}
            </div>
          </StaggerChildren>
          </div>

          <div id="catalog-grid" className="mt-10 flex scroll-mt-44 flex-col gap-14">
            {regions.length > 0 ? (
              regions.map((region) => (
                <ClusterSection
                  key={region.environment}
                  id={`env-${region.environment}`}
                  title={region.label}
                  clusters={region.clusters}
                  onSelect={setFocused}
                />
              ))
            ) : (
              <EmptyState hint="No cluster matches that combination yet — more scenes shipping." />
            )}
          </div>
        </div>
      </PageEnter>

      {focused ? (
        <FocusStage
          mockup={focused}
          similars={similars}
          onClose={() => setFocused(null)}
          onSelect={setFocused}
        />
      ) : null}
    </>
  );
}
