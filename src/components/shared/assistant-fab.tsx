"use client";

import { FormEvent, useMemo, useState } from "react";
import { Bot, MessageCircle, Send, X } from "lucide-react";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";
import { fieldClassName } from "@/components/ui/form-field";

type AssistantMessage = {
  id: number;
  author: "operator" | "assistant";
  text: string;
};

function contextForPath(pathname: string): string {
  if (pathname.includes("/angular/")) return "Angular workspace";
  if (pathname.includes("/java/")) return "Java workspace";
  return "Migration Factory";
}

function answerForQuestion(question: string, context: string): string {
  const normalized = question.toLowerCase();
  if (normalized.includes("log")) {
    return `Open the Console drawer in the ${context} to inspect command output and evidence in order.`;
  }
  if (normalized.includes("diff") || normalized.includes("change")) {
    return "The reviewed diff is shown in the repair workspace. You can accept it, request a revision, or submit a typed correction for review.";
  }
  if (normalized.includes("gate") || normalized.includes("next")) {
    return "The active gate and its allowed decisions are shown in the action panel. I can explain the evidence currently attached to that boundary.";
  }
  return "I can help you find the current route, evidence, logs, or gate context in this workspace.";
}

export function AssistantFab() {
  const pathname = usePathname() ?? "/";
  const context = useMemo(() => contextForPath(pathname), [pathname]);
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<AssistantMessage[]>([]);

  function ask(nextQuestion: string) {
    const trimmed = nextQuestion.trim();
    if (!trimmed) return;
    setMessages((current) => [
      ...current,
      { id: Date.now(), author: "operator", text: trimmed },
      {
        id: Date.now() + 1,
        author: "assistant",
        text: answerForQuestion(trimmed, context),
      },
    ]);
    setQuestion("");
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    ask(question);
  }

  return (
    <>
      {open ? (
        <section
          className="mf-assistant-panel"
          data-resizable="true"
          role="dialog"
          aria-modal="false"
          aria-labelledby="migration-assistant-title"
        >
          <div className="mf-assistant-panel-header">
            <div className="flex min-w-0 items-center gap-2">
              <span className="mf-assistant-avatar" aria-hidden="true">
                <Bot size={16} strokeWidth={2.3} />
              </span>
              <div className="min-w-0">
                <p id="migration-assistant-title" className="text-sm font-semibold">
                  Migration assistant
                </p>
                <p className="truncate text-[10px] text-[var(--mf-text-soft)]">{context}</p>
              </div>
            </div>
            <button
              type="button"
              className="mf-focus mf-assistant-close"
              aria-label="Close migration assistant"
              onClick={() => setOpen(false)}
            >
              <X size={16} />
            </button>
          </div>

          <div className="mf-assistant-messages" aria-live="polite">
            {messages.length === 0 ? (
              <div className="mf-assistant-empty">
                <p className="text-xs font-semibold text-[var(--mf-text)]">Stay oriented</p>
                <p className="mt-1 text-[11px] leading-5 text-[var(--mf-text-muted)]">
                  Ask about this route, its logs, the reviewed diff, or the active gate.
                </p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`mf-assistant-message ${message.author === "operator" ? "is-operator" : "is-assistant"}`}
                >
                  {message.text}
                </div>
              ))
            )}
          </div>

          <div className="mf-assistant-prompts">
            {["What is happening?", "Show the logs", "Explain the gate"].map((prompt) => (
              <button
                key={prompt}
                type="button"
                className="mf-focus mf-assistant-prompt"
                onClick={() => ask(prompt)}
              >
                {prompt}
              </button>
            ))}
          </div>

          <form className="mf-assistant-form" onSubmit={submit}>
            <label className="sr-only" htmlFor="migration-assistant-question">
              Ask the migration assistant
            </label>
            <input
              id="migration-assistant-question"
              className={`${fieldClassName} min-w-0 flex-1 text-xs`}
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              placeholder="Ask about this workspace"
            />
            <Button
              type="submit"
              size="sm"
              aria-label="Send question"
              disabled={!question.trim()}
              className="shrink-0 px-3"
            >
              <Send size={14} />
            </Button>
          </form>
        </section>
      ) : null}

      <button
        type="button"
        className="mf-focus mf-assistant-fab fixed"
        aria-label={open ? "Close migration assistant" : "Open migration assistant"}
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        {open ? <X size={24} /> : <MessageCircle size={25} />}
        <span className="sr-only">{open ? "Close" : "Open"} migration assistant</span>
      </button>
    </>
  );
}

