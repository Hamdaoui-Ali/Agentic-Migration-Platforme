# Migration Factory UI Revamp Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the approved Focus + Observatory redesign across the Migration Factory landing page, Angular workspace, Java workspace, setup flows, and shared presentation primitives without changing workflow authority.

**Architecture:** Add a semantic theme foundation and a presentation-only application shell. Stack pages continue to own state, allowed actions, route semantics, evidence history, and live execution; they adapt those values into shared shell slots such as the journey ribbon, observatory, console, and sticky action bar. Use CSS custom properties for light/dark themes and keep browser-only preference behavior in narrowly scoped Client Components.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4, CSS custom properties, `lucide-react` for icons, Node test runner, ESLint, TypeScript compiler, production Next build.

**Spec:** `docs/superpowers/specs/2026-09-13-migration-factory-ui-revamp-design.md`

## Global Constraints

- Shared UI is presentation-only and never infers the next workflow state.
- Angular and Java have independent domain models/state engines.
- Angular gate order is scenario-policy driven; G08 is a real review boundary when required.
- The persisted reference route uses G07 → transformation → G08 → final validation → G11 direct seal, with G10 only when repair is required.
- G12 candidate promotion appears only on the policy path that selects candidate promotion.
- Java has exactly five PhaseGate types; there is no `assessment_review`.
- Java Stage 4 is terminal-special and has no normal PhaseGate.
- Never hardcode Angular 18→21 or an always-full Java route.
- Visible UI must not expose mock/fake/demo/simulation/fixture terminology.
- Preserve revision/evidence history; do not overwrite accepted/superseded evidence.
- Current stack data has no email or notification records; render a truthful empty communications state instead of inventing records.
- Every task ends with its focused tests and a commit; final verification runs scenario tests, lint, typecheck, build, and route smoke checks.

## File map

### Create

- `src/components/shared/theme-provider.tsx` — client-side theme context and persistence.
- `src/components/shared/theme-script.tsx` — pre-hydration theme initialization script.
- `src/components/shared/theme-toggle.tsx` — accessible Light/Dark segmented control.
- `src/components/shared/app-shell.tsx` — presentation-only rail/command/workspace/observatory/console composition.
- `src/components/shared/navigation-rail.tsx` — responsive global navigation.
- `src/components/shared/command-bar.tsx` — breadcrumb, search affordance, notifications, theme control, status slot.
- `src/components/shared/journey-ribbon.tsx` — route and stage progress projection.
- `src/components/shared/observatory.tsx` — evidence/reviewer/communications timeline presentation.
- `src/components/shared/console-drawer.tsx` — collapsible live/historical log tray.
- `src/components/shared/sticky-action-bar.tsx` — stack-supplied governed actions.
- `src/components/shared/presentation-types.ts` — shared presentation-only prop contracts.
- `src/lib/theme.ts` — pure theme preference helpers.
- `src/lib/presentation.ts` — pure grouping/formatting helpers for shell projections.
- `src/stacks/angular/components/angular-presentation.ts` — Angular-owned adapter for shell data.
- `src/stacks/java/components/java-presentation.ts` — Java-owned adapter for shell data.
- `tests/theme.test.ts` — theme helper tests.
- `tests/presentation-shell.test.ts` — shell projection and invariant tests.
- `tests/angular-presentation.test.ts` — Angular adapter tests.
- `tests/java-presentation.test.ts` — Java adapter tests.

### Modify

