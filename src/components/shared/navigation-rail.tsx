"use client";

import Link from "next/link";
import {
  Activity,
  Bell,
  BookOpen,
  ChevronRight,
  CircleHelp,
  FileCode2,
  FileText,
  GitBranch,
  Home,
  ListTree,
  ScrollText,
  Settings2,
  Workflow,
  X,
} from "lucide-react";

import type { ShellNavItem, StackKey } from "./presentation-types";

const icons = {
  home: Home,
  workspace: Activity,
  pipeline: Workflow,
  evidence: FileText,
  logs: ScrollText,
  diagnostics: CircleHelp,
  "target-versions": GitBranch,
  notifications: Bell,
  settings: Settings2,
  source: FileCode2,
  route: ListTree,
} as const;

export function NavigationRail({
  stack,
  items,
  open,
  onClose,
}: {
  stack: StackKey;
  items: ShellNavItem[];
  open: boolean;
  onClose: () => void;
}) {
  return (
    <aside
      className={`mf-nav-rail ${open ? "is-open" : ""}`}
      aria-label="Primary navigation"
    >
      <div className="flex items-center justify-between gap-3 px-4 py-4">
        <Link href="/" className="mf-focus flex min-w-0 items-center gap-3 rounded-lg">
          <span className="mf-brand-mark" aria-hidden="true">
            MF
          </span>
          <span className="min-w-0 leading-[1.05]">
            <span className="block text-sm font-bold tracking-[-0.02em] text-white">Migration</span>
            <span className="block text-sm font-bold tracking-[-0.02em] text-white">Factory</span>
          </span>
        </Link>
        <button
          type="button"
          className="mf-nav-close mf-focus rounded-md p-1.5 text-slate-400 hover:bg-white/10 hover:text-white"
          aria-label="Close navigation"
          onClick={onClose}
        >
          <X aria-hidden="true" className="h-4 w-4" />
        </button>
      </div>

      <div className="mf-nav-context mx-3 mb-3 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2">
        <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-slate-500">Active factory</p>
        <p className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-slate-200">
          <span className={`mf-stack-dot ${stack}`} aria-hidden="true" />
          {stack === "angular" ? "Angular" : "Spring Boot"}
          <ChevronRight aria-hidden="true" className="ml-auto h-3.5 w-3.5 text-slate-500" />
        </p>
      </div>

      <nav className="flex min-h-0 flex-1 flex-col gap-1 px-3" aria-label="Workspace sections">
        {items.map((item) => {
          const Icon = icons[item.id as keyof typeof icons] ?? Activity;
          const content = (
            <>
              <Icon aria-hidden="true" className="h-[17px] w-[17px] shrink-0" strokeWidth={1.8} />
              <span className="min-w-0 flex-1 truncate">{item.label}</span>
              {item.count !== undefined ? <span className="mf-nav-count">{item.count}</span> : null}
            </>
          );
          const className = `mf-nav-item mf-focus ${item.active ? "is-active" : ""}`;

          return item.href ? (
            <Link key={item.id} href={item.href} className={className} aria-current={item.active ? "page" : undefined} onClick={onClose}>
              {content}
            </Link>
          ) : (
            <button key={item.id} type="button" className={className} aria-current={item.active ? "page" : undefined} onClick={() => { item.onSelect?.(); onClose(); }}>
              {content}
            </button>
          );
        })}
      </nav>

      <div className="mt-auto space-y-1 border-t border-white/10 px-3 py-3">
        <div className="mf-nav-item pointer-events-none text-slate-500">
          <BookOpen aria-hidden="true" className="h-[17px] w-[17px]" strokeWidth={1.8} />
          <span>Presentation workspace</span>
        </div>
        <div className="mf-nav-profile">
          <span className="mf-avatar" aria-hidden="true">RK</span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-xs font-semibold text-slate-200">Run operator</span>
            <span className="block truncate text-[10px] text-slate-500">Engineering</span>
          </span>
          <Settings2 aria-hidden="true" className="h-4 w-4 text-slate-500" />
        </div>
      </div>
    </aside>
  );
}

