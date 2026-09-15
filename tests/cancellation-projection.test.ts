import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { seedAngularRun } from "../src/stacks/angular/scenarios/seeds.ts";
import { applyAngularGateDecision } from "../src/stacks/angular/workflow/run.ts";
import { cancelAngularMigration } from "../src/stacks/angular/workflow/cancellation.ts";
import { JAVA_PIPELINE_PHASES } from "../src/stacks/java/domain/run-types.ts";

function source(path: string): string {
  return readFileSync(new URL(path, import.meta.url), "utf8");
}

test("cancellation stays an operator action, never a Java workflow phase", () => {
  assert.equal(JAVA_PIPELINE_PHASES.includes("CANCELLATION" as never), false);

  const pipeline = source("../src/stacks/java/components/java-pipeline.tsx");
  const cockpit = source("../src/stacks/java/components/java-cockpit-page.tsx");
  const evidence = source("../src/stacks/java/components/java-evidence-workspace.tsx");

  assert.match(pipeline, /out-of-band operator action/);
  assert.match(cockpit, /cancelJavaMigration/);
  assert.match(evidence, /CANCELLATION/);
});

test("Angular cancellation stops active work and appends cancellation evidence", () => {
  const running = applyAngularGateDecision(
    seedAngularRun("run-angular-cancellation"),
    "G02",
    "APPROVE",
  );
  assert.ok(running.liveExecution);

  const cancelled = cancelAngularMigration(running, "2026-09-13T20:00:00.000Z");

  assert.equal(cancelled.state, "CANCELLED");
  assert.equal(cancelled.phase, "CANCELLED");
  assert.equal(cancelled.currentGate, null);
  assert.equal(cancelled.liveExecution, undefined);
  assert.equal(cancelled.currentAction, "Migration cancelled by operator request");
  assert.ok(cancelled.route.every((stage) => stage.status === "CANCELLED"));
  assert.equal(cancelled.evidence.at(-1)?.category, "CANCELLATION");
});

test("Angular cancellation rejects terminal runs", () => {
  assert.throws(
    () => cancelAngularMigration(seedAngularRun("run-angular-complete")),
    /cannot be cancelled/i,
  );
});

test("both workspaces expose a visible header cancellation trigger", () => {
  const angular = source("../src/stacks/angular/components/angular-control-tower-page.tsx");
  const java = source("../src/stacks/java/components/java-cockpit-page.tsx");
  const angularEvidence = source("../src/stacks/angular/components/angular-evidence-workspace.tsx");

  assert.match(angular, /cancelAngularMigration/);
  assert.match(angular, /Cancel migration/);
  assert.match(java, /cancelJavaMigration/);
  assert.match(java, /Cancel migration/);
  assert.match(angularEvidence, /CANCELLATION/);
});

