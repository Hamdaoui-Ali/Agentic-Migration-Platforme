import type {
  AngularRunModel,
  AngularStageGateId,
} from "../domain/run-types.ts";
import {
  ASSISTANT_SUGGESTIONS,
  assistantIntentForQuestion,
  type AssistantSnapshot,
} from "../../../components/shared/assistant-content.ts";
import { getAllowedPreTransformDecisions } from "./run.ts";
import { getAllowedStageDecisions } from "./proven.ts";

function currentStageLabel(run: AngularRunModel): string {
  const stage = run.stageExecution;
  return stage
    ? `Angular ${stage.source} → ${stage.target}`
    : `Angular ${run.sourceMajor} → ${run.targetMajor}`;
}

function readable(value: string): string {
  return value.replaceAll("_", " ");
}

function isStageGateId(
  gate: AngularRunModel["currentGate"],
): gate is AngularStageGateId {
  return gate !== null && ["G07", "G09", "G10", "G11", "G12"].includes(gate);
}

function activeRepair(run: AngularRunModel) {
  const attempts = run.stageExecution?.repairAttempts ?? [];
  return [...attempts]
    .reverse()
    .find((attempt) => !["SUPERSEDED", "REJECTED_BY_CAUSAL_POLICY"].includes(attempt.status));
}

function repairDetails(run: AngularRunModel): string[] {
  const repair = activeRepair(run);
  if (!repair) return [];

  const details = [
    `Repair: attempt ${repair.attempt} is ${readable(repair.status).toLowerCase()} and is owned by ${readable(repair.failureOwner ?? "the governed repair owner").toLowerCase()}.`,
    `Failure evidence: ${readable(repair.failureCategory).toLowerCase()}.`,
    `Review: Repair Proposer prepared the candidate; Independent Reviewer returned ${repair.reviewerVerdict.toLowerCase()}.`,
    `Files in scope: ${repair.changedFiles.join(", ") || "the bound source target"}.`,
  ];

  if (repair.sourceReference) {
    details.push(
      `Source proof: ${repair.sourceReference.repository}, ${repair.sourceReference.path}, ${repair.sourceReference.sourceCommit} → ${repair.sourceReference.targetCommit}.`,
    );
  }

  if (repair.failureCategory === "SSR_COMMON_ENGINE_IMPORT") {
    details.push(
      "Correction: move the CommonEngine import in projects/movies/server.ts from @angular/ssr to @angular/ssr/node.",
    );
  } else if (repair.rationale) {
    details.push(`Repair rationale: ${repair.rationale}`);
  }

  return details;
}

function answerAngularCurrentState(run: AngularRunModel): string {
  const stage = run.stageExecution;
  const latest = run.evidence.at(-1);
  const lines = [
    `Status: ${run.name} is ${readable(run.state).toLowerCase()}.`,
    `Current stage: ${currentStageLabel(run)}.`,
    `Phase: ${readable(run.phase).toLowerCase()}.`,
    `Current action: ${run.currentAction}.`,
    run.currentGate
      ? `Active gate: ${run.currentGate}${stage && isStageGateId(run.currentGate) && stage.gates[run.currentGate]?.label ? ` · ${stage.gates[run.currentGate].label}` : ""}.`
      : "Active gate: none.",
    `Evidence: ${run.evidence.length} record${run.evidence.length === 1 ? "" : "s"}${latest ? `; latest is “${latest.title}”.` : "."}`,
  ];

  if (stage) {
    lines.push(`Validation: ${stage.validation.toLowerCase()}.`);
  }

  if (run.liveExecution) {
    lines.push(
      `Execution: ${readable(run.liveExecution.kind).toLowerCase()} is running; no human decision is open until this execution finishes.`,
    );
  }

  lines.push(...repairDetails(run));
  return lines.join("\n");
}

