"use client";

import { useMemo } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
} from "recharts";
import { usePlatformRows } from "@/components/DataProvider";
import { PageHeader } from "@/components/ui/PageHeader";
import { Kpi } from "@/components/ui/Kpi";
import { LoadingState, ErrorState, EmptyState } from "@/components/ui/StateViews";
import { ChartCard, ChartTooltip, AXIS, REGION_COLORS } from "@/components/ui/charts";
import { IconVideo } from "@/components/ui/icons";
import { Clapperboard } from "lucide-react";
import { sumRows, cpm, cpv, ctr, REGIONS, REGION_SHORT, cleanName } from "@/lib/metrics";
import { plannedInvestimento, capInvest } from "@/lib/metasCalc";
import { fmtBRL, fmtCompact, fmtInt, fmtPct, fmtDayShort } from "@/lib/format";

export default function ProgramaticaPage() {
  const { rows, loading, error, region } = usePlatformRows("programaticaDeVideo");

  const c = useMemo(() => {
    const raw = sumRows(rows);
    const t = {
      ...raw,
      investimento: capInvest(raw.investimento, plannedInvestimento("programaticaDeVideo", region)),
    };
    const dates = Array.from(new Set(rows.map((r) => r.date))).filter(Boolean).sort();
    const activeRegions = REGIONS.filter((reg) => rows.some((r) => r.region === reg));

    // Multi-line: views per region per day
    const series = dates.map((d) => {
      const row: Record<string, number | string> = { date: d };
      activeRegions.forEach((reg) => {
        row[reg] = rows
          .filter((r) => r.date === d && r.region === reg)
          .reduce((s, r) => s + r.views, 0);
      });
      return row;
    });

    // Stacked quartiles per region
    const quartis = activeRegions.map((reg) => {
      const rt = sumRows(rows.filter((r) => r.region === reg));
      return {
        name: REGION_SHORT[reg],
        full: reg,
        "25%": rt.q25,
        "50%": rt.q50,
        "75%": rt.q75,
        "100%": rt.q100,
      };
    });

    // Top creatives by views (aggregate identical cleaned names)
    const byCreative = new Map<string, { name: string; region: string; views: number; impressions: number }>();
    rows.forEach((r) => {
      const name = cleanName(r.adName);
      const key = `${r.region}::${name}`;
      const prev = byCreative.get(key) ?? { name, region: r.region, views: 0, impressions: 0 };
      prev.views += r.views;
      prev.impressions += r.impressions;
      byCreative.set(key, prev);
    });
    const topCreatives = Array.from(byCreative.values())
      .sort((a, b) => b.views - a.views)
      .slice(0, 8);

    return { t, series, quartis, topCreatives, activeRegions };
  }, [rows, region]);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;
  const { t, series, quartis, topCreatives, activeRegions } = c;

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Plataforma"
        title="Programática de Vídeo"
        description="Vídeo programático (Reels e VT) — estratégia de visualização"
        icon={<IconVideo />}
        accent="#7c3aed"
      />

      {rows.length === 0 ? (
        <EmptyState title="Sem dados para o filtro selecionado" icon={<Clapperboard className="h-8 w-8" strokeWidth={1.6} />} />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
            <Kpi label="Investimento" value={fmtBRL(t.investimento)} accent="violet" />
            <Kpi label="Impressões" value={fmtCompact(t.impressions)} accent="navy" />
            <Kpi label="Visualizações" value={fmtCompact(t.views)} accent="green" />
            <Kpi label="Cliques" value={fmtInt(t.clicks)} accent="red" />
            <Kpi label="CTR" value={fmtPct(ctr(t), 2)} accent="blue" />
            <Kpi label="CPV" value={fmtBRL(cpv(t))} accent="yellow" />
          </div>

          {/* Multi-line views per region */}
          <ChartCard title="Visualizações por dia e região" subtitle="Evolução diária por regional">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={series} margin={{ left: -8, right: 8, top: 8 }}>
                <CartesianGrid stroke="#eef1f8" vertical={false} />
                <XAxis dataKey="date" tickFormatter={fmtDayShort} axisLine={false} tickLine={false} tick={AXIS.tick} />
                <YAxis tickFormatter={(v) => fmtCompact(v as number)} axisLine={false} tickLine={false} tick={AXIS.tick} width={50} />
                <Tooltip content={<ChartTooltip labelFormatter={fmtDayShort} />} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
                {activeRegions.map((reg) => (
                  <Line
                    key={reg}
                    type="monotone"
                    dataKey={reg}
                    name={reg}
                    stroke={REGION_COLORS[reg]}
                    strokeWidth={2.5}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          <div className="grid gap-3 lg:grid-cols-2">
            {/* Stacked quartiles */}
            <ChartCard title="Quartis de vídeo por região" subtitle="Distribuição de retenção (barras empilhadas)">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={quartis} margin={{ left: -8, right: 8, top: 8 }}>
                  <CartesianGrid stroke="#eef1f8" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ ...AXIS.tick, fontSize: 12 }} />
                  <YAxis tickFormatter={(v) => fmtCompact(v as number)} axisLine={false} tickLine={false} tick={AXIS.tick} width={50} />
                  <Tooltip cursor={{ fill: "#f4f6fb" }} content={<ChartTooltip />} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
                  <Bar dataKey="25%" stackId="q" fill="#c4b5fd" maxBarSize={56} />
                  <Bar dataKey="50%" stackId="q" fill="#a78bfa" maxBarSize={56} />
                  <Bar dataKey="75%" stackId="q" fill="#8b5cf6" maxBarSize={56} />
                  <Bar dataKey="100%" stackId="q" fill="#6d28d9" radius={[6, 6, 0, 0]} maxBarSize={56} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* Top creatives horizontal bar */}
            <ChartCard title="Top criativos por visualizações" subtitle="8 anúncios com maior volume">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={topCreatives} layout="vertical" margin={{ left: 10, right: 20 }}>
                  <CartesianGrid stroke="#eef1f8" horizontal={false} />
                  <XAxis type="number" tickFormatter={(v) => fmtCompact(v as number)} axisLine={false} tickLine={false} tick={AXIS.tick} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ ...AXIS.tick, fontSize: 10 }}
                    width={120}
                    tickFormatter={(v) => (String(v).length > 18 ? String(v).slice(0, 17) + "…" : String(v))}
                  />
                  <Tooltip cursor={{ fill: "#f4f6fb" }} content={<ChartTooltip formatter={(v) => `${fmtInt(v)} views`} />} />
                  <Bar dataKey="views" name="Visualizações" radius={[0, 6, 6, 0]} barSize={18}>
                    {topCreatives.map((cr, i) => (
                      <Cell key={i} fill={REGION_COLORS[cr.region] ?? "#7c3aed"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          {/* Region table */}
          <ChartCard title="Detalhamento por região" subtitle="Métricas calculadas com base no Investimento">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wide text-muted">
                    <th className="py-2.5 pr-3 font-semibold">Região</th>
                    <th className="px-3 text-right font-semibold">Investimento</th>
                    <th className="px-3 text-right font-semibold">Impressões</th>
                    <th className="px-3 text-right font-semibold">Visualizações</th>
                    <th className="px-3 text-right font-semibold">CTR</th>
                    <th className="pl-3 text-right font-semibold">CPM</th>
                  </tr>
                </thead>
                <tbody>
                  {activeRegions.map((reg) => {
                    const rawRt = sumRows(rows.filter((r) => r.region === reg));
                    const rt = {
                      ...rawRt,
                      investimento: capInvest(rawRt.investimento, plannedInvestimento("programaticaDeVideo", reg)),
                    };
                    return (
                      <tr key={reg} className="border-b border-slate-50 last:border-0 hover:bg-surface/60">
                        <td className="py-3 pr-3 font-semibold text-ink">
                          <span className="flex items-center gap-2">
                            <span className="h-2.5 w-2.5 rounded-full" style={{ background: REGION_COLORS[reg] }} />
                            {reg}
                          </span>
                        </td>
                        <td className="px-3 text-right font-semibold text-ink">{fmtBRL(rt.investimento)}</td>
                        <td className="px-3 text-right tabular-nums text-muted">{fmtInt(rt.impressions)}</td>
                        <td className="px-3 text-right tabular-nums text-muted">{fmtInt(rt.views)}</td>
                        <td className="px-3 text-right tabular-nums text-muted">{fmtPct(ctr(rt), 2)}</td>
                        <td className="pl-3 text-right tabular-nums text-muted">{fmtBRL(cpm(rt))}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </ChartCard>
        </>
      )}
    </div>
  );
}
