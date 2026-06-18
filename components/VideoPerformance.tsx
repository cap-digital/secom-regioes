"use client";

import { useMemo, useState } from "react";
import { ChartCard, REGION_COLORS } from "@/components/ui/charts";
import { sumRows, cpv, vtr } from "@/lib/metrics";
import { youtubeThumb } from "@/lib/youtube";
import { NormalizedRow } from "@/lib/types";
import { fmtInt, fmtPct, fmtBRL } from "@/lib/format";
import { ChevronUp, ChevronDown, ChevronsUpDown, Play, ExternalLink } from "lucide-react";

const TOP_N = 5;

type Key = "impressions" | "views" | "vtr" | "cpv";

interface VideoRow {
  title: string;
  region: string;
  multiRegion: boolean;
  videoUrl: string;
  thumb: string | null;
  impressions: number;
  views: number;
  vtr: number;
  cpv: number;
}

// Aggregates rows by `video_title` and shows per-creative performance.
export function VideoPerformance({
  rows,
  accent = "#1351B4",
}: {
  rows: NormalizedRow[];
  accent?: string;
}) {
  const [sort, setSort] = useState<{ key: Key; dir: "asc" | "desc" }>({
    key: "views",
    dir: "desc",
  });

  const videos = useMemo<VideoRow[]>(() => {
    const map = new Map<string, NormalizedRow[]>();
    rows.forEach((r) => {
      const title = r.videoTitle?.trim();
      if (!title) return;
      (map.get(title) ?? map.set(title, []).get(title)!).push(r);
    });
    const out: VideoRow[] = [];
    map.forEach((list, title) => {
      const t = sumRows(list);
      const regions = Array.from(new Set(list.map((r) => r.region)));
      const videoUrl = list.find((r) => r.videoUrl)?.videoUrl ?? "";
      out.push({
        title,
        region: regions[0] ?? "",
        multiRegion: regions.length > 1,
        videoUrl,
        thumb: youtubeThumb(videoUrl),
        impressions: t.impressions,
        views: t.views,
        vtr: vtr(t),
        cpv: cpv(t),
      });
    });
    return out;
  }, [rows]);

  // Only the 5 best (by the active sort metric).
  const sorted = useMemo(() => {
    const arr = [...videos];
    arr.sort((a, b) => {
      const cmp = a[sort.key] - b[sort.key];
      return sort.dir === "asc" ? cmp : -cmp;
    });
    return arr.slice(0, TOP_N);
  }, [videos, sort]);

  if (videos.length === 0) return null;

  const toggle = (key: Key) =>
    setSort((s) =>
      s.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: "desc" }
    );

  const Head = ({ k, children }: { k: Key; children: React.ReactNode }) => (
    <th
      className={`cursor-pointer select-none px-3 text-right font-semibold transition hover:text-gov-blue ${
        sort.key === k ? "text-gov-blue" : ""
      }`}
      onClick={() => toggle(k)}
    >
      <span className="inline-flex items-center justify-end gap-1">
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

  const max = Math.max(...sorted.map((v) => v.views), 1);

  return (
    <ChartCard
      title="Desempenho por vídeo"
      subtitle="Top 5 vídeos · clique nas colunas para reordenar"
    >
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-muted">
              <th className="py-2.5 pr-3 text-left font-semibold">Vídeo</th>
              <Head k="impressions">Impressões</Head>
              <Head k="views">Visualizações</Head>
              <Head k="vtr">VTR</Head>
              <Head k="cpv">CPV</Head>
            </tr>
          </thead>
          <tbody>
            {sorted.map((v, i) => (
              <tr key={v.title} className="border-b border-slate-50 last:border-0 hover:bg-surface/60">
                <td className="max-w-[340px] py-3 pr-3">
                  <div className="flex items-center gap-3">
                    {/* Thumbnail (links to the video) */}
                    {v.thumb && v.videoUrl ? (
                      <a
                        href={v.videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Abrir vídeo em nova guia"
                        className="group/th relative block h-11 w-[72px] shrink-0 overflow-hidden rounded-lg bg-ink/5"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={v.thumb}
                          alt={v.title}
                          loading="lazy"
                          referrerPolicy="no-referrer"
                          className="h-full w-full object-cover transition-transform duration-300 group-hover/th:scale-110"
                        />
                        <span className="absolute inset-0 flex items-center justify-center bg-ink/15 opacity-0 transition-opacity group-hover/th:opacity-100">
                          <Play className="h-4 w-4 text-white" fill="currentColor" strokeWidth={0} />
                        </span>
                      </a>
                    ) : (
                      <span
                        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[11px] font-bold text-white"
                        style={{ background: REGION_COLORS[v.region] ?? accent }}
                      >
                        {i + 1}
                      </span>
                    )}
                    <div className="min-w-0">
                      {v.videoUrl ? (
                        <a
                          href={v.videoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 font-semibold text-ink transition hover:text-gov-blue"
                          title={v.title}
                        >
                          <span className="truncate">{v.title}</span>
                          <ExternalLink className="h-3 w-3 shrink-0 opacity-60" />
                        </a>
                      ) : (
                        <span className="truncate font-semibold text-ink" title={v.title}>
                          {v.title}
                        </span>
                      )}
                      <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-surface">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${(v.views / max) * 100}%`, background: accent }}
                        />
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-3 text-right tabular-nums text-muted">{fmtInt(v.impressions)}</td>
                <td className="px-3 text-right font-semibold tabular-nums text-ink">{fmtInt(v.views)}</td>
                <td className="px-3 text-right tabular-nums text-muted">{fmtPct(v.vtr, 1)}</td>
                <td className="px-3 text-right tabular-nums text-muted">{fmtBRL(v.cpv)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </ChartCard>
  );
}
