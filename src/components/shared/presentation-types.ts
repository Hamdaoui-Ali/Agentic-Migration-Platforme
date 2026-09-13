import type { ReactNode } from "react";

export type StackKey = "angular" | "java";

export type ShellNavItem = {
  id: string;
  label: string;
  href?: string;
  count?: number;
  active?: boolean;
  onSelect?: () => void;
};

export type JourneyNode = {
  id: string;
  label: string;
  status:
    | "SEALED"
    | "RUNNING"
    | "ACTION_REQUIRED"
    | "INCLUDED"
    | "SKIPPED"
    | "EXCLUDED"
    | "PENDING"
    | "COMPLETED"
    | "CANCELLED";
  detail?: string;
};

export type ObservatoryEntry = {
  id: string;
  kind: "evidence" | "review" | "command" | "notification" | "email" | "system";
  timestamp: string;
  title: string;
  summary?: string;
  checksum?: string;
  href?: string;
};

export type ConsoleEntry = {
  id: string;
  timestamp?: string;
  channel: string;
  message: string;
  tone?: "neutral" | "info" | "success" | "warning" | "danger";
};

export type ShellAction = {
  id: string;
  label: string;
  variant: "primary" | "secondary" | "danger" | "ghost";
  disabled?: boolean;
  onSelect: () => void;
};

export type AppShellProps = {
  stack: StackKey;
  breadcrumb: string;
  status?: ReactNode;
  nav: ShellNavItem[];
  children: ReactNode;
  journey?: JourneyNode[];
  observatoryEntries?: ObservatoryEntry[];
  consoleEntries?: ConsoleEntry[];
  actions?: ShellAction[];
};