- `package.json`, `package-lock.json` — add `lucide-react`.
- `src/app/layout.tsx` — install theme provider/script within the App Router boundary.
- `src/app/globals.css` — replace fixed light-only tokens with semantic light/dark tokens and responsive shell styles.
- `src/app/page.tsx` — operational launchpad composition.
- `src/app/loading.tsx`, `src/app/error.tsx` — shell-aware states.
- `src/components/shared/product-header.tsx`, `technology-card.tsx` — shared header and entry point polish.
- `src/components/ui/button.tsx`, `panel.tsx`, `tabs.tsx`, `status-badge.tsx`, `form-field.tsx`, `dialog.tsx`, `drawer.tsx`, `git-diff-view.tsx` — semantic theme and focus treatment.
- `src/components/shared/live-execution-panel.tsx` — align active execution with the console visual language.
- `src/stacks/angular/components/angular-control-tower-page.tsx`, `angular-current-action.tsx`, `angular-overview.tsx`, `angular-pipeline.tsx`, `angular-evidence-workspace.tsx`, `angular-repair-workspace.tsx`, `angular-diagnostics-workspace.tsx`, `angular-g01-page.tsx`, `angular-setup-page.tsx`, `angular-route-board.tsx` — shell composition and theme classes only.
- `src/stacks/java/components/java-cockpit-page.tsx`, `java-current-action.tsx`, `java-overview.tsx`, `java-pipeline.tsx`, `java-evidence-workspace.tsx`, `java-repair-workspace.tsx`, `java-target-versions-workspace.tsx`, `java-setup-page.tsx`, `java-route-board.tsx`, `java-report-artifact-page.tsx` — shell composition and theme classes only.
- `tests/landing.test.ts`, existing stack/UI tests — assertions for new shell landmarks and preserved workflow vocabulary.

## Task 1: Theme foundation and semantic tokens

**Files:**

- Create: `src/lib/theme.ts`, `src/components/shared/theme-provider.tsx`, `src/components/shared/theme-script.tsx`, `src/components/shared/theme-toggle.tsx`, `tests/theme.test.ts`
- Modify: `src/app/layout.tsx`, `src/app/globals.css`, `package.json`, `package-lock.json`

**Interfaces:**

- `Theme = "light" | "dark"`
- `readStoredTheme(value: string | null): Theme | null`
- `systemTheme(matchesDark: boolean): Theme`
- `themeStorageKey = "mf-theme"`
- `ThemeProvider({ children }: { children: React.ReactNode })`
- `ThemeToggle({ className?: string }: { className?: string })`

- [ ] **Step 1: Write the failing test**

```ts
import assert from "node:assert/strict";
import test from "node:test";
import { readStoredTheme, systemTheme } from "../src/lib/theme.ts";

test("theme helpers accept only supported persisted values", () => {
  assert.equal(readStoredTheme("light"), "light");
  assert.equal(readStoredTheme("dark"), "dark");
  assert.equal(readStoredTheme("solarized"), null);
  assert.equal(readStoredTheme(null), null);
});

test("system theme maps the media-query result", () => {
  assert.equal(systemTheme(true), "dark");
  assert.equal(systemTheme(false), "light");
});
```

- [ ] **Step 2: Run the focused test and verify it fails**

Run: `node --test --experimental-strip-types tests/theme.test.ts`

Expected: FAIL because `src/lib/theme.ts` does not yet export the helpers.

- [ ] **Step 3: Implement the minimal foundation**

Add pure helpers and a client provider. The provider must read `localStorage` only inside an effect, subscribe to `matchMedia("(prefers-color-scheme: dark)")` when no explicit preference exists, set `document.documentElement.dataset.theme`, and expose `{ theme, setTheme }` through context. `ThemeToggle` renders two labelled buttons with `aria-pressed` and never touches workflow state. `ThemeScript` emits a small inline script that reads `mf-theme`, falls back to `matchMedia`, and sets `data-theme` before hydration. Add `suppressHydrationWarning` to `<html>` and wrap `{children}` with `ThemeProvider` as directed by the Next App Router server/client component guidance.

Replace the fixed tokens in `globals.css` with `[data-theme="light"]` and `[data-theme="dark"]` groups for `--mf-page`, `--mf-surface`, `--mf-surface-subtle`, `--mf-surface-muted`, `--mf-text`, `--mf-text-muted`, `--mf-text-soft`, `--mf-border`, `--mf-border-strong`, `--mf-primary`, semantic colors, navigation colors, and console colors. Keep the existing class names as compatibility aliases where needed.

