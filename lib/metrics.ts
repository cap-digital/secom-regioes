import {
  ApiResponse,
  NormalizedRow,
  PlatformId,
  RawGoogleRow,
  RawProgramaticaRow,
  RawSpotifyRow,
} from "./types";

const REGION_KEY = "Região";
const STRATEGY_KEY = "Estratégia ";

const num = (v: unknown): number => {
  const n = typeof v === "string" ? parseFloat(v) : (v as number);
  return Number.isFinite(n) ? (n as number) : 0;
};

const day = (iso: string): string => (iso ? iso.slice(0, 10) : "");

// Remove emojis / pictographs and tidy whitespace from free-text titles.
export function stripEmoji(s: string): string {
  if (!s) return "";
  return s
    .replace(
      /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{2190}-\u{21FF}\u{2300}-\u{23FF}\u{FE00}-\u{FE0F}\u{200D}]/gu,
      ""
    )
    .replace(/\s+/g, " ")
    .trim();
}

// ---------- Normalization ----------
// Google & TV Conectada share the same schema. Quartiles arrive as RATES
// (fraction of impressions), so we convert them to absolute counts.
function normalizeGoogleLike(
  r: RawGoogleRow,
  platform: PlatformId
): NormalizedRow {
  const impressions = num(r.impressions);
  return {
    platform,
    date: day(r.date),
    campaign: r.campaign ?? "",
    adGroup: r.ad_group_name ?? "",
    adName: r.ad_name ?? "",
    videoTitle: stripEmoji(r.video_title ?? ""),
    videoUrl: (r.thumbnailurl ?? "").trim(),
    region: (r[REGION_KEY] ?? "").trim(),
    strategy: (r[STRATEGY_KEY] ?? "").trim(),
    investimento: num(r.Investimento),
    impressions,
    clicks: num(r.clicks),
    views: num(r.video_trueview_views),
    reach: 0,
    engagements: num(r.engagements),
    q25: Math.round(num(r.video_quartile25_rate) * impressions),
    q50: Math.round(num(r.video_quartile50_rate) * impressions),
    q75: Math.round(num(r.video_quartile75_rate) * impressions),
    q100: Math.round(num(r.video_quartile100_rate) * impressions),
    watchTimeMillis: num(r.average_video_watch_time_duration_millis),
  };
}

function normalizeSpotify(r: RawSpotifyRow): NormalizedRow {
  return {
    platform: "spotify",
    date: day(r.date),
    campaign: r.campaign ?? "",
    adGroup: r.ad_set ?? "",
    adName: r.ad ?? "",
    videoTitle: "",
    videoUrl: "",
    region: (r[REGION_KEY] ?? "").trim(),
    strategy: (r[STRATEGY_KEY] ?? "").trim(),
    investimento: num(r.Investimento),
    impressions: num(r.ad_impressions),
    clicks: num(r.ad_set_clicks),
    views: num(r.ad_completes), // escutas completas
    reach: num(r.ad_reach),
    engagements: num(r.ad_listeners),
    q25: num(r.ad_first_quartiles),
    q50: num(r.ad_midpoints),
    q75: num(r.ad_third_quartiles),
    q100: num(r.ad_completes),
    watchTimeMillis: 0,
  };
}

// Programática already comes in Portuguese with quartiles as absolute counts.
function normalizeProgramatica(r: RawProgramaticaRow): NormalizedRow {
  return {
    platform: "programaticaDeVideo",
    date: day(r.Data),
    campaign: r.Campanha ?? "",
    adGroup: r["Grupo de anúncios"] ?? "",
    adName: r["Anúncio"] ?? "",
    videoTitle: "",
    videoUrl: "",
    region: (r[REGION_KEY] ?? "").trim(),
    strategy: (r[STRATEGY_KEY] ?? "").trim(),
    investimento: num(r.Investimento),
    impressions: num(r["Impressões"]),
    clicks: num(r.Cliques),
    views: num(r["Trueview views"]),
    reach: 0,
    engagements: 0,
    q25: num(r["25% Vídeo assistido"]),
    q50: num(r["50% Video assistido"]),
    q75: num(r["75% Video assistido"]),
    q100: num(r["Videos completos 100%"]),
    watchTimeMillis: 0,
  };
}

export function normalize(api: ApiResponse): Record<PlatformId, NormalizedRow[]> {
  return {
    google: (api.google ?? []).map((r) => normalizeGoogleLike(r, "google")),
    tvConectada: (api.tvConectada ?? []).map((r) =>
      normalizeGoogleLike(r, "tvConectada")
    ),
    spotify: (api.spotify ?? []).map(normalizeSpotify),
    programaticaDeVideo: (api.programaticaDeVideo ?? []).map(
      normalizeProgramatica
    ),
    pushNotification: [],
  };
}

