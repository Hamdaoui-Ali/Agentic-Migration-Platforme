# Agent Review Surfaces and Quick Angular Route Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rework the agent output surfaces, source-grounded repair review, cancellation placement, and presentation seed so the Angular path demonstrates a governed 18 → 21 migration with an authentic 18 → 19 repair choice.

**Architecture:** Keep shared components presentational. Angular owns source profiles, repair provenance, review-input lineage, stage failure routing, and G10 decisions; Java keeps its existing independent `repair_review` owner and terminal-special Stage 4 behavior. The pipeline layout becomes a single primary evidence column with route/stage context below the agent outputs, while the app shell keeps cancellation only in each workspace header.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind-style utility classes, Node’s built-in test runner, ESLint, and the existing local-storage presentation stores.

**Spec:** `docs/superpowers/specs/2026-09-15-agent-review-and-quick-route-design.md`

## Global Constraints

- Shared UI is presentation-only and never infers next workflow state.
- Angular and Java have independent domain models/state engines.
- Angular gate order is scenario-policy driven; G08 remains a real boundary only when required.
- The persisted Angular route remains G07 → transformation → G08 → final validation → G11 direct seal, with G10 only for repair.
- G12 candidate promotion appears only on the policy path that selects candidate promotion.
- Java has exactly five PhaseGate types; there is no `assessment_review`.
- Java Stage 4 is terminal-special and has no normal PhaseGate.
- Never hardcode Angular 18 → 21 or an always-full Java route in shared UI.
- Preserve accepted, superseded, and historical evidence/revision history.
- Visible product copy must not expose mock, fake, demo, simulation, or fixture terminology.
- Read the repository’s `AGENTS.md`, the two required migration specs, the source-reference matrix, and the relevant Next.js guides before implementation.
- Every wave ends with focused scenario tests, lint, typecheck, and build; the final wave also runs `npm run check`.

---

## File map and boundaries

- `src/components/shared/correction-composer.tsx` owns only the reusable three-choice review controls and input affordance.
- `src/stacks/angular/domain/types.ts` and `src/stacks/angular/domain/run-types.ts` own Angular source-profile and repair-review types.
- `src/stacks/angular/domain/demo-source.ts` owns the two presentation source profiles and the Angular Movies commit reference.
- `src/stacks/angular/workflow/setup.ts` and `src/stacks/angular/workflow/run.ts` project source identity into preflight/run analysis without changing gate authority.
- `src/stacks/angular/workflow/proven.ts` owns stage-specific repair failure/review proposals and the G10 request-modification lineage.
- `src/stacks/angular/scenarios/seeds.ts` owns deterministic quick, legacy, recovery, and completed presentation scenarios.
- `src/stacks/angular/components/angular-pipeline.tsx` and `src/stacks/java/components/java-pipeline.tsx` own the stack-specific evidence layout.
- `src/stacks/angular/components/angular-repair-workspace.tsx` and `src/stacks/java/components/java-repair-workspace.tsx` compose diff provenance and review controls.
- `src/stacks/angular/components/angular-control-tower-page.tsx` and `src/stacks/java/components/java-cockpit-page.tsx` remain workflow owners and keep cancellation in the header only.
- `src/stacks/angular/components/angular-setup-page.tsx`, `src/data/recent-migrations.ts`, and `src/app/page.tsx` present the 18 → 21 launch path while retaining editable dynamic setup.
- `docs/architecture/source-reference-matrix.md` records the new source-backed presentation reference.
- Tests are source/behavior tests using the existing Node test runner; no new UI test framework is introduced.

---

### Task 1: Add failing contracts for the review controls and single cancellation placement

**Files:**
- Modify: `tests/repair-correction-actions.test.ts`
- Create: `tests/agent-review-ui.test.ts`
- Create: `tests/cancellation-placement.test.ts`

**Interfaces:**
- Consumes: current shared composer and workspace-owner source.
- Produces: red tests that pin the requested labels, input gating, full-width layout marker, and header-only cancellation contract for Tasks 2 and 4.

