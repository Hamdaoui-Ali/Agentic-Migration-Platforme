"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { useParams } from "next/navigation";

import { AppShell } from "@/components/shared/app-shell";
import { useRegisterAssistantSnapshot } from "@/components/shared/assistant-context";
import { LiveExecutionPanel } from "@/components/shared/live-execution-panel";
import type { ShellAction } from "@/components/shared/presentation-types";
import { WorkspaceResetButton } from "@/components/shared/workspace-reset-button";
import {
  getAutomationPreferenceServerSnapshot,
  getAutomationPreferenceSnapshot,
  isAutomationEnabled,
  pickEligibleDecision,
  subscribeAutomationPreference,
  writeAutomationPreference,
} from "@/lib/automation";
import { AutomationModeControl } from "@/components/shared/automation-mode-control";
import {
  playbackNow,
  rebaseLiveExecutionStart,
  usePlaybackSpeed,
} from "@/lib/presenter-mode";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { StatusBadge } from "@/components/ui/status-badge";
import { Tabs } from "@/components/ui/tabs";
import type {
  AngularGovernanceDecision,
  AngularPreTransformGateId,
  AngularRunModel,
} from "../domain/run-types";
import {
  getAngularRun,
  putAngularRun,
  resetAngularState,
} from "../scenarios/angular-store";
import { seedAngularRun } from "../scenarios/seeds";
import { getAllowedPreTransformDecisions, applyAngularGateDecision } from "../workflow/run";
import { advanceAngularLiveExecution } from "../workflow/live";
import { applyAngularStageGateDecision, getAllowedStageDecisions } from "../workflow/proven";
import { cancelAngularMigration } from "../workflow/cancellation";
import {
  createAngularPartialDelivery,
  restartAngularActiveStage,
  resumeAngularFromSealed,
  rollbackAngularToFurthestSealed,
} from "../workflow/recovery";
import { AngularCurrentAction } from "./angular-current-action";
import { AngularDiagnosticsWorkspace } from "./angular-diagnostics-workspace";
import { AngularEvidenceWorkspace } from "./angular-evidence-workspace";
import { AngularGateDecisionPanel } from "./angular-gate-decision-panel";
import { AngularOverview } from "./angular-overview";
import { AngularPipeline } from "./angular-pipeline";
import { AngularProvenExecution } from "./angular-proven-execution";
import { AngularRepairWorkspace } from "./angular-repair-workspace";
import { AngularStageDecisionPanel } from "./angular-stage-decision-panel";
import { createAngularAssistantSnapshot } from "../workflow/assistant";
import type {
  AngularRepairReviewInput,
  AngularStageGateDecision,
  AngularStageGateId,
} from "../domain/run-types";
import { angularConsoleEntries, angularJourney, angularNav, angularObservatory } from "./angular-presentation";

const tabs = [
  { id: "overview", label: "Overview" },
  { id: "pipeline", label: "Pipeline" },
  { id: "evidence", label: "Evidence" },
  { id: "diagnostics", label: "Diagnostics" },
];

const currentEpochMs = () => Date.now();

