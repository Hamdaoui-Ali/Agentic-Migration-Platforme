# Focus + Observatory design QA

## Source visual truth

- Source: `C:\Users\aliha\.codex\generated_images\01a09b0d-23c9-76b0-a8b0-512120fa9dc3\exec-fb853e2a-4736-4021-a210-3d7f86723230.png`
- Source pixels: `1487 × 1058`.
- Selected state: Focus + Observatory, Angular repair-authorization workspace.
- Combined comparison input: `C:\Users\aliha\AppData\Local\Temp\migration-factory-ui-qa\comparison-angular.png` (source and implementation normalized to the same 800px content height, side-by-side).

## Rendered implementation evidence

- Production URL: `http://127.0.0.1:3101`.
- Main implementation: `C:\Users\aliha\AppData\Local\Temp\migration-factory-ui-qa\angular-light-v3.png` (`1440 × 980`, CSS viewport `1440 × 980`, device scale `1`).
- Dark implementation: `C:\Users\aliha\AppData\Local\Temp\migration-factory-ui-qa\angular-dark-v3.png` (`1440 × 980`, CSS viewport `1440 × 980`, device scale `1`).
- Narrow implementation: `C:\Users\aliha\AppData\Local\Temp\migration-factory-ui-qa\angular-mobile-v2.png` (`390 × 844`, CSS viewport `390 × 844`, device scale `1`).
- Java route evidence: `C:\Users\aliha\AppData\Local\Temp\migration-factory-ui-qa\java-light-v2.png` and `java-mobile-v3.png` (`1440 × 980` and `390 × 844`, device scale `1`).
- Interaction evidence: `C:\Users\aliha\AppData\Local\Temp\migration-factory-ui-qa\playwright-angular-interaction.png`.

## Comparison evidence

The combined comparison confirms the intended hierarchy: fixed dark rail, command bar, compact journey ribbon, dominant current responsibility, evidence/context column, sticky decision bar, and a reachable console surface. The implementation uses the repository's Geist sans and Lucide icon system, as required by the approved specification, while keeping the source concept's density and warm-light/dark-rail contrast.

Focused review covered the command bar/theme control, route ribbon, current action/decision surface, observatory chronology/checksum treatment, sticky actions, and narrow navigation. These regions were readable in the full-view captures, so no additional crop was required.

## Findings and iteration history

1. `[P2 fixed]` Initial workspace screenshots opened scrolled to the current gate, hiding the journey and page entry point. The latest-update focus effect now skips the first no-live render and only focuses subsequent gate transitions; revised Angular captures are `angular-light-v3.png` and `angular-dark-v3.png`.
2. `[P2 fixed]` Java route labels initially overflowed and overlapped on narrow screens. Java-owned presentation data now uses compact profile labels and the ribbon constrains long labels with ellipsis; revised captures are `java-light-v2.png` and `java-mobile-v3.png`.
3. `[P3 accepted]` The source concept uses a serif display treatment for the primary action heading. The implementation keeps the approved local Geist font delivery for product consistency; the specification permits an optional distinctive display treatment and no readability or hierarchy issue remained.
4. `[Intentional data constraint]` The current domain contains no notification or email records. The Observatory therefore renders a purposeful, truthful communications empty state and the command-bar unread count is zero; no records were fabricated.

## Checks

- Page identity and meaningful content: passed on landing, Angular workspace, and Java workspace.
- Framework overlay / blank-page check: passed; no Next overlay and no empty shell.
- Console health: passed; Playwright interaction run reported `0` console errors.
- Theme behavior: passed; explicit dark selection persisted across reload.
- Interaction proof: passed; Angular Evidence navigation selected the Evidence tab, and mobile navigation opened and closed cleanly.
- Responsive review: passed at `1440 × 980` and `390 × 844`; no route-ribbon overlap or sticky-action clipping remained in the reviewed states.

## Final result

passed