function answerAngularRoute(run: AngularRunModel): string {
  const sealedStages = run.route.filter((stage) => stage.status === "SEALED").length;
  const activeStage = run.route.find((stage) => stage.status !== "SEALED");
  const stages = run.route.map((stage) => {
    const active = stage.id === activeStage?.id ? " · current" : "";
    return `${stage.source} → ${stage.target}: ${readable(stage.status)}${active}`;
  });

  return [
    `Route: Angular ${run.sourceMajor} → Angular ${run.targetMajor}.`,
    `Progress: ${sealedStages}/${run.route.length} adjacent stage${run.route.length === 1 ? "" : "s"} sealed.`,
    ...stages,
    "Authority: the next adjacent stage can begin only from the previous sealed output; the active unsealed stage remains the current route boundary.",
  ].join("\n");
}

function answerAngularNextAction(run: AngularRunModel): string {
  if (run.liveExecution) {
    return [
      `No human decision is open. ${readable(run.liveExecution.kind)} is running.`,
      `Current action: ${run.currentAction}.`,
      "Wait for the governed execution to finish; the next gate will open from its persisted result.",
    ].join("\n");
  }

  if (!run.currentGate) {
    return [
      "No gate is waiting for a decision.",
      `Current action: ${run.currentAction}.`,
      run.state === "COMPLETED"
        ? "The requested Angular target is complete and no further workflow approval is required."
        : "The run is between governed boundaries; the next action will be created by the stack-owned workflow state.",
    ].join("\n");
  }

  const stageGate = isStageGateId(run.currentGate);
  const decisions = stageGate
    ? getAllowedStageDecisions(run.currentGate as "G07" | "G09" | "G10" | "G11" | "G12")
    : getAllowedPreTransformDecisions(run.currentGate as "G02" | "G03" | "G04" | "G05" | "G06");
  const lines = [
    `${run.currentGate} is waiting for your human decision.`,
    `Available decisions: ${decisions.map(readable).join(", ")}.`,
  ];

  if (run.currentGate === "G10") {
    lines.push(
      "Approve: apply only the reviewed bounded repair; deterministic apply then runs post-state verification and validation.",
      "Request modification: keep the current attempt immutable and create a child review revision.",
      "Reject: reject the repair proposal and keep the stage from advancing through this repair path.",
    );
  } else if (run.currentGate === "G07") {
    lines.push(
      "Approve: start the governed stage execution.",
      "Request modification: keep the stage-start evidence unchanged until revised evidence is reviewed.",
      "Reject: stop this stage-start path.",
    );
  } else {
    lines.push(
      "Choose one of the listed decisions; the Angular workflow will apply the gate-specific successor and preserve the decision evidence.",
    );
  }

  return lines.join("\n");
}

