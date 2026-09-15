# Agent Review Surfaces and Quick Angular Route

**Date:** 2026-09-15  
**Status:** approved visual direction; written specification pending review  
**Scope:** focused follow-up to the 2026-09-13 Focus + Observatory UI revamp

## 1. Goal

Make the analysis, planning, and repair-review surfaces comfortable to use during a short presentation while preserving the existing Angular and Java workflow authorities.

The presentation path should begin at Angular 18 and finish at Angular 21. The first repair-review moment should be a source-grounded Angular 18 → 19 patch, so the operator can demonstrate three clear choices: accept the reviewed change, ask the repair proposer for a new proposal with a hint, or supply a bounded manual override for review.

The request explicitly does not require video. The evidence shown in the diff is a real public repository change, rendered as a Git patch.

## 2. Approved experience direction

Use the **Full-width evidence bench** direction from the visual companion:

- Analysis Agent and Planning Agent disclosures occupy the full primary workspace width.
- Dense evidence uses responsive grids, readable lists, and clear section labels instead of a narrow report column.
- Route and gate context remains available, but is presented as secondary context below or beside the completed agent output rather than consuming the agent output's desktop width.
- Repair review keeps the diff central and places provenance, review metadata, and actions around it.
- Cancellation is visible once in the workspace header. It is not repeated in the bottom sticky action bar.

## 3. Product and workflow invariants

These rules remain unchanged:

- Shared UI is presentation-only and never infers the next workflow state.
- Angular and Java retain independent domain models and state engines.
- Angular gate order remains scenario-policy driven. G08 is a real review boundary only when the active scenario or plan requires it.
- The persisted reference route remains G07 → transformation → G08 → final validation → G11 direct seal, with G10 only when repair is required.
- G12 candidate promotion appears only on the policy path that selects candidate promotion.
- Java keeps exactly five PhaseGate types. There is no `assessment_review`.
- Java Stage 4 remains terminal-special and has no normal PhaseGate.
- No shared component hardcodes Angular 18 → 21 or assumes an always-full Java route.
- Accepted, superseded, and historical evidence remain append-only.
- Visible product copy must not expose mock, fake, demo, simulation, or fixture terminology.

## 4. User flows

### 4.1 Agent output review

For both stacks, the pipeline page keeps the active lifecycle summary first, then gives Analysis Agent and Planning Agent the full content width. Their detail surfaces should expose the information already present in state:

- summary and review status;
- proposer and independent reviewer provenance;
- discovered facts, risks, unknowns, and findings;
- application/source profile where available;
- deterministic route and first-stage plan;
- policy bindings, validation targets, material risks, and reviewer conclusions.

The re-layout must not add derived successors or change gate state. It only changes grouping and visual hierarchy. Java's route/stage context remains separate from its Analysis and Planning phases.

### 4.2 Repair review

The shared correction composer presents three choices:

1. **Accept change** — sends the existing governed approval to the owning stack gate.
2. **Ask AI again** — requires a hint and sends it as review context for a new proposer revision.
3. **Use manual override** — requires a bounded correction or unified patch and sends it as a manual review input to the owning workflow.

The original displayed patch remains immutable. AI-hint and manual-override inputs create a child review revision with parent linkage and remain visible in history. The workflow owner, not the shared composer, decides whether a later revision can be applied. The new revision must not use a placeholder or unrelated synthetic diff: the Angular presentation path reuses the source-grounded 18 → 19 patch until an owning workflow supplies a different validated proposal.

For the Angular presentation case, the active patch is the exact import correction from `tastejs/angular-movies` commit `a002daf3e4ce107f3ef4cd99259e730438f5d1a3`, whose parent is `794e45e00cc2e0935b1a48a372b9a34779f016cb`:

```diff
diff --git a/projects/movies/server.ts b/projects/movies/server.ts
--- a/projects/movies/server.ts
+++ b/projects/movies/server.ts
@@
-import { CommonEngine } from '@angular/ssr';
+import { CommonEngine } from '@angular/ssr/node';
```

The review surface must show repository, source commit, target commit, file path, and a link to the source commit/compare view. Provenance is domain data attached to the repair attempt, not inferred by the diff renderer.

### 4.3 Quick Angular presentation route

