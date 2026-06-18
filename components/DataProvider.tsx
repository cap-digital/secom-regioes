"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from "react";
import { ApiResponse, NormalizedRow, PlatformId } from "@/lib/types";
import { normalize } from "@/lib/metrics";

interface DataState {
  loading: boolean;
  error: string | null;
  data: Record<PlatformId, NormalizedRow[]> | null;
  timestamp: string | null;
  // Global region filter shared across all dashboard pages.
  region: string; // "ALL" | "REGIÃO 8" | ...
  setRegion: (r: string) => void;
  refresh: () => void;
}

const Ctx = createContext<DataState | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<Record<PlatformId, NormalizedRow[]> | null>(
    null
  );
  const [timestamp, setTimestamp] = useState<string | null>(null);
  const [region, setRegion] = useState("ALL");
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(null);
    fetch("/api/data")
      .then((r) => r.json())
      .then((json: ApiResponse) => {
        if (!alive) return;
        if (!json?.success) throw new Error("Resposta inválida da API");
        setData(normalize(json));
        setTimestamp(json.timestamp ?? null);
      })
      .catch((e) => alive && setError(String(e?.message ?? e)))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [nonce]);

  const value = useMemo<DataState>(
    () => ({
      loading,
      error,
      data,
      timestamp,
      region,
      setRegion,
      refresh: () => setNonce((n) => n + 1),
    }),
    [loading, error, data, timestamp, region]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useData() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useData must be used within DataProvider");
  return ctx;
}

// Convenience: rows for one platform, filtered by the global region.
export function usePlatformRows(platform: PlatformId): {
  loading: boolean;
  error: string | null;
  rows: NormalizedRow[];
  allRows: NormalizedRow[];
  region: string;
} {
  const { data, loading, error, region } = useData();
  const allRows = data?.[platform] ?? [];
  const rows =
    region === "ALL" ? allRows : allRows.filter((r) => r.region === region);
  return { loading, error, rows, allRows, region };
}
