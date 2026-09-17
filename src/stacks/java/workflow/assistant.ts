import { stableDisplayChecksum } from "../../../scenarios/runtime/checksum.ts";
import type {
  JavaGateAssistantPreview,
  JavaGateDecision,
  JavaJobModel,
  JavaPhaseGate,
} from "../domain/run-types.ts";
import type { JavaProfileId } from "../domain/types.ts";
import { getJavaGateDecisions } from "./cockpit.ts";
import {
  ASSISTANT_SUGGESTIONS,
  assistantIntentForQuestion,
  type AssistantSnapshot,
} from "../../../components/shared/assistant-content.ts";

function activeGate(job: JavaJobModel): JavaPhaseGate {
  if (!job.currentGate) {
    throw new Error("No Java PhaseGate is active.");
  }
  const gate = job.phaseGates
    .toReversed()
    .find(
      (candidate) =>
        candidate.type === job.currentGate && candidate.status === "PENDING",
    );
  if (!gate) {
    throw new Error("Active Java PhaseGate state is unavailable.");
  }
  return gate;
}

export function explainJavaGate(job: JavaJobModel): string {
  const gate = activeGate(job);
  const decisions = getJavaGateDecisions(gate.type)
    .map((decision) => decision.replaceAll("_", " ").toLowerCase())
    .join(", ");
  return (
    gate.type.replaceAll("_", " ") +
    " is active for Java Stage " +
    gate.stage +
    ", revision #" +
    gate.revision +
    ". Available decisions: " +
    decisions +
    ". The decision must remain bound to checksum " +
    gate.checksum +
    "."
  );
}

export function previewJavaGateAction(
  job: JavaJobModel,
  decision: JavaGateDecision,
  options: {
    comment?: string;
    overrideSourceProfile?: JavaProfileId;
  } = {},
): JavaGateAssistantPreview {
  const gate = activeGate(job);
  if (!getJavaGateDecisions(gate.type).includes(decision)) {
    throw new Error(decision + " is not valid for " + gate.type + ".");
  }
  if (decision === "OVERRIDE_SOURCE_PROFILE" && !options.overrideSourceProfile) {
    throw new Error("Override Source Profile preview requires a source profile.");
  }

  const comment = options.comment?.trim() || undefined;
  const actionChecksum = stableDisplayChecksum(
    [
      gate.id,
      gate.revision,
      gate.checksum,
      decision,
      comment ?? "",
      options.overrideSourceProfile ?? "",
    ].join("|"),
  );

  return {
    gateId: gate.id,
    gateType: gate.type,
    gateRevision: gate.revision,
    gateChecksum: gate.checksum,
    decision,
    comment,
    overrideSourceProfile: options.overrideSourceProfile,
    actionChecksum,
  };
}

export function confirmJavaGatePreview(
  job: JavaJobModel,
  preview: JavaGateAssistantPreview,
): JavaGateAssistantPreview {
  const gate = activeGate(job);
  if (
    gate.id !== preview.gateId ||
    gate.type !== preview.gateType ||
    gate.revision !== preview.gateRevision ||
    gate.checksum !== preview.gateChecksum
  ) {
    throw new Error(
      "Gate Assistant preview is stale because the gate revision or checksum changed.",
    );
  }

  const expected = previewJavaGateAction(job, preview.decision, {
    comment: preview.comment,
    overrideSourceProfile: preview.overrideSourceProfile,
  });

  if (expected.actionChecksum !== preview.actionChecksum) {
    throw new Error("Gate Assistant action checksum no longer matches the preview.");
  }

  return preview;
}

function readable(value: string): string {
  return value.replaceAll("_", " ");
}

function currentJavaRouteStage(job: JavaJobModel) {
  return job.route.find((stage) => stage.stage === job.currentStage);
}

