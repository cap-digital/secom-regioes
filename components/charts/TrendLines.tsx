"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { ChartTooltip, AXIS } from "@/components/ui/charts";
import { fmtBRL, fmtCompact, fmtDayShort } from "@/lib/format";

export interface TrendSeries {
  key: string; // dataKey present on every point
  name: string; // legend / tooltip label
  color: string;
}

// Multi-line daily evolution chart — one line per series (e.g. região),
// sharing the same X axis (date). Formats Y as currency or compact number.
export function TrendLines({
  data,
  series,
  currency = false,
  height = 300,
}: {
  data: Record<string, number | string>[];
  series: TrendSeries[];
  currency?: boolean;
  height?: number;
}) {
  const fmtY = (v: number) => (currency ? fmtBRL(v) : fmtCompact(v));
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ left: -4, right: 12, top: 8 }}>
        <CartesianGrid stroke="#eef1f8" vertical={false} />
        <XAxis
          dataKey="date"
          tickFormatter={fmtDayShort}
          axisLine={false}
          tickLine={false}
          tick={AXIS.tick}
        />
        <YAxis
          tickFormatter={(v) => fmtY(v as number)}
          axisLine={false}
          tickLine={false}
          tick={AXIS.tick}
          width={currency ? 72 : 56}
        />
        <Tooltip
          content={
            <ChartTooltip
              labelFormatter={fmtDayShort}
              formatter={(v) => fmtY(v)}
            />
          }
        />
        {series.map((s) => (
          <Line
            key={s.key}
            type="monotone"
            dataKey={s.key}
            name={s.name}
            stroke={s.color}
            strokeWidth={2.5}
            dot={{ r: 2.5, fill: s.color, strokeWidth: 0 }}
            activeDot={{ r: 5 }}
            connectNulls
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
