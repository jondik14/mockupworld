import { HTMLAttributes } from "react";
import clsx from "clsx";

interface GlassPanelProps extends HTMLAttributes<HTMLDivElement> {
  strong?: boolean;
}

export function GlassPanel({ strong, className, ...props }: GlassPanelProps) {
  return (
    <div
      className={clsx("glass-edge rounded-lg", strong ? "glass-strong" : "glass", className)}
      {...props}
    />
  );
}
