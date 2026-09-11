import assert from "node:assert/strict";
import test from "node:test";

import {
  playbackNow,
  playbackSpeedFromSearch,
  rebaseLiveExecutionStart,
} from "../src/lib/presenter-mode.ts";
import { seedJavaJob } from "../src/stacks/java/scenarios/seeds.ts";
import { applyJavaRepairDecision } from "../src/stacks/java/workflow/repair.ts";
import {
  advanceJavaLiveExecution,
  ensureJavaLiveExecution,
} from "../src/stacks/java/workflow/live.ts";

test("presenter mode defaults to a 3x logical playback speed", () => {
  assert.equal(playbackSpeedFromSearch("?mode=recording"), 3);
  assert.equal(playbackSpeedFromSearch("?presenter=1"), 3);
});

test("an explicit presenter speed is bounded and takes precedence", () => {
  assert.equal(playbackSpeedFromSearch("?mode=recording&speed=4"), 4);
  assert.equal(playbackSpeedFromSearch("?speed=6"), 6);
  assert.equal(playbackSpeedFromSearch("?mode=recording&speed=9"), 3);
  assert.equal(playbackSpeedFromSearch("?speed=0"), 1);
  assert.equal(playbackSpeedFromSearch("?speed=fast"), 1);
});

test("logical playback projects wall-clock time without moving backwards", () => {
  assert.equal(playbackNow(1_000, 11_000, 3), 31_000);
  assert.equal(playbackNow(1_000, 500, 3), 1_000);
});

test("recording transitions rebase the next live phase to wall-clock time", () => {
  const model = rebaseLiveExecutionStart(
    {
      liveExecution: { id: "phase-b", startedAtMs: 31_000 },
      marker: "next-phase",
    },
    11_000,
    3,
    "phase-a",
  );

  assert.equal(model.liveExecution?.startedAtMs, 11_000);
  assert.equal(model.marker, "next-phase");
});

test("recording does not reset the clock while the same live phase is still running", () => {
  const model = rebaseLiveExecutionStart(
    {
      liveExecution: { id: "phase-a", startedAtMs: 1_750 },
      marker: "same-phase",
    },
    2_000,
    3,
    "phase-a",
  );

  assert.equal(model.liveExecution?.startedAtMs, 1_750);
  assert.equal(model.marker, "same-phase");
});

test("Java presenter playback reaches the next stage after a validation phase", () => {
  const startedAtMs = 1_000;
  const prepared = ensureJavaLiveExecution(
    applyJavaRepairDecision(seedJavaJob("java-repair-service"), "CONTINUE"),
    startedAtMs,
  );
  const firstTickMs = 5_000;
  const firstLogicalNow = playbackNow(
    prepared.liveExecution?.startedAtMs ?? startedAtMs,
    firstTickMs,
    3,
  );
  const firstAdvance = advanceJavaLiveExecution(prepared, firstLogicalNow);
  const stillRunning = rebaseLiveExecutionStart(
    firstAdvance,
    firstTickMs,
    3,
    prepared.liveExecution?.id,
  );

  const completionTickMs = 11_000;
  const completionLogicalNow = playbackNow(
    stillRunning.liveExecution?.startedAtMs ?? completionTickMs,
    completionTickMs,
    3,
  );
  const completed = advanceJavaLiveExecution(
    stillRunning,
    completionLogicalNow,
  );
  const nextStage = rebaseLiveExecutionStart(
    completed,
    completionTickMs,
    3,
    stillRunning.liveExecution?.id,
  );

  assert.equal(nextStage.currentStage, 3);
  assert.notEqual(nextStage.liveExecution?.id, stillRunning.liveExecution?.id);
  assert.equal(nextStage.liveExecution?.startedAtMs, completionTickMs);
});
