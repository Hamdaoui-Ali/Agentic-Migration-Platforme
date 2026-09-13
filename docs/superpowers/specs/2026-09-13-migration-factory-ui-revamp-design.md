# Migration Factory UI Revamp — Focus + Observatory

**Date:** 2026-09-13  
**Status:** selected visual direction; implementation pending  
**Visual authority:** Product Design option 3, generated from the current landing page, Angular G10 workspace, Angular pipeline, and Java analysis-review workspace  
**Repository:** `C:\Users\aliha\Agentic-Migration-Platforme`

## 1. Goal

Revamp the existing Agentic Migration Platform into a presentation-ready engineering workspace that is attractive, easy to understand, and comfortable to operate during an end-of-studies project presentation.

The redesign must preserve the complete product information path. Logs, governed decisions, evidence and revision history, reviewer context, checksums, notifications, email records, diffs, diagnostics, route progress, and stack-specific workflow detail remain available. The redesign changes presentation and interaction hierarchy only; it does not change Angular or Java workflow authority.

## 2. Selected experience

The selected direction is **Focus + Observatory**:

- a dark navigation rail and dark console frame the product;
- the main workspace uses a warm, low-glare light surface by default;
- an equally complete dark theme is available through a persistent theme control;
- route and gate progress form a compact journey ribbon near the top;
- the active human responsibility dominates the central workspace;
- evidence, notifications, email records, reviewer context, and immutable revisions share a chronological observatory on the right;
- logs remain continuously reachable through a bottom console drawer;
- primary decisions stay visible in a sticky action bar when the current state permits them.

The UI should feel like an engineering control plane, not an analytics dashboard or a marketing page.

## 3. Evidence from the current UI audit

### 3.1 Strengths to preserve

- The existing product exposes real route, phase, gate, evidence, checksum, review, repair, and validation information.
- The current execution surface correctly gives operational work a dark treatment.
- Angular and Java remain visibly related while retaining independent workflows.
- Governed decisions are explicit and the available action set comes from stack-owned state.
- Detailed pipeline, repair, diff, evidence, and diagnostic information is already present.

### 3.2 Problems to solve

- The workspace reads as a long vertical report, so the operator repeatedly scrolls between current state, decision controls, route context, evidence, and logs.
- Almost every white panel has similar visual weight. Urgent work and historical detail compete for attention.
- Top-level tabs separate related context that should be visible together during a governed decision.
- The landing page has large unused hero space and does not immediately communicate live operational state.
- Long labels, checksums, route stages, and evidence counts lack a consistent dense-data treatment.
- Navigation and utilities are not persistent, which makes deep workspaces feel like isolated pages.
- The product has no theme choice and the bright page background is tiring for log-heavy workflows.
- Notifications and email history are not surfaced as a coherent, inspectable communication timeline.

## 4. Product and workflow invariants

The following rules are unchanged and non-negotiable:

- Shared UI is presentation-only and never infers the next workflow state.
- Angular and Java keep independent domain models and state engines.
- Angular gate order remains scenario-policy driven.
- G08 remains a real review boundary when the active scenario or plan requires it.
- The persisted Angular reference route remains G07 → transformation → G08 → final validation → G11 direct seal, with G10 only when repair is required.
- G12 candidate promotion appears only on the policy path that selects candidate promotion.
- Java retains exactly five PhaseGate types and no `assessment_review`.
- Java Stage 4 remains terminal-special and has no normal PhaseGate.
- Angular target routes and Java included/skipped/excluded routes remain dynamic.
- Accepted, superseded, and historical evidence remain append-only and visible.
- Visible product language does not expose mock, fake, demo, simulation, or fixture terminology.
- Every visible action either performs a real local scenario transition supplied by the owning stack or is correctly disabled.

## 5. Information architecture

### 5.1 Global application shell

All routes share a responsive presentation shell:

1. **Navigation rail**
   - product identity;
   - workspace/home;
   - active stack navigation supplied by the page;
   - Pipeline, Evidence, Logs, and Diagnostics or Target Dependencies where applicable;
   - Notifications with an unread count;
   - Settings/theme access;
   - presenter reset remains available but visually secondary.

