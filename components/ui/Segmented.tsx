"use client";

export interface SegOption {
  value: string;
  label: string;
}

export function Segmented({
  options,
  value,
  onChange,
  size = "md",
}: {
  options: SegOption[];
  value: string;
  onChange: (v: string) => void;
  size?: "sm" | "md";
}) {
  return (
    <div
      className={`inline-flex flex-wrap gap-1 rounded-full bg-surface p-1 ${
        size === "sm" ? "text-xs" : "text-sm"
      }`}
    >
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            onClick={() => onChange(o.value)}
            className={`rounded-full px-3 py-1.5 font-semibold transition-all ${
              active
                ? "bg-white text-gov-blue shadow-sm"
                : "text-muted hover:text-ink"
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
