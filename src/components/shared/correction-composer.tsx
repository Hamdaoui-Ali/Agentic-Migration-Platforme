"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { textareaClassName } from "@/components/ui/form-field";

export function CorrectionComposer({
  title = "Correction to review",
  description = "Add an AI hint or paste a bounded patch for the owning workflow to review before it is applied.",
  disabled = false,
  onAcceptApply,
  onRequestModification,
  onSubmitCorrection,
}: {
  title?: string;
  description?: string;
  disabled?: boolean;
  onAcceptApply?: () => void;
  onRequestModification?: (correction: string) => void;
  onSubmitCorrection?: (correction: string) => void;
}) {
  const [correction, setCorrection] = useState("");
  const hasCorrection = correction.trim().length > 0;

  return (
    <section className="mt-4 rounded-lg border border-[var(--mf-border)] bg-[var(--mf-surface-subtle)] p-4" aria-label={title}>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.09em] text-[var(--mf-primary)]">{title}</p>
        <p className="mt-1 text-xs leading-5 text-[var(--mf-text-muted)]">{description}</p>
      </div>
      <textarea
        className={`${textareaClassName} mt-3 min-h-28 font-mono text-xs`}
        value={correction}
        disabled={disabled}
        onChange={(event) => setCorrection(event.target.value)}
        placeholder="Add a hint or paste a bounded patch"
        aria-label="Review input"
      />
      <div className="mt-3 flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          onClick={onAcceptApply}
          disabled={disabled || !onAcceptApply}
        >
          Accept change
        </Button>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          onClick={() => onRequestModification?.(correction.trim())}
          disabled={disabled || !hasCorrection || !onRequestModification}
        >
          Ask AI again
        </Button>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          onClick={() => onSubmitCorrection?.(correction.trim())}
          disabled={disabled || !hasCorrection || !onSubmitCorrection}
        >
          Use manual override
        </Button>
      </div>
      <p className="mt-3 text-[11px] leading-4 text-[var(--mf-text-soft)]">
        {disabled
          ? "Actions unlock when this reviewed repair owns the active human gate."
          : "The correction is sent to the stack owner as review context; the displayed diff remains immutable."}
      </p>
    </section>
  );
}
