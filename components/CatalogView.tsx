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
      document.getElementById("catalog-top")?.scrollIntoView({ behavior: "smooth", block: "start" });
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
              Tap a mockup to jump into a bounded cluster of tag-similar scenes.
            </p>
          </div>

          <StaggerChildren className="mt-8 flex flex-col gap-2.5">
            <div className="flex flex-wrap gap-2">
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
            <div className="flex flex-wrap gap-2">
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

          <div className="mt-12 flex flex-col gap-12">
            {visibleClusters.length > 0 ? (
              visibleClusters.map((cluster) => (
                <ClusterSection key={cluster.key} cluster={cluster} onSelect={setFocused} />
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
