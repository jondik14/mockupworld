import { ButtonHTMLAttributes, forwardRef } from "react";
import clsx from "clsx";

type Variant = "primary" | "secondary" | "ghost" | "icon";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

const VARIANT_CLASS: Record<Variant, string> = {
  primary: "bg-accent text-[var(--color-accent-ink)] hover:brightness-110",
  secondary: "glass text-ink hover:border-white/20",
  ghost: "text-ink-muted hover:text-ink",
  icon: "glass text-ink-muted hover:text-ink aspect-square p-0",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", className, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      className={clsx(
        "inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-colors duration-200",
        VARIANT_CLASS[variant],
        className,
      )}
      {...props}
    />
  );
});
