"use client";

import { ReactNode } from "react";
import { fmtInt, fmtDec } from "@/lib/format";

// Shared categorical palette (gov.br inspired, extended).
export const PALETTE = [
  "#1351B4", // blue
  "#E52207", // red
  "#168821", // green
  "#FFCD07", // yellow
  "#5992ED", // sky
  "#7c3aed", // violet
  "#0c326f", // navy
  "#f97316", // orange
];

export const REGION_COLORS: Record<string, string> = {
  "REGIÃO 8": "#1351B4",
  "REGIÃO 12": "#E52207",
  "REGIÃO 14": "#168821",
};

export const AXIS = {
  stroke: "#cbd5e1",
  tick: { fill: "#64748b", fontSize: 11 },
};

export const GRID = { stroke: "#eef1f8", strokeDasharray: "0" };

interface TooltipPayloadItem {
  value: number;
  name: string;
  color?: string;
  fill?: string;
  stroke?: string;
}

// Custom tooltip with PT-BR formatting.
export function ChartTooltip({
  active,
  payload,
  label,
  formatter,
  labelFormatter,
}: {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
  formatter?: (value: number, name: string) => string;
  labelFormatter?: (label: string) => string;
}) {
  if (!active || !payload || !payload.length) return null;
  // Show every series (including platforms that are 0 on this point, e.g. a day
  // without veiculação) ordered by value so the relevant ones lead — this keeps
  // occluded/low series like Spotify always visible in the tooltip.
  const items = [...payload].sort(
    (a, b) => (typeof b.value === "number" ? b.value : 0) - (typeof a.value === "number" ? a.value : 0)
  );
  return (
    <div className="rounded-xl border border-slate-100 bg-white/95 px-3 py-2 shadow-lg backdrop-blur">
      {label != null && (
        <p className="mb-1 text-xs font-semibold text-ink">
          {labelFormatter ? labelFormatter(label) : label}
        </p>
      )}
      <div className="space-y-1">
        {items.map((p, i) => (
          <div key={i} className="flex items-center gap-2 text-xs">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ background: p.color || p.fill || p.stroke }}
            />
            <span className="text-muted">{p.name}</span>
            <span className="ml-auto font-semibold text-ink">
              {formatter
                ? formatter(p.value, p.name)
                : typeof p.value === "number"
                ? fmtInt(p.value)
                : p.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export const tooltipCurrency = (v: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(v);

export function ChartCard({
  title,
  subtitle,
  right,
  children,
  className = "",
}: {
  title: string;
  subtitle?: string;
  right?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`card card-pad animate-fade-up ${className}`}>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="section-title">{title}</h3>
          {subtitle && (
            <p className="mt-0.5 text-xs text-muted">{subtitle}</p>
          )}
        </div>
        {right}
      </div>
      {children}
    </div>
  );
}

export const pctTooltip = (v: number) => `${fmtDec(v, 2)}%`;
