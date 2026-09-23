"use client";

import Image from "next/image";
import { Mockup } from "@/lib/types";

interface MockupCardProps {
  mockup: Mockup;
  onSelect?: (mockup: Mockup) => void;
  priority?: boolean;
}

/**
 * Quiet and preview-first per the design guardrail: still image, a soft
 * hover (scale <= 1.02), no per-tile glass/GSAP. When no file exists yet
 * under public/mockups this renders an honest "pending" state instead of
 * a fake CSS phone UI.
 */
export function MockupCard({ mockup, onSelect, priority }: MockupCardProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect?.(mockup)}
      className="group relative block w-full overflow-hidden rounded-md bg-canvas-raised text-left ring-0 transition-transform duration-200 ease-out hover:scale-[1.02] focus-visible:outline-2 focus-visible:outline-accent"
      style={{ aspectRatio: "4 / 5" }}
      aria-label={mockup.title}
    >
      {mockup.hasImage ? (
        <Image
          src={mockup.image.src}
          alt={mockup.title}
          fill
          priority={priority}
          sizes="(min-width: 1024px) 20vw, (min-width: 640px) 33vw, 50vw"
          className="object-cover"
        />
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center gap-3 border border-white/8 px-4">
          <div className="h-16 w-9 rounded-[10px] border border-white/12" />
          <p className="text-center text-xs text-ink-faint">{mockup.title}</p>
          <p className="text-[10px] uppercase tracking-wide text-ink-faint/70">
            image pending
          </p>
        </div>
      )}
    </button>
  );
}
