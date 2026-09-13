import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import {
  DIAGNOSTIC_DURATION_MS,
  advanceDiagnosticState,
  createDiagnosticState,
  type DiagnosticRunState,
} from "../src/lib/diagnostics.ts";

test("diagnostic runs use a five-second presentation window", () => {
  assert.equal(DIAGNOSTIC_DURATION_MS, 5_000);
  assert.deepEqual(createDiagnosticState(), { status: "IDLE", revealed: 0 });
});

test("diagnostic checks reveal one at a time and finish on the final check", () => {
  let state: DiagnosticRunState = { status: "RUNNING", revealed: 0 };
  state = advanceDiagnosticState(state, 3);
  assert.deepEqual(state, { status: "RUNNING", revealed: 1 });
  state = advanceDiagnosticState(state, 3);
  assert.deepEqual(state, { status: "RUNNING", revealed: 2 });
  state = advanceDiagnosticState(state, 3);
  assert.deepEqual(state, { status: "COMPLETE", revealed: 3 });
  assert.deepEqual(advanceDiagnosticState(state, 3), state);
});

test("diagnostic state clamps an empty check list to complete", () => {
  assert.deepEqual(
    advanceDiagnosticState({ status: "RUNNING", revealed: 0 }, 0),
    { status: "COMPLETE", revealed: 0 },
  );
});

test("Angular setup uses an explicit run button and semantic check status hooks", () => {
  const setup = readFileSync(
    new URL("../src/stacks/angular/components/angular-setup-page.tsx", import.meta.url),
    "utf8",
  );
  const diagnostics = readFileSync(
    new URL("../src/components/shared/environment-diagnostics.tsx", import.meta.url),
    "utf8",
  );
  assert.match(setup, /EnvironmentDiagnostics/);
  assert.match(diagnostics, /Run environment diagnosis/);
  assert.match(diagnostics, /data-diagnostic-status/);
  assert.match(diagnostics, /BLOCKED/);
});
