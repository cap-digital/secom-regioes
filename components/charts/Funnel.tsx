"use client";

import { fmtInt, fmtPct } from "@/lib/format";

export interface FunnelStage {
  label: string;
  value: number;
}

// Horizontal video-completion funnel built with CSS bars.
export function Funnel({
  stages,
  color = "#1351B4",
  baseLabel = "Impressões",
}: {
  stages: FunnelStage[];
  color?: string;
  baseLabel?: string;
}) {
  const base = stages[0]?.value || 1;
  return (
    <div className="space-y-2.5">
      {stages.map((s, i) => {
        const ratio = s.value / base;
        return (
          <div key={s.label} className="flex items-center gap-3">
            <span className="w-28 shrink-0 text-xs font-medium text-muted">
              {s.label}
            </span>
            <div className="relative h-9 flex-1 overflow-hidden rounded-lg bg-surface">
              <div
                className="flex h-full items-center justify-end rounded-lg px-3 transition-all duration-700"
                style={{
                  width: `${Math.max(ratio * 100, 6)}%`,
                  background: `linear-gradient(90deg, ${color}cc, ${color})`,
                }}
              >
                <span className="text-xs font-bold text-white">
                  {fmtInt(s.value)}
                </span>
              </div>
            </div>
            <span className="w-14 shrink-0 text-right text-xs font-semibold text-ink">
              {i === 0 ? baseLabel : fmtPct(ratio, 1)}
            </span>
          </div>
        );
      })}
    </div>
  );
}
