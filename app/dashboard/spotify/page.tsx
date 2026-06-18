"use client";

import { useMemo } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  PieChart,
  Pie,
} from "recharts";
import { usePlatformRows } from "@/components/DataProvider";
import { PageHeader } from "@/components/ui/PageHeader";
import { Kpi } from "@/components/ui/Kpi";
import { LoadingState, ErrorState, EmptyState } from "@/components/ui/StateViews";
import { ChartCard, ChartTooltip, AXIS, REGION_COLORS } from "@/components/ui/charts";
import { Funnel } from "@/components/charts/Funnel";
import { RadialGauge } from "@/components/charts/Progress";
import { IconMusic } from "@/components/ui/icons";
import { Headphones } from "lucide-react";
import { sumRows, cpm, REGIONS, REGION_SHORT, cleanName } from "@/lib/metrics";
import { plannedInvestimento, capInvest } from "@/lib/metasCalc";
import { fmtBRL, fmtCompact, fmtInt, fmtPct } from "@/lib/format";

export default function SpotifyPage() {
  const { rows, loading, error, region } = usePlatformRows("spotify");

  const c = useMemo(() => {
    const raw = sumRows(rows);
    const t = {
      ...raw,
      investimento: capInvest(raw.investimento, plannedInvestimento("spotify", region)),
    };
    const perRegion = REGIONS.map((reg) => {
      const rt = sumRows(rows.filter((r) => r.region === reg));
      return {
        name: REGION_SHORT[reg],
        full: reg,
        escutas: rt.q100,
        alcance: rt.reach,
        impressoes: rt.impressions,
        conclusao: rt.impressions > 0 ? rt.q100 / rt.impressions : 0,
        t: rt,
      };
    }).filter((r) => r.impressoes > 0);
    const funnel = [
      { label: "Impressões", value: t.impressions },
      { label: "1º quartil", value: t.q25 },
      { label: "Meio (50%)", value: t.q50 },
      { label: "3º quartil", value: t.q75 },
      { label: "Escutas completas", value: t.q100 },
    ];
    const conclusao = t.impressions > 0 ? t.q100 / t.impressions : 0;
    return { t, perRegion, funnel, conclusao };
  }, [rows, region]);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;
  const { t, perRegion, funnel, conclusao } = c;

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Plataforma"
        title="Spotify"
        description="Áudio com estratégia de Escutas completas"
        icon={<IconMusic />}
        accent="#168821"
      />

      {rows.length === 0 ? (
        <EmptyState title="Sem dados para o filtro selecionado" icon={<Headphones className="h-8 w-8" strokeWidth={1.6} />} />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
            <Kpi label="Investimento" value={fmtBRL(t.investimento)} accent="green" />
            <Kpi label="Impressões" value={fmtCompact(t.impressions)} accent="navy" />
            <Kpi label="Alcance" value={fmtCompact(t.reach)} accent="blue" />
            <Kpi label="Escutas completas" value={fmtCompact(t.q100)} accent="green" />
            <Kpi label="Conclusão" value={fmtPct(conclusao, 1)} accent="violet" />
            <Kpi label="CPM" value={fmtBRL(cpm(t))} accent="red" />
          </div>

          <div className="grid gap-3 lg:grid-cols-3">
            {/* Overall completion gauge */}
            <ChartCard title="Taxa de conclusão geral" subtitle="Escutas completas / impressões">
              <div className="flex flex-col items-center gap-3 py-4">
                <RadialGauge pct={conclusao} size={150} stroke={14} color="#168821" value={fmtPct(conclusao, 1)} label="conclusão" />
                <p className="text-center text-xs text-muted">
                  {fmtInt(t.q100)} escutas completas de {fmtInt(t.impressions)} impressões
                </p>
              </div>
            </ChartCard>

            {/* Donut by region */}
            <ChartCard title="Escutas por região" subtitle="Participação de cada região" className="lg:col-span-2">
              <div className="grid items-center gap-4 sm:grid-cols-2">
                <ResponsiveContainer width="100%" height={210}>
                  <PieChart>
                    <Pie data={perRegion} dataKey="escutas" nameKey="full" innerRadius={52} outerRadius={88} paddingAngle={3} stroke="none">
                      {perRegion.map((r) => (
                        <Cell key={r.full} fill={REGION_COLORS[r.full]} />
                      ))}
                    </Pie>
                    <Tooltip content={<ChartTooltip formatter={(v) => `${fmtInt(v)} escutas`} />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2.5">
                  {perRegion.map((r) => (
                    <div key={r.full} className="rounded-xl bg-surface px-3 py-2">
                      <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ background: REGION_COLORS[r.full] }} />
                        <span className="text-sm font-semibold text-ink">{r.full}</span>
                        <span className="ml-auto text-sm font-bold text-ink">{fmtInt(r.escutas)}</span>
                      </div>
                      <p className="mt-0.5 pl-4 text-xs text-muted">
                        Conclusão {fmtPct(r.conclusao, 1)} · Alcance {fmtInt(r.alcance)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </ChartCard>
          </div>

          {/* Horizontal bar — escutas per region */}
          <ChartCard title="Escutas completas por região" subtitle="Volume absoluto">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={perRegion} layout="vertical" margin={{ left: 10, right: 40 }}>
                <CartesianGrid stroke="#eef1f8" horizontal={false} />
                <XAxis type="number" tickFormatter={(v) => fmtCompact(v as number)} axisLine={false} tickLine={false} tick={AXIS.tick} />
                <YAxis type="category" dataKey="full" axisLine={false} tickLine={false} tick={{ ...AXIS.tick, fontSize: 12 }} width={90} />
                <Tooltip cursor={{ fill: "#f4f6fb" }} content={<ChartTooltip formatter={(v) => `${fmtInt(v)} escutas`} />} />
                <Bar dataKey="escutas" name="Escutas completas" radius={[0, 8, 8, 0]} barSize={28}>
                  {perRegion.map((r) => (
                    <Cell key={r.full} fill={REGION_COLORS[r.full]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <div className="grid gap-3 lg:grid-cols-2">
            <ChartCard title="Funil de escuta" subtitle="Da impressão à escuta completa">
              <div className="pt-3">
                <Funnel stages={funnel} color="#168821" baseLabel="completas" />
              </div>
            </ChartCard>

            {/* Ads table */}
            <ChartCard title="Anúncios" subtitle="Desempenho por criativo de áudio">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wide text-muted">
                      <th className="py-2.5 pr-3 font-semibold">Região</th>
                      <th className="px-3 text-right font-semibold">Impr.</th>
                      <th className="px-3 text-right font-semibold">Escutas</th>
                      <th className="pl-3 text-right font-semibold">Concl.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r, i) => (
                      <tr key={i} className="border-b border-slate-50 last:border-0 hover:bg-surface/60">
                        <td className="py-2.5 pr-3">
                          <span className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full" style={{ background: REGION_COLORS[r.region] }} />
                            <span className="font-semibold text-ink">{REGION_SHORT[r.region]}</span>
                          </span>
                          <span className="block pl-4 text-[11px] text-muted">{cleanName(r.adName) || "Ad"}</span>
                        </td>
                        <td className="px-3 text-right tabular-nums text-muted">{fmtInt(r.impressions)}</td>
                        <td className="px-3 text-right tabular-nums text-muted">{fmtInt(r.q100)}</td>
                        <td className="pl-3 text-right tabular-nums text-muted">
                          {fmtPct(r.impressions > 0 ? r.q100 / r.impressions : 0, 0)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </ChartCard>
          </div>
        </>
      )}
    </div>
  );
}
