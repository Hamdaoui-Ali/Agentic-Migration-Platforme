export const AUTOMATION_STORAGE_VERSION = 1;

export type AutomationStack = "angular" | "java";
export type AutomationPreference = "MANUAL" | "AUTO_APPROVE_ELIGIBLE";

export interface AutomationStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

const listeners: Record<AutomationStack, Set<() => void>> = {
  angular: new Set(),
  java: new Set(),
};

export function automationStorageKey(stack: AutomationStack): string {
  return `migration-factory:automation:v${AUTOMATION_STORAGE_VERSION}:${stack}`;
}

export function parseAutomationPreference(value: string | null): AutomationPreference {
  return value === "AUTO_APPROVE_ELIGIBLE" ? value : "MANUAL";
}

function browserStorage(): AutomationStorage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function readAutomationPreference(
  stack: AutomationStack,
  storage: AutomationStorage | null = browserStorage(),
): AutomationPreference {
  if (!storage) return "MANUAL";
  try {
    return parseAutomationPreference(storage.getItem(automationStorageKey(stack)));
  } catch {
    return "MANUAL";
  }
}

export function writeAutomationPreference(
  stack: AutomationStack,
  preference: AutomationPreference,
  storage: AutomationStorage | null = browserStorage(),
): void {
  if (!storage) return;
  try {
    storage.setItem(automationStorageKey(stack), preference);
    listeners[stack].forEach((listener) => listener());
  } catch {
    // The preference remains active for the current component session.
  }
}

export function isAutomationEnabled(preference: AutomationPreference): boolean {
  return preference === "AUTO_APPROVE_ELIGIBLE";
}

export function subscribeAutomationPreference(
  stack: AutomationStack,
  listener: () => void,
): () => void {
  listeners[stack].add(listener);
  return () => listeners[stack].delete(listener);
}

export function getAutomationPreferenceSnapshot(
  stack: AutomationStack,
): AutomationPreference {
  return readAutomationPreference(stack);
}

export function getAutomationPreferenceServerSnapshot(): AutomationPreference {
  return "MANUAL";
}

export function pickEligibleDecision<T extends string>(
  allowed: readonly T[],
  priorities: readonly T[],
): T | null {
  return priorities.find((decision) => allowed.includes(decision)) ?? null;
}
