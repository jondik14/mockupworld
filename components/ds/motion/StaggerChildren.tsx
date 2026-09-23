"use client";

import { ReactNode, useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { EASE_OUT, prefersReducedMotion } from "@/lib/motion";

/**
 * Staggers its immediate DOM children on mount. Reserved for shell chrome
 * (nav items, filter rows) — never for grid tiles (see design guardrail).
 */
export function StaggerChildren({
  children,
  className,
  stagger = 0.03,
}: {
  children: ReactNode;
  className?: string;
  stagger?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const items = Array.from(el.children);

    if (prefersReducedMotion()) {
      gsap.set(items, { opacity: 1, y: 0 });
      return;
    }

    gsap.fromTo(
      items,
      { opacity: 0, y: 10 },
      { opacity: 1, y: 0, duration: 0.4, ease: EASE_OUT, stagger },
    );
  }, [stagger]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
