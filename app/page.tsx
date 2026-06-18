import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { NAV } from "@/components/nav";
import { IconArrow } from "@/components/ui/icons";
import { CAMPAIGN_PERIOD } from "@/lib/metas";

export default function Home() {
  const platforms = NAV.find((g) => g.title === "Plataformas")!.items;

  return (
    <main className="relative min-h-screen overflow-hidden bg-surface">
      {/* Decorative gradient blobs */}
      <div className="pointer-events-none absolute -left-40 -top-40 h-96 w-96 rounded-full bg-gov-blue/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-40 top-20 h-96 w-96 rounded-full bg-gov-red/10 blur-3xl" />
      <div className="grid-bg absolute inset-0 opacity-60" />

      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-8">
        {/* Top bar */}
        <header className="flex items-center justify-between">
          <Logo />
          <span className="hidden text-xs font-semibold uppercase tracking-[0.15em] text-muted sm:block">
            Governo do Estado da Bahia
          </span>
        </header>

        {/* Hero */}
        <section className="flex flex-1 flex-col justify-center py-12">
          <div className="max-w-3xl">
            <span className="chip bg-white text-gov-blue shadow-card">
              <span className="h-2 w-2 rounded-full bg-gov-green" />
              Campanha ativa · {CAMPAIGN_PERIOD.inicio} a {CAMPAIGN_PERIOD.fim}
            </span>
            <h1 className="mt-5 text-4xl font-extrabold leading-[1.05] tracking-tight text-ink sm:text-6xl">
              Painel de Mídia
              <br />
              <span className="bg-gradient-to-r from-gov-blue via-gov-sky to-gov-red bg-clip-text text-transparent">
                Regional
              </span>
            </h1>
            <p className="mt-5 max-w-xl text-base text-muted sm:text-lg">
              Acompanhe em tempo real a performance da campanha da{" "}
              <strong className="text-ink">
                Secretaria de Comunicação Social
              </strong>{" "}
              nas Regiões 8, 12 e 14 — em cinco plataformas de mídia.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/dashboard"
                className="group inline-flex items-center gap-2 rounded-full bg-gov-blue px-6 py-3.5 text-sm font-bold text-white shadow-float transition hover:bg-gov-navy"
              >
                Acessar o dashboard
                <IconArrow className="transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/dashboard/metas"
                className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-bold text-ink shadow-card transition hover:bg-slate-50"
              >
                Ver progresso de metas
              </Link>
            </div>
          </div>

          {/* Platform quick cards */}
          <div className="mt-14 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {platforms.map((p) => {
              const Icon = p.icon;
              return (
                <Link
                  key={p.href}
                  href={p.href}
                  className="card card-pad group transition hover:-translate-y-1 hover:shadow-float"
                >
                  <span
                    className="flex h-10 w-10 items-center justify-center rounded-xl"
                    style={{ background: `${p.color}14`, color: p.color }}
                  >
                    <Icon />
                  </span>
                  <p className="mt-3 text-sm font-semibold text-ink">
                    {p.label}
                  </p>
                  <span className="mt-1 inline-flex items-center gap-1 text-xs text-muted transition group-hover:text-gov-blue">
                    Abrir <IconArrow width={13} height={13} />
                  </span>
                </Link>
              );
            })}
          </div>
        </section>

        <footer className="border-t border-slate-200 pt-5 text-xs text-muted">
          SECOM — Secretaria de Comunicação Social · Governo do Estado da Bahia ·
          Período {CAMPAIGN_PERIOD.inicio}–{CAMPAIGN_PERIOD.fim}
        </footer>
      </div>
    </main>
  );
}