function javaRouteStatus(
  job: JavaJobModel,
  stage: JavaJobModel["route"][number],
): string {
  if (stage.disposition !== "INCLUDED") return stage.disposition;

  const result = job.stageResults.find((candidate) => candidate.stage === stage.stage);
  if (result?.status === "PASS") return "COMPLETED";
  if (result?.status === "FAILED") return "ACTION REQUIRED";
  if (stage.stage === job.currentStage) {
    return job.status === "ACTION_REQUIRED" ? "ACTION REQUIRED" : "RUNNING";
  }
  return "PENDING";
}

function currentJavaRepair(job: JavaJobModel) {
  return job.repair.attempts
    .filter((attempt) => attempt.stage === job.currentStage)
    .at(-1);
}

function answerJavaCurrentState(job: JavaJobModel): string {
  const stage = currentJavaRouteStage(job);
  const result = job.stageResults.find((candidate) => candidate.stage === job.currentStage);
  const repair = currentJavaRepair(job);
  const lines = [
    `Status: ${job.name} is ${readable(job.status).toLowerCase()}.`,
    stage
      ? `Current stage: Stage ${stage.stage} · ${stage.label}.`
      : "Current stage: none.",
    `Phase: ${readable(job.currentPhase).toLowerCase()}.`,
    `Current action: ${job.currentAction}.`,
    `Active PhaseGate: ${job.currentGate ?? "none"}.`,
  ];

  if (result) {
    lines.push(
      `Validation: build ${result.build.toLowerCase()}; tests ${result.tests.toLowerCase()}.`,
    );
  }

  if (repair) {
    lines.push(
      `Repair: attempt ${repair.attempt} of ${job.repair.maxAttempts} is ${readable(repair.status).toLowerCase()}.`,
      `Failure evidence: ${repair.diagnosis}`,
      `Review: the Repair Proposer and Independent Reviewer returned ${repair.reviewerVerdict.toLowerCase()}.`,
      `Files in scope: ${repair.changedFiles.join(", ")}.`,
    );
  }

  if (job.liveExecution) {
    lines.push(`Execution: ${readable(job.liveExecution.kind).toLowerCase()} is running.`);
  }

  if (job.currentStage === 4) {
    lines.push(
      "Terminal rule: Java Stage 4 is terminal-special and has no normal PhaseGate.",
    );
  }

  if (job.status === "COMPLETED") {
    const latestProof = [...job.evidence]
      .reverse()
      .find((item) => item.category === "STAGE");
    const targetValidation = job.evidence.find((item) =>
      item.title.toLowerCase().includes("target dependency validation"),
    );
    if (targetValidation) {
      lines.push(`Target dependency proof: ${targetValidation.title}. ${targetValidation.summary}`);
    }
    lines.push(
      `Final proof: ${job.finalReport.artifacts.length} report artifacts are available${latestProof ? `; latest Stage 4 evidence is “${latestProof.title}”.` : "."}`,
    );
  }

  return lines.join("\n");
}

function answerJavaRoute(job: JavaJobModel): string {
  const included = job.route.filter((stage) => stage.disposition === "INCLUDED").length;
  const resolved = job.route.filter((stage) => {
    const status = javaRouteStatus(job, stage);
    return ["COMPLETED", "SKIPPED", "EXCLUDED"].includes(status);
  }).length;

  return [
    `Route: ${included} of ${job.route.length} route stages are included; ${resolved} route entr${resolved === 1 ? "y is" : "ies are"} resolved.`,
    ...job.route.map((stage) => {
      const terminal = stage.terminal
        ? " · terminal-special · no normal PhaseGate"
        : "";
      return `Stage ${stage.stage}: ${stage.label} · ${javaRouteStatus(job, stage)}${terminal}`;
    }),
    "Authority: included stages progress in route order, while skipped and excluded stages remain explicit route decisions.",
  ].join("\n");
}