export function answerAngularAssistant(
  run: AngularRunModel,
  question: string,
): string {
  const normalized = question.trim().toLowerCase();
  const intent = assistantIntentForQuestion(question);

  if (!normalized) {
    return "Ask about the current migration state, active gate, repair, evidence, route, or recovery options.";
  }

  if (intent === "current-state") return answerAngularCurrentState(run);
  if (intent === "route") return answerAngularRoute(run);
  if (intent === "next-action") return answerAngularNextAction(run);

  if (/^(hi|hello|hey|bonjour|salut)\b/.test(normalized)) {
    return `Hello. ${run.name} is currently ${run.state.toLowerCase()} in ${run.phase.replaceAll("_", " ").toLowerCase()}. ${run.currentAction}.`;
  }

  if (
    normalized.includes("what is happening") ||
    normalized.includes("what's happening") ||
    normalized.includes("status") ||
    normalized.includes("current") ||
    normalized.includes("where are we")
  ) {
    const gate = run.currentGate ? ` The active gate is ${run.currentGate}.` : "";
    return `${run.name} is in ${run.phase.replaceAll("_", " ").toLowerCase()} for ${currentStageLabel(run)}. ${run.currentAction}.${gate}`;
  }

  if (normalized.includes("repair") || normalized.includes("causal")) {
    const attempts = run.stageExecution?.repairAttempts ?? [];
    if (attempts.length === 0) {
      return "No governed repair attempt is active for the current stage.";
    }

    const active =
      [...attempts]
        .reverse()
        .find((attempt) =>
          ["READY_FOR_G10", "APPLIED", "VALIDATED"].includes(attempt.status),
        ) ?? attempts.at(-1);

    const pieces = [
      `${attempts.length} repair attempts are recorded for ${currentStageLabel(run)}.`,
    ];

    const requestChangesParent = attempts.find(
      (attempt) => attempt.reviewerVerdict === "REQUEST_CHANGES",
    );
    if (requestChangesParent) {
      pieces.push(
        `Attempt ${requestChangesParent.attempt} was superseded after the Independent Reviewer requested changes.`,
      );
    }

    if (active?.failureOwner === "MAIN_REPAIR_LLM") {
      const target = active.changedFiles.join(", ") || "the bound source target";
      pieces.push(
        `Attempt ${active.attempt} is the active Main Repair LLM candidate targeting ${target}.`,
      );
      pieces.push(
        `The Repair Proposer authored the bounded ${active.operation ?? "repair"} candidate and the Independent Reviewer returned ${active.reviewerVerdict.toLowerCase()}.`,
      );
      pieces.push(
        `${run.currentGate ?? "The next governed gate"} must be approved by a human before deterministic apply and validation.`,
      );
    } else if (active) {
      pieces.push(
        `Attempt ${active.attempt} is owned by ${(active.failureOwner ?? "the deterministic repair owner").replaceAll("_", " ").toLowerCase()} and is governed by ${run.currentGate ?? "the next review gate"}.`,
      );
    }

    return pieces.join(" ");
  }

  if (normalized.includes("route") || normalized.includes("stage")) {
    const route = run.route
      .map((stage) => `${stage.source}→${stage.target} ${stage.status.toLowerCase()}`)
      .join(", ");
    return `The requested route is Angular ${run.sourceMajor} → ${run.targetMajor}: ${route}.`;
  }

  if (normalized.includes("evidence") || normalized.includes("proof")) {
    const latest = run.evidence.at(-1);
    return latest
      ? `${run.evidence.length} evidence records are attached to this run. The latest is “${latest.title}”: ${latest.summary}`
      : "No run evidence has been recorded yet.";
  }

  if (
    normalized.includes("rollback") ||
    normalized.includes("resume") ||
    normalized.includes("recover") ||
    normalized.includes("delivery")
  ) {
    const sealed = run.route.filter((stage) => stage.status === "SEALED").at(-1);
    if (!sealed) {
      return "No sealed stage exists yet, so rollback, resume-from-sealed, and partial delivery are not available. Restarting the active unsealed stage is the available recovery action.";
    }
    return `The furthest sealed checkpoint is Angular ${sealed.source} → ${sealed.target}. Recovery can prepare a partial delivery from that checkpoint, roll active work back to it, or resume the next adjacent stage from the same sealed authority.`;
  }

  if (normalized.includes("block") || normalized.includes("fail")) {
    if (run.state === "BLOCKED") {
      return `The run is blocked. ${run.currentAction}. Check Diagnostics and the latest failure evidence before choosing a governed recovery action.`;
    }
    if (run.stageExecution?.validation === "FAILED") {
      return `Validation failed for ${currentStageLabel(run)}, but the run is not terminally blocked. The repair workflow is active at ${run.currentGate ?? "the next governed gate"}.`;
    }
    return "There is no terminal blocker in the current state.";
  }

  return `For ${run.name}, the next governed action is: ${run.currentAction}. Current phase: ${run.phase.replaceAll("_", " ")}${run.currentGate ? `; gate: ${run.currentGate}` : ""}.`;
}

export function createAngularAssistantSnapshot(
  run: AngularRunModel,
): AssistantSnapshot {
  return {
    context: `${run.name} · Angular ${run.sourceMajor} → ${run.targetMajor}`,
    suggestions: ASSISTANT_SUGGESTIONS,
    answer: (question) => answerAngularAssistant(run, question),
  };
}