2. **Top command bar**
   - breadcrumb and current run identity;
   - command/search affordance for local page information;
   - notification access;
   - explicit Light/Dark theme control;
   - compact current-state badge.

3. **Primary workspace**
   - stack identity and route summary;
   - journey ribbon;
   - active action or active execution;
   - contextual detail appropriate to the current stack-owned state.

4. **Observatory**
   - chronological evidence events;
   - notifications and email records;
   - reviewer and assistant context;
   - evidence revision/checksum lineage;
   - links into the full evidence workspace.

5. **Console drawer**
   - live or historical logs;
   - independent auto-follow behavior;
   - filters for log categories where supported by existing data;
   - collapsed, compact, and expanded states without losing scroll position.

### 5.2 Landing page

The landing page becomes an operational launchpad rather than a large hero:

- concise product statement and new-migration action;
- Angular and Spring Boot entry points with clear workflow distinctions;
- recent migrations prioritized by action required, running, then recently completed;
- at-a-glance stack, route, current boundary, status, and last update;
- theme choice available immediately;
- no fabricated metrics or unsupported operational summaries.

### 5.3 Angular workspace

The Angular workspace maps stack-owned state into the shell:

- dynamic adjacent-major route in the journey ribbon;
- current stage, phase, validation state, and applicable gate;
- G01 and G02–G06 governance remain distinct;
- post-G07 PROVEN execution remains node/event driven;
- G08, G10, G11, G09, and G12 appear only when supplied by the active scenario policy;
- repair proposals, Independent Reviewer verdicts, candidate diffs, validation requirements, and lineage remain intact;
- diagnostics and recovery stay available without competing with the active decision.

### 5.4 Java workspace

The Java workspace uses the same shell without borrowing Angular semantics:

- route stages and execution phases remain separate visual tracks;
- the five valid PhaseGate types retain their original decision sets;
- Gate Assistant preserves explain → preview exact action/checksum → explicit confirmation;
- repair attempts and reviewed diffs remain available for Stages 1–3;
- Target Dependency Versions is a dedicated terminal workspace;
- Stage 4 remains terminal-special and never receives a fabricated normal PhaseGate;
- final-report eligibility remains tied to Java-owned terminal conditions.

## 6. Visual system

### 6.1 Theme tokens

Theme selection is implemented with semantic CSS custom properties and a root `data-theme` attribute. Components consume semantic tokens rather than hardcoded light or dark colors.

**Light theme**

- page: warm off-white, approximately `#F7F5F0`;
- primary surface: `#FFFFFF`;
- secondary surface: warm neutral tint;
- text: deep ink/navy;
- navigation and console: blue-black;
- primary action: confident cobalt;
- borders: low-contrast cool neutral.

**Dark theme**

- page: deep ink/navy;
- surfaces: layered graphite and navy;
- text: warm off-white;
- secondary text: cool blue-gray;
- primary action: brighter cobalt/cyan for sufficient contrast;
- borders: subtle cool blue-gray.

Semantic success, warning, danger, info, and action-required colors remain consistent in meaning across themes. Color is always paired with text or iconography.

### 6.2 Typography

- Use the existing local font delivery mechanism in `src/app/layout.tsx`.
- A distinctive display treatment may be used for the primary action heading only.
- Product copy and controls use a highly readable sans-serif.
- Commands, checksums, identifiers, timestamps, and diffs use the monospace family.
- Body text remains at least 14px on dense desktop surfaces and 16px on longer explanatory copy.
- Uppercase labels are short and use restrained letter spacing.

### 6.3 Surfaces and density

- Use spacing, alignment, typography, and dividers before adding panels.
- Avoid card grids and cards nested inside cards.
- Use 10–12px radii for operational surfaces and small radii for controls.
- Use shadows only for sticky or floating layers.
- Use one-pixel borders and surface contrast for hierarchy.
- Do not introduce decorative marketing gradients, glassmorphism, or decorative data visualization.

### 6.4 Icons and assets