- [ ] **Step 4: Run focused tests and checks**

Run: `node --test --experimental-strip-types tests/theme.test.ts`

Expected: PASS.

Run: `npm run typecheck`

Expected: PASS with the provider mounted in the App Router.

- [ ] **Step 5: Commit**

```bash
git add src/lib/theme.ts src/components/shared/theme-provider.tsx src/components/shared/theme-script.tsx src/components/shared/theme-toggle.tsx src/app/layout.tsx src/app/globals.css tests/theme.test.ts package.json package-lock.json
git commit -m "feat(ui): add persisted light and dark themes"
```

## Task 2: Shared shell and presentation contracts

**Files:**

- Create: `src/components/shared/presentation-types.ts`, `app-shell.tsx`, `navigation-rail.tsx`, `command-bar.tsx`, `journey-ribbon.tsx`, `observatory.tsx`, `console-drawer.tsx`, `sticky-action-bar.tsx`, `src/lib/presentation.ts`, `tests/presentation-shell.test.ts`
- Modify: `src/components/shared/product-header.tsx`, `src/components/shared/live-execution-panel.tsx`, `src/components/ui/button.tsx`, `panel.tsx`, `tabs.tsx`, `status-badge.tsx`, `form-field.tsx`, `dialog.tsx`, `drawer.tsx`, `git-diff-view.tsx`

**Interfaces:**

```ts
export type ShellNavItem = {
  id: string;
  label: string;
  href?: string;
  count?: number;
  active?: boolean;
};

export type JourneyNode = {
  id: string;
  label: string;
  status: "SEALED" | "RUNNING" | "ACTION_REQUIRED" | "INCLUDED" | "SKIPPED" | "EXCLUDED" | "PENDING";
  detail?: string;
};

export type ObservatoryEntry = {
  id: string;
  kind: "evidence" | "review" | "command" | "notification" | "email" | "system";
  timestamp: string;
  title: string;
  summary?: string;
  checksum?: string;
  href?: string;
};

export type ConsoleEntry = {
  id: string;
  timestamp?: string;
  channel: string;
  message: string;
  tone?: "neutral" | "info" | "success" | "warning" | "danger";
};

export type ShellAction = {
  id: string;
  label: string;
  variant: "primary" | "secondary" | "danger" | "ghost";
  disabled?: boolean;
  onSelect: () => void;
};
```

`AppShell` accepts `nav`, `breadcrumb`, `status`, `children`, `journey`, `observatory`, `consoleEntries`, `actions`, and `stack`. It must render slots as supplied and must not inspect Angular/Java state, gate IDs, or action names.

- [ ] **Step 1: Write failing projection tests**

```ts
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
```

- [ ] **Step 2: Run the test and verify failure**

Run: `node --test --experimental-strip-types tests/presentation-shell.test.ts`

Expected: FAIL because the projection helpers do not exist.

- [ ] **Step 3: Implement the shell**

Implement the pure grouping helpers without sorting or deriving statuses. Build the shell with semantic landmarks: `<aside aria-label="Primary navigation">`, `<header>`, `<main>`, an optional `<aside aria-label="Evidence and context">`, and a `<section aria-label="Live console">`. Use `lucide-react` icons consistently, add `aria-current` to the active nav item, keep navigation links real, and render the communication tab with `No communication records available for this run.` when the supplied communication group is empty. The observatory must display supplied evidence, review, command, notification, and email entries in the original order. The console must keep its own `open`, `autoFollow`, and `activeFilter` display state; it cannot mutate run/job objects.

Refactor shared primitives to semantic tokens and visible `:focus-visible` rings. Preserve all existing prop signatures unless the change is additive. Make `Drawer` and `Dialog` keyboard-safe and theme-aware. Change `LiveExecutionPanel` to use the console tokens while keeping `projectLiveExecution`, timing, logs, and status untouched.

