import { ButtonHTMLAttributes } from "react";
import clsx from "clsx";

interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean;
}

export function Chip({ selected, className, ...props }: ChipProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      className={clsx(
        "rounded-full border px-3.5 py-1.5 text-sm transition-colors duration-150 whitespace-nowrap",
        selected
          ? "border-accent/40 bg-accent-soft text-ink"
          : "border-white/10 text-ink-muted hover:text-ink hover:border-white/20",
        className,
      )}
      {...props}
    />
  );
}
