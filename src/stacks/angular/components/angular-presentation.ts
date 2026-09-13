import type {
  AngularRunEvidence,
  AngularRunModel,
} from "../domain/run-types";
import type {
  ConsoleEntry,
  JourneyNode,
  ObservatoryEntry,
  ShellNavItem,
} from "@/components/shared/presentation-types";

function evidenceKind(item: AngularRunEvidence): ObservatoryEntry["kind"] {
  if (item.category === "COMMAND") return "command";
  if (item.category === "DECISION" || item.category === "REPAIR") return "review";
  if (item.category === "SEAL" || item.category === "CANCELLATION") return "system";
  return "evidence";
}

export function angularJourney(run: AngularRunModel): JourneyNode[] {
  return run.route.map((stage) => ({
    id: stage.id,
    label: `${stage.source} → ${stage.target}`,
    status: stage.status,
    detail: stage.status === "SEALED" ? "Stage sealed" : stage.status.replaceAll("_", " "),
  }));
}

export function angularObservatory(run: AngularRunModel): ObservatoryEntry[] {
  return run.evidence.map((item) => ({
    id: item.id,
    kind: evidenceKind(item),
    timestamp: item.timestamp,
    title: item.title,
    summary: item.summary,
    checksum: item.checksum,
  }));
}

export function angularConsoleEntries(run: AngularRunModel): ConsoleEntry[] {
  const commandEntries = run.operations.commands.flatMap((command) =>
    command.logs.map((message, index) => ({
      id: `${command.id}:${index}`,
      timestamp: command.timestamp,
      channel: command.action.replaceAll("_", " "),
      message,
      tone: command.status === "FAILED" ? "danger" as const : "success" as const,
    })),
  );
  if (commandEntries.length) return commandEntries;

  return run.evidence
    .filter((item) => item.category === "COMMAND" || item.category === "FAILURE")
    .map((item) => ({
      id: item.id,
      timestamp: item.timestamp,
      channel: item.category,
      message: item.summary,
      tone: item.category === "FAILURE" ? "danger" as const : "info" as const,
    }));
}

export function angularNav(activeView: string, run: AngularRunModel): ShellNavItem[] {
  return [
    { id: "workspace", label: "Workspace", active: activeView === "overview" },
    { id: "pipeline", label: "Pipeline", active: activeView === "pipeline" },
    { id: "evidence", label: "Evidence", count: run.evidence.length, active: activeView === "evidence" },
    { id: "logs", label: "Logs", active: false },
    { id: "diagnostics", label: "Diagnostics", active: activeView === "diagnostics" },
    { id: "notifications", label: "Notifications", count: 0, active: false },
    { id: "settings", label: "Settings", active: false },
  ];
}

