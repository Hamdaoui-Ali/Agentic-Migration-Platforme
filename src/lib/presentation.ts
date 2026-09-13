import type { ObservatoryEntry, JourneyNode } from "@/components/shared/presentation-types";

export function visibleJourneyNodes(nodes: readonly JourneyNode[]): JourneyNode[] {
  return [...nodes];
}

export function groupObservatoryEntries(entries: readonly ObservatoryEntry[]) {
  return {
    all: [...entries],
    evidence: entries.filter((entry) => entry.kind === "evidence" || entry.kind === "command"),
    review: entries.filter((entry) => entry.kind === "review"),
    communication: entries.filter((entry) => entry.kind === "notification" || entry.kind === "email"),
  };
}

export function shortChecksum(checksum?: string): string {
  if (!checksum) return "Not recorded";
  if (checksum.length <= 22) return checksum;
  return `${checksum.slice(0, 10)}…${checksum.slice(-8)}`;
}

