import type { AngularPreflight, AngularRunSeed } from "../domain/types.ts";
import type { AngularRunModel } from "../domain/run-types.ts";
import {
  applyG01Decision,
  createRunFromApprovedPreflight,
  prepareAngularPreflight,
} from "../workflow/setup.ts";
import {
  applyAngularGateDecision,
  createAngularRunModel,
} from "../workflow/run.ts";
import { applyAngularStageGateDecision } from "../workflow/proven.ts";
import {
  advanceAngularLiveExecution,
  angularLiveExecutionDuration,
} from "../workflow/live.ts";

export function seedAngularPreflight(id: string): AngularPreflight {
  const primary = prepareAngularPreflight({
    runName: "Angular 11 CRUD Example",
    sourcePath: "/workspace/angular-11-crud-example",
    outputParent: "/workspace/migration-output",
    sourceMajor: 11,
    targetMajor: 21,
  });
  return { ...primary, id };
}

function approvedRunSeed(): AngularRunSeed {
  const preflight = seedAngularPreflight(
    "preflight-angular-11-crud-example-11-21",
  );
  const approved = applyG01Decision(preflight, "APPROVE");
  return createRunFromApprovedPreflight(approved);
}

function angularMoviesApprovedRunSeed(): AngularRunSeed {
  const preflight = prepareAngularPreflight({
    runName: "Angular Movies",
    sourcePath: "/workspace/angular-movies",
    outputParent: "/workspace/migration-output",
    sourceMajor: 18,
    targetMajor: 21,
  });
  const approved = applyG01Decision(preflight, "APPROVE");
  return createRunFromApprovedPreflight(approved);
}

function finishLive(run: AngularRunModel): AngularRunModel {
  if (!run.liveExecution) return run;
  return advanceAngularLiveExecution(
    run,
    run.liveExecution.startedAtMs +
      angularLiveExecutionDuration(run.liveExecution) +
      1,
  );
}

export function seedAngularRun(id: string): AngularRunModel {
  if (id === "run-angular-complete") {
    const seed = approvedRunSeed();
    return createAngularRunModel({
      ...seed,
      id,
      state: "COMPLETED",
      currentGate: null,
      currentAction: "Requested target achieved",
    });
  }

  const seed = id === "run-angular-action"
    ? angularMoviesApprovedRunSeed()
    : approvedRunSeed();
  let model = createAngularRunModel({
    ...seed,
    id,
  });

  if (id === "run-angular-action" || id === "run-angular-recovery") {
    model = finishLive(applyAngularGateDecision(model, "G02", "APPROVE"));
    model = finishLive(applyAngularGateDecision(model, "G03", "APPROVE"));
    model = finishLive(applyAngularGateDecision(model, "G04", "APPROVE"));
    model = finishLive(applyAngularGateDecision(model, "G05", "APPROVE"));
    model = finishLive(applyAngularGateDecision(model, "G06", "APPROVE"));
  }

  if (id === "run-angular-action") {
    // Keep the action path focused on the first source-grounded Angular 18 → 19 review.
    model = finishLive(
      applyAngularStageGateDecision(model, "G07", "APPROVE"),
    );
    model = finishLive(model);
  }

  if (id === "run-angular-recovery") {
    // Preserve a later-stage recovery path for rollback/resume coverage.
    for (let stageIndex = 0; stageIndex < 9; stageIndex += 1) {
      model = finishLive(
        applyAngularStageGateDecision(model, "G07", "APPROVE"),
      );

      if (model.liveExecution?.kind === "REPAIR_REVIEW") {
        model = finishLive(model);
        model = finishLive(
          applyAngularStageGateDecision(model, "G10", "APPROVE"),
        );
        model = applyAngularStageGateDecision(model, "G11", "APPROVE");
        model = applyAngularStageGateDecision(model, "G09", "APPROVE");
      }

      model = finishLive(
        applyAngularStageGateDecision(model, "G12", "APPROVE"),
      );
    }

    model = finishLive(
      applyAngularStageGateDecision(model, "G07", "APPROVE"),
    );
    model = finishLive(model);
  }

  return model;
}
