import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { pickEligibleDecision } from "../src/lib/automation.ts";

test("automation selects the first safe decision that the stack actually allows", () => {
  assert.equal(
    pickEligibleDecision(["REJECT", "APPROVE"] as const, ["APPROVE", "CONTINUE"] as const),
    "APPROVE",
  );
  assert.equal(
    pickEligibleDecision(["REVISE", "REJECT"] as const, ["CONTINUE", "APPROVE"] as const),
    null,
  );
  assert.equal(
    pickEligibleDecision(["CONTINUE", "REJECT"] as const, ["CONTINUE", "APPROVE"] as const),
    "CONTINUE",
  );
});

test("workspace automation stays stack-owned and opt-in", () => {
  const angular = readFileSync(
    new URL("../src/stacks/angular/components/angular-control-tower-page.tsx", import.meta.url),
    "utf8",
  );
  const java = readFileSync(
    new URL("../src/stacks/java/components/java-cockpit-page.tsx", import.meta.url),
    "utf8",
  );
  const control = readFileSync(
    new URL("../src/components/shared/automation-mode-control.tsx", import.meta.url),
    "utf8",
  );
  assert.match(angular, /isAutomationEnabled/);
  assert.match(angular, /getAllowedStageDecisions/);
  assert.match(angular, /AutomationModeControl/);
  assert.match(angular, /writeAutomationPreference/);
  assert.match(java, /isAutomationEnabled/);
  assert.match(java, /getJavaGateDecisions/);
  assert.match(java, /AutomationModeControl/);
  assert.match(java, /writeAutomationPreference/);
  assert.match(control, /Auto-approve eligible gates/);
  assert.match(control, /Manual approvals/);
});
