import { NormalizedRow, PlatformId } from "./types";
import { METAS, MetaItem, MetaUnit } from "./metas";

export interface MetaProgress {
  region: string;
  platform: PlatformId;
  item: MetaItem;
  actual: number;
  actualInvest: number; // realized investment for this meta
  pct: number; // 0..1+ (can exceed 1)
}

// Accent-insensitive, lowercased strategy string for matching the `Estratégia `
// data column ("Visualização Pulável" / "Visualização Shorts").
export const normStrategy = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

// Rows that back a given meta item (Google is split into two goals by strategy).
function scopedRows(
  item: MetaItem,
  platform: PlatformId,
  region: string,
  data: Record<PlatformId, NormalizedRow[]>
): NormalizedRow[] {
  const rows = (data[platform] ?? []).filter((r) => r.region === region);
  if (platform === "google" && item.dataStrategy) {
    // Match the `Estratégia ` value ("Visualização Pulável" / "...Shorts"),
    // accent-insensitive, decoupled from the displayed unit.
    return rows.filter((r) => normStrategy(r.strategy).includes(item.dataStrategy!));
  }
  return rows;
}

// Pull the actual achieved value for a meta item from normalized rows.
function actualFor(rows: NormalizedRow[], item: MetaItem): number {
  const key: Record<MetaUnit, keyof NormalizedRow> = {
    impressions: "impressions",
    views: "views",
    completes: "q100",
    disparos: "disparos",
  };
  return rows.reduce((s, r) => s + (r[key[item.unit]] as number), 0);
}

export function computeProgress(
  data: Record<PlatformId, NormalizedRow[]>,
  regionFilter: string = "ALL"
): MetaProgress[] {
  const out: MetaProgress[] = [];
  for (const region of Object.keys(METAS)) {
    if (regionFilter !== "ALL" && region !== regionFilter) continue;
    for (const pm of METAS[region]) {
      for (const item of pm.items) {
        const rows = scopedRows(item, pm.platform, region, data);
        const actual = actualFor(rows, item);
        const actualInvest = rows.reduce((s, r) => s + r.investimento, 0);
        out.push({
          region,
          platform: pm.platform,
          item,
          actual,
          actualInvest,
          pct: item.goal > 0 ? actual / item.goal : 0,
        });
      }
    }
  }
  return out;
}

// Aggregate goal investimento (planned budget) for a platform / region.
export function plannedInvestimento(
  platform: PlatformId,
  regionFilter: string = "ALL"
): number {
  let total = 0;
  for (const region of Object.keys(METAS)) {
    if (regionFilter !== "ALL" && region !== regionFilter) continue;
    const pm = METAS[region].find((p) => p.platform === platform);
    pm?.items.forEach((i) => (total += i.investimento));
  }
  return total;
}

// Never let displayed *investment* exceed the contracted limit — money is
// sensitive and overspend must not show through. Delivery metrics are NOT
// capped here: over-delivery (views/listens above goal) is good and shown.
export const capInvest = (actual: number, planned: number): number =>
  planned > 0 ? Math.min(actual, planned) : actual;
