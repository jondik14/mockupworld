import { Cluster, Mockup } from "@/lib/types";
import { MockupCard } from "./MockupCard";

const MAX_PACK_SPAN = 2;

/**
 * One labelled region (an environment) whose ui_type clusters tile a
 * shared grid: each pack spans as many columns as it has cards (capped so
 * it never exceeds a 2-col mobile grid) and `dense` flow fills the holes.
 * Inner and outer gaps match so every card sits on the same column grid.
 */
export function ClusterSection({
  id,
  title,
  clusters,
  onSelect,
}: {
  id?: string;
  title: string;
  clusters: Cluster[];
  onSelect?: (mockup: Mockup) => void;
}) {
  const total = clusters.reduce((sum, c) => sum + c.mockups.length, 0);

  return (
    <section id={id} className="scroll-mt-44 border-t border-white/8 pt-6 first:border-t-0 first:pt-0">
      <header className="mb-5 flex items-baseline gap-3">
        <h2 className="font-display text-3xl tracking-tight text-ink">{title}</h2>
        <span className="text-sm tabular-nums text-ink-faint">{total}</span>
      </header>

      <div
        className="grid gap-3"
        style={{ gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gridAutoFlow: "dense" }}
      >
        {clusters.map((cluster) => {
          const span = Math.min(cluster.mockups.length, MAX_PACK_SPAN);
          return (
            <div key={cluster.key} style={{ gridColumn: `span ${span}` }}>
              <p className="mb-2 text-[11px] uppercase tracking-[0.12em] text-ink-faint">
                {cluster.uiLabel}
              </p>
              <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${span}, minmax(0, 1fr))` }}>
                {cluster.mockups.map((mockup) => (
                  <MockupCard key={mockup.id} mockup={mockup} onSelect={onSelect} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
