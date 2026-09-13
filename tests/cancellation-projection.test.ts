import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { JAVA_PIPELINE_PHASES } from "../src/stacks/java/domain/run-types.ts";

function source(path: string): string {
  return readFileSync(new URL(path, import.meta.url), "utf8");
}

test("cancellation stays an operator action, never a Java workflow phase", () => {
  assert.equal(JAVA_PIPELINE_PHASES.includes("CANCELLATION" as never), false);

  const pipeline = source("../src/stacks/java/components/java-pipeline.tsx");
  const cockpit = source("../src/stacks/java/components/java-cockpit-page.tsx");
  const evidence = source("../src/stacks/java/components/java-evidence-workspace.tsx");

  assert.match(pipeline, /out-of-band operator action/);
  assert.match(cockpit, /java-cancel/);
  assert.match(cockpit, /cancelJavaMigration/);
  assert.match(evidence, /CANCELLATION/);
});

