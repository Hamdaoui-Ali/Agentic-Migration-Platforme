import assert from "node:assert/strict";
import test from "node:test";

import {
  playbackNow,
  playbackSpeedFromSearch,
  rebaseLiveExecutionStart,
} from "../src/lib/presenter-mode.ts";

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
    { liveExecution: { startedAtMs: 31_000 }, marker: "next-phase" },
    11_000,
    3,
  );

  assert.equal(model.liveExecution?.startedAtMs, 11_000);
  assert.equal(model.marker, "next-phase");
});
