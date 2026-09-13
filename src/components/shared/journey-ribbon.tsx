import { Check, Circle, CircleAlert, CircleDot, Minus } from "lucide-react";

import type { JourneyNode } from "./presentation-types";

function iconFor(status: JourneyNode["status"]) {
  if (status === "SEALED" || status === "COMPLETED") return Check;
  if (status === "ACTION_REQUIRED") return CircleAlert;
  if (status === "RUNNING") return CircleDot;
  if (status === "SKIPPED" || status === "EXCLUDED") return Minus;
  return Circle;
}

export function JourneyRibbon({ nodes }: { nodes: JourneyNode[] }) {
  if (!nodes.length) return null;

  return (
    <section className="mf-journey" aria-label="Migration route progress">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="mf-eyebrow">Journey</p>
          <h2 className="mt-1 text-sm font-semibold text-[var(--mf-text)]">Route progress</h2>
        </div>
        <p className="text-[11px] font-medium text-[var(--mf-text-muted)]">
          {nodes.filter((node) => node.status === "SEALED" || node.status === "COMPLETED").length} of {nodes.length} complete
        </p>
      </div>
      <div className="mf-journey-scroll mt-4">
        {nodes.map((node, index) => {
          const Icon = iconFor(node.status);
          const active = node.status === "RUNNING" || node.status === "ACTION_REQUIRED";
          return (
            <div key={node.id} className={`mf-journey-node ${active ? "is-active" : ""} status-${node.status.toLowerCase()}`}>
              <span className="mf-journey-icon" aria-hidden="true"><Icon className="h-3.5 w-3.5" strokeWidth={2.4} /></span>
              <span className="min-w-0">
                <span className="block whitespace-nowrap text-[11px] font-bold text-[var(--mf-text)]">{node.label}</span>
                {node.detail ? <span className="mt-0.5 block whitespace-nowrap text-[10px] text-[var(--mf-text-soft)]">{node.detail}</span> : null}
              </span>
              {index < nodes.length - 1 ? <span className="mf-journey-line" aria-hidden="true" /> : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}

