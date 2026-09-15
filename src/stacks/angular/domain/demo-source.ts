export const ANGULAR11_CRUD_SOURCE = {
  repository: "cornflourblue/angular-11-crud-example",
  revision: "eda3cf6278c02e4fb65f91ec73a9281d4325514e",
  applicationName: "angular-crud-example",
  sourcePath: "/workspace/angular-11-crud-example",
  angular: "11.0.4",
  angularCli: "11.0.4",
  buildAngular: "0.1100.4",
  typescript: "4.0.2",
  rxjs: "6.6.x",
  zoneJs: "0.10.x",
  projects: 1,
  lazyFeatureModules: 1,
  crudOperations: 5,
  packageEntries: 28,
  thirdPartyEntries: 17,
  builder: "@angular-devkit/build-angular:browser",
  lockfile: "package-lock.json",
  routes: ["/", "/users", "/users/add", "/users/edit/:id"],
  architecture: [
    "NgModule application architecture",
    "Lazy-loaded UsersModule",
    "Reactive Forms",
    "HttpClient service layer",
    "HTTP interceptor chain",
    "localStorage-backed development API interceptor",
  ],
  tooling: {
    unit: "Karma 5.1 + Jasmine 3.6 + Chrome launcher",
    lint: "TSLint 6.1 + Codelyzer 6",
    e2e: "Protractor 7 + Jasmine",
  },
} as const;

export const ANGULAR_MOVIES_SOURCE = {
  repository: "tastejs/angular-movies",
  revision: "794e45e00cc2e0935b1a48a372b9a34779f016cb",
  applicationName: "angular-movies",
  sourcePath: "/workspace/angular-movies",
  angular: "18.2.14",
  angularCli: "18.2.21",
  buildAngular: "18.2.21",
  typescript: "5.5.4",
  rxjs: "7.8.2",
  zoneJs: "0.14.10",
  projects: 1,
  lazyFeatureModules: 6,
  crudOperations: 0,
  packageEntries: 100,
  thirdPartyEntries: 84,
  builder: "@angular-devkit/build-angular:application",
  lockfile: "package-lock.json",
  routes: [
    "/list/:type/:identifier",
    "/detail/movie/:identifier",
    "/detail/list/:identifier",
    "/detail/person/:identifier",
    "/account",
    "/page-not-found",
  ],
  architecture: [
    "Standalone Angular application",
    "Angular SSR entrypoint with @angular/ssr",
    "Nx workspace with lazy movie, person, and account routes",
    "RxAngular state and template primitives",
    "Service worker and prerender-ready application target",
  ],
  tooling: {
    unit: "Jest 29 + jest-preset-angular",
    lint: "Angular ESLint 18.4",
    e2e: "Push-based user-flow + Puppeteer",
  },
} as const;

export const ANGULAR_MOVIES_NG19_REPAIR = {
  repository: "tastejs/angular-movies",
  sourceCommit: "794e45e00cc2e0935b1a48a372b9a34779f016cb",
  targetCommit: "a002daf3e4ce107f3ef4cd99259e730438f5d1a3",
  path: "projects/movies/server.ts",
  sourceUrl: "https://github.com/tastejs/angular-movies/commit/a002daf3e4ce107f3ef4cd99259e730438f5d1a3",
  compareUrl: "https://github.com/tastejs/angular-movies/compare/794e45e00cc2e0935b1a48a372b9a34779f016cb...a002daf3e4ce107f3ef4cd99259e730438f5d1a3",
} as const;

export const ANGULAR_MOVIES_NG19_REPAIR_DIFF = `diff --git a/projects/movies/server.ts b/projects/movies/server.ts
--- a/projects/movies/server.ts
+++ b/projects/movies/server.ts
@@ -1,6 +1,6 @@
-import { CommonEngine } from '@angular/ssr';
+import { CommonEngine } from '@angular/ssr/node';`;