- [ ] **Step 1: Add the failing correction-control assertions**

In `tests/repair-correction-actions.test.ts`, assert the composer source contains `Accept change`, `Ask AI again`, and `Use manual override`; assert the two input-dependent buttons use `hasCorrection` in their disabled condition; assert Angular and Java repair workspaces still pass all three callbacks.

- [ ] **Step 2: Add the failing layout/cancellation source assertions**

In `tests/agent-review-ui.test.ts`, read both pipeline files and assert they expose an `agent-output` layout marker for Analysis and Planning and do not use a desktop two-column root that reserves a narrow right rail for agent output. In `tests/cancellation-placement.test.ts`, read both workspace owner files, assert `Cancel migration` remains in the header markup, assert the shell action array no longer contains a cancellation action, and assert each owner contains one exact `Cancel migration` label.

- [ ] **Step 3: Run the focused tests and verify the expected red state**

Run:

```powershell
npm test -- tests/repair-correction-actions.test.ts tests/agent-review-ui.test.ts tests/cancellation-placement.test.ts
```

Expected: failures identify the old composer labels, the two-column pipeline roots, and the sticky cancellation action. Do not change production code before observing these failures.

- [ ] **Step 4: Commit the red contract tests**

```powershell
git add tests/repair-correction-actions.test.ts tests/agent-review-ui.test.ts tests/cancellation-placement.test.ts
git commit -m "test: specify agent review layout and action controls"
```

### Task 2: Implement shared review controls and remove sticky cancellation duplicates

**Files:**
- Modify: `src/components/shared/correction-composer.tsx`
- Modify: `src/stacks/angular/components/angular-control-tower-page.tsx`
- Modify: `src/stacks/java/components/java-cockpit-page.tsx`
- Test: `tests/repair-correction-actions.test.ts`, `tests/cancellation-placement.test.ts`

**Interfaces:**
- Consumes: existing callback props `onAcceptApply`, `onRequestModification`, and `onSubmitCorrection`.
- Produces: a shared composer that keeps workflow decisions in its callbacks, plus owners that pass only gate actions to `AppShell` while retaining their header cancel button/dialog.

- [ ] **Step 1: Run the Task 1 failing control tests as the red checkpoint**

Run:

```powershell
npm test -- tests/repair-correction-actions.test.ts tests/cancellation-placement.test.ts
```

Expected: the label and sticky-cancel assertions fail against the current implementation.

- [ ] **Step 2: Update the shared composer copy and input gating**

In `correction-composer.tsx`:

```tsx
<Button onClick={onAcceptApply} disabled={disabled || !onAcceptApply}>
  Accept change
</Button>
<Button
  variant="secondary"
  onClick={() => onRequestModification?.(correction.trim())}
  disabled={disabled || !hasCorrection || !onRequestModification}
>
  Ask AI again
</Button>
<Button
  variant="secondary"
  onClick={() => onSubmitCorrection?.(correction.trim())}
  disabled={disabled || !hasCorrection || !onSubmitCorrection}
>
  Use manual override
</Button>
```

Change the description/placeholder to explain that the input is either an AI hint or a bounded patch, and keep the statement that the displayed diff remains immutable. Do not import Angular or Java workflow code into this component.

- [ ] **Step 3: Remove cancellation from both shell action arrays**

In each workspace owner, delete the `cancellationAction` entries and their spreads from `shellActions`. Leave the existing header `<Button>Cancel migration</Button>` and cancellation dialog wired to the stack-owned `cancel*Migration` function. Gate actions, terminal actions, and Java’s existing PhaseGate decisions remain unchanged.

- [ ] **Step 4: Run the focused tests and verify green**

Run:

```powershell
npm test -- tests/repair-correction-actions.test.ts tests/cancellation-placement.test.ts
```

Expected: PASS, with one header cancellation label per workspace and no sticky cancellation source.

- [ ] **Step 5: Commit the shared-control change**

