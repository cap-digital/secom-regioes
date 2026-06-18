"use client";

import { ReactNode, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV } from "./nav";
import { SecomMark } from "./ui/Logo";
import { IconMenu, IconClose, IconRefresh, IconPin } from "./ui/icons";
import { useData } from "./DataProvider";
import { REGIONS } from "@/lib/metrics";
import { CAMPAIGN_PERIOD } from "@/lib/metas";

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-2 scrollbar-none">
      {NAV.map((group) => (
        <div key={group.title}>
          <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
            {group.title}
          </p>
          <div className="space-y-1">
            {group.items.map((item) => {
              const active =
                pathname === item.href ||
                (item.href !== "/dashboard" && pathname.startsWith(item.href));
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onNavigate}
                  className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                    active
                      ? "bg-gov-blue text-white shadow-float"
                      : "text-slate-600 hover:bg-surface"
                  }`}
                >
                  <span
                    className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors"
                    style={{
                      background: active ? "rgba(255,255,255,0.18)" : `${item.color}14`,
                      color: active ? "#fff" : item.color,
                    }}
                  >
                    <Icon width={18} height={18} />
                  </span>
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}

function SidebarBody({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="flex h-full flex-col">
      <div className="px-5 pb-4 pt-5">
        <Link href="/" onClick={onNavigate}>
          <SecomMark />
        </Link>
      </div>
      <div className="mx-4 mb-2 border-t border-slate-100" />
      <NavList onNavigate={onNavigate} />
      <div className="px-4 pb-5 pt-3">
        <div className="rounded-xl bg-gradient-to-br from-gov-navy to-gov-blue p-3 text-white">
          <p className="text-[10px] font-semibold uppercase tracking-wider opacity-80">
            Período da campanha
          </p>
          <p className="mt-0.5 text-sm font-bold">
            {CAMPAIGN_PERIOD.inicio} — {CAMPAIGN_PERIOD.fim}
          </p>
        </div>
      </div>
    </div>
  );
}

function RegionFilter() {
  const { region, setRegion } = useData();
  const opts = ["ALL", ...REGIONS];
  return (
    <div className="flex items-center gap-1 overflow-x-auto rounded-full bg-white p-1 shadow-card scrollbar-none">
      <span className="hidden pl-2 pr-1 text-muted sm:block">
        <IconPin width={16} height={16} />
      </span>
      {opts.map((r) => {
        const active = region === r;
        return (
          <button
            key={r}
            onClick={() => setRegion(r)}
            className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
              active ? "bg-gov-blue text-white" : "text-muted hover:text-ink"
            }`}
          >
            {r === "ALL" ? "Todas" : r.replace("REGIÃO", "Região")}
          </button>
        );
      })}
    </div>
  );
}

export function DashboardShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const { refresh, loading, timestamp } = useData();

  return (
    <div className="min-h-screen grid-bg">
      {/* Floating sidebar — desktop */}
      <aside className="fixed left-4 top-4 bottom-4 z-30 hidden w-[252px] rounded-2xl border border-slate-100 bg-white/90 shadow-float backdrop-blur lg:block">
        <SidebarBody />
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <aside className="absolute left-3 top-3 bottom-3 w-[252px] animate-fade-up rounded-2xl bg-white shadow-float">
            <button
              onClick={() => setOpen(false)}
              className="absolute right-3 top-4 text-muted"
              aria-label="Fechar menu"
            >
              <IconClose />
            </button>
            <SidebarBody onNavigate={() => setOpen(false)} />
          </aside>
        </div>
      )}

      <div className="lg:pl-[276px]">
        {/* Topbar */}
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-slate-100 bg-surface/80 px-4 py-3 backdrop-blur sm:px-6">
          <button
            onClick={() => setOpen(true)}
            className="rounded-lg bg-white p-2 text-ink shadow-card lg:hidden"
            aria-label="Abrir menu"
          >
            <IconMenu />
          </button>
          <RegionFilter />
          <div className="ml-auto flex items-center gap-3">
            {timestamp && (
              <span className="hidden text-[11px] text-muted md:block">
                Atualizado{" "}
                {new Date(timestamp).toLocaleString("pt-BR", {
                  day: "2-digit",
                  month: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            )}
            <button
              onClick={refresh}
              className="flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-gov-blue shadow-card transition hover:bg-gov-blue hover:text-white"
            >
              <IconRefresh
                width={14}
                height={14}
                className={loading ? "animate-spin" : ""}
              />
              <span className="hidden sm:inline">Atualizar</span>
            </button>
          </div>
        </header>

        <main className="px-4 py-5 sm:px-6 sm:py-6">{children}</main>
      </div>
    </div>
  );
}
