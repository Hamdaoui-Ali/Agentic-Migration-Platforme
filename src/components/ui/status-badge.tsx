import { toneForStatus, type StatusTone } from "@/lib/display";

const toneClasses: Record<StatusTone, string> = {
  neutral: "bg-[var(--mf-surface-muted)] text-[var(--mf-text-muted)] border-[var(--mf-border)]",
  info: "bg-[var(--mf-info-soft)] text-[var(--mf-info)] border-[var(--mf-info)]/30",
  success: "bg-[var(--mf-success-soft)] text-[var(--mf-success)] border-[var(--mf-success)]/30",
  warning: "bg-[var(--mf-warning-soft)] text-[var(--mf-warning)] border-[var(--mf-warning)]/30",
  danger: "bg-[var(--mf-danger-soft)] text-[var(--mf-danger)] border-[var(--mf-danger)]/30",
};

export function StatusBadge({
  label,
  tone = toneForStatus(label),
}: {
  label: string;
  tone?: StatusTone;
}) {
  return (
    <span
      className={`inline-flex min-h-6 items-center rounded-md border px-2 py-0.5 text-[11px] font-bold uppercase tracking-[0.06em] ${toneClasses[tone]}`}
    >
      {label.replaceAll("_", " ")}
    </span>
  );
}
