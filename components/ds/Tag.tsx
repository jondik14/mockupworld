import { ReactNode } from "react";
import clsx from "clsx";

export function Tag({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={clsx(
        "rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] uppercase tracking-wide text-ink-faint",
        className,
      )}
    >
      {children}
    </span>
  );
}
