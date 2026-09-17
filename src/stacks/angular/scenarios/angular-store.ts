"use client";

import type { AngularPreflight, AngularRunSeed } from "../domain/types";
import type { AngularRunModel } from "../domain/run-types";
import { stableDisplayChecksum } from "../../../scenarios/runtime/checksum.ts";
import { createAngularRunModel } from "../workflow/run.ts";
import { prepareProvenStage } from "../workflow/proven.ts";
import {
  isAngularMoviesPrimaryPreflightId,
  isAngularMoviesPrimaryRunId,
  seedAngularPreflight,
  seedAngularRun,
} from "./seeds.ts";

interface AngularPresentationState {
  preflights: Record<string, AngularPreflight>;
  runs: Record<string, AngularRunModel | AngularRunSeed>;
}

const STORAGE_KEY = "migration-factory:angular:v4";

function emptyState(): AngularPresentationState {
  return { preflights: {}, runs: {} };
}

function asRunModel(run: AngularRunModel | AngularRunSeed): AngularRunModel {
  const model = "gates" in run ? run : createAngularRunModel(run);
  return {
    ...model,
    operations: model.operations ?? {
      commands: [],
      partialDeliveries: [],
      rollbacks: [],
      stageHistory: [],
    },
  };
}

function archiveSuffix(value: unknown): string {
  return stableDisplayChecksum(JSON.stringify(value)).slice(0, 12);
}

function isCorrectAngularMoviesPreflight(
  id: string,
  preflight: AngularPreflight,
): boolean {
  return (
    isAngularMoviesPrimaryPreflightId(id) &&
    preflight.sourceProfile === "ANGULAR_MOVIES" &&
    preflight.sourceMajor === 18 &&
    preflight.targetMajor === 21
  );
}

function restoreAngularMoviesPreflight(
  id: string,
  stale: AngularPreflight,
  state: AngularPresentationState,
): AngularPreflight {
  const archiveId = `${id}-archived-${archiveSuffix(stale)}`;
  const corrected = seedAngularPreflight(id);
  const migrated = {
    ...corrected,
    evidence: [
      ...corrected.evidence,
      {
        id: `${id}-source-profile-corrected`,
        category: "SOURCE" as const,
        title: "Angular Movies source profile corrected",
        summary:
          "An incompatible persisted source profile was archived before restoring the Angular Movies 18 -> 21 route.",
        timestamp: new Date().toISOString(),
        checksum: stableDisplayChecksum(`${id}:source-profile-corrected:${archiveId}`),
      },
    ],
  };
  saveAngularState({
    ...state,
    preflights: {
      ...state.preflights,
      [archiveId]: stale,
      [id]: migrated,
    },
  });
  return migrated;
}

function isCorrectAngularMoviesRun(id: string, run: AngularRunModel): boolean {
  return (
    isAngularMoviesPrimaryRunId(id) &&
    run.sourceProfile === "ANGULAR_MOVIES" &&
    run.sourceMajor === 18 &&
    run.targetMajor === 21
  );
}

function restoreAngularMoviesRun(
  id: string,
  stale: AngularRunModel,
  state: AngularPresentationState,
): AngularRunModel {
  const archiveId = `${id}-archived-${archiveSuffix(stale)}`;
  const corrected = seedAngularRun(id);
  const migrated = {
    ...corrected,
    evidence: [
      ...corrected.evidence,
      {
        id: `${id}-source-profile-corrected`,
        category: "SOURCE" as const,
        title: "Angular Movies source profile corrected",
        summary:
          "An incompatible persisted source profile was archived before restoring the Angular Movies 18 -> 21 route.",
        timestamp: new Date().toISOString(),
        checksum: stableDisplayChecksum(`${id}:source-profile-corrected:${archiveId}`),
      },
    ],
  };
  saveAngularState({
    ...state,
    runs: {
      ...state.runs,
      [archiveId]: stale,
      [id]: migrated,
    },
  });
  return migrated;
}

export function loadAngularState(): AngularPresentationState {
  if (typeof window === "undefined") return emptyState();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyState();
    const parsed = JSON.parse(raw) as AngularPresentationState;
    return { preflights: parsed.preflights ?? {}, runs: parsed.runs ?? {} };
  } catch {
    return emptyState();
  }
}

export function saveAngularState(state: AngularPresentationState): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function putAngularPreflight(preflight: AngularPreflight): AngularPresentationState {
  const state = loadAngularState();
  const next = { ...state, preflights: { ...state.preflights, [preflight.id]: preflight } };
  saveAngularState(next);
  return next;
}

export function putAngularRun(run: AngularRunModel | AngularRunSeed): AngularPresentationState {
  const state = loadAngularState();
  const model = asRunModel(run);
  const next = { ...state, runs: { ...state.runs, [model.id]: model } };
  saveAngularState(next);
  return next;
}

export function getAngularPreflight(id: string): AngularPreflight {
  const state = loadAngularState();
  const existing = state.preflights[id];
  if (existing) {
    if (
      isAngularMoviesPrimaryPreflightId(id) &&
      !isCorrectAngularMoviesPreflight(id, existing)
    ) {
      return restoreAngularMoviesPreflight(id, existing, state);
    }
    return existing;
  }
  const seeded = seedAngularPreflight(id);
  putAngularPreflight(seeded);
  return seeded;
}

export function getAngularRun(id: string): AngularRunModel {
  const state = loadAngularState();
  const existing = state.runs[id];
  if (existing) {
    let model = asRunModel(existing);
    if (
      isAngularMoviesPrimaryRunId(id) &&
      !isCorrectAngularMoviesRun(id, model)
    ) {
      return restoreAngularMoviesRun(id, model, state);
    }
    if (
      model.phase === "STAGE_PREPARATION" &&
      !model.stageExecution &&
      !model.liveExecution
    ) {
      model = prepareProvenStage(model);
    }
    if (!("gates" in existing) || model !== existing) putAngularRun(model);
    return model;
  }

  const seeded = seedAngularRun(id);
  putAngularRun(seeded);
  return seeded;
}

export function resetAngularState(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
}
