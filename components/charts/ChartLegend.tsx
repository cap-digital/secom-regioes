"use client";

export interface LegendItem {
  label: string;
  color: string;
}

// Compact horizontal legend (color dot + label) for charts without a built-in
// legend, e.g. the multi-line TrendLines.
export function ChartLegend({ items }: { items: LegendItem[] }) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
      {items.map((it) => (
        <span key={it.label} className="flex items-center gap-1.5 text-xs text-muted">
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{ background: it.color }}
          />
          <span className="font-semibold text-ink">{it.label}</span>
        </span>
      ))}
    </div>
  );
}
