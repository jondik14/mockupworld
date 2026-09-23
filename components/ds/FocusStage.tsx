"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { Mockup } from "@/lib/types";
import { EASE_OUT, prefersReducedMotion } from "@/lib/motion";
import { Button } from "./Button";
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
  const contentRef = useRef<HTMLDivElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);
  const closingRef = useRef(false);

  // Open once; refocusing a similar must not re-flash the overlay.
  useEffect(() => {
    const overlay = overlayRef.current;
    const panel = panelRef.current;
    if (!overlay || !panel || prefersReducedMotion()) return;
    gsap.fromTo(overlay, { opacity: 0 }, { opacity: 1, duration: 0.25, ease: EASE_OUT });
    gsap.fromTo(
      panel,
      { opacity: 0, y: 20, scale: 0.98 },
      { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: EASE_OUT },
    );
  }, []);

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    panelRef.current?.scrollTo({ top: 0 });
    if (contentRef.current && !prefersReducedMotion()) {
      gsap.fromTo(contentRef.current, { opacity: 0.4 }, { opacity: 1, duration: 0.25, ease: EASE_OUT });
    }
  }, [mockup.id]);

  function close() {
    if (closingRef.current) return;
    closingRef.current = true;
    const overlay = overlayRef.current;
    const panel = panelRef.current;
    if (!overlay || !panel || prefersReducedMotion()) {
      onClose();
      return;
    }
    gsap.to(panel, { opacity: 0, y: 12, scale: 0.98, duration: 0.2, ease: "power2.in" });
    gsap.to(overlay, { opacity: 0, duration: 0.2, ease: "power2.in", onComplete: onClose });
  }

  // Esc closes; arrows move keyboard focus along the similars strip (Enter opens).
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        close();
        return;
      }
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      const buttons = Array.from(stripRef.current?.querySelectorAll("button") ?? []);
      if (!buttons.length) return;
      e.preventDefault();
      const current = buttons.indexOf(document.activeElement as HTMLButtonElement);
      const step = e.key === "ArrowRight" ? 1 : -1;
      const next =
        current === -1
          ? step === 1
            ? 0
            : buttons.length - 1
          : (current + step + buttons.length) % buttons.length;
      buttons[next].focus();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

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
        role="dialog"
        aria-modal="true"
        aria-label={mockup.title}
        className="glass-strong max-h-[92vh] w-full max-w-6xl overflow-y-auto rounded-lg p-5 sm:p-8"
      >
        <div
          ref={contentRef}
          className="grid gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:items-start"
        >
          <div className="relative mx-auto aspect-[4/5] w-full max-w-md overflow-hidden rounded-md bg-canvas-raised lg:max-w-none">
            {mockup.hasImage ? (
              <Image
                src={mockup.image.src}
                alt={mockup.title}
                fill
                priority
                sizes="(min-width: 1024px) 520px, 90vw"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center gap-4">
                <div className="h-[34%] aspect-[9/19] rounded-[14px] border border-white/12" />
                <p className="text-xs uppercase tracking-[0.12em] text-ink-faint">Image pending</p>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-display text-3xl tracking-tight text-ink">{mockup.title}</h2>
                <div className="mt-3 flex flex-wrap gap-1.5">
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

            {mockup.hasImage ? (
              <a
                href={mockup.image.src}
                download
                className="inline-flex w-fit items-center rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-[var(--color-accent-ink)] transition hover:brightness-110"
              >
                Download .webp
              </a>
            ) : (
              <Button variant="secondary" disabled className="w-fit cursor-not-allowed opacity-50">
                Download — image pending
              </Button>
            )}

            <div>
              <p className="mb-3 text-xs uppercase tracking-[0.12em] text-ink-faint">
                Similar ({similars.length}) · ranked by shared tags
              </p>
              {similars.length > 0 ? (
                <div ref={stripRef} className="grid grid-cols-3 gap-3 sm:grid-cols-4">
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
      </div>
    </div>
  );
}
