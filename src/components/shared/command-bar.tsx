"use client";

import { Bell, Menu, Search } from "lucide-react";

import { ThemeToggle } from "./theme-toggle";

export function CommandBar({
  breadcrumb,
  status,
  onOpenNav,
}: {
  breadcrumb: string;
  status?: React.ReactNode;
  onOpenNav: () => void;
}) {
  return (
    <header className="mf-command-bar">
      <div className="flex min-w-0 items-center gap-3">
        <button type="button" className="mf-command-menu mf-focus rounded-lg p-2" aria-label="Open navigation" onClick={onOpenNav}>
          <Menu aria-hidden="true" className="h-5 w-5" />
        </button>
        <div className="min-w-0 truncate text-xs font-medium text-[var(--mf-text-muted)]">
          <span className="hidden sm:inline">Workspace</span>
          <span className="mx-2 text-[var(--mf-text-soft)]">/</span>
          <span className="text-[var(--mf-text)]">{breadcrumb}</span>
        </div>
      </div>

      <div className="mf-command-tools">
        <button type="button" className="mf-search-trigger mf-focus" aria-label="Search routes, phases, evidence, or logs">
          <Search aria-hidden="true" className="h-4 w-4" />
          <span className="hidden min-[760px]:inline">Search routes, phases, evidence, or logs…</span>
          <kbd className="hidden min-[760px]:inline">⌘ K</kbd>
        </button>
        <button type="button" className="mf-icon-button mf-focus" aria-label="Notifications">
          <Bell aria-hidden="true" className="h-[17px] w-[17px]" />
          <span className="mf-notification-dot" aria-label="3 unread notifications">3</span>
        </button>
        <ThemeToggle />
        {status ? <div className="hidden sm:block">{status}</div> : null}
      </div>
    </header>
  );
}

