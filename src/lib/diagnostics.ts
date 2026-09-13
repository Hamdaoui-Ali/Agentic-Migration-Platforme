export const DIAGNOSTIC_DURATION_MS = 5_000;

export type DiagnosticRunStatus = "IDLE" | "RUNNING" | "COMPLETE";

export interface DiagnosticRunState {
  status: DiagnosticRunStatus;
  revealed: number;
}

export function createDiagnosticState(): DiagnosticRunState {
  return { status: "IDLE", revealed: 0 };
}

export function advanceDiagnosticState(
  state: DiagnosticRunState,
  checkCount: number,
): DiagnosticRunState {
  const total = Math.max(0, Math.floor(checkCount));
  if (total === 0) return { status: "COMPLETE", revealed: 0 };
  if (state.status === "COMPLETE") {
    return { status: "COMPLETE", revealed: Math.min(total, state.revealed) };
  }

  const revealed = Math.min(total, Math.max(0, state.revealed) + 1);
  return {
    status: revealed >= total ? "COMPLETE" : "RUNNING",
    revealed,
  };
}
