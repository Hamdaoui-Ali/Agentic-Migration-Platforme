import Link from "next/link";
import type { ReactNode } from "react";

import { ThemeToggle } from "./theme-toggle";

export function ProductHeader({
  breadcrumb,
  actions,
}: {
  breadcrumb?: string;
  actions?: ReactNode;
}) {
  return (
    <header className="border-b border-[var(--mf-border)] bg-[color-mix(in_srgb,var(--mf-page)_92%,transparent)] backdrop-blur">
      <div className="mf-container flex h-16 items-center justify-between gap-6">
        <div className="flex min-w-0 items-center gap-4">
          <Link
            href="/"
            className="mf-focus flex items-center gap-2 rounded-md font-semibold tracking-[-0.02em] text-[var(--mf-text)]"
          >
            <span className="mf-product-mark grid h-8 w-8 place-items-center rounded-[9px] bg-[var(--mf-graphite)] text-xs font-bold text-white">
              MF
            </span>
            <span className="hidden sm:inline">Migration Factory</span>
          </Link>
          {breadcrumb ? (
            <>
              <span className="text-[var(--mf-border-strong)]">/</span>
              <span className="truncate text-sm font-medium text-[var(--mf-text-muted)]">
                {breadcrumb}
              </span>
            </>
          ) : null}
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {actions ? actions : null}
        </div>
      </div>
    </header>
  );
}