```powershell
git add src/components/shared/correction-composer.tsx src/stacks/angular/components/angular-control-tower-page.tsx src/stacks/java/components/java-cockpit-page.tsx tests/repair-correction-actions.test.ts tests/cancellation-placement.test.ts
git commit -m "feat: clarify repair choices and keep cancel in header"
```

### Task 3: Add source identity and the computed Angular 18 → 21 presentation seed

**Files:**
- Modify: `src/stacks/angular/domain/types.ts`
- Modify: `src/stacks/angular/domain/run-types.ts`
- Modify: `src/stacks/angular/domain/demo-source.ts`
- Modify: `src/stacks/angular/workflow/setup.ts`
- Modify: `src/stacks/angular/workflow/run.ts`
- Modify: `src/stacks/angular/scenarios/seeds.ts`
- Modify: `src/stacks/angular/components/angular-setup-page.tsx`
- Modify: `src/data/recent-migrations.ts`
- Modify: `src/app/page.tsx`
- Create: `tests/angular-quick-route.test.ts`
- Modify: `tests/angular-repair-demo-seed.test.ts`, `tests/presenter-flows.test.ts`, `tests/angular-recovery.test.ts`

**Interfaces:**
- Produces `AngularSourceProfileId = "ANGULAR11_CRUD" | "ANGULAR_MOVIES" | "GENERIC"` on preflight/run identity.
- Produces a source-backed Angular Movies profile using parent commit `794e45e00cc2e0935b1a48a372b9a34779f016cb` and target commit `a002daf3e4ce107f3ef4cd99259e730438f5d1a3`.
- Keeps `computeAngularRoute(sourceMajor, targetMajor)` as the only route builder.

- [ ] **Step 1: Write the failing quick-route behavior test**

Create `tests/angular-quick-route.test.ts`:

```ts
test("quick Angular action scenario opens the first source-grounded 18 to 19 repair", () => {
  const run = seedAngularRun("run-angular-action");
  assert.equal(run.sourceMajor, 18);
  assert.equal(run.targetMajor, 21);
  assert.deepEqual(run.route.map(({ source, target }) => [source, target]), [[18, 19], [19, 20], [20, 21]]);
  assert.equal(run.stageExecution?.source, 18);
  assert.equal(run.stageExecution?.target, 19);
  assert.equal(run.currentGate, "G10");
  assert.equal(run.analysis.applicationProfile?.repository, "tastejs/angular-movies");
});
```

Add a second test asserting `seedAngularRun("run-angular-recovery")` retains the existing 20 → 21 recovery fixture behavior so recovery tests do not silently change meaning when the presentation action seed changes.

- [ ] **Step 2: Run the new test and confirm it fails**

Run:

```powershell
npm test -- tests/angular-quick-route.test.ts
```

Expected: the current action seed reports Angular 11 → 21 and has no Angular Movies profile.

- [ ] **Step 3: Add explicit source-profile metadata**

Add the profile ID to `AngularPreflight` and `AngularRunSeed`, carry it through `createRunFromApprovedPreflight`, and define `ANGULAR_MOVIES_SOURCE` in `demo-source.ts` with the real repository, parent/target revisions, Angular 18 package versions, application name, path, routes, architecture, and tooling values read from the source snapshot. Keep `ANGULAR11_CRUD_SOURCE` unchanged.

Update `prepareAngularPreflight` to recognize `/workspace/angular-movies` with source major 18 as `ANGULAR_MOVIES`; keep the generic fallback for arbitrary user-selected paths. Update completed analysis creation to accept the profile ID and select the corresponding profile/facts/findings without changing the gate sequence.

- [ ] **Step 4: Re-seed only the presentation action path**

Add explicit seed helpers for the Angular Movies 18 → 21 action path and the prior Angular 11 CRUD 20 → 21 repair/recovery path. Make `run-angular-action` use `computeAngularRoute(18, 21)`, complete G02–G06, approve G07, and stop when the 18 → 19 repair review opens. Give recovery tests and any legacy reference links their distinct seed ID. Keep `run-angular-complete` legacy-compatible unless a test proves it is the presentation default.

