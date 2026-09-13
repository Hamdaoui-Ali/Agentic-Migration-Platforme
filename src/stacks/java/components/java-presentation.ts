import type { ConsoleEntry, JourneyNode, ObservatoryEntry, ShellNavItem } from "@/components/shared/presentation-types";
import type { JavaJobModel } from "../domain/run-types";

function evidenceKind(category: string): ObservatoryEntry["kind"] {
  if (category === "DECISION" || category === "REPAIR") return "review";
  if (category === "CANCELLATION") return "system";
  return "evidence";
}

function compactProfile(profile: string): string {
  const match = profile.match(/^SB_(\d+)_(\d+)_J(\d+)$/);
  return match ? `${match[1]}.${match[2]}/J${match[3]}` : profile;
}

function stageStatus(job: JavaJobModel, stage: JavaJobModel["route"][number]): JourneyNode["status"] {
  if (stage.disposition === "SKIPPED") return "SKIPPED";
  if (stage.disposition === "EXCLUDED") return "EXCLUDED";

  const result = job.stageResults.find((candidate) => candidate.stage === stage.stage);
  if (result?.status === "PASS") return "COMPLETED";
  if (result?.status === "FAILED") return "ACTION_REQUIRED";
  if (job.status === "COMPLETED" && stage.stage === job.currentStage) return "COMPLETED";
  if (job.currentStage === stage.stage) {
    return job.liveExecution ? "RUNNING" : job.currentGate || job.status === "ACTION_REQUIRED" ? "ACTION_REQUIRED" : "RUNNING";
  }
  return "PENDING";
}

export function javaJourney(job: JavaJobModel): JourneyNode[] {
  return job.route.map((stage) => ({
    id: `stage-${stage.stage}`,
    label: `${compactProfile(stage.source)} → ${compactProfile(stage.target)}`,
    status: stageStatus(job, stage),
    detail: stage.terminal ? "Terminal-special · no normal PhaseGate" : `Stage ${stage.stage}`,
  }));
}

export function javaObservatory(job: JavaJobModel): ObservatoryEntry[] {
  return job.evidence.map((item) => ({
    id: item.id,
    kind: evidenceKind(item.category),
    timestamp: item.timestamp,
    title: item.title,
    summary: item.summary,
    checksum: item.checksum,
  }));
}

export function javaConsoleEntries(job: JavaJobModel): ConsoleEntry[] {
  const liveEntries = job.liveExecution?.steps.flatMap((step) =>
    step.logs.map((message, index) => ({
      id: `${step.id}:${index}`,
      channel: step.kind,
      message,
      tone: step.kind === "COMMAND" ? "success" as const : "info" as const,
    })),
  ) ?? [];
  if (liveEntries.length) return liveEntries;

  return job.evidence
    .filter((item) => ["TRANSFORM", "BUILD", "TEST", "FAILURE"].includes(item.category))
    .map((item) => ({
      id: item.id,
      timestamp: item.timestamp,
      channel: item.category,
      message: item.summary,
      tone: item.category === "FAILURE" ? "danger" as const : "info" as const,
    }));
}

export function javaNav(activeView: string, job: JavaJobModel): ShellNavItem[] {
  return [
    { id: "workspace", label: "Workspace", active: activeView === "overview" },
    { id: "pipeline", label: "Pipeline", active: activeView === "pipeline" },
    { id: "evidence", label: "Evidence", count: job.evidence.length, active: activeView === "evidence" },
    { id: "logs", label: "Logs", active: false },
    { id: "target-versions", label: "Target versions", active: activeView === "target-versions" },
    { id: "notifications", label: "Notifications", count: 0, active: false },
    { id: "settings", label: "Settings", active: false },
  ];
}
