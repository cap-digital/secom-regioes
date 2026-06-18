// PT-BR formatting helpers.

export const fmtInt = (n: number): string =>
  new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 0 }).format(
    Number.isFinite(n) ? n : 0
  );

export const fmtDec = (n: number, d = 2): string =>
  new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: d,
    maximumFractionDigits: d,
  }).format(Number.isFinite(n) ? n : 0);

export const fmtBRL = (n: number): string =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number.isFinite(n) ? n : 0);

export const fmtPct = (n: number, d = 2): string =>
  `${fmtDec(n * 100, d)}%`;

// Compact: 1.234.567 -> "1,23 mi"
export const fmtCompact = (n: number): string => {
  if (!Number.isFinite(n)) return "0";
  const abs = Math.abs(n);
  if (abs >= 1_000_000) return `${fmtDec(n / 1_000_000, 2)} mi`;
  if (abs >= 1_000) return `${fmtDec(n / 1_000, 1)} mil`;
  return fmtInt(n);
};

// "2026-06-12" -> "12/06"
export const fmtDayShort = (iso: string): string => {
  const [, m, d] = iso.split("-");
  return `${d}/${m}`;
};

export const fmtDayLong = (iso: string): string => {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
};