Change setup defaults, Angular landing metadata, and the action recent-migration row to “Angular Movies” / “Angular 18 → 21”. Keep the setup selectors editable and route preview computed from the selected source/target. Do not add a fixed route list to shared components.

- [ ] **Step 5: Update affected expectations and run the focused tests**

Update `angular-repair-demo-seed.test.ts`, `presenter-flows.test.ts`, and `angular-recovery.test.ts` to name the new quick action seed or the preserved recovery seed explicitly. Run:

```powershell
npm test -- tests/angular-quick-route.test.ts tests/angular-repair-demo-seed.test.ts tests/presenter-flows.test.ts tests/angular-recovery.test.ts tests/angular-setup.test.ts
```

Expected: PASS, with the action scenario at 18 → 19 and recovery assertions still at 20 → 21.

- [ ] **Step 6: Commit the source-profile and seed change**

```powershell
git add src/stacks/angular/domain/types.ts src/stacks/angular/domain/run-types.ts src/stacks/angular/domain/demo-source.ts src/stacks/angular/workflow/setup.ts src/stacks/angular/workflow/run.ts src/stacks/angular/scenarios/seeds.ts src/stacks/angular/components/angular-setup-page.tsx src/data/recent-migrations.ts src/app/page.tsx tests/angular-quick-route.test.ts tests/angular-repair-demo-seed.test.ts tests/presenter-flows.test.ts tests/angular-recovery.test.ts
git commit -m "feat: seed Angular Movies 18 to 21 presentation route"
```

### Task 4: Implement source-grounded 18 → 19 repair lineage and three review intents

**Files:**
- Modify: `src/stacks/angular/domain/run-types.ts`
- Modify: `src/stacks/angular/domain/demo-source.ts`
- Modify: `src/stacks/angular/workflow/proven.ts`
- Modify: `src/stacks/angular/components/angular-repair-workspace.tsx`
- Modify: `src/stacks/angular/components/angular-control-tower-page.tsx`
- Modify: `src/stacks/java/components/java-repair-workspace.tsx`
- Modify: `src/stacks/java/components/java-cockpit-page.tsx`
- Create: `tests/angular-repair-review-input.test.ts`
- Modify: `tests/angular-repair-git-diff-ui.test.ts`, `tests/repair-correction-actions.test.ts`

**Interfaces:**
- Add `AngularRepairSourceReference` with `repository`, `sourceCommit`, `targetCommit`, `path`, `sourceUrl`, and `compareUrl`.
- Add `AngularRepairReviewInput = { mode: "AI_HINT" | "MANUAL_OVERRIDE"; text: string }`.
- Extend `AngularRepairAttempt` with optional `sourceReference` and `reviewInput` fields.
- Extend `applyAngularStageGateDecision` with an optional final `reviewInput` parameter, preserving existing callers:

```ts
applyAngularStageGateDecision(
  run,
  gateId,
  decision,
  comment,
  now,
  runtimeStartedAtMs,
  reviewInput?: AngularRepairReviewInput,
): AngularRunModel
```

- [ ] **Step 1: Write the failing lineage/provenance test**

Create `tests/angular-repair-review-input.test.ts` with these behaviors:

