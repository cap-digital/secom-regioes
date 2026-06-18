"use client";

import { useMemo } from "react";
import {
  ResponsiveContainer,
  Area,
  Line,
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { usePlatformRows } from "@/components/DataProvider";
import { PageHeader } from "@/components/ui/PageHeader";
import { Kpi } from "@/components/ui/Kpi";
import { LoadingState, ErrorState, EmptyState } from "@/components/ui/StateViews";
import { ChartCard, ChartTooltip, AXIS, REGION_COLORS } from "@/components/ui/charts";
import { RadialGauge } from "@/components/charts/Progress";
import { Heatmap, HeatRow } from "@/components/charts/Heatmap";
import { Funnel } from "@/components/charts/Funnel";
import { VideoPerformance } from "@/components/VideoPerformance";
import { IconTv } from "@/components/ui/icons";
import { Tv } from "lucide-react";
import { sumRows, cpv, vtr, REGIONS, REGION_SHORT } from "@/lib/metrics";
import { plannedInvestimento, capInvest } from "@/lib/metasCalc";
import { fmtBRL, fmtCompact, fmtInt, fmtPct, fmtDayShort, fmtDec } from "@/lib/format";

export default function TvConectadaPage() {
  const { rows, loading, error, region } = usePlatformRows("tvConectada");

  const c = useMemo(() => {
    const raw = sumRows(rows);
    const t = {
      ...raw,
      investimento: capInvest(raw.investimento, plannedInvestimento("tvConectada", region)),
    };
    const dates = Array.from(new Set(rows.map((r) => r.date))).filter(Boolean).sort();
    const series = dates.map((d) => {
      const dt = sumRows(rows.filter((r) => r.date === d));
      return {
        date: d,
        views: dt.views,
        completion: dt.impressions > 0 ? (dt.q100 / dt.impressions) * 100 : 0,
      };
    });
    const perRegion = REGIONS.map((reg) => {
      const rt = sumRows(rows.filter((r) => r.region === reg));
      return { reg, short: REGION_SHORT[reg], vtr: vtr(rt), views: rt.views, t: rt };
    });
    // Heatmap: views per region x day
    const heat: HeatRow[] = REGIONS.map((reg) => ({
      label: REGION_SHORT[reg],
      cells: dates.map((d) => ({
        key: d,
        value: rows
          .filter((r) => r.region === reg && r.date === d)
          .reduce((s, r) => s + r.views, 0),
      })),
    }));
    const watchRows = rows.filter((r) => r.watchTimeMillis > 0);
    const avgWatch =
      watchRows.length > 0
        ? watchRows.reduce((s, r) => s + r.watchTimeMillis, 0) / watchRows.length / 1000
        : 0;
    const funnel = [
      { label: "Impressões", value: t.impressions },
      { label: "25%", value: t.q25 },
      { label: "50%", value: t.q50 },
      { label: "75%", value: t.q75 },
      { label: "100%", value: t.q100 },
    ];
    return { t, series, perRegion, heat, dates, avgWatch, funnel };
  }, [rows, region]);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;
  const { t, series, perRegion, heat, dates, avgWatch, funnel } = c;

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Plataforma"
        title="TV Conectada"
        description="Vídeo em telas de TV conectada (CTV) — estratégia de visualização"
        icon={<IconTv />}
        accent="#1351B4"
      />

      {rows.length === 0 ? (
        <EmptyState title="Sem dados para o filtro selecionado" icon={<Tv className="h-8 w-8" strokeWidth={1.6} />} />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
            <Kpi label="Investimento" value={fmtBRL(t.investimento)} accent="blue" />
            <Kpi label="Impressões" value={fmtCompact(t.impressions)} accent="navy" />
            <Kpi label="Visualizações" value={fmtCompact(t.views)} accent="green" />
            <Kpi label="VTR" value={fmtPct(vtr(t), 1)} accent="red" />
            <Kpi label="Tempo médio" value={`${fmtDec(avgWatch, 0)}s`} accent="violet" />
            <Kpi label="CPV" value={fmtBRL(cpv(t))} accent="yellow" />
          </div>

          {/* Completion gauges per region */}
          <ChartCard
            title="Taxa de conclusão (VTR) por região"
            subtitle="Percentual de vídeos assistidos até 100%"
          >
            <div className="flex flex-wrap items-center justify-around gap-4 py-2">
              {perRegion.map((r) => (
                <div key={r.reg} className="flex flex-col items-center gap-2">
                  <RadialGauge
                    pct={r.vtr}
                    color={REGION_COLORS[r.reg]}
                    label="VTR"
                    value={fmtPct(r.vtr, 1)}
                  />
                  <div className="text-center">
                    <p className="text-sm font-semibold text-ink">{r.reg}</p>
                    <p className="text-xs text-muted">{fmtInt(r.views)} visualizações</p>
                  </div>
                </div>
              ))}
            </div>
          </ChartCard>

          <div className="grid gap-3 lg:grid-cols-2">
            {/* Area + completion line */}
            <ChartCard
              title="Visualizações e conclusão por dia"
              subtitle="Área: visualizações · Linha: taxa de conclusão (%)"
            >
              <ResponsiveContainer width="100%" height={280}>
                <ComposedChart data={series} margin={{ left: -8, right: 8, top: 8 }}>
                  <defs>
                    <linearGradient id="ctvViews" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#1351B4" stopOpacity={0.55} />
                      <stop offset="100%" stopColor="#1351B4" stopOpacity={0.04} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#eef1f8" vertical={false} />
                  <XAxis dataKey="date" tickFormatter={fmtDayShort} axisLine={false} tickLine={false} tick={AXIS.tick} />
                  <YAxis yAxisId="l" tickFormatter={(v) => fmtCompact(v as number)} axisLine={false} tickLine={false} tick={AXIS.tick} width={48} />
                  <YAxis yAxisId="r" orientation="right" tickFormatter={(v) => `${v}%`} axisLine={false} tickLine={false} tick={AXIS.tick} width={38} />
                  <Tooltip
                    content={
                      <ChartTooltip
                        labelFormatter={fmtDayShort}
                        formatter={(v, n) => (n === "Conclusão" ? `${fmtDec(v, 1)}%` : fmtInt(v))}
                      />
                    }
                  />
                  <Area yAxisId="l" type="monotone" dataKey="views" name="Visualizações" stroke="#1351B4" strokeWidth={2} fill="url(#ctvViews)" />
                  <Line yAxisId="r" type="monotone" dataKey="completion" name="Conclusão" stroke="#E52207" strokeWidth={2.5} dot={{ r: 3 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* Funnel */}
            <ChartCard title="Funil de retenção" subtitle="Quartis de exibição do vídeo">
              <div className="pt-3">
                <Funnel stages={funnel} color="#1351B4" baseLabel="100%" />
              </div>
            </ChartCard>
          </div>

          {/* Heatmap */}
          <ChartCard
            title="Mapa de calor — visualizações por região e dia"
            subtitle="Intensidade proporcional ao volume de visualizações"
          >
            <Heatmap
              rows={heat}
              cols={dates}
              colLabel={fmtDayShort}
              baseColor="19,81,180"
              unit="visualizações"
            />
          </ChartCard>

          <VideoPerformance rows={rows} accent="#1351B4" />
        </>
      )}
    </div>
  );
}
