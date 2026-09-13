"use client";

import type { AutomationPreference } from "@/lib/automation";

export function AutomationModeControl({
  preference,
  onChange,
}: {
  preference: AutomationPreference;
  onChange: (preference: AutomationPreference) => void;
}) {
  const automatic = preference === "AUTO_APPROVE_ELIGIBLE";

  return (
    <label
      className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-[var(--mf-border)] bg-[var(--mf-surface)] px-3 py-1.5 text-[11px] text-[var(--mf-text-muted)] shadow-sm"
      title={
        automatic
          ? "Disable automatic progression and return to manual approvals"
          : "Enable automatic progression for eligible gates"
      }
    >
      <input
        type="checkbox"
        className="h-4 w-4 accent-[var(--mf-primary)]"
        checked={automatic}
        aria-label="Auto-approve eligible gates"
        onChange={(event) =>
          onChange(event.target.checked ? "AUTO_APPROVE_ELIGIBLE" : "MANUAL")
        }
      />
      <span className="font-semibold">Auto-approve eligible gates</span>
      <span className="hidden text-[var(--mf-text-soft)] sm:inline">
        {automatic ? "Automatic" : "Manual approvals"}
      </span>
    </label>
  );
}