function answerJavaNextAction(job: JavaJobModel): string {
  if (job.liveExecution) {
    return [
      "No human decision is open while the current Java execution is running.",
      `Current action: ${job.currentAction}.`,
      "Wait for the phase evidence to finish; the next PhaseGate opens only from that result.",
    ].join("\n");
  }

  if (job.status === "COMPLETED") {
    return [
      "No human decision is open; there is no open PhaseGate.",
      `Current action: ${job.currentAction}.`,
      `Stage 4 is terminal-special. The final report is generated with ${job.finalReport.artifacts.length} report artifacts; the accepted output revision is #${job.terminalStage4.acceptedOutputRevision ?? "—"}.`,
    ].join("\n");
  }

  if (!job.currentGate) {
    return [
      "No PhaseGate is waiting for a decision.",
      `Current action: ${job.currentAction}.`,
      job.currentStage === 4
        ? "Continue through the dedicated terminal Stage 4 workflow; it does not create a normal PhaseGate."
        : "The next governed boundary will be created by the Java workflow after the current phase completes.",
    ].join("\n");
  }

  const decisions = getJavaGateDecisions(job.currentGate);
  const lines = [
    `${job.currentGate} is waiting for your human decision at Stage ${job.currentStage}.`,
    `Available decisions: ${decisions.map(readable).join(", ")}.`,
  ];

  if (job.currentGate === "repair_review") {
    lines.push(
      "Continue: apply the reviewed repair and rerun Maven build/test validation before stage progression.",
      "Reanalyze: create a new diagnosis from the frozen failure evidence.",
      "Revise: request a revised repair proposal without mutating the current attempt.",
      "Reject: reject the proposal and keep the stage from advancing.",
    );
  } else {
    lines.push(
      "Choose one of the listed decisions; the Java workflow applies the gate-specific successor and preserves the PhaseGate evidence.",
    );
  }

  return lines.join("\n");
}

export function answerJavaAssistant(
  job: JavaJobModel,
  question: string,
): string {
  const normalized = question.trim().toLowerCase();
  const intent = assistantIntentForQuestion(question);
  const stageAttempts = job.repair.attempts.filter(
    (attempt) => attempt.stage === job.currentStage,
  );
  const latest = stageAttempts.at(-1);

  if (!normalized) {
    return "Ask about the current migration state, route, next decision, repair, evidence, or terminal report.";
  }

  if (intent === "current-state") return answerJavaCurrentState(job);
  if (intent === "route") return answerJavaRoute(job);
  if (intent === "next-action") return answerJavaNextAction(job);

  if (intent === "greeting") {
    return `Hello. ${job.name} is currently ${readable(job.status).toLowerCase()} in ${readable(job.currentPhase).toLowerCase()}. ${job.currentAction}.`;
  }

  if (!latest) {
    return "No Java repair attempt is active. Repair Assistant becomes relevant after build or test validation creates failure evidence.";
  }

  if (normalized.includes("diff") || normalized.includes("change")) {
    return (
      "The reviewed repair changes " +
      latest.changedFiles.join(", ") +
      ". It is limited to the failing source surface and must pass Maven build/test revalidation after repair_review approval."
    );
  }

  if (normalized.includes("attempt") || normalized.includes("limit")) {
    return (
      stageAttempts.length +
      " of " +
      job.repair.maxAttempts +
      " governed repair attempts have been used for Java Stage " +
      job.currentStage +
      ". Prior stage attempts remain in the immutable repair history."
    );
  }

  return (
    "Repair Assistant is grounded in attempt " +
    latest.attempt +
    ". The next governed action is: " +
    job.currentAction +
    "."
  );
}

export function answerJavaRepairAssistant(
  job: JavaJobModel,
  question: string,
): string {
  return answerJavaAssistant(job, question);
}

export function createJavaAssistantSnapshot(
  job: JavaJobModel,
): AssistantSnapshot {
  return {
    context: `${job.name} · Spring Boot migration`,
    suggestions: ASSISTANT_SUGGESTIONS,
    answer: (question) => answerJavaAssistant(job, question),
  };
}
