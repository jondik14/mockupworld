import { Cluster, Mockup } from "@/lib/types";
import { MockupCard } from "./MockupCard";

export function ClusterSection({
  cluster,
  onSelect,
  id,
}: {
  cluster: Cluster;
  onSelect: (mockup: Mockup) => void;
  id?: string;
}) {
  return (
    <section id={id} className="scroll-mt-20">
      <h2 className="mb-3 flex items-baseline gap-2 font-display text-base text-ink-muted">
        {cluster.label}
        <span className="text-xs text-ink-faint">{cluster.mockups.length}</span>
      </h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {cluster.mockups.map((mockup) => (
          <MockupCard key={mockup.id} mockup={mockup} onSelect={onSelect} />
        ))}
      </div>
    </section>
  );
}