```ts
test("Angular Movies repair carries source commits and the exact SSR import patch", () => {
  const run = seedAngularRun("run-angular-action");
  const attempt = run.stageExecution?.repairAttempts.at(-1);
  assert.equal(attempt?.sourceReference?.repository, "tastejs/angular-movies");
  assert.equal(attempt?.sourceReference?.sourceCommit, "794e45e00cc2e0935b1a48a372b9a34779f016cb");
  assert.equal(attempt?.sourceReference?.targetCommit, "a002daf3e4ce107f3ef4cd99259e730438f5d1a3");
  assert.match(attempt?.diff ?? "", /CommonEngine/);
  assert.match(attempt?.diff ?? "", /@angular\/ssr\/node/);
});

test("G10 AI hint creates a child source-grounded revision without mutating the parent", () => {
  const run = seedAngularRun("run-angular-action");
  const parent = run.stageExecution!.repairAttempts.at(-1)!;
  const next = applyAngularStageGateDecision(
    run,
    "G10",
    "REQUEST_MODIFICATION",
    "Prefer the Angular 19 SSR node entrypoint.",
    "2026-09-15T12:00:00.000Z",
    Date.parse("2026-09-15T12:00:00.000Z"),
    { mode: "AI_HINT", text: "Prefer the Angular 19 SSR node entrypoint." },
  );
  const child = next.stageExecution!.repairAttempts.at(-1)!;
  assert.equal(parent.id, child.parentAttemptId);
  assert.equal(parent.reviewInput, undefined);
  assert.deepEqual(child.reviewInput, { mode: "AI_HINT", text: "Prefer the Angular 19 SSR node entrypoint." });
  assert.match(child.diff, /@angular\/ssr\/node/);
});

test("G10 manual override is recorded as a child review input", () => {
  const run = seedAngularRun("run-angular-action");
  const parent = run.stageExecution!.repairAttempts.at(-1)!;
  const next = applyAngularStageGateDecision(
    run,
    "G10",
    "REQUEST_MODIFICATION",
    "Manual correction supplied by operator.",
    "2026-09-15T12:00:00.000Z",
    Date.parse("2026-09-15T12:00:00.000Z"),
    { mode: "MANUAL_OVERRIDE", text: "diff --git a/projects/movies/server.ts b/projects/movies/server.ts" },
  );
  const child = next.stageExecution!.repairAttempts.at(-1)!;
  assert.equal(child.parentAttemptId, parent.id);
  assert.equal(child.reviewInput?.mode, "MANUAL_OVERRIDE");
  assert.equal(next.stageExecution!.repairAttempts[0]?.diff, parent.diff);
});
```

- [ ] **Step 2: Run the new test and verify it fails for missing source metadata/lineage**

Run:

```powershell
npm test -- tests/angular-repair-review-input.test.ts
```

Expected: failures show the current 18 → 19 stage has no repair family and the current request-modification path creates an unrelated placeholder diff without input lineage.

- [ ] **Step 3: Add immutable provenance and exact patch constants**

In `demo-source.ts`, define the Angular Movies repair reference and exact unified patch:

```ts
export const ANGULAR_MOVIES_NG19_REPAIR = {
  sourceCommit: "794e45e00cc2e0935b1a48a372b9a34779f016cb",
  targetCommit: "a002daf3e4ce107f3ef4cd99259e730438f5d1a3",
  repository: "tastejs/angular-movies",
  path: "projects/movies/server.ts",
  sourceUrl: "https://github.com/tastejs/angular-movies/commit/a002daf3e4ce107f3ef4cd99259e730438f5d1a3",
  compareUrl: "https://github.com/tastejs/angular-movies/compare/794e45e00cc2e0935b1a48a372b9a34779f016cb...a002daf3e4ce107f3ef4cd99259e730438f5d1a3",
} as const;
```

Use the exact `CommonEngine` import change from that commit; do not invent a new file or placeholder expectation diff.

- [ ] **Step 4: Add stage-specific 18 → 19 repair routing**

In `proven.ts`, add `sourceBackedRepairAttempts18To19` and its reviewing projection. Include only the matching `stage.source === 18 && stage.target === 19` case in the repair-failure predicate and review selector alongside the existing 15 → 16 and 20 → 21 cases. The failure evidence must say SSR entrypoint/import compatibility and carry the source reference. Other stages keep their current pass/repair behavior.

- [ ] **Step 5: Replace the placeholder request-modification child with a source-grounded child**

When G10 receives `REQUEST_MODIFICATION`, preserve the current attempt object unchanged, create a new child with `parentAttemptId`, the selected `reviewInput`, the same stage-specific source reference, the same exact source-grounded diff unless the manual text is itself a bounded unified patch, and `reviewerVerdict: "NOT_REVIEWED"`. If a manual input is a full unified patch, display it as the child candidate while leaving the parent source reference and history intact; the owning gate still requires human review before apply. Never create `src/app/order.service.spec.ts` or another unrelated placeholder diff.

