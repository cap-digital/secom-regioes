"use client";

import { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useData } from "@/components/DataProvider";
import { PageHeader } from "@/components/ui/PageHeader";
import { Kpi } from "@/components/ui/Kpi";
import { LoadingState, ErrorState } from "@/components/ui/StateViews";
import { Dropdown } from "@/components/ui/Dropdown";
import {
  ChartCard,
  ChartTooltip,
  REGION_COLORS,
  AXIS,
} from "@/components/ui/charts";
import { IconGrid } from "@/components/ui/icons";
import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";
import {
  sumRows,
  cpm,
  ctr,
  cpc,
  cpv,
  sumMetric,
  metricValue,
  METRIC_OPTIONS,
  METRIC_META,
  MetricKey,
  REGIONS,
  REGION_SHORT,
} from "@/lib/metrics";
import { PLATFORM_LABEL } from "@/lib/metas";
import { plannedInvestimento, capInvest } from "@/lib/metasCalc";
import { NormalizedRow, PlatformId } from "@/lib/types";
import { fmtBRL, fmtCompact, fmtInt, fmtPct, fmtDayShort } from "@/lib/format";

const PLATS: { id: PlatformId; color: string }[] = [
  { id: "google", color: "#E52207" },
  { id: "tvConectada", color: "#1351B4" },
  { id: "spotify", color: "#168821" },
  { id: "programaticaDeVideo", color: "#7c3aed" },
];

const fmtMetric = (m: MetricKey, v: number) =>
  METRIC_META[m].currency ? fmtBRL(v) : fmtInt(v);

type SortKey = "name" | "investimento" | "impressions" | "clicks" | "ctr" | "cpm" | "cpc";

