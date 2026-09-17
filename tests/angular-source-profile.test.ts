import assert from "node:assert/strict";
import test from "node:test";

import { createAngularLiveExecution } from "../src/stacks/angular/workflow/live-definitions.ts";
import {
  completedAnalysis,
  completedBaseline,
  completedFeasibility,
} from "../src/stacks/angular/workflow/run.ts";
import {
  getAngularRun,
} from "../src/stacks/angular/scenarios/angular-store.ts";
import { seedAngularPreflight, seedAngularRun } from "../src/stacks/angular/scenarios/seeds.ts";

test("Angular Movies preflight deep links use the 18 to 21 source profile", () => {
  for (const preflightId of [
    "preflight-angular-movies-18-21",
    "preflight-movie-angular-18-21",
  ]) {
    const preflight = seedAngularPreflight(preflightId);

    assert.equal(preflight.sourceProfile, "ANGULAR_MOVIES");
    assert.equal(preflight.sourceMajor, 18);
    assert.equal(preflight.targetMajor, 21);
    assert.equal(preflight.sourceAnalysis.detectedVersion, "18.2.14");
  }
});

test("generic completed Angular evidence stays source-neutral and route-aware", () => {
  const evidence = JSON.stringify({
    baseline: completedBaseline("GENERIC", 17, 20),
    analysis: completedAnalysis("READY_FOR_REVIEW", "GENERIC", 17, 20),
    feasibility: completedFeasibility("GENERIC", 17, 20),
  });

  assert.match(evidence, /Angular 17/);
  assert.match(evidence, /Angular 20/);
  assert.doesNotMatch(evidence, /Angular 11/);
  assert.doesNotMatch(evidence, /cornflourblue\/angular-11-crud-example/);
});

test("generic live execution requires an explicit selected route", () => {
  assert.throws(
    () => createAngularLiveExecution("BASELINE", 1_900_000_000_000, { sourceProfile: "GENERIC" }),
    /source and target majors/i,
  );
});

test("stale Angular Movies run state is archived before restoring the corrected route", () => {
  const storage = new Map<string, string>();
  const originalWindow = (globalThis as { window?: unknown }).window;
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: {
      localStorage: {
        getItem: (key: string) => storage.get(key) ?? null,
        setItem: (key: string, value: string) => storage.set(key, value),
        removeItem: (key: string) => storage.delete(key),
      },
    },
  });

  try {
    const runId = "run-angular-movies-18-21";
    const stale = { ...seedAngularRun("legacy-persisted-run"), id: runId };
    storage.set(
      "migration-factory:angular:v4",
      JSON.stringify({ preflights: {}, runs: { [runId]: stale } }),
    );

    const migrated = getAngularRun(runId);
    const persisted = JSON.parse(storage.get("migration-factory:angular:v4") ?? "{}");
    const archived = Object.entries(persisted.runs as Record<string, unknown>).find(([id]) =>
      id.startsWith(`${runId}-archived-`),
    );

    assert.equal(migrated.sourceProfile, "ANGULAR_MOVIES");
    assert.equal(migrated.sourceMajor, 18);
    assert.equal(migrated.targetMajor, 21);
    assert.ok(migrated.evidence.some((item) => /source profile corrected/i.test(item.title)));
    assert.ok(archived);
    assert.equal((archived[1] as { sourceProfile: string }).sourceProfile, "ANGULAR11_CRUD");
  } finally {
    if (originalWindow === undefined) {
      Reflect.deleteProperty(globalThis, "window");
    } else {
      Object.defineProperty(globalThis, "window", {
        configurable: true,
        value: originalWindow,
      });
    }
  }
});
