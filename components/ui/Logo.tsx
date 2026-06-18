export function Logo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const cls =
    size === "lg" ? "text-3xl" : size === "sm" ? "text-lg" : "text-2xl";
  return (
    <span className={`font-extrabold tracking-tight ${cls} leading-none`}>
      <span className="text-gov-blue">ba</span>
      <span className="text-gov-red">.gov</span>
      <span className="text-gov-sky">.br</span>
    </span>
  );
}

export function SecomMark({ subtitle = true }: { subtitle?: boolean }) {
  return (
    <div className="flex flex-col">
      <Logo size="md" />
      {subtitle && (
        <span className="mt-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">
          SECOM · Comunicação Social
        </span>
      )}
    </div>
  );
}
