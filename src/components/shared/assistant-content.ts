export const ASSISTANT_THINKING_DELAY_MS = 3_000;
export const ASSISTANT_TYPING_INTERVAL_MS = 24;

export const ASSISTANT_SUGGESTIONS = [
  "What is happening right now?",
  "What is the migration route?",
  "What do you need from me next?",
] as const;

export const ASSISTANT_RESPONSES = [
  "current-state",
  "route",
  "next-action",
] as const;

export type AssistantIntent =
  | "greeting"
  | "current-state"
  | "route"
  | "next-action"
  | "evidence"
  | "help";

export type AssistantSnapshot = {
  context: string;
  suggestions: readonly string[];
  answer: (question: string) => string;
};

export function assistantIntentForQuestion(question: string): AssistantIntent {
  const normalized = question.trim().toLowerCase().replaceAll("’", "'");

  if (/^(hi|hello|hey|bonjour|salut)\b/.test(normalized)) {
    return "greeting";
  }

  if (
    normalized.includes("what is happening") ||
    normalized.includes("what's happening") ||
    normalized.includes("what is going on") ||
    normalized.includes("what's going on") ||
    normalized.includes("current") ||
    normalized.includes("status") ||
    normalized.includes("where are we")
  ) {
    return "current-state";
  }

  if (
    normalized.includes("route") ||
    normalized.includes("stage") ||
    normalized.includes("path") ||
    normalized.includes("journey")
  ) {
    return "route";
  }

  if (
    normalized.includes("what do you need") ||
    normalized.includes("what should i do") ||
    normalized.includes("what happens next") ||
    normalized.includes("what's next") ||
    normalized.includes("next") ||
    normalized.includes("decision") ||
    normalized.includes("action required")
  ) {
    return "next-action";
  }

  if (
    normalized.includes("evidence") ||
    normalized.includes("log") ||
    normalized.includes("console") ||
    normalized.includes("proof")
  ) {
    return "evidence";
  }

  return "help";
}

export function answerForQuestion(question: string, context: string): string {
  switch (assistantIntentForQuestion(question)) {
    case "greeting":
      return `Hello. I can explain the current migration state, route, and next governed action for the ${context}.`;
    case "current-state":
      return `The current migration state for the ${context} is not connected to a specific run yet. Open a migration workspace to receive its stage, phase, gate, repair, and evidence details.`;
    case "route":
      return `The migration route for the ${context} is derived from the active workflow plan. I can list each stage and its status when a migration workspace is connected.`;
    case "next-action":
      return `The next governed action for the ${context} is determined by its active gate or execution. A connected workspace can explain the exact decision and its consequence.`;
    case "evidence":
      return `Evidence for the ${context} is kept with the migration run, including decisions, command results, validation, repair history, and checksums.`;
    default:
      return `I can answer three questions for the ${context}: what is happening right now, what is the migration route, and what is needed next.`;
  }
}