- [ ] **Step 6: Connect the two composer choices to typed Angular review inputs**

In `angular-control-tower-page.tsx`, pass `{ mode: "AI_HINT", text: hint }` for `onRequestModification` and `{ mode: "MANUAL_OVERRIDE", text: correction }` for `onSubmitCorrection` to `handleStageDecision`, then pass the optional value to `applyAngularStageGateDecision`. Keep Accept mapped to G10 `APPROVE` only.

In both repair workspaces, show source repository/commit/path/link metadata when `attempt.sourceReference` exists, label the active patch `Source-grounded patch` or `Manual override candidate` as appropriate, and keep `GitDiffView` as the renderer. Java’s callback mapping remains its existing `repair_review` `CONTINUE`/`REVISE` contract; the shared composer does not add Java gates.

- [ ] **Step 7: Run focused tests and verify green**

Run:

```powershell
npm test -- tests/angular-repair-review-input.test.ts tests/angular-repair-git-diff-ui.test.ts tests/repair-correction-actions.test.ts tests/angular-repair-live-flow.test.ts tests/angular-repair-reference.test.ts
```

Expected: PASS; the active action seed is source-grounded at 18 → 19, parent attempts remain unchanged, and all three controls still map to stack owners.

- [ ] **Step 8: Commit the repair-review implementation**

```powershell
git add src/stacks/angular/domain/run-types.ts src/stacks/angular/domain/demo-source.ts src/stacks/angular/workflow/proven.ts src/stacks/angular/components/angular-repair-workspace.tsx src/stacks/angular/components/angular-control-tower-page.tsx src/stacks/java/components/java-repair-workspace.tsx src/stacks/java/components/java-cockpit-page.tsx tests/angular-repair-review-input.test.ts tests/angular-repair-git-diff-ui.test.ts tests/repair-correction-actions.test.ts
git commit -m "feat: ground Angular repair review in source history"
```

### Task 5: Recompose Angular and Java pipeline evidence to use the full workspace

**Files:**
- Modify: `src/stacks/angular/components/angular-pipeline.tsx`
- Modify: `src/stacks/java/components/java-pipeline.tsx`
- Modify: `tests/agent-review-ui.test.ts`

**Interfaces:**
- Consumes: existing run/job state and existing `PhaseDisclosure`, `Panel`, `Timeline`, and `JavaRouteBoard` presentation primitives.
- Produces: full-width Analysis Agent and Planning Agent output with route/stage context demoted below or into a secondary context row; no state transitions.

- [ ] **Step 1: Run the layout contract tests as the red checkpoint**

Run:

```powershell
npm test -- tests/agent-review-ui.test.ts
```

Expected: the current `xl:grid-cols-[...]` roots fail the full-width assertions.

- [ ] **Step 2: Make Angular pipeline a single evidence column**

Replace the root two-column grid with `div className="space-y-6"`. Keep the pre-transformation panel, G04, G05, and G06 disclosures in their existing state order. Remove the nested `Panel` around G04 and G06 where it creates a card inside a card; use a full-width evidence surface inside each disclosure, with the existing model cards, facts/findings, deterministic plan, route, and policy lists intact. Add `data-agent-output="analysis"` and `data-agent-output="planning"` to the corresponding disclosure content wrappers for stable tests. Move the route `Panel` after the planning disclosure and give it the full available width, retaining the dynamic `run.route.map` timeline.

- [ ] **Step 3: Make Java pipeline agent output primary and route context secondary**

Replace the root `xl:grid-cols-[minmax(0,1.25fr)_minmax(360px,.75fr)]` with a single `space-y-6` wrapper. Keep Execution phases, Analysis Agent, Planning Agent, and Assessment in the main flow. Remove nested agent `Panel` wrappers that make the output look like a small card; preserve each revision’s model cards, facts, risks, route plan, execution units, validation targets, constraints, rationale, and reviewer notes. Add `data-agent-output="analysis"` and `data-agent-output="planning"` to the agent detail wrappers. Place the Spring Boot stage route and PhaseGate history context below the agent sections in a responsive `grid gap-6 xl:grid-cols-2`, without adding or renaming any Java gate.

