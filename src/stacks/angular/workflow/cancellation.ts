import { stableDisplayChecksum } from "../../../scenarios/runtime/checksum.ts";
import type { AngularRunModel } from "../domain/run-types.ts";

export function cancelAngularMigration(
  run: AngularRunModel,
  now = new Date().toISOString(),
): AngularRunModel {
  if (run.state === "COMPLETED" || run.state === "CANCELLED") {
    throw new Error("This Angular migration cannot be cancelled from its current terminal state.");
  }

  const evidenceId = `${run.id}-cancellation-${run.evidence.length + 1}`;

  return {
    ...run,
    state: "CANCELLED",
    phase: "CANCELLED",
    currentGate: null,
    currentAction: "Migration cancelled by operator request",
    route: run.route.map((stage) =>
      stage.status === "SEALED" ? stage : { ...stage, status: "CANCELLED" },
    ),
    stageExecution:
      run.stageExecution && run.stageExecution.status !== "SEALED"
        ? { ...run.stageExecution, status: "CANCELLED" }
        : run.stageExecution,
    liveExecution: undefined,
    evidence: [
      ...run.evidence,
      {
        id: evidenceId,
        category: "CANCELLATION",
        title: "Migration cancellation accepted",
        summary:
          "Cancellation stopped the active Angular workflow and cleared any pending gate action. Recorded evidence remains available.",
        timestamp: now,
        checksum: stableDisplayChecksum(
          `${run.id}:cancellation:${now}:${evidenceId}`,
        ),
      },
    ],
  };
}
