# Migration Factory Interaction Iteration 2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add deliberate preflight diagnostics, optional local automation, governed diff correction actions, and a persistent migration assistant to the existing Angular and Java presentation flows without changing stack workflow authority.

**Architecture:** Stack setup pages own diagnostic timing and automation preferences. A shared, presentation-only diagnostics renderer and correction composer receive data and callbacks from the stack owners; they never infer transitions. A global assistant FAB is mounted inside the existing theme/app shell and only exposes contextual conversation UI. Cancellation remains a Java-owned immediate action and is not represented as a pipeline phase or diagnostic check.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4, Node test runner, existing stack scenario engines and shared UI primitives.

**Spec:** `docs/superpowers/specs/2026-08-31-migration-factory-presentation-frontend-design.md` plus `docs/superpowers/specs/2026-09-01-proven-transformer-runtime-design.md` for post-G07 Angular repair display.

## Global Constraints

- Shared UI is presentation-only; never infer next workflow state in shared components.
- Angular and Java have independent domain models/state engines.
- Angular gate order is scenario-policy driven; do not fabricate G08/G09/G12 or a universal route.
- The persisted reference route uses G07 → transformation → G08 → final validation → G11 direct seal, with G10 only when repair is required.
- G12 candidate promotion belongs only to the policy path that selects candidate promotion.
- Java has exactly five PhaseGate types; Java Stage 4 is terminal-special and has no normal PhaseGate.
- Never hardcode Angular 18→21 or an always-full Java route.
- Visible UI must not expose mock/fake/demo/simulation/fixture terminology.
- Preserve revision/evidence history; never overwrite accepted or superseded evidence.
- Angular auto progression is a local presentation preference that calls existing allowed decisions; it is not production auto-approval and never bypasses a stack-owned gate.
- Diagnostics are deterministic local presentation timing, not claims of a real host inspection.
- Every wave must pass scenario tests, lint, typecheck, and production build before its commit.

---

### Task 1: Diagnostics presentation contract and Angular setup preflight

**Files:**
- Create: `src/components/shared/environment-diagnostics.tsx`
- Create: `src/lib/diagnostics.ts`
- Modify: `src/stacks/angular/components/angular-setup-page.tsx`
- Modify: `docs/architecture/source-reference-matrix.md`
- Test: `tests/environment-diagnostics.test.ts`
- Test: `tests/angular-setup.test.ts`

**Interfaces:**
- `src/lib/diagnostics.ts` exports `DiagnosticRunStatus`, `DiagnosticRunState`, `createDiagnosticState`, `advanceDiagnosticState`, and `DIAGNOSTIC_DURATION_MS` (5_000).
- `EnvironmentDiagnostics` accepts `{ checks, state, onRun }` where checks are generic `{ id, label, value, status }` records and state controls the revealed count; it only renders supplied values and callbacks.

- [x] **Step 1: Write the failing tests** for deterministic sequential reveal, five-second duration constant, blocked check color, and Angular setup’s idle state/button label.
- [x] **Step 2: Run `npm test tests/environment-diagnostics.test.ts tests/angular-setup.test.ts` and confirm the new assertions fail because the helper/component contract does not exist.**
- [x] **Step 3: Implement the pure diagnostics state helper and presentation-only renderer.** Use a five-second run split evenly across the supplied check count; the helper must clamp revealed entries and finish with `COMPLETE` only after the final check.
- [x] **Step 4: Replace Angular’s static environment list with the renderer.** Keep the route, project, and source-review content visible; start in `IDLE`, reveal the existing `preview.environment` values one at a time, and block “Review production readiness” until `COMPLETE` unless the existing preflight is already blocked.
- [x] **Step 5: Run focused tests, then `npm run lint`, `npm run typecheck`, and `npm run build`.**
- [x] **Step 6: Update the source-reference matrix with the Angular setup diagnostic projection and commit:** `feat: add staged Angular environment diagnostics`.

### Task 2: Java setup diagnostics and automation preference control

**Files:**
- Modify: `src/stacks/java/components/java-setup-page.tsx`
- Modify: `src/lib/diagnostics.ts`
- Modify: `docs/architecture/source-reference-matrix.md`
- Test: `tests/java-setup.test.ts`

