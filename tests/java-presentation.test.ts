import assert from "node:assert/strict";
import test from "node:test";

import { seedJavaJob } from "../src/stacks/java/scenarios/seeds.ts";
import { javaConsoleEntries, javaJourney, javaNav, javaObservatory } from "../src/stacks/java/components/java-presentation.ts";

test("Java journey preserves route dispositions and terminal-special semantics", () => {
  const job = seedJavaJob("java-terminal-service");
  const journey = javaJourney(job);

  assert.equal(journey.length, job.route.length);
  assert.ok(journey.some((node) => node.detail?.includes("Terminal-special")));
  assert.equal(journey.at(-1)?.status, "COMPLETED");
  assert.ok(journey.every((node) => !node.label.includes("assessment_review")));
});

test("Java observatory and console projections retain append-only evidence", () => {
  const job = seedJavaJob("java-repair-service");
  const observatory = javaObservatory(job);
  const consoleEntries = javaConsoleEntries(job);

  assert.equal(observatory.length, job.evidence.length);
  assert.equal(observatory.at(-1)?.id, job.evidence.at(-1)?.id);
  assert.ok(consoleEntries.length > 0);
});

test("Java workspace navigation keeps target versions stack-owned", () => {
  const job = seedJavaJob("java-order-service");
  const nav = javaNav("overview", job);

  assert.equal(nav.find((item) => item.id === "workspace")?.active, true);
  assert.equal(nav.find((item) => item.id === "target-versions")?.active, false);
  assert.equal(nav.find((item) => item.id === "notifications")?.count, 0);
});
