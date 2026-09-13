"use client";

import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import type { DiagnosticRunState } from "@/lib/diagnostics";

export interface EnvironmentDiagnosticCheck {
  id: string;
  label: string;
  value: string;
  status: "READY" | "WARNING" | "BLOCKED";
}

export function EnvironmentDiagnostics({
  checks,
  state,
  onRun,
}: {
  checks: EnvironmentDiagnosticCheck[];
  state: DiagnosticRunState;
  onRun: () => void;
}) {
  const revealedChecks = checks.slice(0, state.revealed);
  const isRunning = state.status === "RUNNING";
  const isComplete = state.status === "COMPLETE";

  return (
    <div className="mt-5">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[var(--mf-border)] bg-[var(--mf-surface-subtle)] p-3">
        <div>
          <p className="text-xs font-semibold">
            {isComplete
              ? "Environment diagnosis complete"
              : isRunning
                ? "Checking environment prerequisites"
                : "Ready to check environment prerequisites"}
          </p>
          <p className="mt-1 text-[11px] leading-4 text-[var(--mf-text-muted)]">
            {isComplete
              ? `${checks.length} checks recorded for this configuration.`
              : isRunning
                ? "Each signal is revealed as its check completes."
                : "The route stays visible while the prerequisite check is prepared."}
          </p>
        </div>
        <Button
          type="button"
          size="sm"
          variant={isComplete ? "secondary" : "primary"}
          busy={isRunning}
          disabled={isRunning}
          onClick={onRun}
        >
          {isRunning
            ? "Checking…"
            : isComplete
              ? "Run diagnosis again"
              : "Run environment diagnosis"}
        </Button>
      </div>

      <div className="mt-4" role="list" aria-live="polite" aria-label="Environment diagnosis checks">
        {state.status === "IDLE" ? (
          <div className="rounded-lg border border-dashed border-[var(--mf-border-strong)] p-4 text-sm text-[var(--mf-text-muted)]">
            No checks have run yet. Start the diagnosis to verify this route.
          </div>
        ) : null}

        {revealedChecks.map((check) => (
          <div
            key={check.id}
            role="listitem"
            data-diagnostic-status={check.status}
            className="flex items-center justify-between gap-5 border-b border-[var(--mf-border)] py-3 first:pt-0 last:border-b-0 last:pb-0"
          >
            <div className="min-w-0">
              <p className="text-sm font-semibold">{check.label}</p>
              <p className="mt-0.5 truncate text-xs text-[var(--mf-text-muted)]">{check.value}</p>
            </div>
            <StatusBadge label={check.status} />
          </div>
        ))}
      </div>

      <p className="mt-3 text-[11px] text-[var(--mf-text-soft)]" role="status">
        {isComplete
          ? "All available signals are visible above."
          : isRunning
            ? `Completed ${revealedChecks.length} of ${checks.length} checks.`
            : "Diagnosis is waiting to start."}
      </p>
    </div>
  );
}
