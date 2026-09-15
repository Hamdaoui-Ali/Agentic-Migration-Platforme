import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

for (const [label, path] of [
  ["Angular", "src/stacks/angular/components/angular-control-tower-page.tsx"],
  ["Java", "src/stacks/java/components/java-cockpit-page.tsx"],
] as const) {
  test(`${label} keeps cancellation in the header and out of sticky actions`, () => {
    const content = readFileSync(path, "utf8");
    const headerLabels = content.match(/>\s*Cancel migration\s*<\/Button>/g) ?? [];
    assert.equal(headerLabels.length, 1);
    assert.doesNotMatch(content, /const cancellationAction/);
  });
}
