"use client";

import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState } from "@/components/ui/StateViews";
import { ChartCard } from "@/components/ui/charts";
import { IconBell } from "@/components/ui/icons";
import { Bell } from "lucide-react";
import { REGION_COLORS } from "@/components/ui/charts";
import { METAS } from "@/lib/metas";
import { REGIONS } from "@/lib/metrics";
import { fmtBRL, fmtInt } from "@/lib/format";

export default function PushPage() {
  const planned = REGIONS.map((reg) => {
    const item = METAS[reg].find((p) => p.platform === "pushNotification")!.items[0];
    return { reg, goal: item.goal, inv: item.investimento };
  });
  const totalGoal = planned.reduce((s, p) => s + p.goal, 0);
  const totalInv = planned.reduce((s, p) => s + p.inv, 0);

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Plataforma"
        title="Push Notification"
        description="Alcance via notificações push — estratégia de alcance"
        icon={<IconBell />}
        accent="#f97316"
      />

      <EmptyState
        title="Aguardando início da veiculação"
        description="Esta plataforma ainda não retornou dados de performance. Assim que a campanha de Push Notification começar a veicular, as métricas aparecerão aqui automaticamente."
        icon={<Bell className="h-8 w-8" strokeWidth={1.6} />}
      />

      {/* Planned goals preview */}
      <ChartCard
        title="Metas planejadas"
        subtitle="Objetivos de alcance (impressões) definidos por região"
      >
        <div className="grid gap-3 sm:grid-cols-3">
          {planned.map((p) => (
            <div key={p.reg} className="rounded-2xl border border-slate-100 bg-surface/60 p-4">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: REGION_COLORS[p.reg] }} />
                <span className="text-sm font-semibold text-ink">{p.reg}</span>
              </div>
              <p className="mt-3 text-2xl font-bold text-ink">{fmtInt(p.goal)}</p>
              <p className="text-xs text-muted">impressões previstas</p>
              <p className="mt-2 text-sm font-semibold text-gov-blue">{fmtBRL(p.inv)}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-gradient-to-r from-gov-navy to-gov-blue px-4 py-3 text-white">
          <span className="text-sm font-medium opacity-90">Total planejado</span>
          <span className="text-sm font-bold">
            {fmtInt(totalGoal)} impressões · {fmtBRL(totalInv)}
          </span>
        </div>
      </ChartCard>
    </div>
  );
}
