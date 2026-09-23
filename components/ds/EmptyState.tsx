export function EmptyState({
  title = "More scenes shipping",
  hint,
}: {
  title?: string;
  hint?: string;
}) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-white/10 px-8 py-16 text-center">
      <p className="font-display text-xl text-ink">{title}</p>
      {hint ? <p className="max-w-xs text-sm text-ink-muted">{hint}</p> : null}
    </div>
  );
}
