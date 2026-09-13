import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

function source(path: string): string {
  return readFileSync(new URL(path, import.meta.url), "utf8");
}

test("the migration assistant is a persistent, accessible floating action", () => {
  const fab = source("../src/components/shared/assistant-fab.tsx");
  const layout = source("../src/app/layout.tsx");

  assert.match(fab, /Migration assistant/);
  assert.match(fab, /Open migration assistant/);
  assert.match(fab, /fixed/);
  assert.match(fab, /role=\"dialog\"/);
  assert.match(layout, /<AssistantFab\s*\/>/);
});

