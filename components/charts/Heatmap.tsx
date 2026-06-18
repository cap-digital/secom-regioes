"use client";

import { fmtInt } from "@/lib/format";

export interface HeatRow {
  label: string;
  cells: { key: string; value: number }[];
}

// Generic heatmap (rows = categories, cols = e.g. days).
export function Heatmap({
  rows,
  cols,
  colLabel,
  baseColor = "19,81,180", // rgb
  unit = "",
}: {
  rows: HeatRow[];
  cols: string[];
  colLabel?: (c: string) => string;
  baseColor?: string;
  unit?: string;
}) {
  const max = Math.max(
    1,
    ...rows.flatMap((r) => r.cells.map((c) => c.value))
  );
  return (
    <div className="overflow-x-auto scrollbar-none">
      <table className="w-full border-separate border-spacing-1">
        <thead>
          <tr>
            <th className="sticky left-0 bg-white" />
            {cols.map((c) => (
              <th
                key={c}
                className="px-1 pb-1 text-[10px] font-semibold text-muted"
              >
                {colLabel ? colLabel(c) : c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.label}>
              <td className="sticky left-0 whitespace-nowrap bg-white pr-2 text-xs font-semibold text-ink">
                {r.label}
              </td>
              {r.cells.map((c) => {
                const intensity = c.value / max;
                return (
                  <td key={c.key} className="p-0">
                    <div
                      className="group relative flex h-10 min-w-[34px] items-center justify-center rounded-md text-[10px] font-bold transition"
                      style={{
                        background: `rgba(${baseColor}, ${
                          0.08 + intensity * 0.85
                        })`,
                        color: intensity > 0.5 ? "#fff" : "#0d1b2a",
                      }}
                      title={`${r.label} · ${
                        colLabel ? colLabel(c.key) : c.key
                      }: ${fmtInt(c.value)} ${unit}`}
                    >
                      {c.value > 0 ? fmtInt(c.value) : ""}
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