The named presentation scenario uses a real Angular Movies source profile at Angular 18 and target Angular 21. Its route is produced by `computeAngularRoute(18, 21)`, giving three adjacent stages: 18 → 19, 19 → 20, and 20 → 21.

The action seed opens at the first 18 → 19 repair review after the stage-start execution fails with the source-grounded SSR import compatibility evidence. The route engine remains generic, so other source/target selections and the legacy Angular 11 CRUD source remain supported explicitly.

The landing/setup defaults may point at this 18 → 21 presentation scenario, but editable source and target controls must continue to use the dynamic route computation and existing preflight validation.

## 5. Proposed implementation boundaries

### Shared presentation

- Update `CorrectionComposer` labels, hints, and disabled states so the three actions are unambiguous and do not imply that the displayed patch is mutable.
- Keep the composer free of workflow transitions; it only invokes callbacks supplied by the stack owner.
- Remove cancellation actions from the `AppShell` sticky action inputs in both workspace owners. Keep the existing header cancellation control and cancellation dialog.
- Recompose Angular and Java pipeline layout so agent output is full width and route/stage context is secondary.

### Angular domain and workflow

- Add an immutable source-reference record to Angular repair attempts for repository, source commit, target commit, path, and source links.
- Add a typed review-input mode for AI hints and manual overrides while keeping the governed decision `REQUEST_MODIFICATION` owned by G10.
- Add a source profile for `tastejs/angular-movies` and make completed analysis presentation data source-aware without removing the Angular 11 CRUD profile.
- Add the 18 → 19 source-grounded repair family to PROVEN failure/review routing. Do not make it the universal failure path; only the matching stage receives that repair evidence.
- Replace the generic placeholder child diff created by a modification request with a source-grounded child proposal that preserves parent lineage and records the review input.
- Seed the quick presentation path from 18 → 21 while preserving the existing legacy and recovery scenarios through distinct seed identities where necessary.

### Java domain and workflow

- Keep Java's current repair gate and Stage 4 terminal semantics unchanged.
- Surface the same three composer choices in Java repair UI, mapping them to the existing `repair_review` owner and existing revision history.
- Do not add Angular-style source metadata or phase gates to Java unless its own domain contract already supplies them.

### Documentation authority

Update `docs/architecture/source-reference-matrix.md` in the same implementation wave with the public Angular Movies source reference and the new presentation behavior. The 2026-09-01 proven-transformer runtime design remains the post-G07 implementation contract.

## 6. Acceptance criteria

- At desktop width, Analysis Agent and Planning Agent use the primary workspace width; no large unused right-side region remains beside their content.
- At narrow width, evidence grids collapse without horizontal scrolling, and the diff remains readable.
- The repair review visibly offers Accept change, Ask AI again, and Use manual override. The latter two require input.
- The source-grounded Angular patch shows red/green lines, line numbers, file path, repository, source/target commits, and a source link.
- Accept, AI hint, and manual override callbacks reach the stack-owned gate handlers. The original attempt remains unchanged and child revisions preserve parent linkage.
- Each workspace renders only one visible “Cancel migration” control in the header; no bottom sticky cancellation action exists.
- The presentation setup/action path shows Angular 18 → 21 and the action seed opens an 18 → 19 repair review. The route is computed, not hardcoded in shared UI.
- Existing Angular 11 source evidence, Java five-PhaseGate behavior, terminal Stage 4 behavior, and policy-selected Angular gate paths remain intact.
- Focused scenario/UI tests pass, followed by lint, typecheck, build, and the full project check.

## 7. Verification plan

1. Add failing tests for full-width pipeline structure, three correction labels/disabled behavior, single cancellation placement, source-grounded 18 → 19 repair provenance, and the quick route seed.
2. Run each focused test and confirm it fails for the missing behavior.
3. Implement the smallest domain/UI changes that make each test pass.
4. Run `npm test`, `npm run lint`, `npm run typecheck`, and `npm run build`.
5. Run the browser smoke path at the Angular action route and inspect desktop and narrow layouts, including Accept, Ask AI again, and Use manual override states.
6. Run `npm run check` and record the result before claiming completion.

## 8. Non-goals

- No video asset or video player.
- No external migration execution, network-backed runtime, or automatic code checkout.
- No redesign of Angular or Java workflow authority.
- No universal Angular 18 → 21 assumption for arbitrary user-selected migrations.
- No candidate promotion added to the direct G11 seal path.