- [ ] **Step 4: Verify the layout contract**

Run:

```powershell
npm test -- tests/agent-review-ui.test.ts tests/java-presentation.test.ts tests/angular-presentation.test.ts
```

Expected: PASS; source assertions confirm both agent sections are full-width and the route context remains dynamic/stack-specific.

- [ ] **Step 5: Commit the evidence-layout change**

```powershell
git add src/stacks/angular/components/angular-pipeline.tsx src/stacks/java/components/java-pipeline.tsx tests/agent-review-ui.test.ts
git commit -m "feat: give agent evidence the full workspace"
```

### Task 6: Update the source-reference matrix and run complete verification

**Files:**
- Modify: `docs/architecture/source-reference-matrix.md`
- Test: all existing tests through `npm run check`

**Interfaces:**
- Consumes: completed source/profile/workflow/layout changes.
- Produces: documentation evidence for the Angular Movies source-grounded presentation case and a verified build artifact.

- [ ] **Step 1: Update the architecture matrix**

Add the Angular Movies repository, parent/target commit pair, `projects/movies/server.ts` SSR import correction, and the new full-width/three-choice presentation behavior under the Angular presentation source and repair sections. State explicitly that the public commit supplies application/diff evidence while Angular workflow authority remains the current proven-transformer contract. Do not change Java gate rows.

- [ ] **Step 2: Run focused scenario and UI tests**

Run:

```powershell
npm test -- tests/angular-quick-route.test.ts tests/angular-repair-review-input.test.ts tests/agent-review-ui.test.ts tests/repair-correction-actions.test.ts tests/cancellation-placement.test.ts tests/angular-repair-demo-seed.test.ts tests/presenter-flows.test.ts tests/angular-recovery.test.ts
```

Expected: exit code 0 and no failed tests.

- [ ] **Step 3: Run lint, typecheck, and build**

Run each command separately and read its exit code:

```powershell
npm run lint
npm run typecheck
npm run build
```

Expected: all three exit 0.

- [ ] **Step 4: Smoke-test the browser path**

Use the existing local app at `http://localhost:3000/angular/migrations/run-angular-action`. Inspect at desktop width and a narrow viewport:

- page header shows Angular 18 → 21 and exactly one visible Cancel migration control;
- pipeline Analysis Agent and Planning Agent use the workspace width;
- G10 shows the source-grounded `projects/movies/server.ts` diff, source/target commits, and source link;
- Accept change is enabled without review text;
- Ask AI again and Use manual override remain disabled until text is entered;
- entering a hint/manual patch preserves the original attempt and shows a child review revision.

Keep the preview open after inspection.

- [ ] **Step 5: Run the full project check**

```powershell
npm run check
```

Expected: the existing test suite, lint, typecheck, and production build all pass.

- [ ] **Step 6: Commit documentation and verification-ready state**

```powershell
git add docs/architecture/source-reference-matrix.md
git commit -m "docs: record Angular Movies repair provenance"
```

Before claiming completion, run `git status --short` and inspect `git diff HEAD~N` for unintended changes. Do not include the user’s pre-existing `AGENTS.md` modification in any commit.

---

## Plan self-review

- **Spec coverage:** agent output width is Task 5; source-grounded diff and three choices are Task 4; cancellation is Task 2; 18 → 21 dynamic route/defaults are Task 3; matrix documentation and verification are Task 6; Angular/Java invariants are repeated in the global constraints and task boundaries.
- **Placeholder scan:** no implementation step is left as TBD/TODO or “write tests later”; each task includes exact paths, test names, expected red/green behavior, and commit scope.
- **Type consistency:** `AngularSourceProfileId`, `AngularRepairSourceReference`, `AngularRepairReviewInput`, and the extended `applyAngularStageGateDecision` signature are introduced before their consumers. Java continues using its existing `repair_review` callback contract.
- **Scope check:** the work is one cohesive presentation/review feature with independent stack-owned implementations, not a shared workflow rewrite.