- [ ] **Step 4: Run focused tests and typecheck**

Run: `node --test --experimental-strip-types tests/presentation-shell.test.ts`

Expected: PASS.

Run: `npm run typecheck`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/shared src/components/ui src/lib/presentation.ts tests/presentation-shell.test.ts package.json package-lock.json
git commit -m "feat(ui): add focus and observatory workspace shell"
```

## Task 3: Landing and setup surfaces

**Files:**

- Modify: `src/app/page.tsx`, `src/app/loading.tsx`, `src/app/error.tsx`, `src/components/shared/product-header.tsx`, `technology-card.tsx`, `src/stacks/angular/components/angular-setup-page.tsx`, `angular-g01-page.tsx`, `angular-route-board.tsx`, `src/stacks/java/components/java-setup-page.tsx`, `java-route-board.tsx`, `tests/landing.test.ts`

**Interfaces:**

- Keep all existing setup handler functions and form state unchanged.
- Use `AppShell` for launchpad and `ProductHeader`/shell-compatible layout for setup and G01 pages.
- Add `ThemeToggle` and real `Link` destinations without changing route paths.

- [ ] **Step 1: Add failing landing assertions**

Extend `tests/landing.test.ts` with source assertions that `src/app/page.tsx` contains `ThemeToggle`, `Recent migrations`, and `Action required`, and that it does not contain unsupported KPI labels. Add assertions that `angular-setup-page.tsx` and `java-setup-page.tsx` retain `Review production readiness` and `Create governed migration` respectively.

- [ ] **Step 2: Run focused test and verify failure**

Run: `node --test --experimental-strip-types tests/landing.test.ts`

Expected: FAIL until the new launchpad composition is present.

- [ ] **Step 3: Implement launchpad and setup composition**

Replace the grid-line hero with a compact operational launchpad: a concise heading, two stack entry rows/cards with Angular/Java identity, route metadata, and one primary action each. Order recent migrations by the existing array and retain each link/status/updated value. Add a theme control to the header. Make `ProductHeader` render the dark rail-compatible identity while remaining usable on setup routes. In setup pages, keep all inputs, route calculations, readiness checks, and button handlers exactly as they are; change only layout, semantic token classes, section hierarchy, and sticky readiness summary. Make route boards horizontally scrollable on narrow widths and mark the current stage with text plus icon/status.

Ensure loading and error states use the same semantic tokens and do not expose prohibited terminology. Use Lucide icons in cards and controls; do not add new unsupported data.

- [ ] **Step 4: Run focused tests and checks**

Run: `node --test --experimental-strip-types tests/landing.test.ts tests/angular-setup.test.ts tests/java-setup.test.ts`

Expected: PASS.

Run: `npm run lint`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/app/page.tsx src/app/loading.tsx src/app/error.tsx src/components/shared/product-header.tsx src/components/shared/technology-card.tsx src/stacks/angular/components/angular-setup-page.tsx src/stacks/angular/components/angular-g01-page.tsx src/stacks/angular/components/angular-route-board.tsx src/stacks/java/components/java-setup-page.tsx src/stacks/java/components/java-route-board.tsx tests/landing.test.ts
git commit -m "feat(ui): refresh launchpad and setup flows"
```

## Task 4: Angular Focus + Observatory workspace

**Files:**

- Create: `src/stacks/angular/components/angular-presentation.ts`, `tests/angular-presentation.test.ts`
- Modify: `src/stacks/angular/components/angular-control-tower-page.tsx`, `angular-current-action.tsx`, `angular-overview.tsx`, `angular-pipeline.tsx`, `angular-evidence-workspace.tsx`, `angular-repair-workspace.tsx`, `angular-diagnostics-workspace.tsx`, `angular-proven-execution.tsx`, `angular-stage-decision-panel.tsx`, `angular-gate-decision-panel.tsx`, `tests/angular-cockpit.test.ts`, relevant Angular UI tests

**Interfaces:**

