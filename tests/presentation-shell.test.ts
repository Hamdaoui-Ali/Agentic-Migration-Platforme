import assert from "node:assert/strict";
import test from "node:test";

import { groupObservatoryEntries, visibleJourneyNodes } from "../src/lib/presentation.ts";

test("observatory grouping preserves append-only order and exposes empty communications", () => {
  const entries = [
    { id: "a", kind: "evidence", timestamp: "10:00", title: "Evidence" },
    { id: "b", kind: "email", timestamp: "10:01", title: "Email" },
    { id: "c", kind: "review", timestamp: "10:02", title: "Review" },
  ] as const;
  const groups = groupObservatoryEntries(entries);
  assert.deepEqual(groups.all.map((entry) => entry.id), ["a", "b", "c"]);
  assert.deepEqual(groups.communication.map((entry) => entry.id), ["b"]);
  assert.equal(groupObservatoryEntries([]).communication.length, 0);
});

test("journey helper keeps supplied node order and status", () => {
  const nodes = [
    { id: "2", label: "12 → 13", status: "SEALED" },
    { id: "3", label: "13 → 14", status: "RUNNING" },
  ] as const;
  assert.deepEqual(visibleJourneyNodes(nodes), nodes);
});

