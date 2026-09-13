import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import {
  ASSISTANT_RESPONSES,
  ASSISTANT_SUGGESTIONS,
  answerForQuestion,
} from "../src/components/shared/assistant-content.ts";

function source(path: string): string {
  return readFileSync(new URL(path, import.meta.url), "utf8");
}

test("assistant offers five static replies and three suggestions", () => {
  assert.equal(ASSISTANT_RESPONSES.length, 5);
  assert.equal(ASSISTANT_SUGGESTIONS.length, 3);
  assert.match(answerForQuestion("hi", "Angular workspace"), /hello/i);
  assert.match(answerForQuestion("what is happening?", "Angular workspace"), /current workflow state/i);
  assert.match(answerForQuestion("show the route", "Angular workspace"), /route/i);
  assert.match(answerForQuestion("where are the logs?", "Angular workspace"), /console|evidence/i);
  assert.match(answerForQuestion("what should I do next?", "Angular workspace"), /next governed action/i);
});

test("assistant shows thinking feedback before revealing a typed reply", () => {
  const fab = source("../src/components/shared/assistant-fab.tsx");

  assert.match(fab, /ASSISTANT_THINKING_DELAY_MS/);
  assert.match(fab, /setTimeout/);
  assert.match(fab, /setInterval/);
  assert.match(fab, /slice\(0, visibleLength\)/);
  assert.match(fab, /aria-busy/);
  assert.match(fab, /isThinking/);
  assert.match(fab, /Thinking/);
});
