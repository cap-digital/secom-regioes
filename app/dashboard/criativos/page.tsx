"use client";

import { useEffect, useMemo, useState } from "react";
import { useData } from "@/components/DataProvider";
import { PageHeader } from "@/components/ui/PageHeader";
import { LoadingState, ErrorState, EmptyState } from "@/components/ui/StateViews";
import { Segmented } from "@/components/ui/Segmented";
import { REGION_COLORS } from "@/components/ui/charts";
import { IconImage } from "@/components/ui/icons";
import {
  Trophy,
  Target,
  TrendingDown,
  CheckCircle2,
  Zap,
  ImageOff,
  Headphones,
  Tv,
  Film,
  Play,
  ExternalLink,
} from "lucide-react";
import { sumRows, ctr, creativeName } from "@/lib/metrics";
import { plannedInvestimento, capInvest } from "@/lib/metasCalc";
import { youtubeThumb } from "@/lib/youtube";
import { PLATFORM_LABEL } from "@/lib/metas";
import { NormalizedRow, PlatformId } from "@/lib/types";
import { fmtInt, fmtPct, fmtBRL, fmtCompact } from "@/lib/format";

const PLAT_COLOR: Record<PlatformId, string> = {
  google: "#E52207",
  tvConectada: "#1351B4",
  spotify: "#168821",
  programaticaDeVideo: "#7c3aed",
  pushNotification: "#f97316",
};

const PAGE_SIZE = 20;

interface Creative {
  key: string;
  name: string;
  platform: PlatformId;
  region: string;
  videoUrl: string;
  thumb: string | null;
  investimento: number;
  impressions: number;
  views: number;
  clicks: number;
  q100: number;
  ctr: number;
  cpm: number;
  completion: number;
}

const SORT_OPTS = [
  { value: "views", label: "Visualizações" },
  { value: "impressions", label: "Impressões" },
  { value: "investimento", label: "Investimento" },
  { value: "ctr", label: "CTR" },
];

