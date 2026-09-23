"use client";

import { ReactNode, useEffect, useState } from "react";
import clsx from "clsx";

export function NavBar({ right }: { right?: ReactNode }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 8);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={clsx(
        "sticky top-0 z-30 flex h-14 items-center justify-between px-4 transition-colors duration-300 sm:px-6",
        scrolled ? "bg-canvas/85 backdrop-blur-xl" : "bg-transparent",
      )}
    >
      <span className="font-display text-lg tracking-tight text-ink">Mockupworld</span>
      {right}
    </header>
  );
}