```ts
export function angularJourney(run: AngularRunModel): JourneyNode[];
export function angularObservatory(run: AngularRunModel): ObservatoryEntry[];
export function angularConsoleEntries(run: AngularRunModel): ConsoleEntry[];
export function angularNav(activeView: string, run: AngularRunModel): ShellNavItem[];
```

Adapters must use only data already present in `AngularRunModel`, including `run.evidence`, `run.gates`, `run.route`, `run.currentGate`, `run.liveExecution`, `run.state`, and `run.currentAction`. They must never calculate a successor gate, promotion path, or workflow decision.

- [ ] **Step 1: Write failing Angular adapter tests**

```ts
import assert from "node:assert/strict";
import test from "node:test";
import { seedAngularRun } from "../src/stacks/angular/scenarios/seeds.ts";
import { angularJourney, angularObservatory } from "../src/stacks/angular/components/angular-presentation.ts";

test("Angular presentation preserves dynamic route and evidence identity", () => {
  const run = seedAngularRun("run-angular-action");
  const journey = angularJourney(run);
  assert.equal(journey.length, run.route.length);
  assert.equal(journey[0].label, `Angular ${run.route[0].from} → ${run.route[0].to}`);
  const evidence = angularObservatory(run);
  assert.equal(evidence.length, run.evidence.length);
  assert.equal(evidence[0].id, run.evidence[0].id);
  assert.equal(evidence[0].checksum, run.evidence[0].checksum);
});
```

- [ ] **Step 2: Run focused test and verify failure**

Run: `node --test --experimental-strip-types tests/angular-presentation.test.ts`

Expected: FAIL because the Angular adapter does not exist.

- [ ] **Step 3: Implement adapter and compose Angular page**

Map the existing Angular route and statuses into `JourneyNode[]`; map evidence categories and timestamps into observatory entries; map available command/live-event evidence into console entries; return explicit empty communication entries because no communication records are in the model. Keep `AngularControlTowerPage` as the stateful owner of `run`, `active`, interval progression, decisions, recovery, and persistence. Replace its outer header/main composition with `AppShell` and pass `angularNav(active, run)`, `angularJourney(run)`, `angularObservatory(run)`, and a stack-owned `StickyActionBar` whose actions call the existing `handleDecision`/`handleStageDecision` only when their panels currently allow them.

Make the main content asymmetric: current action and execution occupy the primary column, an observatory occupies the context column, and pipeline/evidence/diagnostics remain selectable from the rail and existing tabs. Keep the existing tabs as a secondary local view for deep inspection; do not delete them. Restyle `AngularCurrentAction`, gate panels, route board, pipeline, evidence rows, repair workspace, diagnostics, diff view, and proven execution with semantic tokens and focused headings. Keep the dark live execution panel and console visually aligned with the shell. Ensure G08/G10/G11/G09/G12 labels render only from existing state.

- [ ] **Step 4: Run Angular scenarios and focused checks**

Run: `node --test --experimental-strip-types tests/angular-presentation.test.ts tests/angular-cockpit.test.ts tests/angular-proven.test.ts tests/angular-repair-live-flow.test.ts tests/angular-repair-reference.test.ts tests/angular-gate*.test.ts`

Expected: PASS with unchanged gate/order assertions.