export default function CriativosPage() {
  const { data, loading, error, region } = useData();
  const [plat, setPlat] = useState<string>("ALL");
  const [sort, setSort] = useState<string>("views");
  const [page, setPage] = useState(1);

  const creatives = useMemo<Creative[]>(() => {
    if (!data) return [];
    const plats: PlatformId[] = ["google", "tvConectada", "spotify", "programaticaDeVideo"];
    const map = new Map<string, NormalizedRow[]>();
    plats.forEach((p) => {
      data[p]
        .filter((r) => region === "ALL" || r.region === region)
        .forEach((r) => {
          const name = creativeName(r);
          const key = `${p}::${r.region}::${name}`;
          (map.get(key) ?? map.set(key, []).get(key)!).push(r);
        });
    });
    const out: Creative[] = [];
    map.forEach((rows, key) => {
      const [platform, reg] = key.split("::") as [PlatformId, string];
      const t = sumRows(rows);
      const videoUrl = rows.find((r) => r.videoUrl)?.videoUrl ?? "";
      out.push({
        key,
        name: creativeName(rows[0]),
        platform,
        region: reg,
        videoUrl,
        thumb: youtubeThumb(videoUrl),
        investimento: t.investimento,
        impressions: t.impressions,
        views: t.views,
        clicks: t.clicks,
        q100: t.q100,
        ctr: ctr(t),
        cpm: t.impressions > 0 ? (t.investimento / t.impressions) * 1000 : 0,
        completion: t.impressions > 0 ? t.q100 / t.impressions : 0,
      });
    });
    return out;
  }, [data, region]);

  const filtered = useMemo(() => {
    const list = plat === "ALL" ? creatives : creatives.filter((c) => c.platform === plat);
    const key = sort as "views" | "impressions" | "investimento" | "ctr";
    return [...list].sort((a, b) => b[key] - a[key]);
  }, [creatives, plat, sort]);

  // Reset to first page whenever filters change.
  useEffect(() => setPage(1), [plat, sort, region]);

  const stats = useMemo(() => {
    const t = filtered.reduce(
      (acc, c) => {
        acc.impressions += c.impressions;
        acc.views += c.views;
        acc.active += c.impressions > 0 ? 1 : 0;
        return acc;
      },
      { impressions: 0, views: 0, active: 0 }
    );
    // Cap investment per platform at the contracted limit so overspend never shows.
    const invByPlat = new Map<PlatformId, number>();
    filtered.forEach((c) =>
      invByPlat.set(c.platform, (invByPlat.get(c.platform) ?? 0) + c.investimento)
    );
    let investimento = 0;
    invByPlat.forEach((v, p) => {
      investimento += capInvest(v, plannedInvestimento(p, region));
    });
    return { ...t, investimento };
  }, [filtered, region]);

  // Quick-read insights (best performers within the current view).
  const insights = useMemo(() => {
    if (filtered.length === 0) return [];
    const withImpr = filtered.filter((c) => c.impressions >= 100);
    const top = (arr: Creative[], pick: (c: Creative) => number, dir: 1 | -1 = 1) =>
      arr.length ? arr.reduce((a, b) => (pick(b) * dir > pick(a) * dir ? b : a)) : null;

    const bestViews = top(filtered, (c) => c.views);
    const bestCtr = top(withImpr.length ? withImpr : filtered, (c) => c.ctr);
    const bestCpm = top(withImpr.length ? withImpr : filtered, (c) => c.cpm, -1);
    const bestCompletion = top(
      filtered.filter((c) => c.platform !== "spotify" && c.impressions >= 100),
      (c) => c.completion
    );

    const list: { icon: React.ReactNode; tag: string; text: React.ReactNode; color: string }[] = [];
    if (bestViews && bestViews.views > 0)
      list.push({
        icon: <Trophy className="h-4 w-4" />,
        tag: "Mais visualizado",
        color: PLAT_COLOR[bestViews.platform],
        text: (
          <>
            <b>{bestViews.name}</b> ({PLATFORM_LABEL[bestViews.platform]} ·{" "}
            {bestViews.region}) lidera com <b>{fmtInt(bestViews.views)}</b>{" "}
            visualizações.
          </>
        ),
      });
    if (bestCtr && bestCtr.ctr > 0)
      list.push({
        icon: <Target className="h-4 w-4" />,
        tag: "Melhor CTR",
        color: PLAT_COLOR[bestCtr.platform],
        text: (
          <>
            <b>{bestCtr.name}</b> ({PLATFORM_LABEL[bestCtr.platform]}) tem o maior
            CTR: <b>{fmtPct(bestCtr.ctr, 2)}</b>.
          </>
        ),
      });
    if (bestCpm && bestCpm.cpm > 0)
      list.push({
        icon: <TrendingDown className="h-4 w-4" />,
        tag: "Menor CPM",
        color: PLAT_COLOR[bestCpm.platform],
        text: (
          <>
            <b>{bestCpm.name}</b> ({bestCpm.region}) é o mais eficiente:{" "}
            CPM de <b>{fmtBRL(bestCpm.cpm)}</b>.
          </>
        ),
      });
    if (bestCompletion && bestCompletion.completion > 0)
      list.push({
        icon: <CheckCircle2 className="h-4 w-4" />,
        tag: "Maior conclusão",
        color: PLAT_COLOR[bestCompletion.platform],
        text: (
          <>
            <b>{bestCompletion.name}</b> ({PLATFORM_LABEL[bestCompletion.platform]}){" "}
            tem a maior taxa de conclusão: <b>{fmtPct(bestCompletion.completion, 1)}</b>.
          </>
        ),
      });
    return list;
  }, [filtered]);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;

  const platsPresent = Array.from(new Set(creatives.map((c) => c.platform)));
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, totalPages);
  const pageItems = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Análise"
        title="Criativos"
        description="Biblioteca de anúncios veiculados e seu desempenho"
        icon={<IconImage />}
        accent="#0c326f"
        right={
          <Segmented
            size="sm"
            value={plat}
            onChange={setPlat}
            options={[
              { value: "ALL", label: "Todas" },
              ...platsPresent.map((p) => ({ value: p, label: PLATFORM_LABEL[p] })),
            ]}
          />
        }
      />

      {/* Banner with totals */}
      <div className="grid grid-cols-2 gap-3 rounded-2xl bg-gradient-to-r from-gov-navy to-gov-blue p-4 text-white sm:grid-cols-4 sm:p-5">
        {[
          { label: "Criativos ativos", value: fmtInt(stats.active) },
          { label: "Investimento", value: fmtBRL(stats.investimento) },
          { label: "Impressões", value: fmtCompact(stats.impressions) },
          { label: "Visualizações", value: fmtCompact(stats.views) },
        ].map((s) => (
          <div key={s.label}>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-white/70">
              {s.label}
            </p>
            <p className="mt-1 text-xl font-bold sm:text-2xl">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Quick-read insights */}
      {insights.length > 0 && (
        <div className="card card-pad">
          <div className="mb-3 flex items-center gap-2">
            <Zap className="h-4 w-4 text-gov-yellow" fill="currentColor" />
            <h3 className="section-title">Leitura rápida</h3>
          </div>
          <div className="grid gap-2.5 sm:grid-cols-2">
            {insights.map((ins) => (
              <div
                key={ins.tag}
                className="flex items-start gap-3 rounded-xl bg-surface/70 p-3"
              >
                <span
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                  style={{ background: `${ins.color}1a`, color: ins.color }}
                >
                  {ins.icon}
                </span>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wide" style={{ color: ins.color }}>
                    {ins.tag}
                  </p>
                  <p className="text-xs leading-relaxed text-ink">{ins.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted">
          <strong className="text-ink">{filtered.length}</strong> criativos
        </p>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted">Ordenar por</span>
          <Segmented size="sm" value={sort} onChange={setSort} options={SORT_OPTS} />
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="Nenhum criativo encontrado" icon={<ImageOff className="h-8 w-8" strokeWidth={1.6} />} />
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {pageItems.map((c) => (
              <div key={c.key} className="card card-pad group flex flex-col animate-fade-up transition hover:-translate-y-0.5 hover:shadow-float">
                {c.thumb && c.videoUrl ? (
                  <a
                    href={c.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group/thumb relative mb-3 block h-56 overflow-hidden rounded-xl bg-ink/5"
                    title="Abrir vídeo em nova guia"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={c.thumb}
                      alt={c.name}
                      loading="lazy"
                      referrerPolicy="no-referrer"
                      className="h-full w-full object-cover transition-transform duration-300 group-hover/thumb:scale-105"
                    />
                    <span className="absolute inset-0 bg-ink/0 transition-colors group-hover/thumb:bg-ink/25" />
                    <span className="absolute left-1/2 top-1/2 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-gov-red opacity-90 shadow-card transition-transform group-hover/thumb:scale-110">
                      <Play className="h-5 w-5 translate-x-[1px]" fill="currentColor" strokeWidth={0} />
                    </span>
                    <span className="absolute left-2 top-2 chip text-[10px] text-white" style={{ background: PLAT_COLOR[c.platform] }}>
                      {PLATFORM_LABEL[c.platform]}
                    </span>
                    <span className="absolute right-2 top-2 chip bg-white/90 text-[10px]" style={{ color: REGION_COLORS[c.region] }}>
                      {c.region.replace("REGIÃO", "R")}
                    </span>
                  </a>
                ) : (
                  <div
                    className="relative mb-3 flex h-56 items-center justify-center overflow-hidden rounded-xl"
                    style={{ background: `linear-gradient(135deg, ${PLAT_COLOR[c.platform]}22, ${PLAT_COLOR[c.platform]}08)` }}
                  >
                    <span style={{ color: PLAT_COLOR[c.platform] }}>
                      {c.platform === "spotify" ? (
                        <Headphones className="h-9 w-9" strokeWidth={1.5} />
                      ) : c.platform === "tvConectada" ? (
                        <Tv className="h-9 w-9" strokeWidth={1.5} />
                      ) : (
                        <Film className="h-9 w-9" strokeWidth={1.5} />
                      )}
                    </span>
                    <span className="absolute left-2 top-2 chip text-[10px] text-white" style={{ background: PLAT_COLOR[c.platform] }}>
                      {PLATFORM_LABEL[c.platform]}
                    </span>
                    <span className="absolute right-2 top-2 chip bg-white/90 text-[10px]" style={{ color: REGION_COLORS[c.region] }}>
                      {c.region.replace("REGIÃO", "R")}
                    </span>
                  </div>
                )}

                <p className="line-clamp-2 min-h-[2.5rem] text-sm font-semibold text-ink" title={c.name}>
                  {c.name}
                </p>

                <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-lg bg-surface px-2.5 py-1.5">
                    <p className="stat-label">Visualizações</p>
                    <p className="font-bold text-ink">{fmtInt(c.views)}</p>
                  </div>
                  <div className="rounded-lg bg-surface px-2.5 py-1.5">
                    <p className="stat-label">Impressões</p>
                    <p className="font-bold text-ink">{fmtInt(c.impressions)}</p>
                  </div>
                  <div className="rounded-lg bg-surface px-2.5 py-1.5">
                    <p className="stat-label">CTR</p>
                    <p className="font-bold text-ink">{fmtPct(c.ctr, 2)}</p>
                  </div>
                  <div className="rounded-lg bg-surface px-2.5 py-1.5">
                    <p className="stat-label">Investimento</p>
                    <p className="font-bold text-ink">{fmtBRL(c.investimento)}</p>
                  </div>
                </div>

                <div className="mt-3">
                  <div className="flex justify-between text-[11px] text-muted">
                    <span>Conclusão de vídeo</span>
                    <span className="font-semibold text-ink">{fmtPct(c.completion, 0)}</span>
                  </div>
                  <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-surface">
                    <div className="h-full rounded-full" style={{ width: `${Math.min(c.completion * 100, 100)}%`, background: PLAT_COLOR[c.platform] }} />
                  </div>
                </div>

                {c.videoUrl && (
                  <a
                    href={c.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 py-2 text-xs font-semibold text-ink transition hover:border-gov-blue hover:bg-gov-blue hover:text-white"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    Abrir vídeo
                  </a>
                )}
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={current === 1}
                className="rounded-full bg-white px-4 py-2 text-xs font-semibold text-ink shadow-card transition enabled:hover:bg-gov-blue enabled:hover:text-white disabled:opacity-40"
              >
                Anterior
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i + 1)}
                    className={`h-8 w-8 rounded-full text-xs font-semibold transition ${
                      current === i + 1 ? "bg-gov-blue text-white" : "bg-white text-muted shadow-card hover:text-ink"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={current === totalPages}
                className="rounded-full bg-white px-4 py-2 text-xs font-semibold text-ink shadow-card transition enabled:hover:bg-gov-blue enabled:hover:text-white disabled:opacity-40"
              >
                Próximo
              </button>
            </div>
          )}
          <p className="text-center text-xs text-muted">
            Página {current} de {totalPages} · exibindo {pageItems.length} de {filtered.length}
          </p>
        </>
      )}
    </div>
  );
}
