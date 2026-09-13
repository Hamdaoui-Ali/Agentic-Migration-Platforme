"use client";

import { useState } from "react";

import { CommandBar } from "./command-bar";
import { ConsoleDrawer } from "./console-drawer";
import { JourneyRibbon } from "./journey-ribbon";
import { NavigationRail } from "./navigation-rail";
import { Observatory } from "./observatory";
import type { AppShellProps } from "./presentation-types";
import { StickyActionBar } from "./sticky-action-bar";

export function AppShell({
  stack,
  breadcrumb,
  status,
  nav,
  children,
  journey = [],
  observatoryEntries = [],
  consoleEntries = [],
  actions = [],
}: AppShellProps) {
  const [navOpen, setNavOpen] = useState(false);

  return (
    <div className={`mf-shell stack-${stack}`}>
      <NavigationRail stack={stack} items={nav} open={navOpen} onClose={() => setNavOpen(false)} />
      {navOpen ? <button type="button" className="mf-nav-backdrop" aria-label="Close navigation" onClick={() => setNavOpen(false)} /> : null}
      <div className="mf-shell-main">
        <CommandBar
          breadcrumb={breadcrumb}
          status={status}
          notificationCount={nav.find((item) => item.id === "notifications")?.count ?? 0}
          onOpenNav={() => setNavOpen(true)}
        />
        <main className="mf-shell-content">
          {journey.length ? <JourneyRibbon nodes={journey} /> : null}
          <div className="mf-shell-grid">
            <div className="min-w-0">{children}</div>
            <Observatory entries={observatoryEntries} />
          </div>
          <StickyActionBar actions={actions} />
          <ConsoleDrawer entries={consoleEntries} />
        </main>
      </div>
    </div>
  );
}