export default function OverviewPage() {
  const { data, loading, error, region } = useData();
  const [dailyMetric, setDailyMetric] = useState<MetricKey>("investimento");
  const [platMetric, setPlatMetric] = useState<MetricKey>("investimento");
  const [regionMetric, setRegionMetric] = useState<MetricKey>("investimento");
  const [sort, setSort] = useState<{ key: SortKey; dir: "asc" | "desc" }>({
    key: "investimento",
    dir: "desc",
  });

  const filtered = useMemo(() => {
    if (!data) return null;
    const out = {} as Record<PlatformId, NormalizedRow[]>;
    (Object.keys(data) as PlatformId[]).forEach((p) => {
      out[p] =
        region === "ALL" ? data[p] : data[p].filter((r) => r.region === region);
    });
    return out;
  }, [data, region]);

  const base = useMemo(() => {
    if (!filtered) return null;
    const allRows = PLATS.flatMap((p) => filtered[p.id]);
    const rawTotals = sumRows(allRows);
    const perPlatform = PLATS.map((p) => {
      const t = sumRows(filtered[p.id]);
      // Cap investment at the contracted limit so overspend never shows.
      const inv = capInvest(t.investimento, plannedInvestimento(p.id, region));
      const capped = { ...t, investimento: inv };
      return {
        id: p.id,
        name: PLATFORM_LABEL[p.id],
        color: p.color,
        investimento: inv,
        impressions: t.impressions,
        clicks: t.clicks,
        ctr: ctr(t),
        cpm: cpm(capped),
        cpc: cpc(capped),
      };
    });
    const totalInvest = perPlatform.reduce((s, p) => s + p.investimento, 0);
    const totals = { ...rawTotals, investimento: totalInvest };
    const dateSet = new Set<string>();
    allRows.forEach((r) => r.date && dateSet.add(r.date));
    const days = Array.from(dateSet).sort();
    return { allRows, totals, perPlatform, days };
  }, [filtered, region]);

  const daily = useMemo(() => {
    if (!filtered || !base) return [];
    return base.days.map((d) => {
      const row: Record<string, number | string> = { date: d };
      PLATS.forEach((p) => {
        row[p.id] = filtered[p.id]
          .filter((r) => r.date === d)
          .reduce((s, r) => s + metricValue(r, dailyMetric), 0);
      });
      return row;
    });
  }, [filtered, base, dailyMetric]);

  const platformBar = useMemo(() => {
    if (!filtered) return [];
    return PLATS.map((p) => ({
      id: p.id,
      name: PLATFORM_LABEL[p.id],
      color: p.color,
      value:
        platMetric === "investimento"
          ? capInvest(
              sumRows(filtered[p.id]).investimento,
              plannedInvestimento(p.id, region)
            )
          : sumMetric(filtered[p.id], platMetric),
    }));
  }, [filtered, platMetric, region]);

  const byRegion = useMemo(() => {
    if (!base || !filtered) return [];
    const rows = REGIONS.map((reg) => {
      const value =
        regionMetric === "investimento"
          ? PLATS.reduce(
              (s, p) =>
                s +
                capInvest(
                  filtered[p.id]
                    .filter((r) => r.region === reg)
                    .reduce((a, r) => a + r.investimento, 0),
                  plannedInvestimento(p.id, reg)
                ),
              0
            )
          : sumMetric(
              base.allRows.filter((r) => r.region === reg),
              regionMetric
            );
      return { name: reg, short: REGION_SHORT[reg], value };
    }).filter((r) => r.value > 0);
    const total = rows.reduce((s, r) => s + r.value, 0) || 1;
    // Share of total — naturally bounded to 100%.
    return rows.map((r) => ({ ...r, pct: Math.min(r.value / total, 1) }));
  }, [base, filtered, regionMetric]);

  const sortedPlatforms = useMemo(() => {
    if (!base) return [];
    const arr = [...base.perPlatform];
    arr.sort((a, b) => {
      const av = a[sort.key];
      const bv = b[sort.key];
      const cmp =
        typeof av === "string" && typeof bv === "string"
          ? av.localeCompare(bv)
          : (av as number) - (bv as number);
      return sort.dir === "asc" ? cmp : -cmp;
    });
    return arr;
  }, [base, sort]);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;
  if (!base) return null;

  const { totals } = base;

  const toggleSort = (key: SortKey) =>
    setSort((s) =>
      s.key === key
        ? { key, dir: s.dir === "asc" ? "desc" : "asc" }
        : { key, dir: "desc" }
    );

  const SortHead = ({ k, children, align = "right" }: { k: SortKey; children: React.ReactNode; align?: "left" | "right" }) => (
    <th
      className={`cursor-pointer select-none px-3 font-semibold transition hover:text-gov-blue ${
        align === "right" ? "text-right" : "text-left"
      } ${sort.key === k ? "text-gov-blue" : ""}`}
      onClick={() => toggleSort(k)}
    >
      <span className={`inline-flex items-center gap-1 ${align === "right" ? "justify-end" : ""}`}>
        {children}
        {sort.key === k ? (
          sort.dir === "asc" ? (
            <ChevronUp className="h-3 w-3" />
          ) : (
            <ChevronDown className="h-3 w-3" />
          )
        ) : (
          <ChevronsUpDown className="h-3 w-3 opacity-50" />
        )}
      </span>
    </th>
  );

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Campanha SECOM · Regionais"
        title="Visão Geral"
        description="Consolidado de performance entre todas as plataformas de mídia"
        icon={<IconGrid />}
        accent="#1351B4"
      />

      {/* KPIs with embedded costs & rates */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi
          label="Investimento"
          value={fmtBRL(totals.investimento)}
          accent="blue"
        />
        <Kpi
          label="Impressões"
          value={fmtCompact(totals.impressions)}
          accent="navy"
          sub={[{ label: "CPM", value: fmtBRL(cpm(totals)) }]}
        />
        <Kpi
          label="Cliques"
          value={fmtInt(totals.clicks)}
          accent="red"
          sub={[
            { label: "CTR", value: fmtPct(ctr(totals), 2) },
            { label: "CPC", value: fmtBRL(cpc(totals)) },
          ]}
        />
        <Kpi
          label="Visualizações"
          value={fmtCompact(totals.views)}
          accent="green"
          sub={[{ label: "CPV", value: fmtBRL(cpv(totals)) }]}
        />
      </div>

      {/* Daily area + region donut */}
      <div className="grid gap-3 lg:grid-cols-3">
        <ChartCard
          title={`${METRIC_META[dailyMetric].label} por dia e plataforma`}
          subtitle="Distribuição ao longo da campanha"
          className="lg:col-span-2"
          right={
            <Dropdown
              label="Métrica"
              value={dailyMetric}
              onChange={(v) => setDailyMetric(v as MetricKey)}
              options={METRIC_OPTIONS}
            />
          }
        >
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={daily} margin={{ left: -10, right: 8, top: 8 }}>
              <defs>
                {PLATS.map((p) => (
                  <linearGradient key={p.id} id={`g-${p.id}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={p.color} stopOpacity={0.7} />
                    <stop offset="100%" stopColor={p.color} stopOpacity={0.05} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid stroke="#eef1f8" vertical={false} />
              <XAxis dataKey="date" tickFormatter={fmtDayShort} axisLine={false} tickLine={false} tick={AXIS.tick} />
              <YAxis tickFormatter={(v) => fmtCompact(v as number)} axisLine={false} tickLine={false} tick={AXIS.tick} width={56} />
              <Tooltip content={<ChartTooltip labelFormatter={fmtDayShort} formatter={(v) => fmtMetric(dailyMetric, v)} />} />
              {PLATS.map((p) => (
                <Area
                  key={p.id}
                  type="monotone"
                  dataKey={p.id}
                  name={PLATFORM_LABEL[p.id]}
                  stackId="1"
                  stroke={p.color}
                  fill={`url(#g-${p.id})`}
                  strokeWidth={2}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title={`${METRIC_META[regionMetric].label} por região`}
          subtitle="Participação de cada região"
          right={
            <Dropdown
              value={regionMetric}
              onChange={(v) => setRegionMetric(v as MetricKey)}
              options={METRIC_OPTIONS}
            />
          }
        >
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={byRegion} dataKey="value" nameKey="name" innerRadius={50} outerRadius={85} paddingAngle={3} stroke="none">
                {byRegion.map((r) => (
                  <Cell key={r.name} fill={REGION_COLORS[r.name]} />
                ))}
              </Pie>
              <Tooltip content={<ChartTooltip formatter={(v) => fmtMetric(regionMetric, v)} />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-2 space-y-1.5">
            {byRegion.map((r) => (
              <div key={r.name} className="flex items-center gap-2 text-xs">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: REGION_COLORS[r.name] }} />
                <span className="text-muted">{r.name}</span>
                <span className="ml-auto font-semibold text-ink">{fmtMetric(regionMetric, r.value)}</span>
                <span className="w-12 text-right font-bold text-gov-blue">{fmtPct(r.pct, 1)}</span>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>

      {/* Platform bar */}
      <ChartCard
        title={`${METRIC_META[platMetric].label} por plataforma`}
        subtitle="Comparativo entre os canais de mídia"
        right={
          <Dropdown
            label="Métrica"
            value={platMetric}
            onChange={(v) => setPlatMetric(v as MetricKey)}
            options={METRIC_OPTIONS}
          />
        }
      >
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={platformBar} layout="vertical" margin={{ left: 30, right: 30 }}>
            <CartesianGrid stroke="#eef1f8" horizontal={false} />
            <XAxis type="number" tickFormatter={(v) => fmtCompact(v as number)} axisLine={false} tickLine={false} tick={AXIS.tick} />
            <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ ...AXIS.tick, fontSize: 12 }} width={120} />
            <Tooltip cursor={{ fill: "#f4f6fb" }} content={<ChartTooltip formatter={(v) => fmtMetric(platMetric, v)} />} />
            <Bar dataKey="value" name={METRIC_META[platMetric].label} radius={[0, 8, 8, 0]} barSize={26}>
              {platformBar.map((p) => (
                <Cell key={p.id} fill={p.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Sortable summary table */}
      <ChartCard
        title="Resumo por plataforma"
        subtitle="Custos e taxas calculados (Investimento como base) · clique nas colunas para ordenar"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-muted">
                <SortHead k="name" align="left">Plataforma</SortHead>
                <SortHead k="investimento">Investimento</SortHead>
                <SortHead k="impressions">Impressões</SortHead>
                <SortHead k="clicks">Cliques</SortHead>
                <SortHead k="ctr">CTR</SortHead>
                <SortHead k="cpm">CPM</SortHead>
                <SortHead k="cpc">CPC</SortHead>
              </tr>
            </thead>
            <tbody>
              {sortedPlatforms.map((p) => (
                <tr key={p.id} className="border-b border-slate-50 last:border-0 hover:bg-surface/60">
                  <td className="py-3 pr-3">
                    <span className="flex items-center gap-2 font-semibold text-ink">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ background: p.color }} />
                      {p.name}
                    </span>
                  </td>
                  <td className="px-3 text-right font-semibold text-ink">{fmtBRL(p.investimento)}</td>
                  <td className="px-3 text-right tabular-nums text-muted">{fmtInt(p.impressions)}</td>
                  <td className="px-3 text-right tabular-nums text-muted">{fmtInt(p.clicks)}</td>
                  <td className="px-3 text-right tabular-nums text-muted">{fmtPct(p.ctr, 2)}</td>
                  <td className="px-3 text-right tabular-nums text-muted">{fmtBRL(p.cpm)}</td>
                  <td className="px-3 text-right tabular-nums text-muted">{p.clicks > 0 ? fmtBRL(p.cpc) : "—"}</td>
                </tr>
              ))}
              <tr className="bg-surface/70 font-bold text-ink">
                <td className="py-3 pr-3">Total</td>
                <td className="px-3 text-right">{fmtBRL(totals.investimento)}</td>
                <td className="px-3 text-right tabular-nums">{fmtInt(totals.impressions)}</td>
                <td className="px-3 text-right tabular-nums">{fmtInt(totals.clicks)}</td>
                <td className="px-3 text-right tabular-nums">{fmtPct(ctr(totals), 2)}</td>
                <td className="px-3 text-right tabular-nums">{fmtBRL(cpm(totals))}</td>
                <td className="px-3 text-right tabular-nums">{fmtBRL(cpc(totals))}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </ChartCard>
    </div>
  );
}
