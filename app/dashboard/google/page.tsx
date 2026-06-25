"use client";

import { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { usePlatformRows } from "@/components/DataProvider";
import { PageHeader } from "@/components/ui/PageHeader";
import { Kpi } from "@/components/ui/Kpi";
import { LoadingState, ErrorState, EmptyState } from "@/components/ui/StateViews";
import { Segmented } from "@/components/ui/Segmented";
import { ChartCard, ChartTooltip, AXIS, REGION_COLORS } from "@/components/ui/charts";
import { Funnel } from "@/components/charts/Funnel";
import { VideoPerformance } from "@/components/VideoPerformance";
import { IconPlay } from "@/components/ui/icons";
import { Film } from "lucide-react";
import {
  sumRows,
  cpm,
  ctr,
  cpv,
  viewRate,
  REGIONS,
  REGION_SHORT,
} from "@/lib/metrics";
import { plannedInvestimento, capInvest, normStrategy } from "@/lib/metasCalc";
import { METAS } from "@/lib/metas";
import {
  fmtBRL,
  fmtCompact,
  fmtInt,
  fmtPct,
  fmtDayShort,
} from "@/lib/format";

export default function GooglePage() {
  const { rows, loading, error, region } = usePlatformRows("google");
  const [strategy, setStrategy] = useState("ALL");

  const scoped = useMemo(
    () =>
      strategy === "ALL"
        ? rows
        : rows.filter((r) => r.strategy === strategy),
    [rows, strategy]
  );

  const c = useMemo(() => {
    const raw = sumRows(scoped);
    // Cap investment at the contracted limit so overspend never shows.
    const invest = capInvest(raw.investimento, plannedInvestimento("google", region));
    const t = { ...raw, investimento: invest };
    // Time series
    const dates = Array.from(new Set(scoped.map((r) => r.date))).filter(Boolean).sort();
    const series = dates.map((d) => {
      const day = scoped.filter((r) => r.date === d);
      const dt = sumRows(day);
      return {
        date: d,
        impressions: dt.impressions,
        views: dt.views,
        clicks: dt.clicks,
      };
    });
    // By region: investment split by strategy (each capped at its item budget)
    const byRegion = REGIONS.map((reg) => {
      const rr = sumRows(scoped.filter((r) => r.region === reg));
      const items = METAS[reg]?.find((p) => p.platform === "google")?.items ?? [];
      const pulBudget = items.find((i) => i.dataStrategy === "pulavel")?.investimento ?? 0;
      const shortsBudget = items.find((i) => i.dataStrategy === "shorts")?.investimento ?? 0;
      const pul = scoped.filter((r) => r.region === reg && normStrategy(r.strategy).includes("pulavel"));
      const shorts = scoped.filter((r) => r.region === reg && normStrategy(r.strategy).includes("shorts"));
      const regInvest = capInvest(rr.investimento, plannedInvestimento("google", reg));
      return {
        name: REGION_SHORT[reg],
        full: reg,
        Pulável: capInvest(sumRows(pul).investimento, pulBudget),
        Shorts: capInvest(sumRows(shorts).investimento, shortsBudget),
        impressions: rr.impressions,
        views: rr.views,
        ctr: ctr(rr),
        cpm: cpm({ ...rr, investimento: regInvest }),
      };
    });
    const funnel = [
      { label: "Impressões", value: t.impressions },
      { label: "25% assistido", value: t.q25 },
      { label: "50% assistido", value: t.q50 },
      { label: "75% assistido", value: t.q75 },
      { label: "100% (completo)", value: t.q100 },
    ];
    return { t, series, byRegion, funnel };
  }, [scoped, region]);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;

  const strategies = Array.from(new Set(rows.map((r) => r.strategy))).filter(Boolean);
  const { t, series, byRegion, funnel } = c;

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Plataforma"
        title="Google"
        description="Visualização — YouTube Pulável e YouTube Shorts"
        icon={<IconPlay />}
        accent="#E52207"
        right={
          <Segmented
            value={strategy}
            onChange={setStrategy}
            options={[
              { value: "ALL", label: "Todas estratégias" },
              ...strategies.map((s) => ({ value: s, label: s })),
            ]}
          />
        }
      />

      {scoped.length === 0 ? (
        <EmptyState title="Sem dados para o filtro selecionado" icon={<Film className="h-8 w-8" strokeWidth={1.6} />} />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
            <Kpi label="Investimento" value={fmtBRL(t.investimento)} accent="red" />
            <Kpi label="Impressões" value={fmtCompact(t.impressions)} accent="navy" />
            <Kpi label="Visualizações" value={fmtCompact(t.views)} accent="green" />
            <Kpi label="CTR" value={fmtPct(ctr(t), 2)} accent="blue" />
            <Kpi label="CPM" value={fmtBRL(cpm(t))} accent="violet" />
            <Kpi label="CPV" value={fmtBRL(cpv(t))} accent="yellow" />
          </div>

          {/* Time series — impressions/views (bars) + clicks (line) */}
          <ChartCard
            title="Evolução diária"
            subtitle="Impressões e visualizações (barras) · Cliques (linha)"
          >
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={series} margin={{ left: -8, right: 8, top: 8 }}>
                <CartesianGrid stroke="#eef1f8" vertical={false} />
                <XAxis
                  dataKey="date"
                  tickFormatter={fmtDayShort}
                  axisLine={false}
                  tickLine={false}
                  tick={AXIS.tick}
                />
                <YAxis
                  yAxisId="l"
                  tickFormatter={(v) => fmtCompact(v as number)}
                  axisLine={false}
                  tickLine={false}
                  tick={AXIS.tick}
                  width={50}
                />
                <YAxis yAxisId="r" orientation="right" hide />
                <Tooltip content={<ChartTooltip labelFormatter={fmtDayShort} />} />
                <Legend
                  iconType="circle"
                  wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
                />
                <Bar yAxisId="l" dataKey="impressions" name="Impressões" fill="#1351B4" radius={[4, 4, 0, 0]} maxBarSize={26} />
                <Bar yAxisId="l" dataKey="views" name="Visualizações" fill="#5992ED" radius={[4, 4, 0, 0]} maxBarSize={26} />
                <Line yAxisId="r" type="monotone" dataKey="clicks" name="Cliques" stroke="#E52207" strokeWidth={2.5} dot={{ r: 3 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </ChartCard>

          <div className="grid gap-3 lg:grid-cols-2">
            {/* Stacked bar by region & strategy */}
            <ChartCard
              title="Investimento por região e estratégia"
              subtitle="Visualização — Pulável vs Shorts"
            >
              <ResponsiveContainer width="100%" height={280}>
                <ComposedChart data={byRegion} margin={{ left: -8, right: 8, top: 8 }}>
                  <CartesianGrid stroke="#eef1f8" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ ...AXIS.tick, fontSize: 12 }} />
                  <YAxis tickFormatter={(v) => fmtCompact(v as number)} axisLine={false} tickLine={false} tick={AXIS.tick} width={56} />
                  <Tooltip content={<ChartTooltip formatter={(v) => fmtBRL(v)} />} cursor={{ fill: "#f4f6fb" }} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
                  <Bar dataKey="Pulável" stackId="a" fill="#1351B4" radius={[0, 0, 0, 0]} maxBarSize={56} />
                  <Bar dataKey="Shorts" stackId="a" fill="#E52207" radius={[6, 6, 0, 0]} maxBarSize={56} />
                </ComposedChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* Funnel */}
            <ChartCard
              title="Funil de visualização de vídeo"
              subtitle="Retenção da audiência por quartil"
            >
              <div className="pt-3">
                <Funnel stages={funnel} color="#E52207" baseLabel="100%" />
              </div>
              <p className="mt-4 rounded-xl bg-surface p-3 text-xs text-muted">
                <strong className="text-ink">VTR (taxa de conclusão):</strong>{" "}
                {fmtPct(t.impressions > 0 ? t.q100 / t.impressions : 0, 2)} ·{" "}
                <strong className="text-ink">Taxa de view:</strong>{" "}
                {fmtPct(viewRate(t), 2)}
              </p>
            </ChartCard>
          </div>

          {/* Table by region */}
          <ChartCard title="Detalhamento por região" subtitle="Métricas calculadas com base no Investimento">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wide text-muted">
                    <th className="py-2.5 pr-3 font-semibold">Região</th>
                    <th className="px-3 text-right font-semibold">Impressões</th>
                    <th className="px-3 text-right font-semibold">Visualizações</th>
                    <th className="px-3 text-right font-semibold">CTR</th>
                    <th className="pl-3 text-right font-semibold">CPM</th>
                  </tr>
                </thead>
                <tbody>
                  {byRegion.map((r) => (
                    <tr key={r.full} className="border-b border-slate-50 last:border-0 hover:bg-surface/60">
                      <td className="py-3 pr-3 font-semibold text-ink">
                        <span className="flex items-center gap-2">
                          <span className="h-2.5 w-2.5 rounded-full" style={{ background: REGION_COLORS[r.full] }} />
                          {r.full}
                        </span>
                      </td>
                      <td className="px-3 text-right tabular-nums text-muted">{fmtInt(r.impressions)}</td>
                      <td className="px-3 text-right tabular-nums text-muted">{fmtInt(r.views)}</td>
                      <td className="px-3 text-right tabular-nums text-muted">{fmtPct(r.ctr, 2)}</td>
                      <td className="pl-3 text-right tabular-nums text-muted">{fmtBRL(r.cpm)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ChartCard>

          <VideoPerformance rows={scoped} accent="#E52207" />
        </>
      )}
    </div>
  );
}
