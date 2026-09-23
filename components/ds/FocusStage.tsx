"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { Mockup } from "@/lib/types";
import { EASE_OUT, prefersReducedMotion } from "@/lib/motion";
import { Tag } from "./Tag";
import { MockupCard } from "./MockupCard";

interface FocusStageProps {
  mockup: Mockup;
  similars: Mockup[];
  onClose: () => void;
  onSelect: (mockup: Mockup) => void;
}

export function FocusStage({ mockup, similars, onClose, onSelect }: FocusStageProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const overlay = overlayRef.current;
    const panel = panelRef.current;
    if (!overlay || !panel) return;

    if (prefersReducedMotion()) {
      gsap.set([overlay, panel], { opacity: 1, y: 0, scale: 1 });
    } else {
      gsap.fromTo(overlay, { opacity: 0 }, { opacity: 1, duration: 0.25, ease: EASE_OUT });
      gsap.fromTo(
        panel,
        { opacity: 0, y: 20, scale: 0.98 },
        { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: EASE_OUT },
      );
    }
  }, [mockup.id]);

  function close() {
    const overlay = overlayRef.current;
    const panel = panelRef.current;
    if (!overlay || !panel || prefersReducedMotion()) {
      onClose();
      return;
    }
    gsap.to(panel, { opacity: 0, y: 12, scale: 0.98, duration: 0.2, ease: "power2.in" });
    gsap.to(overlay, { opacity: 0, duration: 0.2, ease: "power2.in", onComplete: onClose });
  }

  const [cursor, setCursor] = useState(0);

  useEffect(() => {
    setCursor(0);
  }, [mockup.id]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        close();
        return;
      }
      if (!similars.length) return;
      if (e.key === "ArrowRight") {
        const next = (cursor + 1) % similars.length;
        setCursor(next);
        onSelect(similars[next]);
      }
      if (e.key === "ArrowLeft") {
        const prev = (cursor - 1 + similars.length) % similars.length;
        setCursor(prev);
        onSelect(similars[prev]);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [similars, cursor]);

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div
        ref={panelRef}
        className="glass-strong flex max-h-[90vh] w-full max-w-4xl flex-col gap-6 overflow-y-auto rounded-lg p-5 sm:p-8"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl text-ink">{mockup.title}</h2>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <Tag>{mockup.style}</Tag>
              <Tag>{mockup.mood}</Tag>
              <Tag>{mockup.environment}</Tag>
              <Tag>{mockup.uiType}</Tag>
            </div>
          </div>
          <button
            type="button"
            onClick={close}
            aria-label="Close"
            className="glass shrink-0 rounded-full px-3 py-1.5 text-sm text-ink-muted hover:text-ink"
          >
            Esc
          </button>
        </div>

        <div className="relative mx-auto aspect-[4/5] w-full max-w-sm overflow-hidden rounded-md bg-canvas-raised">
          {mockup.hasImage ? (
            <Image
              src={mockup.image.src}
              alt={mockup.title}
              fill
              sizes="384px"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-3">
              <div className="h-20 w-11 rounded-[12px] border border-white/12" />
              <p className="text-xs uppercase tracking-wide text-ink-faint">image pending</p>
            </div>
          )}
        </div>

        <div>
          <p className="mb-3 text-xs uppercase tracking-wide text-ink-faint">
            Similar ({similars.length})
          </p>
          {similars.length > 0 ? (
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
              {similars.map((s) => (
                <MockupCard key={s.id} mockup={s} onSelect={onSelect} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-ink-faint">No overlapping tags yet — more scenes shipping.</p>
          )}
        </div>
      </div>
    </div>
  );
}
