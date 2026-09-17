# Migration Factory presenter runbook

This repository is a standalone presentation frontend. It reproduces the Angular and Java operator workflows with deterministic local state so the recording remains reliable when the real source repositories or backend cannot be opened.

The recording should describe the surface accurately:

> La démonstration utilise un scénario anonymisé et des états préparés afin de respecter la politique CGI.

No source code or live backend call is required for the recording. The visible workflow still preserves the important product contract: the backend is the authority in the real system, the AI proposes, a reviewer evaluates, a human approves, and technical validation gates continuation.

## Start the presenter build

```bash
npm ci
npm run dev
```

Open the application with `mode=recording`:

```text
http://localhost:3000/?mode=recording
```

The presenter mode uses 3× wall-clock playback while preserving logical phase durations and progress behaviour in the interface. An explicit speed from 1× to 6× can be selected with `?mode=recording&speed=4`.

## Recommended recording routes

| Sequence | Route | What it shows |
| --- | --- | --- |
| 1 | `/` | Two stack entry points and the prepared migration list |
| 2 | `/angular/migrations/run-angular-action?mode=recording` | Angular Movies 18 → 21, a source-grounded Angular 18 → 19 repair review boundary, approval, revalidation and evidence |
| 3 | `/java/migrations/java-repair-service?mode=recording` | Spring Boot 2.7 / Java 11 → 4.0 / Java 21, failed validation, reviewed repair and human decision |
| 4 | `/java/migrations/java-terminal-service?mode=recording` | Completed terminal Stage 4 target-version review and final report |

The Angular action route opens at the prepared G10 repair-review boundary. The Java repair route opens at the Stage 2 validation failure and `repair_review`. These are deliberate entry states for a short recording; they avoid spending minutes replaying every preceding gate while keeping the gate, diff, approval and revalidation evidence visible.

## Timing guidance

The logical durations remain credible even in presenter mode:

| Logical phase | At 3× presenter speed |
| --- | ---: |
| Standard execution phase | about 30 s logical / 10 s wall-clock |
| Planning or repair review | about 45 s logical / 15 s wall-clock |
| Repair validation | about 120 s logical / 40 s wall-clock |

Build and test are shown as explicit workflow steps inside the phase. They are not presented as an implausible four-second real build; the phase timing is accelerated consistently for recording.

## Recording checklist

1. Start from a clean browser profile or use **Reset workspace** before each take.
2. Keep the URL query `mode=recording` visible only in the browser address bar; it does not change the product workflow.
3. On Angular, show the reviewed proposal and diff, approve the bounded repair, then show the revalidation result and evidence tab.
4. On Java, show the failed test validation, the structured diff, the reviewer context, the human `CONTINUE` decision, and the return to validation.
5. Use the terminal Java route for a short final proof: accepted target versions, POM diff and generated report artifacts.
6. If a transition must be skipped during editing, state that the capture uses a prepared state; do not describe it as a live call to the CGI backend.

The recording demonstrates the frontend workflow only. It must not claim that the local presenter state itself executed Maven, npm, Azure AI Foundry or a protected source repository.
