"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useParams } from "next/navigation";

import { AppShell } from "@/components/shared/app-shell";
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
  JavaGateAssistantPreview,
  JavaGateDecision,
  JavaJobModel,
  JavaPhaseGateType,
} from "../domain/run-types";
import type { JavaProfileId } from "../domain/types";
import {
  getJavaJob,
  putJavaJob,
  resetJavaState,
} from "../scenarios/java-store";
import { applyJavaGateDecision, getJavaGateDecisions } from "../workflow/cockpit";
import { cancelJavaMigration } from "../workflow/cancellation";
import { applyJavaRepairDecision } from "../workflow/repair";
import {
  advanceJavaLiveExecution,
  ensureJavaLiveExecution,
} from "../workflow/live";
import {
  acceptJavaStage4Output,
  analyzeJavaTargetVersions,
  applyJavaTargetVersionProposal,
  applyJavaTargetVersionRepair,
  createJavaStage4OutputRevision,
  generateJavaFinalReport,
} from "../workflow/terminal";
import { JavaCurrentAction } from "./java-current-action";
import { JavaEvidenceWorkspace } from "./java-evidence-workspace";
import { JavaGateAssistantPanel } from "./java-gate-assistant-panel";
import { JavaGateDecisionPanel } from "./java-gate-decision-panel";
import { JavaOverview } from "./java-overview";
import { JavaPipeline } from "./java-pipeline";
import { JavaRepairWorkspace } from "./java-repair-workspace";
import { JavaTargetVersionsWorkspace } from "./java-target-versions-workspace";
import { javaConsoleEntries, javaJourney, javaNav, javaObservatory } from "./java-presentation";

const tabs = [
  { id: "overview", label: "Overview" },
  { id: "pipeline", label: "Pipeline" },
  { id: "evidence", label: "Evidence" },
  { id: "target-versions", label: "Target Dependency Versions" },
];

const REPAIR_DECISIONS = [
  "CONTINUE",
  "REANALYZE",
  "REVISE",
  "REJECT",
] as const;

type RepairDecision = (typeof REPAIR_DECISIONS)[number];

const currentEpochMs = () => Date.now();

