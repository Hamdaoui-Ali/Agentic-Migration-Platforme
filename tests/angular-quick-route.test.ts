import assert from "node:assert/strict";
import test from "node:test";

import { seedAngularRun } from "../src/stacks/angular/scenarios/seeds.ts";

test("quick Angular action scenario opens the first source-grounded 18 to 19 repair", () => {
  const run = seedAngularRun("run-angular-action");

  assert.equal(run.sourceMajor, 18);
  assert.equal(run.targetMajor, 21);
  assert.deepEqual(
    run.route.map(({ source, target }) => [source, target]),
    [[18, 19], [19, 20], [20, 21]],
  );
  assert.equal(run.stageExecution?.source, 18);
  assert.equal(run.stageExecution?.target, 19);
  assert.equal(run.currentGate, "G10");
  assert.equal(run.analysis.applicationProfile?.repository, "tastejs/angular-movies");
});

test("recovery scenario keeps the prior Angular 20 to 21 repair authority", () => {
  const run = seedAngularRun("run-angular-recovery");

  assert.equal(run.stageExecution?.source, 20);
  assert.equal(run.stageExecution?.target, 21);
  assert.equal(run.currentGate, "G10");
  assert.equal(run.analysis.applicationProfile?.repository, "cornflourblue/angular-11-crud-example");
});
