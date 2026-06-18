import { NormalizedRow, PlatformId } from "./types";
import { METAS, MetaItem, MetaUnit } from "./metas";

export interface MetaProgress {
  region: string;
  platform: PlatformId;
  item: MetaItem;
  actual: number;
  pct: number; // 0..1+ (can exceed 1)
}

// Pull the actual achieved value for a meta item from normalized rows.
function actualFor(
  item: MetaItem,
  platform: PlatformId,
  region: string,
  data: Record<PlatformId, NormalizedRow[]>
): number {
  const rows = (data[platform] ?? []).filter((r) => r.region === region);

  // Google carries two distinct goals split by strategy.
  let scoped = rows;
  if (platform === "google") {
    if (item.unit === "impressions") {
      scoped = rows.filter((r) => r.strategy.toLowerCase().includes("alcance"));
    } else {
      scoped = rows.filter((r) =>
        r.strategy.toLowerCase().includes("visualiza")
      );
    }
  }

  const key: Record<MetaUnit, keyof NormalizedRow> = {
    impressions: "impressions",
    views: "views",
    completes: "q100",
  };
  return scoped.reduce((s, r) => s + (r[key[item.unit]] as number), 0);
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
        const actual = actualFor(item, pm.platform, region, data);
        out.push({
          region,
          platform: pm.platform,
          item,
          actual,
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
