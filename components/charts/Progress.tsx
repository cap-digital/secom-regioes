"use client";

import { fmtInt, fmtPct } from "@/lib/format";

// Linear meta progress bar.
export function MetaBar({
  label,
  sublabel,
  actual,
  goal,
  unit,
  color = "#1351B4",
}: {
  label: string;
  sublabel?: string;
  actual: number;
  goal: number;
  unit?: string;
  color?: string;
}) {
  // Delivery metrics (visualizações, escutas, impressões…) may exceed 100% —
  // over-delivery is good news and should be shown. Only money is capped.
  const pct = goal > 0 ? actual / goal : 0;
  const done = pct >= 1;
  const barWidth = Math.min(pct, 1); // the bar fills to 100% max; the % label shows the real number
  return (
    <div>
      <div className="flex items-baseline justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-ink">{label}</p>
          {sublabel && <p className="text-xs text-muted">{sublabel}</p>}
        </div>
        <span
          className="text-sm font-bold tabular-nums"
          style={{ color: done ? "#168821" : color }}
        >
          {fmtPct(pct, 1)}
        </span>
      </div>
      <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-surface">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${Math.max(barWidth * 100, 1.5)}%`,
            background: done
              ? "linear-gradient(90deg,#168821,#22c55e)"
              : `linear-gradient(90deg, ${color}aa, ${color})`,
          }}
        />
      </div>
      <div className="mt-1 flex justify-between text-[11px] text-muted">
        <span>
          {fmtInt(actual)} {unit}
        </span>
        <span>
          Meta {fmtInt(goal)} {unit}
        </span>
      </div>
    </div>
  );
}

// Circular gauge (SVG ring).
export function RadialGauge({
  pct,
  size = 120,
  stroke = 11,
  color = "#1351B4",
  label,
  value,
}: {
  pct: number;
  size?: number;
  stroke?: number;
  color?: string;
  label?: string;
  value?: string;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const clamped = Math.min(Math.max(pct, 0), 1);
  const done = pct >= 1;
  const ringColor = done ? "#168821" : color;
  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="#eef1f8"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={ringColor}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - clamped)}
          style={{ transition: "stroke-dashoffset 0.8s ease" }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-lg font-bold text-ink">
          {value ?? fmtPct(pct, 0)}
        </span>
        {label && (
          <span className="text-[10px] font-medium text-muted">{label}</span>
        )}
      </div>
    </div>
  );
}
