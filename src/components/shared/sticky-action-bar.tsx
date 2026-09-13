import { Check, Pencil, XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { ShellAction } from "./presentation-types";

const iconFor: Record<ShellAction["variant"], typeof Check> = {
  primary: Check,
  secondary: Pencil,
  danger: XCircle,
  ghost: Pencil,
};

export function StickyActionBar({ actions }: { actions: ShellAction[] }) {
  if (!actions.length) return null;

  return (
    <div className="mf-sticky-actions" aria-label="Available actions">
      {actions.map((action) => {
        const Icon = iconFor[action.variant];
        return (
          <Button key={action.id} type="button" variant={action.variant} disabled={action.disabled} onClick={action.onSelect} className="min-w-0 flex-1">
            <Icon aria-hidden="true" className="h-4 w-4" strokeWidth={2} />
            <span className="truncate">{action.label}</span>
          </Button>
        );
      })}
    </div>
  );
}

