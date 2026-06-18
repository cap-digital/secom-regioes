"use client";

import { ReactNode } from "react";
import { Inbox } from "lucide-react";

export function LoadingState({ label = "Carregando dados…" }: { label?: string }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="card h-28 animate-pulse bg-gradient-to-br from-white to-slate-50"
          />
        ))}
      </div>
      <div className="grid gap-3 lg:grid-cols-2">
        <div className="card h-72 animate-pulse" />
        <div className="card h-72 animate-pulse" />
      </div>
      <p className="text-center text-sm text-muted">{label}</p>
    </div>
  );
}

export function ErrorState({ message }: { message: string }) {
  return (
    <div className="card card-pad border-gov-red/20 bg-gov-red/5">
      <p className="font-semibold text-gov-red">Não foi possível carregar os dados</p>
      <p className="mt-1 text-sm text-muted">{message}</p>
    </div>
  );
}

export function EmptyState({
  title,
  description,
  icon,
}: {
  title: string;
  description?: string;
  icon?: ReactNode;
}) {
  return (
    <div className="card card-pad flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-surface text-gov-blue">
        {icon ?? <Inbox className="h-8 w-8" strokeWidth={1.6} />}
      </div>
      <h3 className="text-lg font-semibold text-ink">{title}</h3>
      {description && (
        <p className="mt-1 max-w-md text-sm text-muted">{description}</p>
      )}
    </div>
  );
}