- Use one consistent icon library already suitable for React, added only if the project does not contain a usable set.
- Do not use emoji, text-symbol icons, handcrafted SVG approximations, or decorative illustrations.
- Preserve recognizable Angular and Java identity using existing or properly sourced assets.

## 7. Core components

### 7.1 Presentation-only shared components

- `AppShell`: composes rail, command bar, workspace, observatory, and console slots.
- `NavigationRail`: renders page-supplied destinations and counts.
- `CommandBar`: breadcrumb, local search trigger, notifications, status, and theme control.
- `ThemeProvider` and `ThemeToggle`: initialize, persist, and switch theme without owning workflow state.
- `JourneyRibbon`: formats page-supplied route nodes and statuses without deriving successors.
- `Observatory`: renders normalized presentation entries explicitly supplied by Angular or Java pages.
- `ConsoleDrawer`: renders supplied log events and presentation-only display state.
- `StickyActionBar`: renders only the actions supplied by the active stack page.
- `WorkspaceSection`, `DataLabel`, `MetricPair`, and related primitives: provide consistent hierarchy without embedding domain rules.

### 7.2 Stack-owned adapters

Angular and Java pages prepare their own view data and allowed actions. Any adapter belongs under its stack directory and may translate stack-owned state into presentation props. Shared components must not inspect gate identifiers to decide what happens next.

## 8. Interaction design

### 8.1 Theme behavior

- On first visit, use the saved preference when present; otherwise use the operating-system preference.
- Persist explicit selection in browser storage.
- Apply the theme before interactive hydration where possible to avoid a visible flash.
- The control is keyboard operable, labelled, and reports the selected theme.

### 8.2 Focus management

- Current automatic focus/scroll behavior is retained only when it helps the operator find a newly opened live execution or human gate.
- A sticky decision bar must not steal keyboard focus.
- When a gate or dialog opens, focus moves to the heading or first meaningful control as appropriate.
- Closing a dialog returns focus to its trigger.

### 8.3 Observatory behavior

- Tabs or filters change presentation only; they do not alter scenario state.
- Evidence, notifications, and email entries retain chronological order and immutable revision identity.
- Selecting an entry opens detail in-place or routes to the existing evidence surface.
- Empty categories show a purposeful empty state rather than disappearing.

### 8.4 Console behavior

- The console can collapse, open to a compact tray, or expand.
- Live follow is independent from workspace focus and pauses when the operator inspects history.
- Returning to live follow restores the newest events.
- Historical failures remain visible after repair success.

### 8.5 Responsive behavior

- Desktop at 1280px and above uses the full rail/workspace/observatory composition.
- Medium widths collapse the rail to icons and move the observatory into a controlled drawer.
- Narrow widths use a top navigation trigger, a single-column workspace, horizontally scrollable journey ribbon, bottom action bar, and full-screen observatory/console drawers.
- No workflow information or allowed decision is removed at narrow widths.

## 9. Accessibility and cognitive clarity

- Maintain WCAG-relevant contrast for text, controls, focus indicators, diffs, and semantic states in both themes.
- Preserve semantic headings and a logical reading order independent of desktop columns.
- All navigation, tabs, drawers, theme controls, dialogs, and decisions are keyboard accessible.
- Status never relies on color alone.
- Interactive targets are at least 40px in dense desktop layouts and 44px on touch-oriented layouts.
- Avoid long all-caps strings and excessive letter spacing.
- Break long technical explanations into labelled facts while preserving exact identifiers.
- Checksums and IDs support copy actions with accessible names.
- Motion is brief, functional, and disabled or reduced under `prefers-reduced-motion`.
- Live updates use restrained announcements so logs do not overwhelm assistive technology.

## 10. Error and state handling

- Existing stack-owned transition errors remain visible, specific, and non-destructive.
- Theme and display-state persistence failures fall back silently to usable defaults without affecting scenario state.
- Empty evidence, notification, email, and log states remain explicit.
- Long identifiers truncate visually but remain available in full to assistive technology and copy actions.
- Loading and error routes adopt both themes and the new shell styling where a shell is available.

## 11. Implementation boundaries

The revamp may change:

