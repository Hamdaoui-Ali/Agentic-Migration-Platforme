import assert from "node:assert/strict";
import test from "node:test";

import { readStoredTheme, systemTheme } from "../src/lib/theme.ts";

test("theme helpers accept only supported persisted values", () => {
  assert.equal(readStoredTheme("light"), "light");
  assert.equal(readStoredTheme("dark"), "dark");
  assert.equal(readStoredTheme("solarized"), null);
  assert.equal(readStoredTheme(null), null);
});

test("system theme maps the media-query result", () => {
  assert.equal(systemTheme(true), "dark");
  assert.equal(systemTheme(false), "light");
});

