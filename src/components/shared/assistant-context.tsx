"use client";

import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import {
  ASSISTANT_SUGGESTIONS,
  answerForQuestion,
  type AssistantSnapshot,
} from "./assistant-content";

export const DEFAULT_ASSISTANT_SNAPSHOT: AssistantSnapshot = {
  context: "Migration Factory",
  suggestions: ASSISTANT_SUGGESTIONS,
  answer: (question) => answerForQuestion(question, "Migration Factory"),
};

type AssistantContextValue = {
  snapshot: AssistantSnapshot;
  snapshotRef: { current: AssistantSnapshot };
  registerSnapshot: (snapshot: AssistantSnapshot) => void;
  resetSnapshot: () => void;
};

const AssistantContext = createContext<AssistantContextValue>({
  snapshot: DEFAULT_ASSISTANT_SNAPSHOT,
  snapshotRef: { current: DEFAULT_ASSISTANT_SNAPSHOT },
  registerSnapshot: () => undefined,
  resetSnapshot: () => undefined,
});

export function AssistantProvider({ children }: { children: ReactNode }) {
  const [displaySnapshot, setDisplaySnapshot] = useState(
    DEFAULT_ASSISTANT_SNAPSHOT,
  );
  const snapshotRef = useRef(DEFAULT_ASSISTANT_SNAPSHOT);
  const registerSnapshot = useCallback((next: AssistantSnapshot) => {
    const previous = snapshotRef.current;
    snapshotRef.current = next;
    if (
      previous.context !== next.context ||
      previous.suggestions !== next.suggestions
    ) {
      setDisplaySnapshot(next);
    }
  }, []);
  const resetSnapshot = useCallback(() => {
    snapshotRef.current = DEFAULT_ASSISTANT_SNAPSHOT;
    setDisplaySnapshot(DEFAULT_ASSISTANT_SNAPSHOT);
  }, []);
  const value = useMemo(
    () => ({
      snapshot: displaySnapshot,
      snapshotRef,
      registerSnapshot,
      resetSnapshot,
    }),
    [displaySnapshot, registerSnapshot, resetSnapshot],
  );

  return (
    <AssistantContext.Provider value={value}>
      {children}
    </AssistantContext.Provider>
  );
}

export function useAssistantSnapshot(): AssistantSnapshot {
  return useContext(AssistantContext).snapshot;
}

export function useRegisterAssistantSnapshot(snapshot: AssistantSnapshot): void {
  const { registerSnapshot, resetSnapshot } = useContext(AssistantContext);

  useEffect(() => {
    registerSnapshot(snapshot);
  }, [registerSnapshot, snapshot]);

  useEffect(() => () => resetSnapshot(), [resetSnapshot]);
}

export function useAssistantAnswer(): (question: string) => string {
  const { snapshotRef } = useContext(AssistantContext);
  return useCallback(
    (question: string) => snapshotRef.current.answer(question),
    [snapshotRef],
  );
}
