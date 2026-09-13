"use client";

import { useMemo, useState } from "react";
import { ChevronDown, ChevronUp, Maximize2, Pause, Play, Terminal } from "lucide-react";

import { toneForStatus } from "@/lib/display";
import type { ConsoleEntry } from "./presentation-types";

export function ConsoleDrawer({ entries }: { entries: ConsoleEntry[] }) {
  const [open, setOpen] = useState(true);
  const [autoFollow, setAutoFollow] = useState(true);
  const visible = useMemo(() => entries.slice(-80), [entries]);

  return (
    <section className={`mf-console-drawer ${open ? "is-open" : ""}`} aria-label="Live console">
      <div className="mf-console-bar">
        <button type="button" className="mf-focus flex min-w-0 items-center gap-2 rounded-md text-left" onClick={() => setOpen((value) => !value)} aria-expanded={open}>
          <Terminal aria-hidden="true" className="h-4 w-4 text-cyan-300" />
          <span className="text-xs font-bold tracking-[0.01em] text-slate-100">Live console</span>
          {entries.length ? <span className="mf-console-streaming"><span className="mf-live-dot" aria-hidden="true" /> Streaming logs from this execution</span> : null}
          {open ? <ChevronDown aria-hidden="true" className="ml-1 h-4 w-4 text-slate-500" /> : <ChevronUp aria-hidden="true" className="ml-1 h-4 w-4 text-slate-500" />}
        </button>
        <div className="flex items-center gap-2">
          <button type="button" className="mf-console-control mf-focus" aria-pressed={autoFollow} onClick={() => setAutoFollow((value) => !value)}>
            {autoFollow ? <Pause aria-hidden="true" className="h-3.5 w-3.5" /> : <Play aria-hidden="true" className="h-3.5 w-3.5" />}
            <span className="hidden sm:inline">Auto-follow {autoFollow ? "on" : "off"}</span>
          </button>
          <button type="button" className="mf-console-control mf-focus" aria-label="Expand live console"><Maximize2 aria-hidden="true" className="h-3.5 w-3.5" /></button>
        </div>
      </div>
      {open ? (
        <div className="mf-console-body mf-scrollbar">
          {visible.length ? visible.map((entry) => (
            <div key={entry.id} className="mf-console-line">
              <span className="text-slate-500">{entry.timestamp ?? "--:--:--"}</span>
              <span className={`mf-console-channel tone-${toneForStatus(entry.tone ?? "neutral")}`}>[{entry.channel}]</span>
              <span className="min-w-0 text-slate-300">{entry.message}</span>
            </div>
          )) : <p className="text-xs text-slate-500">No runtime log entries have been recorded for this state.</p>}
        </div>
      ) : null}
    </section>
  );
}

