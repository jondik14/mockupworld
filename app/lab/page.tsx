import { ReactNode } from "react";
import { Button } from "@/components/ds/Button";
import { Chip } from "@/components/ds/Chip";
import { GlassPanel } from "@/components/ds/GlassPanel";
import { Tag } from "@/components/ds/Tag";
import { Stat } from "@/components/ds/Stat";
import { EmptyState } from "@/components/ds/EmptyState";
import { MockupCard } from "@/components/ds/MockupCard";
import { MagneticButton } from "@/components/ds/motion/MagneticButton";
import { getMockups } from "@/lib/mockups";

function Section({ title, note, children }: { title: string; note?: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-4 border-t border-white/8 py-10 first:border-t-0 first:pt-0">
      <div>
        <h2 className="font-display text-xl text-ink">{title}</h2>
        {note ? <p className="mt-1 max-w-lg text-sm text-ink-muted">{note}</p> : null}
      </div>
      <div className="flex flex-wrap items-center gap-4">{children}</div>
    </section>
  );
}

export default function LabPage() {
  const mockups = getMockups();
  const sample = mockups[0];

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <p className="text-xs uppercase tracking-wide text-ink-faint">/lab</p>
      <h1 className="font-display text-3xl text-ink">Design system showcase</h1>
      <p className="mt-2 max-w-lg text-ink-muted">
        Component reference for the catalog. Glass + GSAP stays reserved for shell
        chrome (nav, focus stage, filter bar) — grid tiles stay quiet and
        preview-first.
      </p>

      <Section title="Button" note="primary / secondary / ghost / icon">
        <Button variant="primary">Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="ghost">Ghost</Button>
      </Section>

      <Section title="Chip" note="selectable filter chip, multi-row safe">
        <Chip selected>Desk</Chip>
        <Chip>Cafe</Chip>
        <Chip>Transit</Chip>
      </Section>

      <Section title="GlassPanel" note="frosted shell container">
        <GlassPanel className="px-6 py-4 text-sm text-ink-muted">Glass panel content</GlassPanel>
      </Section>

      <Section title="Tag / Stat / EmptyState">
        <Tag>premium</Tag>
        <Stat label="60 of 60 mockups" />
      </Section>
      <div className="max-w-sm">
        <EmptyState hint="Shown when a filter combination has no cluster yet." />
      </div>

      <Section
        title="MockupCard"
        note="quiet, preview-first. Left: honest pending state. Right: image-backed once public/mockups has the file."
      >
        <div className="w-40">
          <MockupCard mockup={{ ...sample, hasImage: false }} />
        </div>
        <div className="w-40">
          <MockupCard mockup={sample} />
        </div>
      </Section>

      <Section title="MagneticButton" note="subtle cursor pull — reserved for shell CTAs">
        <MagneticButton>
          <Button variant="primary">Hover me</Button>
        </MagneticButton>
      </Section>
    </div>
  );
}
