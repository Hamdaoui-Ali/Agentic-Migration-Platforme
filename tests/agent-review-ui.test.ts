import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

function source(path: string): string {
  return readFileSync(path, "utf8");
}

for (const [label, path] of [
  ["Angular", "src/stacks/angular/components/angular-pipeline.tsx"],
  ["Java", "src/stacks/java/components/java-pipeline.tsx"],
] as const) {
  test(`${label} agent evidence declares full-width analysis and planning surfaces`, () => {
    const content = source(path);
    assert.match(content, /data-agent-output="analysis"/);
    assert.match(content, /data-agent-output="planning"/);
    assert.doesNotMatch(content, /grid gap-6 xl:grid-cols-\[minmax\(0,1fr\)_minmax\(380px/);
    assert.doesNotMatch(content, /grid gap-6 xl:grid-cols-\[minmax\(0,1\.25fr\)_minmax\(360px/);
  });
}