export function AngularControlTowerPage() {
  const params = useParams<{ runId: string }>();
  const runId = Array.isArray(params.runId) ? params.runId[0] : params.runId;
  const [run, setRun] = useState<AngularRunModel>(() => seedAngularRun(runId));
  const [active, setActive] = useState("overview");
  const [error, setError] = useState<string | null>(null);
  const [cancelOpen, setCancelOpen] = useState(false);
  const liveExecutionRef = useRef<HTMLDivElement>(null);
  const latestUpdateRef = useRef<HTMLDivElement>(null);
  const latestUpdateMountedRef = useRef(false);
  const autoDecisionCompletedRef = useRef<string | null>(null);
  const autoDecisionTimerRef = useRef<number | null>(null);
  const playbackSpeed = usePlaybackSpeed();
  const assistantSnapshot = useMemo(
    () => createAngularAssistantSnapshot(run),
    [run],
  );

  useRegisterAssistantSnapshot(assistantSnapshot);

  const automationPreference = useSyncExternalStore(
    (listener) => subscribeAutomationPreference("angular", listener),
    () => getAutomationPreferenceSnapshot("angular"),
    getAutomationPreferenceServerSnapshot,
  );

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setRun(getAngularRun(runId));
    });
    return () => window.cancelAnimationFrame(frame);
  }, [runId]);

  const liveExecution = run.liveExecution;

  useEffect(() => {
    if (!liveExecution) return;

    const timer = window.setInterval(() => {
      setRun((current) => {
        const realNowMs = Date.now();
        const logicalNowMs = playbackNow(
          current.liveExecution?.startedAtMs ?? realNowMs,
          realNowMs,
          playbackSpeed,
        );
        const next = rebaseLiveExecutionStart(
          advanceAngularLiveExecution(current, logicalNowMs),
          realNowMs,
          playbackSpeed,
          current.liveExecution?.id,
        );
        if (next !== current) {
          putAngularRun(next);
        }
        return next;
      });
    }, 250);

    return () => window.clearInterval(timer);
  }, [liveExecution, playbackSpeed]);

  useEffect(() => {
    if (!liveExecution?.id) return;

    const frame = window.requestAnimationFrame(() => {
      liveExecutionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [liveExecution?.id]);

  useEffect(() => {
    const currentGate = run.currentGate;
    if (liveExecution) {
      latestUpdateMountedRef.current = true;
      return;
    }
    if (!currentGate) return;
    if (!latestUpdateMountedRef.current) {
      latestUpdateMountedRef.current = true;
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      latestUpdateRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [liveExecution, run.currentGate]);

  useEffect(() => {
    if (autoDecisionTimerRef.current !== null) {
      window.clearTimeout(autoDecisionTimerRef.current);
      autoDecisionTimerRef.current = null;
    }
    if (!isAutomationEnabled(automationPreference) || liveExecution || !run.currentGate) return;

    const currentGate = run.currentGate;
    const stageGate = ["G07", "G09", "G10", "G11", "G12"].includes(currentGate);
    const preTransformGate = ["G02", "G03", "G04", "G05", "G06"].includes(currentGate);
    if (!stageGate && !preTransformGate) return;

    const gate = stageGate
      ? run.stageExecution?.gates[currentGate as AngularStageGateId]
      : run.gates[currentGate as AngularPreTransformGateId];
    if (!gate || gate.status !== "PENDING") return;

    const allowed = stageGate
      ? getAllowedStageDecisions(currentGate as AngularStageGateId)
      : getAllowedPreTransformDecisions(currentGate as AngularPreTransformGateId);
    const decision = pickEligibleDecision(allowed, ["APPROVE"] as const);
    if (!decision) return;

    const decisionKey = `${currentGate}:${gate.checksum}`;
    if (autoDecisionCompletedRef.current === decisionKey) return;

    autoDecisionTimerRef.current = window.setTimeout(() => {
      autoDecisionCompletedRef.current = decisionKey;
      try {
        const nowMs = currentEpochMs();
        const next = stageGate
          ? applyAngularStageGateDecision(
              run,
              currentGate as AngularStageGateId,
              decision as AngularStageGateDecision,
              "",
              new Date(nowMs).toISOString(),
              nowMs,
            )
          : applyAngularGateDecision(
              run,
              currentGate as AngularPreTransformGateId,
              decision as AngularGovernanceDecision,
              "",
              new Date(nowMs).toISOString(),
              nowMs,
            );
        putAngularRun(next);
        setRun(next);
        setActive("pipeline");
        setError(null);
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : "Unable to progress the eligible gate automatically.");
      }
    }, 700);

    return () => {
      if (autoDecisionTimerRef.current !== null) {
        window.clearTimeout(autoDecisionTimerRef.current);
        autoDecisionTimerRef.current = null;
      }
    };
  }, [automationPreference, liveExecution, run]);

  function handleDecision(
    gate: AngularPreTransformGateId,
    decision: AngularGovernanceDecision,
    comment: string,
  ) {
    try {
      setError(null);
      const nowMs = currentEpochMs();
      const next = applyAngularGateDecision(
        run,
        gate,
        decision,
        comment,
        new Date(nowMs).toISOString(),
        nowMs,
      );
      putAngularRun(next);
      setRun(next);
      if (decision === "REQUEST_MODIFICATION" || next.liveExecution) {
        setActive("pipeline");
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to apply governance decision.");
    }
  }

  function handleStageDecision(
    gate: AngularStageGateId,
    decision: AngularStageGateDecision,
    comment: string,
    reviewInput?: AngularRepairReviewInput,
  ) {
    try {
      setError(null);
      const nowMs = currentEpochMs();
      const next = applyAngularStageGateDecision(
        run,
        gate,
        decision,
        comment,
        new Date(nowMs).toISOString(),
        nowMs,
        reviewInput,
      );
      putAngularRun(next);
      setRun(next);
      setActive("pipeline");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to apply stage governance decision.");
    }
  }

  function confirmCancellation() {
    try {
      setError(null);
      const next = cancelAngularMigration(run);
      putAngularRun(next);
      setRun(next);
      setCancelOpen(false);
      setActive("pipeline");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to cancel Angular migration.");
      setCancelOpen(false);
    }
  }

  function applyRecovery(action: "delivery" | "rollback" | "resume" | "restart") {
    try {
      setError(null);
      const next =
        action === "delivery"
          ? createAngularPartialDelivery(run)
          : action === "rollback"
            ? rollbackAngularToFurthestSealed(run)
            : action === "resume"
              ? resumeAngularFromSealed(run)
              : restartAngularActiveStage(run);
      putAngularRun(next);
      setRun(next);
      setActive("diagnostics");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to apply recovery action.");
    }
  }

  const canCancel = run.state !== "CANCELLED" && run.state !== "COMPLETED";

  const shellActions: ShellAction[] = (() => {
    if (run.liveExecution || !run.currentGate) return [];

    if (["G07", "G09", "G10", "G11", "G12"].includes(run.currentGate)) {
      const gateId = run.currentGate as AngularStageGateId;
      const gate = run.stageExecution?.gates[gateId];
      if (!gate || gate.status !== "PENDING") return [];
      return [
        ...getAllowedStageDecisions(gateId).map((decision): ShellAction => ({
          id: `stage-${gateId}-${decision.toLowerCase()}`,
          label:
            decision === "REQUEST_MODIFICATION"
              ? "Request modification"
              : decision === "APPROVE"
                ? "Approve gate"
                : "Reject gate",
          variant: decision === "REJECT" ? "danger" : decision === "APPROVE" ? "primary" : "secondary",
          onSelect: () => handleStageDecision(gateId, decision, ""),
        })),
      ];
    }

    if (["G02", "G03", "G04", "G05", "G06"].includes(run.currentGate)) {
      const gateId = run.currentGate as AngularPreTransformGateId;
      const gate = run.gates[gateId];
      if (!gate || gate.status !== "PENDING") return [];
      return [
        ...getAllowedPreTransformDecisions(gateId).map((decision): ShellAction => ({
          id: `pre-${gateId}-${decision.toLowerCase()}`,
          label:
            decision === "REQUEST_MODIFICATION"
              ? "Request modification"
              : decision === "APPROVE_WITH_COMMENT"
                ? "Approve with comment"
                : decision === "APPROVE"
                  ? "Approve gate"
                  : "Reject gate",
          variant: decision === "REJECT" ? "danger" : decision === "APPROVE" ? "primary" : "secondary",
          disabled: decision === "APPROVE_WITH_COMMENT",
          onSelect: () => handleDecision(gateId, decision, ""),
        })),
      ];
    }

    return [];
  })();

  const navigation = angularNav(active, run).map((item) => ({
    ...item,
    onSelect: () => {
      if (["workspace", "pipeline", "evidence", "diagnostics"].includes(item.id)) {
        setActive(item.id === "workspace" ? "overview" : item.id);
      }
      if (item.id === "logs") {
        document.querySelector('[aria-label="Live console"]')?.scrollIntoView({ behavior: "smooth", block: "end" });
      }
    },
  }));

  return (
    <>
      <AppShell
      stack="angular"
      breadcrumb="Angular / Migration Workspace"
      status={<StatusBadge label={run.state} />}
      nav={navigation}
      journey={angularJourney(run)}
      observatoryEntries={angularObservatory(run)}
      consoleEntries={angularConsoleEntries(run)}
      actions={shellActions}
    >
      <div className="space-y-6">
        <div className="mb-6 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.13em] text-[var(--mf-primary)]">Angular Migration</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em]">{run.name}</h1>
            <p className="mt-1.5 text-sm text-[var(--mf-text-muted)]">
              Angular {run.sourceMajor} → Angular {run.targetMajor} · governed adjacent-major execution
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <AutomationModeControl
              preference={automationPreference}
              onChange={(next) => writeAutomationPreference("angular", next)}
            />
            {canCancel ? (
              <Button variant="danger" size="sm" onClick={() => setCancelOpen(true)}>
                Cancel migration
              </Button>
            ) : null}
            <StatusBadge label={isAutomationEnabled(automationPreference) ? "AUTO MODE" : "MANUAL MODE"} />
            {run.liveExecution
              ? "Execution active · live events synchronized"
              : run.currentGate
                ? "Awaiting governed decision · evidence synchronized"
                : "Evidence synchronized"}
            <WorkspaceResetButton onReset={resetAngularState} />
          </div>
        </div>

        <div ref={latestUpdateRef} className="scroll-mt-4">
          <AngularCurrentAction run={run} />
        </div>

        {run.liveExecution ? (
          <div ref={liveExecutionRef} className="mt-6 scroll-mt-4">
            <LiveExecutionPanel
              execution={run.liveExecution}
              title={run.currentAction}
              description="The workflow is progressing through persisted execution nodes. The next human gate opens only after the active execution finishes."
            />
          </div>
        ) : null}

        {error ? (
          <div role="alert" className="mt-5 rounded-lg border border-[var(--mf-danger)]/35 bg-[var(--mf-danger-soft)] p-3 text-sm text-[var(--mf-danger)]">
            {error}
          </div>
        ) : null}

        {!run.liveExecution ? (
          <div className="mt-6 space-y-6">
            <AngularGateDecisionPanel run={run} onDecision={handleDecision} />
            <AngularStageDecisionPanel run={run} onDecision={handleStageDecision} />
          </div>
        ) : null}

        <div className="mt-7">
          <Tabs items={tabs} active={active} onChange={setActive} ariaLabel="Angular Migration Workspace tabs" />
        </div>

        <div className="mt-6">
          {active === "overview" ? <AngularOverview run={run} /> : null}
          {active === "pipeline" ? (
            <div className="space-y-6">
              <AngularPipeline run={run} />
              <AngularProvenExecution run={run} />
              <AngularRepairWorkspace
                run={run}
                onAcceptApply={() => handleStageDecision("G10", "APPROVE", "Accepted reviewed diff and apply it.")}
                onRequestModification={(correction) =>
                  handleStageDecision(
                    "G10",
                    "REQUEST_MODIFICATION",
                    correction || "Request modification from reviewed diff.",
                    { mode: "AI_HINT", text: correction },
                  )
                }
                onSubmitCorrection={(correction) =>
                  handleStageDecision(
                    "G10",
                    "REQUEST_MODIFICATION",
                    correction,
                    { mode: "MANUAL_OVERRIDE", text: correction },
                  )
                }
              />
            </div>
          ) : null}
          {active === "evidence" ? <AngularEvidenceWorkspace run={run} /> : null}
          {active === "diagnostics" ? (
            <AngularDiagnosticsWorkspace
              run={run}
              onPartialDelivery={() => applyRecovery("delivery")}
              onRollback={() => applyRecovery("rollback")}
              onResume={() => applyRecovery("resume")}
              onRestart={() => applyRecovery("restart")}
            />
          ) : null}
        </div>

      </div>
      </AppShell>

      <Dialog
        open={cancelOpen}
        title="Cancel migration?"
        description="Cancellation stops the active Angular workflow and clears the current governed action. Recorded evidence remains available."
        onClose={() => setCancelOpen(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setCancelOpen(false)}>
              Keep running
            </Button>
            <Button variant="danger" onClick={confirmCancellation}>
              Confirm cancellation
            </Button>
          </>
        }
      >
        <p className="text-sm leading-6 text-[var(--mf-text-muted)]">
          Run {run.id} is currently in {run.phase.replaceAll("_", " ")}.
          Cancellation is recorded in the execution evidence.
        </p>
      </Dialog>
    </>
  );
}
