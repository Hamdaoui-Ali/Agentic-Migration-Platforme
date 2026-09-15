import assert from "node:assert/strict";
import test from "node:test";

import { seedAngularRun } from "../src/stacks/angular/scenarios/seeds.ts";

test("run-angular-action opens on the source-backed 18 to 19 G10 repair review", () => {
  const run = seedAngularRun("run-angular-action");

  assert.equal(run.stageExecution?.source, 18);
  assert.equal(run.stageExecution?.target, 19);
  assert.equal(run.currentGate, "G10");
  assert.equal(run.phase, "REPAIR");

  const active = run.stageExecution?.repairAttempts.at(-1);
  assert.equal(active?.proposalKind, "SOURCE_PATCH");
  assert.match(active?.diff ?? "", /@angular\/ssr\/node/);
  assert.match(active?.diff ?? "", /projects\/movies\/server\.ts/);
});
