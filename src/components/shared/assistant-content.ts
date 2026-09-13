export const ASSISTANT_THINKING_DELAY_MS = 3_000;
export const ASSISTANT_TYPING_INTERVAL_MS = 24;

export const ASSISTANT_SUGGESTIONS = [
  "Hi",
  "What is happening?",
  "Show the route",
] as const;

export const ASSISTANT_RESPONSES = [
  "greeting",
  "current-state",
  "route",
  "evidence",
  "next-action",
] as const;

export function answerForQuestion(question: string, context: string): string {
  const normalized = question.trim().toLowerCase();

  if (/^(hi|hello|hey)\b/.test(normalized)) {
    return `Hello! I am here to help you navigate the ${context}.`;
  }

  if (
    normalized.includes("what is happening") ||
    normalized.includes("what's happening") ||
    normalized.includes("status") ||
    normalized.includes("current")
  ) {
    return `The ${context} is showing its current workflow state. Check the Current action panel for the active phase, gate, or running execution.`;
  }

  if (
    normalized.includes("route") ||
    normalized.includes("stage") ||
    normalized.includes("path")
  ) {
    return `The ${context} route is shown in the journey ribbon. It includes only the stages selected by the active workflow plan.`;
  }

  if (
    normalized.includes("evidence") ||
    normalized.includes("log") ||
    normalized.includes("console")
  ) {
    return `Evidence and logs for the ${context} are available in the Evidence workspace, observatory, and Console drawer.`;
  }

  return `The next governed action for the ${context} is shown in the action panel. I can help you understand that boundary before you continue.`;
}