// ---------- Aggregation ----------
export interface Totals {
  investimento: number;
  impressions: number;
  clicks: number;
  views: number;
  reach: number;
  engagements: number;
  q25: number;
  q50: number;
  q75: number;
  q100: number;
  rows: number;
}

export function sumRows(rows: NormalizedRow[]): Totals {
  return rows.reduce<Totals>(
    (acc, r) => {
      acc.investimento += r.investimento;
      acc.impressions += r.impressions;
      acc.clicks += r.clicks;
      acc.views += r.views;
      acc.reach += r.reach;
      acc.engagements += r.engagements;
      acc.q25 += r.q25;
      acc.q50 += r.q50;
      acc.q75 += r.q75;
      acc.q100 += r.q100;
      acc.rows += 1;
      return acc;
    },
    {
      investimento: 0,
      impressions: 0,
      clicks: 0,
      views: 0,
      reach: 0,
      engagements: 0,
      q25: 0,
      q50: 0,
      q75: 0,
      q100: 0,
      rows: 0,
    }
  );
}

// ---------- Derived metrics (costs & rates) ----------
const safeDiv = (a: number, b: number): number => (b > 0 ? a / b : 0);

export const cpm = (t: Totals) => safeDiv(t.investimento, t.impressions) * 1000;
export const cpc = (t: Totals) => safeDiv(t.investimento, t.clicks);
export const ctr = (t: Totals) => safeDiv(t.clicks, t.impressions);
export const cpv = (t: Totals) => safeDiv(t.investimento, t.views);
// VTR = taxa de visualização completa (vídeos 100% / impressões)
export const vtr = (t: Totals) => safeDiv(t.q100, t.impressions);
export const viewRate = (t: Totals) => safeDiv(t.views, t.impressions);

// ---------- Grouping helpers ----------
export function groupBy<T, K extends string>(
  rows: T[],
  key: (r: T) => K
): Record<K, T[]> {
  return rows.reduce((acc, r) => {
    const k = key(r);
    (acc[k] ||= [] as T[]).push(r);
    return acc;
  }, {} as Record<K, T[]>);
}

export function byDay(rows: NormalizedRow[]): { date: string; rows: NormalizedRow[] }[] {
  const map = groupBy(rows, (r) => r.date);
  return Object.keys(map)
    .filter(Boolean)
    .sort()
    .map((date) => ({ date, rows: map[date] }));
}

export const REGIONS = ["REGIÃO 8", "REGIÃO 12", "REGIÃO 14"] as const;

export const REGION_SHORT: Record<string, string> = {
  "REGIÃO 8": "R8",
  "REGIÃO 12": "R12",
  "REGIÃO 14": "R14",
};

// ---------- Switchable metrics (for chart dropdowns) ----------
export type MetricKey =
  | "investimento"
  | "impressions"
  | "clicks"
  | "views"
  | "escutas";

export const METRIC_META: Record<
  MetricKey,
  { label: string; currency: boolean }
> = {
  investimento: { label: "Investimento", currency: true },
  impressions: { label: "Impressões", currency: false },
  clicks: { label: "Cliques", currency: false },
  views: { label: "Visualizações", currency: false },
  escutas: { label: "Escutas", currency: false },
};

export const METRIC_OPTIONS = (Object.keys(METRIC_META) as MetricKey[]).map(
  (value) => ({ value, label: METRIC_META[value].label })
);

// Value of a metric for one row. "Visualizações" excludes Spotify (which is
// audio) and "Escutas" is exclusive to Spotify — so the two never overlap.
export function metricValue(r: NormalizedRow, m: MetricKey): number {
  switch (m) {
    case "investimento":
      return r.investimento;
    case "impressions":
      return r.impressions;
    case "clicks":
      return r.clicks;
    case "views":
      return r.platform === "spotify" ? 0 : r.views;
    case "escutas":
      return r.platform === "spotify" ? r.q100 : 0;
  }
}

export const sumMetric = (rows: NormalizedRow[], m: MetricKey): number =>
  rows.reduce((s, r) => s + metricValue(r, m), 0);

// Strip the heavy bracketed prefix from campaign / creative names.
export function cleanName(raw: string): string {
  if (!raw) return "—";
  // Remove all [....] tokens, collapse whitespace.
  const stripped = raw.replace(/\[[^\]]*\]/g, " ").replace(/\s+/g, " ").trim();
  return stripped || raw;
}

// Best human-readable label for a creative: prefer the video title.
export function creativeName(r: NormalizedRow): string {
  return r.videoTitle || cleanName(r.adName) || cleanName(r.adGroup) || "Criativo";
}
