"use client";

import { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from "recharts";
import { usePlatformRows } from "@/components/DataProvider";
import { PageHeader } from "@/components/ui/PageHeader";
import { Kpi } from "@/components/ui/Kpi";
import { Segmented } from "@/components/ui/Segmented";
import { LoadingState, ErrorState, EmptyState } from "@/components/ui/StateViews";
import { ChartCard, ChartTooltip, AXIS, REGION_COLORS } from "@/components/ui/charts";
import { TrendLines } from "@/components/charts/TrendLines";
import { ChartLegend } from "@/components/charts/ChartLegend";
import { IconBell } from "@/components/ui/icons";
import { Bell } from "lucide-react";
import { NormalizedRow } from "@/lib/types";
import { sumRows, REGIONS, REGION_SHORT, cleanName } from "@/lib/metrics";
import { plannedInvestimento, capInvest } from "@/lib/metasCalc";
import { fmtBRL, fmtCompact, fmtInt, fmtPct } from "@/lib/format";

// Métricas disponíveis no gráfico de evolução diária do push.
type PushMetric = "disparos" | "clicks" | "investimento";
const PUSH_METRIC_OPTIONS = [
  { value: "disparos", label: "Disparos" },
  { value: "clicks", label: "Cliques" },
  { value: "investimento", label: "Investimento" },
];
const pushMetricValue = (r: NormalizedRow, m: PushMetric): number =>
  m === "investimento" ? r.investimento : m === "clicks" ? r.clicks : r.disparos;

export default function PushPage() {
  const { rows, loading, error, region } = usePlatformRows("pushNotification");
  const [trendMetric, setTrendMetric] = useState<PushMetric>("disparos");

  const c = useMemo(() => {
    const raw = sumRows(rows);
    const t = {
      ...raw,
      investimento: capInvest(
        raw.investimento,
        plannedInvestimento("pushNotification", region)
      ),
    };
    const ctr = raw.disparos > 0 ? raw.clicks / raw.disparos : 0;

    const regions = REGIONS.filter((reg) => region === "ALL" || reg === region);

    const perRegion = regions.map((reg) => {
      const rt = sumRows(rows.filter((r) => r.region === reg));
      return { reg, name: REGION_SHORT[reg], disparos: rt.disparos };
    });

    // Série diária: uma linha por região para a métrica selecionada.
    const dates = Array.from(
      new Set(rows.map((r) => r.date).filter(Boolean))
    ).sort();
    const trendData = dates.map((d) => {
      const row: Record<string, number | string> = { date: d };
      regions.forEach((reg) => {
        row[reg] = rows
          .filter((r) => r.date === d && r.region === reg)
          .reduce((s, r) => s + pushMetricValue(r, trendMetric), 0);
      });
      return row;
    });
    const trendSeries = regions.map((reg) => ({
      key: reg,
      name: reg,
      color: REGION_COLORS[reg],
    }));

    // Criativos agregados por anúncio.
    const byAd = new Map<
      string,
      { name: string; region: string; disparos: number; clicks: number }
    >();
    for (const r of rows) {
      const k = `${r.region}·${r.videoTitle || r.adName}`;
      const cur = byAd.get(k) ?? {
        name: r.videoTitle || cleanName(r.adName) || "Criativo",
        region: r.region,
        disparos: 0,
        clicks: 0,
      };
      cur.disparos += r.disparos;
      cur.clicks += r.clicks;
      byAd.set(k, cur);
    }
    const creatives = [...byAd.values()].sort((a, b) => b.disparos - a.disparos);

    return { t, ctr, perRegion, trendData, trendSeries, creatives };
  }, [rows, region, trendMetric]);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;
  const { t, ctr, perRegion, trendData, trendSeries, creatives } = c;

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Plataforma"
        title="Push Notification"
        description="Notificações push (MGID) — métrica contratada: disparos"
        icon={<IconBell />}
        accent="#f97316"
      />

      {rows.length === 0 ? (
        <EmptyState
          title="Sem dados para o filtro selecionado"
          icon={<Bell className="h-8 w-8" strokeWidth={1.6} />}
        />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Kpi label="Investimento" value={fmtBRL(t.investimento)} accent="green" />
            <Kpi label="Disparos" value={fmtCompact(t.disparos)} accent="navy" />
            <Kpi label="Cliques" value={fmtCompact(t.clicks)} accent="blue" />
            <Kpi label="CTR" value={fmtPct(ctr, 2)} accent="violet" />
          </div>

          {/* Evolução diária — uma linha por região */}
          <ChartCard
            title="Evolução diária por região"
            subtitle="Desempenho ao longo da campanha"
            right={
              <Segmented
                size="sm"
                options={PUSH_METRIC_OPTIONS}
                value={trendMetric}
                onChange={(v) => setTrendMetric(v as PushMetric)}
              />
            }
          >
            <TrendLines
              data={trendData}
              series={trendSeries}
              currency={trendMetric === "investimento"}
            />
            <div className="mt-3">
              <ChartLegend
                items={trendSeries.map((s) => ({ label: s.name, color: s.color }))}
              />
            </div>
          </ChartCard>

          {/* Disparos por região */}
          <ChartCard title="Disparos por região" subtitle="Volume absoluto">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={perRegion} layout="vertical" margin={{ left: 10, right: 40 }}>
                <CartesianGrid stroke="#eef1f8" horizontal={false} />
                <XAxis type="number" tickFormatter={(v) => fmtCompact(v as number)} axisLine={false} tickLine={false} tick={AXIS.tick} />
                <YAxis type="category" dataKey="reg" axisLine={false} tickLine={false} tick={{ ...AXIS.tick, fontSize: 12 }} width={90} />
                <Tooltip cursor={{ fill: "#f4f6fb" }} content={<ChartTooltip formatter={(v) => `${fmtInt(v)} disparos`} />} />
                <Bar dataKey="disparos" name="Disparos" radius={[0, 8, 8, 0]} barSize={28}>
                  {perRegion.map((p) => (
                    <Cell key={p.reg} fill={REGION_COLORS[p.reg]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Criativos */}
          <ChartCard title="Criativos" subtitle="Desempenho por anúncio de push">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wide text-muted">
                    <th className="py-2.5 pr-3 font-semibold">Criativo</th>
                    <th className="px-3 text-right font-semibold">Disparos</th>
                    <th className="px-3 text-right font-semibold">Cliques</th>
                    <th className="pl-3 text-right font-semibold">CTR</th>
                  </tr>
                </thead>
                <tbody>
                  {creatives.map((cr, i) => (
                    <tr key={i} className="border-b border-slate-50 last:border-0 hover:bg-surface/60">
                      <td className="py-2.5 pr-3">
                        <span className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full" style={{ background: REGION_COLORS[cr.region] }} />
                          <span className="font-semibold text-ink">{REGION_SHORT[cr.region]}</span>
                        </span>
                        <span className="block pl-4 text-[11px] text-muted">{cr.name}</span>
                      </td>
                      <td className="px-3 text-right tabular-nums text-muted">{fmtInt(cr.disparos)}</td>
                      <td className="px-3 text-right tabular-nums text-muted">{fmtInt(cr.clicks)}</td>
                      <td className="pl-3 text-right tabular-nums text-muted">
                        {fmtPct(cr.disparos > 0 ? cr.clicks / cr.disparos : 0, 2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ChartCard>
        </>
      )}
    </div>
  );
}
