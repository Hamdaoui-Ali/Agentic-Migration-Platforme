import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

function source(path: string): string {
  return readFileSync(new URL(path, import.meta.url), "utf8");
}

test("correction composer exposes explicit apply, request, and typed correction actions", () => {
  const composer = source("../src/components/shared/correction-composer.tsx");
  assert.match(composer, /Accept and apply/);
  assert.match(composer, /Request modification/);
  assert.match(composer, /Submit correction for review/);
  assert.match(composer, /Correction to review/);
});

test("Angular repair maps corrections to the governed G10 decision owner", () => {
  const workspace = source("../src/stacks/angular/components/angular-repair-workspace.tsx");
  const control = source("../src/stacks/angular/components/angular-control-tower-page.tsx");
  assert.match(workspace, /CorrectionComposer/);
  assert.match(workspace, /onAcceptApply/);
  assert.match(workspace, /onRequestModification/);
  assert.match(workspace, /onSubmitCorrection/);
  assert.match(control, /G10/);
  assert.match(control, /REQUEST_MODIFICATION/);
});

test("Java repair maps corrections to repair_review without inventing a Stage 4 gate", () => {
  const workspace = source("../src/stacks/java/components/java-repair-workspace.tsx");
  const control = source("../src/stacks/java/components/java-cockpit-page.tsx");
  assert.match(workspace, /CorrectionComposer/);
  assert.match(workspace, /onAcceptApply/);
  assert.match(workspace, /onRequestModification/);
  assert.match(workspace, /onSubmitCorrection/);
  assert.match(control, /repair_review/);
  assert.match(control, /CONTINUE/);
  assert.match(control, /REVISE/);
});