export function JavaCockpitPage() {
  const params = useParams<{ jobId: string }>();
  const jobId = Array.isArray(params.jobId) ? params.jobId[0] : params.jobId;
  const [job, setJob] = useState<JavaJobModel>(() => {
    const initialized = ensureJavaLiveExecution(getJavaJob(jobId), currentEpochMs());
    if (initialized.liveExecution) putJavaJob(initialized);
    return initialized;
  });
  const [active, setActive] = useState("overview");
  const [error, setError] = useState<string | null>(null);
  const [cancelOpen, setCancelOpen] = useState(false);
  const liveExecutionRef = useRef<HTMLDivElement>(null);
  const latestUpdateRef = useRef<HTMLDivElement>(null);
  const latestUpdateMountedRef = useRef(false);
  const autoDecisionCompletedRef = useRef<string | null>(null);
  const autoDecisionTimerRef = useRef<number | null>(null);
  const playbackSpeed = usePlaybackSpeed();

  const automationPreference = useSyncExternalStore(
    (listener) => subscribeAutomationPreference("java", listener),
    () => getAutomationPreferenceSnapshot("java"),
    getAutomationPreferenceServerSnapshot,
  );

  const liveExecution = job.liveExecution;

  useEffect(() => {
    if (!liveExecution) return;

    const timer = window.setInterval(() => {
      setJob((current) => {
        const realNowMs = currentEpochMs();
        const logicalNowMs = playbackNow(
          current.liveExecution?.startedAtMs ?? realNowMs,
          realNowMs,
          playbackSpeed,
        );
        const next = rebaseLiveExecutionStart(
          advanceJavaLiveExecution(current, logicalNowMs),
          realNowMs,
          playbackSpeed,
          current.liveExecution?.id,
        );
        if (next !== current) {
          putJavaJob(next);
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
    const currentGate = job.currentGate;
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
  }, [liveExecution, job.currentGate]);

  useEffect(() => {
    if (autoDecisionTimerRef.current !== null) {
      window.clearTimeout(autoDecisionTimerRef.current);
      autoDecisionTimerRef.current = null;
    }
    if (!isAutomationEnabled(automationPreference) || liveExecution || !job.currentGate) return;

    const gateType = job.currentGate;
    const gate = job.phaseGates.find(
      (candidate) => candidate.type === gateType && candidate.status === "PENDING",
    );
    if (!gate) return;

    const allowed =
      gateType === "repair_review"
        ? REPAIR_DECISIONS
        : getJavaGateDecisions(gateType);
    const priorities = gateType === "repair_review" ? (["CONTINUE"] as const) : (["CONTINUE", "APPROVE"] as const);
    const decision = pickEligibleDecision(allowed, priorities);
    if (!decision) return;

    const decisionKey = `${gateType}:${gate.checksum}`;
    if (autoDecisionCompletedRef.current === decisionKey) return;

    autoDecisionTimerRef.current = window.setTimeout(() => {
      autoDecisionCompletedRef.current = decisionKey;
      try {
        const next =
          gateType === "repair_review"
            ? applyJavaRepairDecision(job, decision as RepairDecision, "Automatic progression enabled.")
            : applyJavaGateDecision(job, gateType, decision as JavaGateDecision, {
                comment: "Automatic progression enabled.",
              });
        const ensured = ensureJavaLiveExecution(next, currentEpochMs());
        putJavaJob(ensured);
        setJob(ensured);
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
  }, [automationPreference, liveExecution, job]);

  function persist(next: JavaJobModel) {
    putJavaJob(next);
    setJob(next);
  }

  function decide(
    type: JavaPhaseGateType,
    decision: JavaGateDecision,
    options: { comment?: string; overrideSourceProfile?: JavaProfileId },
  ) {
    try {
      setError(null);
      let next: JavaJobModel;
      if (type === "repair_review") {
        if (!REPAIR_DECISIONS.includes(decision as RepairDecision)) {
          throw new Error(decision + " is not valid for repair_review.");
        }
        next = applyJavaRepairDecision(
          job,
          decision as RepairDecision,
          options.comment,
        );
      } else {
        next = applyJavaGateDecision(job, type, decision, options);
      }
      next = ensureJavaLiveExecution(next, currentEpochMs());
      persist(next);
      setActive("pipeline");
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Unable to apply Java PhaseGate decision.",
      );
    }
  }

  function confirmAssistant(preview: JavaGateAssistantPreview) {
    decide(preview.gateType, preview.decision, {
      comment: preview.comment,
      overrideSourceProfile: preview.overrideSourceProfile,
    });
  }

  function confirmCancellation() {
    try {
      setError(null);
      persist(cancelJavaMigration(job));
      setCancelOpen(false);
      setActive("pipeline");
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Unable to cancel Java migration.",
      );
      setCancelOpen(false);
    }
  }

  function applyTerminalAction(
    action:
      | { type: "analyze"; csv: string }
      | { type: "apply" }
      | { type: "repair" }
      | { type: "create-output" }
      | { type: "accept-output"; revision: number }
      | { type: "report" },
  ) {
    try {
      setError(null);
      const next =
        action.type === "analyze"
          ? analyzeJavaTargetVersions(job, action.csv)
          : action.type === "apply"
            ? applyJavaTargetVersionProposal(job)
            : action.type === "repair"
              ? applyJavaTargetVersionRepair(job)
              : action.type === "create-output"
                ? createJavaStage4OutputRevision(job)
                : action.type === "accept-output"
                  ? acceptJavaStage4Output(job, action.revision)
                  : generateJavaFinalReport(job);
      persist(next);
      setActive("target-versions");
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Unable to apply terminal Stage 4 action.",
      );
    }
  }

  const canCancel =
    job.status !== "CANCELLED" && job.status !== "COMPLETED";

  const shellActions: ShellAction[] = (() => {
    const gateType = job.currentGate;
    const gate = gateType
      ? job.phaseGates.find(
          (candidate) => candidate.type === gateType && candidate.status === "PENDING",
        )
      : null;
    const gateActions: ShellAction[] = gate && gateType
      ? getJavaGateDecisions(gateType).map((decision): ShellAction => ({
          id: `java-${gateType}-${decision.toLowerCase()}`,
          label:
            decision === "OVERRIDE_SOURCE_PROFILE"
              ? "Override source"
              : decision === "REANALYZE"
                ? "Reanalyze"
                : decision === "REVISE"
                  ? "Revise plan"
                  : decision === "APPROVE"
                    ? "Approve gate"
                    : decision === "REJECT"
                      ? "Reject gate"
                      : "Continue",
          variant: decision === "REJECT" ? "danger" : decision === "CONTINUE" || decision === "APPROVE" ? "primary" : "secondary",
          disabled: decision === "OVERRIDE_SOURCE_PROFILE",
          onSelect: () => decide(gateType, decision, { comment: "" }),
        }))
      : [];

    const terminalAction: ShellAction[] =
      job.currentStage === 4
        ? [{
            id: "java-open-target-versions",
            label: "Open target versions",
            variant: "secondary",
            onSelect: () => setActive("target-versions"),
          }]
        : [];
    return [...gateActions, ...terminalAction];
  })();

  const navigation = javaNav(active, job).map((item) => ({
    ...item,
    onSelect: () => {
      if (["workspace", "pipeline", "evidence", "target-versions"].includes(item.id)) {
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
        stack="java"
        breadcrumb="Spring Boot / Migration Workspace"
        status={<StatusBadge label={job.status} />}
        nav={navigation}
        journey={javaJourney(job)}
        observatoryEntries={javaObservatory(job)}
        consoleEntries={javaConsoleEntries(job)}
        actions={shellActions}
      >
      <div className="space-y-6">
        <div className="mb-6 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.13em] text-[var(--mf-primary)]">
              Spring Boot Migration
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em]">
              {job.name}
            </h1>
            <p className="mt-1.5 text-sm text-[var(--mf-text-muted)]">
              Java route stages and execution phases are governed independently.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <AutomationModeControl
              preference={automationPreference}
              onChange={(next) => writeAutomationPreference("java", next)}
            />
            {canCancel ? (
              <Button variant="danger" size="sm" onClick={() => setCancelOpen(true)}>
                Cancel migration
              </Button>
            ) : null}
            <StatusBadge label={isAutomationEnabled(automationPreference) ? "AUTO MODE" : "MANUAL MODE"} />
            <span className="hidden font-mono text-[11px] text-[var(--mf-text-soft)] md:inline">
              {job.id}
            </span>
            <WorkspaceResetButton onReset={resetJavaState} />
          </div>
        </div>

        <div ref={latestUpdateRef} className="scroll-mt-4">
          <JavaCurrentAction job={job} />
        </div>

        {job.liveExecution ? (
          <div ref={liveExecutionRef} className="mt-6 scroll-mt-4">
            <LiveExecutionPanel
              execution={job.liveExecution}
              title={job.currentAction}
              description="The Java orchestrator is advancing through the active execution phase. Reviewed PhaseGates appear only after the phase evidence is complete."
            />
          </div>
        ) : null}

        {error ? (
          <div role="alert" className="mt-5 rounded-lg border border-[var(--mf-danger)]/35 bg-[var(--mf-danger-soft)] p-3 text-sm text-[var(--mf-danger)]">
            {error}
          </div>
        ) : null}

        {!job.liveExecution ? (
          <div className="mt-6 space-y-6">
            <JavaGateDecisionPanel job={job} onDecision={decide} />
            <JavaGateAssistantPanel job={job} onConfirm={confirmAssistant} />
          </div>
        ) : null}

        <div className="mt-7">
          <Tabs
            items={tabs}
            active={active}
            onChange={setActive}
            ariaLabel="Spring Boot Migration Workspace tabs"
          />
        </div>

        <div className="mt-6">
          {active === "overview" ? <JavaOverview job={job} /> : null}
          {active === "pipeline" ? (
            <div className="space-y-6">
              <JavaPipeline job={job} />
              <JavaRepairWorkspace
                job={job}
                onAcceptApply={() => decide("repair_review", "CONTINUE", { comment: "Accepted reviewed diff and apply it." })}
                onRequestModification={(correction) =>
                  decide("repair_review", "REVISE", { comment: correction || "Request modification from reviewed diff." })
                }
                onSubmitCorrection={(correction) =>
                  decide("repair_review", "REVISE", { comment: `Typed correction: ${correction}` })
                }
              />
            </div>
          ) : null}
          {active === "evidence" ? (
            <JavaEvidenceWorkspace job={job} />
          ) : null}
          {active === "target-versions" ? (
            <JavaTargetVersionsWorkspace
              job={job}
              onAnalyze={(csv) => applyTerminalAction({ type: "analyze", csv })}
              onApply={() => applyTerminalAction({ type: "apply" })}
              onRepair={() => applyTerminalAction({ type: "repair" })}
              onCreateOutput={() => applyTerminalAction({ type: "create-output" })}
              onAcceptOutput={(revision) =>
                applyTerminalAction({ type: "accept-output", revision })
              }
              onGenerateReport={() => applyTerminalAction({ type: "report" })}
            />
          ) : null}
        </div>

      </div>
      </AppShell>

      <Dialog
        open={cancelOpen}
        title="Cancel migration?"
        description="Cancellation stops the active Java workflow and clears the current PhaseGate action. Recorded evidence remains available."
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
          Job {job.id} is currently in {job.currentPhase.replaceAll("_", " ")}.
          Cancellation is recorded in the execution evidence.
        </p>
      </Dialog>
    </>
  );
}
