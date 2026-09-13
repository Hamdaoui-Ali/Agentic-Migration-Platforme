"use client";

import { useMemo, useState } from "react";
import { ArrowUpRight, CheckCircle2, Clock3, Copy, FileText, Mail, MessageSquareText, ShieldCheck } from "lucide-react";

import { groupObservatoryEntries, shortChecksum } from "@/lib/presentation";
import type { ObservatoryEntry } from "./presentation-types";

type ObservatoryFilter = "all" | "evidence" | "review" | "communication";

const filterLabels: Record<ObservatoryFilter, string> = {
  all: "All events",
  evidence: "Evidence",
  review: "Review",
  communication: "Communications",
};

function ObservatoryIcon({ kind }: { kind: ObservatoryEntry["kind"] }) {
  if (kind === "review") return <ShieldCheck aria-hidden="true" className="h-3.5 w-3.5" strokeWidth={1.9} />;
  if (kind === "email") return <Mail aria-hidden="true" className="h-3.5 w-3.5" strokeWidth={1.9} />;
  if (kind === "notification") return <MessageSquareText aria-hidden="true" className="h-3.5 w-3.5" strokeWidth={1.9} />;
  if (kind === "command") return <FileText aria-hidden="true" className="h-3.5 w-3.5" strokeWidth={1.9} />;
  if (kind === "system") return <Clock3 aria-hidden="true" className="h-3.5 w-3.5" strokeWidth={1.9} />;
  return <CheckCircle2 aria-hidden="true" className="h-3.5 w-3.5" strokeWidth={1.9} />;
}

export function Observatory({ entries }: { entries: ObservatoryEntry[] }) {
  const [filter, setFilter] = useState<ObservatoryFilter>("all");
  const groups = useMemo(() => groupObservatoryEntries(entries), [entries]);
  const visible = filter === "all" ? groups.all : filter === "evidence" ? groups.evidence : filter === "review" ? groups.review : groups.communication;

  return (
    <aside className="mf-observatory" aria-label="Evidence and context">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="mf-eyebrow">Observatory</p>
          <h2 className="mt-1 text-base font-semibold tracking-[-0.02em] text-[var(--mf-text)]">Evidence &amp; context</h2>
        </div>
        <span className="mf-count-chip">{entries.length}</span>
      </div>
      <div className="mf-observatory-tabs mt-4" role="tablist" aria-label="Evidence context filters">
        {(Object.keys(filterLabels) as ObservatoryFilter[]).map((item) => (
          <button key={item} type="button" role="tab" aria-selected={filter === item} className="mf-focus" onClick={() => setFilter(item)}>
            {filterLabels[item]}
          </button>
        ))}
      </div>
      <div className="mf-observatory-list mt-4">
        {visible.length ? visible.map((entry) => <ObservatoryRow key={entry.id} entry={entry} />) : (
          <div className="mf-empty-state">
            <Mail aria-hidden="true" className="h-5 w-5" />
            <p className="mt-2 text-sm font-semibold text-[var(--mf-text)]">
              {filter === "communication" ? "No communication records" : `No ${filterLabels[filter].toLowerCase()} records`}
            </p>
            <p className="mt-1 text-xs leading-5 text-[var(--mf-text-muted)]">
              {filter === "communication"
                ? "Notifications and email history will appear here when the run records them."
                : "This view will populate as the run records additional evidence."}
            </p>
          </div>
        )}
      </div>
      <button type="button" className="mf-observatory-footer mf-focus mt-4">
        Open full evidence <ArrowUpRight aria-hidden="true" className="h-3.5 w-3.5" />
      </button>
    </aside>
  );
}

function ObservatoryRow({ entry }: { entry: ObservatoryEntry }) {
  return (
    <article className="mf-observatory-row">
      <span className={`mf-observatory-icon kind-${entry.kind}`}><ObservatoryIcon kind={entry.kind} /></span>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-xs font-semibold leading-5 text-[var(--mf-text)]">{entry.title}</h3>
          <time className="shrink-0 text-[10px] text-[var(--mf-text-soft)]">{entry.timestamp}</time>
        </div>
        {entry.summary ? <p className="mt-0.5 text-[11px] leading-5 text-[var(--mf-text-muted)]">{entry.summary}</p> : null}
        {entry.checksum ? (
          <button type="button" className="mf-checksum mf-focus mt-2" aria-label={`Copy checksum ${entry.checksum}`} onClick={() => navigator.clipboard?.writeText(entry.checksum ?? "")}>
            <span>{shortChecksum(entry.checksum)}</span><Copy aria-hidden="true" className="h-3 w-3" />
          </button>
        ) : null}
      </div>
    </article>
  );
}