Run: `npm run typecheck`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/stacks/angular/components tests/angular-presentation.test.ts tests/angular-cockpit.test.ts
git commit -m "feat(ui): compose Angular workspace around active governance"
```

## Task 5: Java Focus + Observatory workspace

**Files:**

- Create: `src/stacks/java/components/java-presentation.ts`, `tests/java-presentation.test.ts`
- Modify: `src/stacks/java/components/java-cockpit-page.tsx`, `java-current-action.tsx`, `java-overview.tsx`, `java-pipeline.tsx`, `java-evidence-workspace.tsx`, `java-repair-workspace.tsx`, `java-target-versions-workspace.tsx`, `java-route-board.tsx`, `java-report-artifact-page.tsx`, `java-gate-decision-panel.tsx`, `java-gate-assistant-panel.tsx`, relevant Java UI tests

**Interfaces:**

```ts
export function javaJourney(job: JavaJobModel): JourneyNode[];
export function javaObservatory(job: JavaJobModel): ObservatoryEntry[];
export function javaConsoleEntries(job: JavaJobModel): ConsoleEntry[];
export function javaNav(activeView: string, job: JavaJobModel): ShellNavItem[];
```

- [ ] **Step 1: Write failing Java adapter tests**

```ts
import assert from "node:assert/strict";
import test from "node:test";
import { seedJavaJob } from "../src/stacks/java/scenarios/seeds.ts";
import { javaJourney, javaObservatory } from "../src/stacks/java/components/java-presentation.ts";

test("Java presentation keeps route disposition separate from phase gates", () => {
  const job = seedJavaJob("java-order-service");
  const journey = javaJourney(job);
  assert.equal(journey.length, job.route.length);
  assert.equal(journey.some((node) => node.label.includes("Terminal-special")), true);
  const evidence = javaObservatory(job);
  assert.equal(evidence.length, job.evidence.length);
  assert.equal(evidence[0].id, job.evidence[0].id);
});
```

- [ ] **Step 2: Run focused test and verify failure**

Run: `node --test --experimental-strip-types tests/java-presentation.test.ts`

Expected: FAIL because the Java adapter does not exist.

- [ ] **Step 3: Implement adapter and compose Java page**

Map `job.route` disposition and stage labels directly into journey nodes. Keep Stage 4’s `Terminal-special route stage` detail, but never produce a PhaseGate node for it. Map `job.evidence`, `job.currentPhase`, `job.currentGate`, `job.liveExecution`, and assistant preview metadata into observatory/console entries without changing decisions or continuation policy. Render empty communications state when no records exist.

Keep `JavaCockpitPage` as the stateful owner of job transitions, cancellation, assistant confirmation, target-version actions, live timing, and persistence. Pass stack-owned actions to `AppShell` and `StickyActionBar`. Keep the existing `Overview`, `Pipeline`, `Evidence`, and `Target Dependency Versions` tabs and their routes. Restyle route board, PhaseGate decision panel, Gate Assistant, evidence, repair diff, target-version comparison, Stage 4 output, and final report with semantic tokens and the selected asymmetric hierarchy.

- [ ] **Step 4: Run Java scenarios and focused checks**

Run: `node --test --experimental-strip-types tests/java-presentation.test.ts tests/java-cockpit.test.ts tests/java-setup.test.ts tests/java-repair.test.ts tests/java-terminal.test.ts tests/java-xlsx.test.ts tests/java-target-versions-git-diff-ui.test.ts`

Expected: PASS with exactly five PhaseGate types and no fabricated Stage 4 gate.

Run: `npm run typecheck`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/stacks/java/components tests/java-presentation.test.ts tests/java-cockpit.test.ts
git commit -m "feat(ui): compose Java workspace around phase governance"
```

## Task 6: Responsive, accessibility, and interaction hardening

**Files:**

- Modify: `src/app/globals.css`, `src/components/shared/app-shell.tsx`, `navigation-rail.tsx`, `command-bar.tsx`, `observatory.tsx`, `console-drawer.tsx`, `sticky-action-bar.tsx`, `theme-provider.tsx`, `theme-toggle.tsx`, `src/components/ui/dialog.tsx`, `drawer.tsx`, `tabs.tsx`, `button.tsx`
- Create: `tests/accessibility-structure.test.ts`

- [ ] **Step 1: Write failing structural assertions**

```ts
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("shell exposes keyboard and live-region landmarks", () => {
  const source = readFileSync("src/components/shared/app-shell.tsx", "utf8");
  assert.match(source, /aria-label=\"Primary navigation\"/);
  assert.match(source, /aria-label=\"Evidence and context\"/);
  assert.match(source, /aria-label=\"Live console\"/);
  assert.match(source, /focus-visible/);
});
```

