"use client";

import { ReactNode } from "react";

export function Kpi({
  label,
  value,
  hint,
  icon,
  accent = "blue",
  className = "",
  sub,
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  icon?: ReactNode;
  accent?: "blue" | "red" | "green" | "yellow" | "navy" | "violet";
  className?: string;
  sub?: { label: string; value: ReactNode }[];
}) {
  const accents: Record<string, string> = {
    blue: "from-gov-blue/10 text-gov-blue",
    red: "from-gov-red/10 text-gov-red",
    green: "from-gov-green/10 text-gov-green",
    yellow: "from-gov-yellow/20 text-amber-600",
    navy: "from-gov-navy/10 text-gov-navy",
    violet: "from-violet-500/10 text-violet-600",
  };
  return (
    <div
      className={`card card-pad relative overflow-hidden animate-fade-up ${className}`}
    >
      <div
        className={`pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full bg-gradient-to-br ${accents[accent]} to-transparent`}
      />
      <div className="flex items-center justify-between">
        <span className="stat-label">{label}</span>
        {icon && (
          <span className={`text-lg ${accents[accent].split(" ")[1]}`}>
            {icon}
          </span>
        )}
      </div>
      <p className="mt-2 text-2xl font-bold tracking-tight text-ink sm:text-[1.7rem]">
        {value}
      </p>
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
      {sub && sub.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 border-t border-slate-100 pt-2.5">
          {sub.map((s) => (
            <div key={s.label} className="flex items-baseline gap-1">
              <span className="text-[10px] font-semibold uppercase tracking-wide text-muted">
                {s.label}
              </span>
              <span className="text-xs font-bold text-ink">{s.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Smaller inline metric pill for dense rows.
export function MiniStat({
  label,
  value,
  color = "#1351B4",
}: {
  label: string;
  value: ReactNode;
  color?: string;
}) {
  return (
    <div className="rounded-xl bg-surface px-3 py-2.5">
      <div className="flex items-center gap-1.5">
        <span
          className="h-2 w-2 rounded-full"
          style={{ background: color }}
        />
        <span className="stat-label">{label}</span>
      </div>
      <p className="mt-1 text-lg font-bold text-ink">{value}</p>
    </div>
  );
}
