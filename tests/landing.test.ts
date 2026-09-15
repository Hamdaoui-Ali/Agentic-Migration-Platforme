import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { recentMigrations } from "../src/data/recent-migrations.ts";

test("recent migration deep links stay stack-owned", () => {
  assert.equal(recentMigrations.length, 5);
  for (const migration of recentMigrations) {
    const expectedPrefix = migration.stack === "Angular" ? "/angular/" : "/java/";
    assert.ok(migration.href.startsWith(expectedPrefix));
  }
});

test("landing scenarios include action-required, running, and completed examples", () => {
  assert.deepEqual(
    new Set(recentMigrations.map((migration) => migration.status)),
    new Set(["ACTION_REQUIRED", "RUNNING", "COMPLETED"]),
  );
});


test("landing includes direct presenter links for Java analysis, repair, and terminal report states", () => {
  const hrefs = new Set(recentMigrations.map((migration) => migration.href));
  assert.ok(hrefs.has("/java/migrations/java-order-service"));
  assert.ok(hrefs.has("/java/migrations/java-repair-service"));
  assert.ok(hrefs.has("/java/migrations/java-terminal-service"));
  assert.ok(hrefs.has("/angular/migrations/run-angular-action"));
  assert.ok(hrefs.has("/angular/migrations/run-angular-complete"));
});


test("Angular presenter cards lead with Movies and retain the legacy scenario", () => {
  const angular = recentMigrations.filter((migration) => migration.stack === "Angular");
  assert.equal(angular.length, 2);

  assert.deepEqual(
    angular.find((migration) => migration.id === "ang-movies-action"),
    {
      id: "ang-movies-action",
      name: "Angular Movies",
      stack: "Angular",
      route: "Angular 18 \u2192 21",
      status: "ACTION_REQUIRED",
      href: "/angular/migrations/run-angular-action",
      updated: "2 min ago",
    },
  );
  assert.deepEqual(
    angular.find((migration) => migration.id === "ang-crud-complete"),
    {
      id: "ang-crud-complete",
      name: "Angular 11 CRUD Example",
      stack: "Angular",
      route: "Angular 11 \u2192 21",
      status: "COMPLETED",
      href: "/angular/migrations/run-angular-complete",
      updated: "Yesterday",
    },
  );
});

test("landing presents an operational launchpad with theme choice", () => {
  const source = readFileSync("src/app/page.tsx", "utf8");
  assert.match(source, /ThemeToggle|ProductHeader/);
  assert.match(source, /Recent migrations/);
  assert.match(source, /StatusBadge/);
  assert.ok(recentMigrations.some((migration) => migration.status === "ACTION_REQUIRED"));
  assert.doesNotMatch(source, /Total migrations|Success rate|Average duration/);
});

test("setup flows retain their governed primary actions", () => {
  const angular = readFileSync("src/stacks/angular/components/angular-setup-page.tsx", "utf8");
  const java = readFileSync("src/stacks/java/components/java-setup-page.tsx", "utf8");
  assert.match(angular, /Review production readiness/);
  assert.match(java, /Create governed migration/);
});
