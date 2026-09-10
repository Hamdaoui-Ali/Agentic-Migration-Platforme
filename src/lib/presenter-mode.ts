"use client";

import { useSyncExternalStore } from "react";

export const DEFAULT_RECORDING_SPEED = 3;
const MIN_PLAYBACK_SPEED = 1;
const MAX_PLAYBACK_SPEED = 6;

export function playbackSpeedFromSearch(search: string): number {
  const params = new URLSearchParams(search);
  const requested = Number(params.get("speed"));
  const hasValidSpeed =
    Number.isFinite(requested) &&
    requested >= MIN_PLAYBACK_SPEED &&
    requested <= MAX_PLAYBACK_SPEED;

  if (hasValidSpeed) return requested;

  const presenterMode =
    params.get("mode") === "recording" || params.get("presenter") === "1";
  return presenterMode ? DEFAULT_RECORDING_SPEED : 1;
}

export function playbackNow(
  startedAtMs: number,
  realNowMs: number,
  speed: number,
): number {
  return startedAtMs + Math.max(0, realNowMs - startedAtMs) * speed;
}

type ModelWithLiveExecution = {
  liveExecution?: {
    startedAtMs: number;
  };
};

export function rebaseLiveExecutionStart<T extends ModelWithLiveExecution>(
  model: T,
  realNowMs: number,
  speed: number,
): T {
  if (speed === 1 || !model.liveExecution) return model;

  return {
    ...model,
    liveExecution: {
      ...model.liveExecution,
      startedAtMs: realNowMs,
    },
  } as T;
}

export function usePlaybackSpeed(): number {
  return useSyncExternalStore(
    (onChange) => {
      window.addEventListener("popstate", onChange);
      return () => window.removeEventListener("popstate", onChange);
    },
    () => playbackSpeedFromSearch(window.location.search),
    () => 1,
  );
}
