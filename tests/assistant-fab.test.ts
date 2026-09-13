import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

function source(path: string): string {
  return readFileSync(new URL(path, import.meta.url), "utf8");
}

test("the migration assistant is a persistent, accessible floating action", () => {
  const fab = source("../src/components/shared/assistant-fab.tsx");
  const styles = source("../src/app/globals.css");
  const layout = source("../src/app/layout.tsx");

  assert.match(fab, /Migration assistant/);
  assert.match(fab, /Open migration assistant/);
  assert.match(fab, /fixed/);
  assert.match(fab, /role=\"dialog\"/);
  assert.match(fab, /data-resizable=\"true\"/);
  assert.match(styles, /\.mf-assistant-fab[\s\S]*height: 64px/);
  assert.match(styles, /\.mf-assistant-panel[\s\S]*resize: both/);
  assert.match(styles, /min-width: 320px/);
  assert.match(layout, /<AssistantFab\s*\/>/);
});

