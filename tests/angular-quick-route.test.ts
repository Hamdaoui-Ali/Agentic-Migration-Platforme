import assert from "node:assert/strict";
import test from "node:test";

import { seedAngularRun } from "../src/stacks/angular/scenarios/seeds.ts";
import {
  applyG01Decision,
  createRunFromApprovedPreflight,
  prepareAngularPreflight,
} from "../src/stacks/angular/workflow/setup.ts";
import { createAngularRunModel } from "../src/stacks/angular/workflow/run.ts";
import { applyAngularGateDecision } from "../src/stacks/angular/workflow/run.ts";

test("Angular Movies 18 to 21 deep links keep their source profile and baseline logs", () => {
  for (const runId of ["run-angular-movies-18-21", "run-movie-angular-18-21"]) {
    const run = seedAngularRun(runId);

    assert.equal(run.name, "Angular Movies");
    assert.equal(run.sourceProfile, "ANGULAR_MOVIES");
    assert.equal(run.sourceMajor, 18);
    assert.equal(run.targetMajor, 21);
    assert.deepEqual(
      run.route.map(({ source, target }) => [source, target]),
      [[18, 19], [19, 20], [20, 21]],
    );

    const baseline = applyAngularGateDecision(
      run,
      "G02",
      "APPROVE",
      "",
      "2026-09-17T20:00:00.000Z",
      Date.parse("2026-09-17T20:00:00.000Z"),
    );
    const logs = baseline.liveExecution?.steps.flatMap((step) => step.logs).join("\n") ?? "";

    assert.match(logs, /tastejs\/angular-movies/);
    assert.match(logs, /Angular 18\.2\.14/);
    assert.doesNotMatch(logs, /Angular 11/);
  }
});

test("generic Angular 17 to 20 runs keep the selected majors in baseline logs", () => {
  const preflight = prepareAngularPreflight({
    runName: "Customer Portal",
    sourcePath: "/workspace/customer-portal",
    outputParent: "/workspace/migration-output",
    sourceMajor: 17,
    targetMajor: 20,
  });
  const run = createAngularRunModel(
    createRunFromApprovedPreflight(applyG01Decision(preflight, "APPROVE")),
  );
  const baseline = applyAngularGateDecision(
    run,
    "G02",
    "APPROVE",
    "",
    "2026-09-17T20:00:00.000Z",
    Date.parse("2026-09-17T20:00:00.000Z"),
  );
  const logs = baseline.liveExecution?.steps.flatMap((step) => step.logs).join("\n") ?? "";

  assert.equal(run.sourceProfile, "GENERIC");
  assert.match(logs, /Angular 17/);
  assert.match(logs, /Angular 20/);
  assert.doesNotMatch(logs, /Angular 11/);
  assert.doesNotMatch(logs, /cornflourblue\/angular-11-crud-example/);
});

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