- global theme tokens and layout styles;
- presentation-only shared UI components;
- page composition and responsive behavior;
- stack-owned view adapters;
- accessible labels and visible explanatory copy where workflow meaning is unchanged;
- presentation-only local preferences such as theme, drawer state, and selected view.

The revamp must not change:

- Angular or Java domain types for visual convenience;
- reducers, transition rules, gate policy, route policy, or evidence history;
- scenario semantics, checksums, allowed decisions, or terminal eligibility;
- source-reference authority.

If implementation reveals that a desired presentation cannot be derived from existing stack-owned data, the UI must omit or label that presentation rather than invent it.

## 12. Testing strategy

### 12.1 Presentation unit tests

- theme initialization, explicit switching, and persistence;
- journey ribbon renders only supplied nodes and statuses;
- observatory preserves supplied order and revision identity;
- console display state does not mutate workflow state;
- sticky action bar renders only supplied actions;
- navigation and compact layout semantics.

### 12.2 Stack scenario tests

- existing Angular and Java workflow suites remain unchanged and green;
- Angular scenario-policy gate order remains intact;
- Java retains exactly five PhaseGate types and terminal-special Stage 4;
- accepted and superseded evidence remains visible after the redesign;
- all allowed actions still call the same stack-owned handlers.

### 12.3 Accessibility and interaction checks

- keyboard traversal for shell, tabs, drawers, theme switch, dialogs, and decisions;
- visible focus in both themes;
- semantic labels and reading order;
- reduced-motion behavior;
- responsive reflow at representative desktop, tablet, and narrow widths;
- contrast review for normal, muted, semantic, diff, and console text.

### 12.4 Browser and visual verification

- capture landing, Angular setup, Angular governed gate, Angular live PROVEN execution, Angular repair, Java setup, Java PhaseGate, Java repair, and Java Stage 4 surfaces;
- verify both light and dark themes;
- compare the implemented primary workspace against the selected Focus + Observatory visual target;
- inspect for clipping, overflow, scroll traps, sticky-layer collisions, and theme flashes;
- verify logs, evidence, notifications/email records, and diffs remain legible.

### 12.5 Required project checks

Every implementation wave must pass the relevant scenario tests, then:

```text
npm run lint
npm run typecheck
npm run build
```

The final implementation must pass `npm run check` and production route smoke checks.

## 13. Implementation sequence

1. Theme foundation and semantic token migration.
2. Shared shell, navigation rail, command bar, theme control, observatory, and console drawer.
3. Landing-page operational launchpad.
4. Angular setup, control tower, live execution, evidence, repair, and diagnostics composition.
5. Java setup, cockpit, evidence, repair, target versions, and terminal composition.
6. Responsive and accessibility hardening.
7. Full scenario, build, and browser visual verification in both themes.

Each wave preserves a runnable application and passes its relevant checks before the next wave begins.

## 14. Acceptance criteria

The revamp is complete when:

1. The selected Focus + Observatory hierarchy is recognizable in the running application.
2. Light and dark modes are both complete, accessible, persisted, and free of a disruptive theme flash.
3. The current action or execution is identifiable within five seconds on representative Angular and Java states.
4. Route progress, current stack state, human boundary, reviewer context, and validation result are visible without searching across multiple tabs.
5. Logs remain reachable from every workflow workspace and support independent follow/history inspection.
6. Evidence, revisions, notifications, and email records are accessible through a chronological observatory without overwriting history.
7. Governed actions remain explicit, checksum-bound where required, and supplied only by the owning stack.
8. The landing page prioritizes starting or resuming operational work without fabricated metrics.
9. Desktop and narrow layouts retain all workflow information and actions without clipping or overlapping sticky surfaces.
10. Angular and Java workflow invariants in the source-reference matrix remain true.
11. No visible product copy exposes prohibited implementation-storage terminology.
12. All scenario tests, lint, typecheck, production build, and route smoke checks pass.

## 15. Source references

- `docs/superpowers/specs/2026-08-31-migration-factory-presentation-frontend-design.md`
- `docs/superpowers/specs/2026-09-01-proven-transformer-runtime-design.md`
- `docs/architecture/source-reference-matrix.md`
- current repository UI and scenario tests captured on 2026-09-13