**Interfaces:**
- Reuse `EnvironmentDiagnostics` and `DiagnosticRunState` from Task 1 with Java’s `configuration.environment` values.
- Add `AutomationPreference` (`MANUAL` | `AUTO_APPROVE_ELIGIBLE`) and `read/writeAutomationPreference(stack)` in `src/lib/automation.ts` for a versioned local-storage key.

- [x] **Step 1: Write failing tests** for Java idle diagnostics, five-second run state wiring, and versioned automation preference serialization.
- [x] **Step 2: Run `npm test tests/java-setup.test.ts` and verify the new tests fail.**
- [x] **Step 3: Implement the preference helper with safe browser guards and no domain-model mutation.** Invalid or absent storage values must resolve to `MANUAL`.
- [x] **Step 4: Add the Java “Run environment diagnosis” interaction.** Render Java 11/17/21, Maven, AI provider, and Azure integration checks sequentially; the create button remains disabled until diagnostics complete or configuration is blocked.
- [x] **Step 5: Add a clearly scoped “Automation preference” control with Manual approvals selected by default and Auto-approve eligible gates as the opt-in choice.** Explain that only decisions already allowed by Java’s own PhaseGate set may be progressed automatically.
- [x] **Step 6: Run focused tests, lint, typecheck, and build; update the source-reference matrix and commit:** `feat: add Java preflight diagnostics and automation preference`.

### Task 3: Stack-owned automation runner for eligible gates

**Files:**
- Modify: `src/stacks/angular/components/angular-control-tower-page.tsx`
- Modify: `src/stacks/java/components/java-cockpit-page.tsx`
- Modify: `src/lib/automation.ts`
- Test: `tests/presentation-automation.test.ts`

**Interfaces:**
- `automation.ts` exports `isAutomationEnabled(stack)` and the versioned preference helpers; no shared component reads gates.
- Each control page owns a guarded effect/ref that invokes its existing `handleDecision`/`decide` callback only when the current gate is pending and its allowed decision set contains the stack’s safe progression decision.

- [x] **Step 1: Write failing tests** proving manual preference leaves gates pending, Angular auto mode uses only an allowed stage/pre-transform approval, Java auto mode uses only `CONTINUE`/`APPROVE` when available, and rejected/override decisions are never fabricated.
- [x] **Step 2: Run `npm test tests/presentation-automation.test.ts` and verify failure.**
- [x] **Step 3: Implement guarded automation in each stack owner.** Read the persisted preference after hydration, debounce duplicate calls with a ref, stop at human boundaries with no allowed safe action, and persist every resulting scenario state through the existing store functions.
- [x] **Step 4: Surface the selected preference in the workspace header/current-action context without changing the shared shell’s transition logic.**
- [x] **Step 5: Run focused tests, lint, typecheck, and build.**
- [x] **Step 6: Update the source-reference matrix and commit:** `feat: progress eligible gates with explicit automation mode`.

### Task 4: Governed diff correction composer for Angular and Java

**Files:**
- Create: `src/components/shared/correction-composer.tsx`
- Modify: `src/stacks/angular/components/angular-repair-workspace.tsx`
- Modify: `src/stacks/angular/components/angular-control-tower-page.tsx`
- Modify: `src/stacks/java/components/java-repair-workspace.tsx`
- Modify: `src/stacks/java/components/java-cockpit-page.tsx`
- Modify: `docs/architecture/source-reference-matrix.md`
- Test: `tests/repair-correction-actions.test.ts`

**Interfaces:**
- `CorrectionComposer` accepts `title`, `description`, `value`, `onChange`, `onAcceptApply`, `onRequestModification`, `onSubmitCorrection`, and per-action disabled/label props. It is presentational and never imports a workflow module.
- Angular owner maps “Accept and apply” to the current allowed G10 `APPROVE`, “Request modification” to `REQUEST_MODIFICATION`, and typed correction submission to `REQUEST_MODIFICATION` with the entered correction as comment.
- Java owner maps “Accept and apply” to `repair_review` `CONTINUE`, “Request modification” and typed correction to `REVISE`, preserving attempt history.

