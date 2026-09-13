export const AUTOMATION_STORAGE_VERSION = 1;

export type AutomationStack = "angular" | "java";
export type AutomationPreference = "MANUAL" | "AUTO_APPROVE_ELIGIBLE";

export interface AutomationStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

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
  } catch {
    // The preference remains active for the current component session.
  }
}

export function isAutomationEnabled(preference: AutomationPreference): boolean {
  return preference === "AUTO_APPROVE_ELIGIBLE";
}
