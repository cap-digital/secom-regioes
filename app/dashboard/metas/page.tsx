"use client";

import { useMemo } from "react";
import { useData } from "@/components/DataProvider";
import { PageHeader } from "@/components/ui/PageHeader";
import { Kpi } from "@/components/ui/Kpi";
import { LoadingState, ErrorState } from "@/components/ui/StateViews";
import { ChartCard, REGION_COLORS } from "@/components/ui/charts";
import { MetaBar, RadialGauge } from "@/components/charts/Progress";
import { IconTarget } from "@/components/ui/icons";
import { computeProgress, capInvest } from "@/lib/metasCalc";
import { PLATFORM_LABEL, CAMPAIGN_PERIOD } from "@/lib/metas";
import { fmtBRL, fmtPct, fmtInt } from "@/lib/format";
import { PlatformId } from "@/lib/types";

const platformColor = (p: PlatformId) => {
  const map: Record<PlatformId, string> = {
    google: "#E52207",
    tvConectada: "#1351B4",
    spotify: "#168821",
    programaticaDeVideo: "#7c3aed",
    pushNotification: "#f97316",
  };
  return map[p];
};

export default function MetasPage() {
  const { data, loading, error, region } = useData();

  const c = useMemo(() => {
    if (!data) return null;
    const progress = computeProgress(data, region);
    const plannedInv = progress.reduce((s, p) => s + p.item.investimento, 0);
    // Realized investment = soma do Investimento de todas as linhas veiculadas
    // (mesma base da visão geral). Capada ao planejado para não exibir overspend.
    const actualInv = capInvest(
      progress.reduce((s, p) => s + p.actualInvest, 0),
      plannedInv
    );
    const investPct = plannedInv > 0 ? actualInv / plannedInv : 0;
    // group by region
    const regions = Array.from(new Set(progress.map((p) => p.region)));
    return { progress, plannedInv, actualInv, investPct, regions };
  }, [data, region]);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;
  if (!c) return null;
  const { progress, plannedInv, actualInv, investPct, regions } = c;

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Análise"
        title="Progresso de Metas"
        description={`Acompanhamento dos objetivos da campanha · ${CAMPAIGN_PERIOD.inicio} a ${CAMPAIGN_PERIOD.fim}`}
        icon={<IconTarget />}
        accent="#168821"
      />

      <div className="grid gap-3 lg:grid-cols-3">
        <ChartCard title="Investimento veiculado" subtitle="Realizado sobre o investimento planejado">
          <div className="flex items-center justify-center gap-5 py-2">
            <RadialGauge pct={investPct} size={140} stroke={13} color="#168821" value={fmtPct(investPct, 0)} label="do planejado" />
            <div className="space-y-2 text-sm">
              <p>
                <span className="text-lg font-bold text-ink">{fmtBRL(actualInv)}</span>
                <br />
                <span className="text-muted">de {fmtBRL(plannedInv)}</span>
              </p>
            </div>
          </div>
        </ChartCard>

        <Kpi
          label="Metas monitoradas"
          value={progress.length}
          hint="objetivos com dados de veiculação"
          accent="blue"
          className="lg:col-span-1"
        />
        <Kpi
          label="Regiões"
          value={regions.length}
          hint={region === "ALL" ? "Todas as regiões" : region}
          accent="navy"
        />
      </div>

      {/* Per region */}
      {regions.map((reg) => {
        const items = progress.filter((p) => p.region === reg);
        return (
          <ChartCard
            key={reg}
            title={reg}
            subtitle="Progresso por plataforma e objetivo"
            right={
              <span
                className="chip text-white"
                style={{ background: REGION_COLORS[reg] }}
              >
                {items.length} metas
              </span>
            }
          >
            <div className="grid gap-x-8 gap-y-5 md:grid-cols-2">
              {items.map((p, i) => (
                <div key={i}>
                  <div className="mb-1.5 flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ background: platformColor(p.platform) }}
                    />
                    <span className="text-xs font-bold uppercase tracking-wide text-muted">
                      {PLATFORM_LABEL[p.platform]}
                    </span>
                  </div>
                  <MetaBar
                    label={p.item.label}
                    sublabel={`Meta de ${fmtInt(p.item.goal)} ${p.item.unitLabel.toLowerCase()}`}
                    actual={p.actual}
                    goal={p.item.goal}
                    unit={p.item.unitLabel.toLowerCase()}
                    color={platformColor(p.platform)}
                  />
                  <div className="mt-3">
                    <MetaBar
                      label="Investimento"
                      actual={capInvest(p.actualInvest, p.item.investimento)}
                      goal={p.item.investimento}
                      currency
                      color="#64748b"
                    />
                  </div>
                </div>
              ))}
            </div>
          </ChartCard>
        );
      })}
    </div>
  );
}
