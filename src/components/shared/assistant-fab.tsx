"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { Bot, LoaderCircle, MessageCircle, Send, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { fieldClassName } from "@/components/ui/form-field";
import {
  ASSISTANT_THINKING_DELAY_MS,
  ASSISTANT_TYPING_INTERVAL_MS,
} from "./assistant-content";
import { useAssistantAnswer, useAssistantSnapshot } from "./assistant-context";

type AssistantMessage = {
  id: number;
  author: "operator" | "assistant";
  text: string;
};

export function AssistantFab() {
  const snapshot = useAssistantSnapshot();
  const answerQuestion = useAssistantAnswer();
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<AssistantMessage[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [typingMessageId, setTypingMessageId] = useState<number | null>(null);
  const nextMessageIdRef = useRef(0);
  const thinkingTimerRef = useRef<number | null>(null);
  const typingTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (thinkingTimerRef.current !== null) {
        window.clearTimeout(thinkingTimerRef.current);
      }
      if (typingTimerRef.current !== null) {
        window.clearInterval(typingTimerRef.current);
      }
    };
  }, []);

  function ask(nextQuestion: string) {
    const trimmed = nextQuestion.trim();
    if (!trimmed || isThinking || typingMessageId !== null) return;

    const operatorMessageId = nextMessageIdRef.current + 1;
    const assistantMessageId = operatorMessageId + 1;
    nextMessageIdRef.current = assistantMessageId;
    const answer = answerQuestion(trimmed);

    setMessages((current) => [
      ...current,
      { id: operatorMessageId, author: "operator", text: trimmed },
    ]);
    setQuestion("");
    setIsThinking(true);
    thinkingTimerRef.current = window.setTimeout(() => {
      thinkingTimerRef.current = null;
      setIsThinking(false);
      setTypingMessageId(assistantMessageId);
      setMessages((current) => [
        ...current,
        { id: assistantMessageId, author: "assistant", text: "" },
      ]);

      let visibleLength = 0;
      typingTimerRef.current = window.setInterval(() => {
        visibleLength += 1;
        setMessages((current) =>
          current.map((message) =>
            message.id === assistantMessageId
              ? { ...message, text: answer.slice(0, visibleLength) }
              : message,
          ),
        );
        if (visibleLength >= answer.length) {
          if (typingTimerRef.current !== null) {
            window.clearInterval(typingTimerRef.current);
            typingTimerRef.current = null;
          }
          setTypingMessageId(null);
        }
      }, ASSISTANT_TYPING_INTERVAL_MS);
    }, ASSISTANT_THINKING_DELAY_MS);
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
          hidden={!open}
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
                <p className="truncate text-[10px] text-[var(--mf-text-soft)]">{snapshot.context}</p>
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

          <div
            className="mf-assistant-messages"
            aria-live="polite"
            aria-busy={isThinking || typingMessageId !== null}
          >
            {messages.length === 0 ? (
              <div className="mf-assistant-empty">
                <p className="text-xs font-semibold text-[var(--mf-text)]">Ask a focused question</p>
                <p className="mt-1 text-[11px] leading-5 text-[var(--mf-text-muted)]">
                  I can explain what is happening, the migration route, and the next governed decision.
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
            {isThinking ? (
              <div className="mf-assistant-thinking" role="status" aria-label="Migration assistant is thinking">
                <LoaderCircle className="animate-spin" size={14} aria-hidden="true" />
                <span>Thinking</span>
              </div>
            ) : null}
          </div>

          <div className="mf-assistant-prompts">
            {snapshot.suggestions.map((prompt) => (
              <button
                key={prompt}
                type="button"
                className="mf-focus mf-assistant-prompt"
                disabled={isThinking || typingMessageId !== null}
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
              disabled={isThinking || typingMessageId !== null}
              onChange={(event) => setQuestion(event.target.value)}
              placeholder="Ask about this workspace"
            />
            <Button
              type="submit"
              size="sm"
              aria-label="Send question"
              disabled={!question.trim() || isThinking || typingMessageId !== null}
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

