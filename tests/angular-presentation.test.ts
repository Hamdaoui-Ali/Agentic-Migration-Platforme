import assert from "node:assert/strict";
import test from "node:test";

import { seedAngularRun } from "../src/stacks/angular/scenarios/seeds.ts";
import {
  angularConsoleEntries,
  angularJourney,
  angularObservatory,
} from "../src/stacks/angular/components/angular-presentation.ts";

test("Angular presentation preserves dynamic route and evidence identity", () => {
  const run = seedAngularRun("run-angular-action");
  const journey = angularJourney(run);
  assert.equal(journey.length, run.route.length);
  assert.equal(journey[0].label, `${run.route[0].source} → ${run.route[0].target}`);
  const evidence = angularObservatory(run);
  assert.equal(evidence.length, run.evidence.length);
  assert.equal(evidence[0].id, run.evidence[0].id);
  assert.equal(evidence[0].checksum, run.evidence[0].checksum);
});

test("Angular console projection uses command logs or truthful evidence fallback", () => {
  const run = seedAngularRun("run-angular-action");
  const entries = angularConsoleEntries(run);
  assert.ok(entries.length > 0);
  assert.ok(entries.every((entry) => entry.id && entry.channel && entry.message));
});

