import assert from "node:assert/strict";
import test from "node:test";

import { seedAngularRun } from "../src/stacks/angular/scenarios/seeds.ts";
import { applyAngularStageGateDecision } from "../src/stacks/angular/workflow/proven.ts";

test("Angular Movies repair carries source commits and the exact SSR import patch", () => {
  const run = seedAngularRun("run-angular-action");
  const attempt = run.stageExecution?.repairAttempts.at(-1);

  assert.equal(attempt?.sourceReference?.repository, "tastejs/angular-movies");
  assert.equal(
    attempt?.sourceReference?.sourceCommit,
    "794e45e00cc2e0935b1a48a372b9a34779f016cb",
  );
  assert.equal(
    attempt?.sourceReference?.targetCommit,
    "a002daf3e4ce107f3ef4cd99259e730438f5d1a3",
  );
  assert.equal(attempt?.sourceReference?.path, "projects/movies/server.ts");
  assert.match(attempt?.diff ?? "", /CommonEngine/);
  assert.match(attempt?.diff ?? "", /@angular\/ssr\/node/);
});

test("G10 AI hint creates a child source-grounded revision without mutating the parent", () => {
  const run = seedAngularRun("run-angular-action");
  const parent = run.stageExecution!.repairAttempts.at(-1)!;
  const next = applyAngularStageGateDecision(
    run,
    "G10",
    "REQUEST_MODIFICATION",
    "Prefer the Angular 19 SSR node entrypoint.",
    "2026-09-15T12:00:00.000Z",
    Date.parse("2026-09-15T12:00:00.000Z"),
    { mode: "AI_HINT", text: "Prefer the Angular 19 SSR node entrypoint." },
  );
  const child = next.stageExecution!.repairAttempts.at(-1)!;

  assert.equal(parent.id, child.parentAttemptId);
  assert.equal(parent.reviewInput, undefined);
  assert.deepEqual(child.reviewInput, {
    mode: "AI_HINT",
    text: "Prefer the Angular 19 SSR node entrypoint.",
  });
  assert.deepEqual(child.sourceReference, parent.sourceReference);
  assert.match(child.diff, /@angular\/ssr\/node/);
});

test("G10 manual override is recorded as a child review input", () => {
  const run = seedAngularRun("run-angular-action");
  const parent = run.stageExecution!.repairAttempts.at(-1)!;
  const manualPatch =
    "diff --git a/projects/movies/server.ts b/projects/movies/server.ts";
  const next = applyAngularStageGateDecision(
    run,
    "G10",
    "REQUEST_MODIFICATION",
    "Manual correction supplied by operator.",
    "2026-09-15T12:00:00.000Z",
    Date.parse("2026-09-15T12:00:00.000Z"),
    { mode: "MANUAL_OVERRIDE", text: manualPatch },
  );
  const child = next.stageExecution!.repairAttempts.at(-1)!;

  assert.equal(child.parentAttemptId, parent.id);
  assert.equal(child.reviewInput?.mode, "MANUAL_OVERRIDE");
  assert.equal(child.reviewInput?.text, manualPatch);
  assert.deepEqual(child.sourceReference, parent.sourceReference);
  assert.equal(next.stageExecution!.repairAttempts[0]?.diff, parent.diff);
});
