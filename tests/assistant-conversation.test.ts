import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import {
  ASSISTANT_RESPONSES,
  ASSISTANT_SUGGESTIONS,
  answerForQuestion,
} from "../src/components/shared/assistant-content.ts";
import { seedAngularRun } from "../src/stacks/angular/scenarios/seeds.ts";
import { answerAngularAssistant } from "../src/stacks/angular/workflow/assistant.ts";
import { seedJavaJob } from "../src/stacks/java/scenarios/seeds.ts";
import { answerJavaRepairAssistant } from "../src/stacks/java/workflow/assistant.ts";

function source(path: string): string {
  return readFileSync(new URL(path, import.meta.url), "utf8");
}

test("assistant offers the three canonical demo questions", () => {
  assert.deepEqual(ASSISTANT_SUGGESTIONS, [
    "What is happening right now?",
    "What is the migration route?",
    "What do you need from me next?",
  ]);
  assert.deepEqual(ASSISTANT_RESPONSES, [
    "current-state",
    "route",
    "next-action",
  ]);
  assert.match(answerForQuestion("hi", "Angular workspace"), /hello/i);
  assert.match(answerForQuestion("what is happening?", "Angular workspace"), /current migration state/i);
  assert.match(answerForQuestion("show the route", "Angular workspace"), /route/i);
  assert.match(answerForQuestion("where are the logs?", "Angular workspace"), /console|evidence/i);
  assert.match(answerForQuestion("what should I do next?", "Angular workspace"), /next governed action/i);
});

test("Angular demo answers explain the active repair, route, and human decision", () => {
  const run = seedAngularRun("run-angular-action");

  const current = answerAngularAssistant(run, "What is happening right now?");
  assert.match(current, /Angular Movies/);
  assert.match(current, /Angular 18 .* 19/);
  assert.match(current, /REPAIR/i);
  assert.match(current, /G10/);
  assert.match(current, /projects\/movies\/server\.ts/);
  assert.match(current, /Independent Reviewer/i);
  assert.doesNotMatch(current, /check the interface|look at/i);

  const route = answerAngularAssistant(run, "What is the migration route?");
  assert.match(route, /18.*19.*ACTION REQUIRED/i);
  assert.match(route, /19.*20.*PENDING/i);
  assert.match(route, /20.*21.*PENDING/i);
  assert.match(route, /\d+\/\d+ adjacent stages sealed/i);

  const next = answerAngularAssistant(run, "What do you need from me next?");
  assert.match(next, /G10/);
  assert.match(next, /approve/i);
  assert.match(next, /deterministic apply/i);
  assert.match(next, /request modification/i);
  assert.match(next, /reject/i);
});

test("Java demo answers explain failure evidence, dynamic route, and repair decisions", () => {
  const job = seedJavaJob("java-repair-service");

  const current = answerJavaRepairAssistant(job, "What is happening right now?");
  assert.match(current, /Payments Service/);
  assert.match(current, /Stage 2/);
  assert.match(current, /repair_review/);
  assert.match(current, /Maven compilation passed/i);
  assert.match(current, /test validation failed/i);
  assert.match(current, /attempt 1 of 3/i);
  assert.match(current, /OrderServiceTest\.java/);
  assert.match(current, /pom\.xml/);

  const route = answerJavaRepairAssistant(job, "What is the migration route?");
  assert.match(route, /Spring Boot 2\.1.*SKIPPED/i);
  assert.match(route, /Spring Boot 2\.7.*Spring Boot 3\.5.*ACTION REQUIRED/i);
  assert.match(route, /Spring Boot 3\.5.*Java 21.*PENDING/i);
  assert.match(route, /Stage 4.*terminal-special/i);

  const next = answerJavaRepairAssistant(job, "What do you need from me next?");
  assert.match(next, /repair_review/);
  assert.match(next, /Continue/i);
  assert.match(next, /Reanalyze/i);
  assert.match(next, /Revise/i);
  assert.match(next, /Reject/i);
  assert.match(next, /build\/test/i);
});

test("completed Java answers explain terminal proof without inventing a gate", () => {
  const job = seedJavaJob("java-terminal-service");

  const current = answerJavaRepairAssistant(job, "What is happening right now?");
  assert.match(current, /completed/i);
  assert.match(current, /Stage 4/);
  assert.match(current, /final report/i);
  assert.match(current, /target dependency validation passed/i);

  const next = answerJavaRepairAssistant(job, "What do you need from me next?");
  assert.match(next, /no open PhaseGate/i);
  assert.match(next, /report artifacts/i);
  assert.doesNotMatch(next, /repair_review/i);
});

test("assistant shows thinking feedback before revealing a typed reply", () => {
  const fab = source("../src/components/shared/assistant-fab.tsx");

  assert.match(fab, /ASSISTANT_THINKING_DELAY_MS/);
  assert.match(fab, /setTimeout/);
  assert.match(fab, /setInterval/);
  assert.match(fab, /slice\(0, visibleLength\)/);
  assert.match(fab, /aria-busy/);
  assert.match(fab, /isThinking/);
  assert.match(fab, /Thinking/);
});
