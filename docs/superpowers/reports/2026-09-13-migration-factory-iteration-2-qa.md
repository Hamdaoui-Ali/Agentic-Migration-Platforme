# Migration Factory interaction iteration 2 — rendered QA

Date: 2026-09-13  
Branch: `feature/migration-factory-iteration-2`

## Verification result

The feature worktree passed the interaction pass with Playwright fallback. The Browser plugin was not available in the environment, so Playwright/Chromium was installed locally with `npm install --no-save --package-lock=false --ignore-scripts playwright@1.63.0`; no package or lockfile changes were committed.

Every exercised page reported zero console errors and zero page errors. No blank, stale, or error overlay appeared during navigation or interaction.

| Surface | Viewport | Interaction proof | Capture |
|---|---:|---|---|
| Angular new migration | 1440×1000 | Starts with zero check rows; the explicit diagnosis button reveals 3 rows at 2.55s and all 6 rows at 5.65s; readiness review unlocks only after completion; automation preference persists as `AUTO_APPROVE_ELIGIBLE`. | `angular-setup-idle.png`, `angular-diagnostics-mid.png`, `angular-diagnostics-complete.png` |
| Angular assistant | 1440×1000 | Global bottom-right action opens a `Migration assistant` dialog; “Show the logs” returns Console guidance without changing workflow state. | `angular-assistant-open.png` |
| Java new migration | 390×844 | JDK 11/17/21, Maven, AI provider, and Azure integration checks reveal to 6/6 after ~5.35s; create remains locked before completion and unlocks after; automation preference persists. | `java-setup-mobile.png` |
| Angular repair | 1440×1000 | Pipeline tab exposes the reviewed diff composer; typed correction and “Request modification” route through the existing G10 owner. | `angular-repair-correction.png` |
| Java repair | 1440×1000 | Pipeline tab exposes the reviewed diff composer; typed correction routes through the existing `repair_review` owner without adding a Stage 4 gate. | `java-repair-correction.png` |

Screenshots are stored outside the repository at `C:/Users/aliha/AppData/Local/Temp/migration-factory-ui-iteration-2/`.

## Visual comparison to the approved Focus + Observatory direction

1. The setup routes keep the approved light/dark theme switch, restrained neutral canvas, blue action color, and dense evidence typography.
2. Route context stays above the fold: Angular’s adjacent-major board and Java’s route board remain visible while diagnostics run, so the operator never loses the migration path.
3. Diagnostic results use the same semantic status language as the cockpit. Green `READY` and warning/danger tones remain legible in both themes and appear one row at a time.
4. Automation is presented as a compact, explicit preference card. Workspace headers surface `AUTO MODE` or `MANUAL MODE`, while the stack-owned allowed-decision sets remain authoritative.
5. Repair review keeps the structured red/green Git diff as the primary evidence surface. The new composer is visually subordinate and clearly states that typed corrections are review context, not an in-place diff mutation.
6. The persistent assistant is a small lower-right affordance that clears the sticky action/console surfaces on mobile and opens a compact contextual panel on every route.

Intentional deviations: the approved reference is a repair cockpit, while this pass adds setup-specific diagnostics and automation controls; therefore the setup screens use a two-column form/readiness layout and the assistant FAB is a new global affordance. The five-second diagnostic timing is deliberately presentation-local and does not claim host inspection authority.

## Automated checks

- `npm run check` — 167 tests passed; lint, TypeScript, and production build passed.
- `git diff --check` — clean.
- Cancellation projection test confirms cancellation remains an out-of-band action with append-only evidence and no pipeline/PhaseGate entry.

