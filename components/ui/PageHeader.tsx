"use client";

import { ReactNode } from "react";

export function PageHeader({
  eyebrow,
  title,
  description,
  icon,
  accent = "#1351B4",
  right,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  icon?: ReactNode;
  accent?: string;
  right?: ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3.5">
        {icon && (
          <span
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-white shadow-card"
            style={{ background: accent }}
          >
            {icon}
          </span>
        )}
        <div>
          {eyebrow && (
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted">
              {eyebrow}
            </p>
          )}
          <h1 className="text-xl font-bold tracking-tight text-ink sm:text-2xl">
            {title}
          </h1>
          {description && (
            <p className="mt-0.5 text-sm text-muted">{description}</p>
          )}
        </div>
      </div>
      {right && <div className="shrink-0">{right}</div>}
    </div>
  );
}