- [x] **Step 1: Write failing tests** for action labels, disabled states outside the active repair boundary, and stack-specific callback mapping.
- [x] **Step 2: Run `npm test tests/repair-correction-actions.test.ts` and verify failure.**
- [x] **Step 3: Implement the shared composer with an accessible textarea, explicit action labels, and no implied state transitions.**
- [x] **Step 4: Wire Angular’s active reviewed attempt to the composer and pass the existing stage-decision callback from the control tower.** Do not mutate the diff or evidence in the component.
- [x] **Step 5: Wire Java’s active current-stage repair attempt to the composer and pass the existing `decide` callback from the cockpit.** Keep Stage 4 target-version/POM repair on its existing terminal-special path; do not create a `repair_review` gate there.
- [x] **Step 6: Run focused tests, lint, typecheck, and build; update the source-reference matrix and commit:** `feat: add governed diff correction actions`.

### Task 5: Persistent migration assistant FAB

**Files:**
- Create: `src/components/shared/assistant-fab.tsx`
- Modify: `src/app/layout.tsx`
- Modify: `src/app/globals.css`
- Test: `tests/assistant-fab.test.ts`

**Interfaces:**
- `AssistantFab` is a client component mounted once inside `ThemeProvider`; it accepts no workflow state, derives a short context label from `usePathname`, and exposes `aria-label="Open migration assistant"`.

- [x] **Step 1: Write failing tests** for global mount, collapsed FAB label, open panel, input submission, and route-context copy.
- [x] **Step 2: Run `npm test tests/assistant-fab.test.ts` and verify failure.**
- [x] **Step 3: Implement the fixed bottom-right assistant button and compact dialog/panel.** Submitted messages append locally and receive a transparent contextual response about route, evidence, logs, or gates; no assistant action changes workflow state.
- [x] **Step 4: Add responsive CSS so the FAB clears sticky actions/console surfaces on mobile, respects reduced motion, and remains keyboard reachable.**
- [x] **Step 5: Run focused tests, lint, typecheck, and build.**
- [x] **Step 6: Update the source-reference matrix and commit:** `feat: add persistent migration assistant surface`.

### Task 6: Cancellation projection cleanup and final hardening

**Files:**
- Modify: `src/stacks/java/components/java-cockpit-page.tsx`
- Modify: `src/stacks/angular/components/angular-presentation.ts`
- Modify: `src/stacks/java/components/java-presentation.ts`
- Modify: `src/components/shared/journey-ribbon.tsx`
- Modify: `src/components/shared/observatory.tsx`
- Modify: `docs/architecture/source-reference-matrix.md`
- Test: `tests/cancellation-projection.test.ts`

**Interfaces:**
- Cancellation remains exposed as one immediate Java shell action that calls `cancelJavaMigration`; no journey/phase/diagnostic entry named Cancellation is introduced.
- Existing cancellation audit evidence remains append-only and visible in evidence/observatory surfaces.

- [x] **Step 1: Write failing tests** proving cancellation is absent from pipeline/journey/check projections while the immediate action and audit evidence remain available.
- [x] **Step 2: Run `npm test tests/cancellation-projection.test.ts` and verify failure.**
- [x] **Step 3: Remove any cancellation-as-check copy discovered in the presentation projections; keep the confirmed action dialog and Java-owned cancellation state transition.**
- [x] **Step 4: Run the complete test suite, lint, typecheck, and production build.**
- [x] **Step 5: Update the source-reference matrix and commit:** `fix: keep cancellation as an immediate action only`.

### Task 7: Rendered QA and integration handoff

**Files:**
- Create: `docs/superpowers/reports/2026-09-13-migration-factory-iteration-2-qa.md`
- Modify: `docs/architecture/source-reference-matrix.md`

- [x] **Step 1: Run `npm run check` on the feature worktree and record test count, lint, typecheck, and build output.**
- [x] **Step 2: Start the production app, verify Angular setup → run diagnosis → sequential green/red rows → readiness review, Java setup → diagnosis → automation preference, and at least one diff action path.**
- [x] **Step 3: Capture desktop and mobile screenshots outside the repository; inspect the accepted visual reference and latest screenshot with `view_image`, recording at least five comparison points.**
- [x] **Step 4: Record Browser plugin absence and the Playwright fallback reason in the QA report; include page identity, no-overlay, console, screenshot, and interaction evidence.**
- [x] **Step 5: Commit the QA report:** `docs: record iteration two rendered QA`.