- [ ] **Step 2: Run focused test and verify failure**

Run: `node --test --experimental-strip-types tests/accessibility-structure.test.ts`

Expected: FAIL if any required landmark or focus rule is missing.

- [ ] **Step 3: Implement responsive and accessibility behavior**

Use CSS grid for desktop rail/workspace/observatory composition; collapse the rail and move observatory/console into labelled drawers below 1100px; switch to a single-column workspace below 760px; keep action controls reachable in a sticky bottom bar. Add `prefers-reduced-motion` overrides for transitions and live pulses. Ensure tab buttons expose `aria-controls`/`tabIndex` semantics where content panels are present. Keep focus inside open Dialog/Drawer, return focus to the trigger on close, and give all copy/checksum buttons accessible names. Use text and icon state pairs for semantic statuses. Add `aria-live="polite"` only to meaningful active-execution summaries, not the entire log stream.

Verify no sticky action bar overlaps the console, no route ribbon clips at narrow widths, and long IDs use `overflow-wrap:anywhere` or visually hidden full text.

- [ ] **Step 4: Run focused test plus all existing source tests**

Run: `node --test --experimental-strip-types tests/accessibility-structure.test.ts tests/presentation-hardening.test.ts tests/live-presentation-regressions.test.ts tests/display.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/app/globals.css src/components/shared src/components/ui tests/accessibility-structure.test.ts
git commit -m "feat(ui): harden responsive and accessible workspace behavior"
```

## Task 7: Full verification and browser visual QA

**Files:**

- Modify only if verification finds a concrete defect: the relevant implementation file and its focused test.
- Update: `docs/architecture/source-reference-matrix.md` only if a workflow behavior was unintentionally changed and the source authority requires a corresponding traceability entry; presentation-only changes do not require a matrix update.

- [ ] **Step 1: Run the full project check**

Run: `npm run check`

Expected: scenario tests, ESLint, TypeScript, and production build all pass.

- [ ] **Step 2: Start production server and smoke-test routes**

Run: `npm run start -- -p 3001`

Verify these routes return a rendered page without console errors:

```text
/
/angular/migrations/new
/angular/preflights/preflight-angular-action
/angular/migrations/run-angular-action
/java/migrations/new
/java/migrations/java-order-service
/java/migrations/java-terminal-service
```

- [ ] **Step 3: Capture visual states in the supported browser**

Inspect desktop and narrow layouts for:

- landing launchpad;
- Angular G10 action-required state;
- Angular pipeline and evidence state;
- Angular live execution/log console;
- Java analysis review and Gate Assistant;
- Java target dependency versions and terminal Stage 4;
- light theme and dark theme for each representative workspace.

Check the selected Focus + Observatory hierarchy, route ribbon, observatory empty communications state, sticky actions, console drawer, focus rings, long checksum handling, and absence of prohibited visible terminology.

- [ ] **Step 4: Fix only verified defects and rerun focused checks**

For each concrete defect, add or update a focused test before editing the implementation. Rerun the smallest relevant test, then rerun `npm run check` after all fixes.

- [ ] **Step 5: Commit final verification fixes**

```bash
git add src tests docs/architecture/source-reference-matrix.md
git commit -m "chore(ui): verify migration factory revamp"
```

## Completion criteria

- `npm run check` passes.
- All existing Angular and Java scenario tests pass without changed workflow semantics.
- Light/dark theme preference persists and does not flash visibly on load.
- The active action or execution is visually dominant within one viewport on representative states.
- Route progress, current phase/gate, validation, reviewer/evidence context, and logs are reachable without hunting through a long page.
- Evidence and revisions remain append-only and identifiable by original IDs/checksums.
- Communications have a truthful empty state until stack-owned email/notification records exist.
- Narrow layouts retain all workflow information and allowed actions.
- No visible product copy contains prohibited terminology.

