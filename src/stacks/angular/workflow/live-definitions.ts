import { paceLiveExecution } from "../../../domain/live-execution.ts";
import type { LiveExecutionStep } from "../../../domain/live-execution.ts";
import type {
  AngularLiveExecution,
  AngularLiveExecutionKind,
} from "../domain/run-types.ts";
import type { AngularMajor, AngularSourceProfileId } from "../domain/types.ts";
import {
  ANGULAR11_CRUD_SOURCE,
  ANGULAR_MOVIES_NG19_REPAIR,
  ANGULAR_MOVIES_SOURCE,
} from "../domain/demo-source.ts";

type AngularLiveContext = {
  source?: AngularMajor;
  target?: AngularMajor;
  sourceProfile?: AngularSourceProfileId;
};

function id(kind: AngularLiveExecutionKind, startedAtMs: number) {
  return "angular-" + kind.toLowerCase().replaceAll("_", "-") + "-" + startedAtMs;
}

export function createAngularLiveExecution(
  kind: AngularLiveExecutionKind,
  startedAtMs: number,
  context: AngularLiveContext = {},
): AngularLiveExecution {
  const raw =
    context.sourceProfile === "ANGULAR_MOVIES"
      ? createAngularMoviesLiveExecutionRaw(kind, startedAtMs, context)
      : context.sourceProfile === "GENERIC"
        ? createAngularGenericLiveExecutionRaw(kind, startedAtMs, context)
      : createAngularLiveExecutionRaw(kind, startedAtMs, context);
  const minimumDurationMs =
    kind === "PLANNING"
      ? 45_000
      : kind === "REPAIR_REVIEW"
        ? 45_000
        : kind === "REPAIR_VALIDATION"
          ? 120_000
          : 30_000;
  return paceLiveExecution(raw, minimumDurationMs);
}

function movieStep(
  id: string,
  label: string,
  node: string,
  detail: string,
  durationMs: number,
  kind: LiveExecutionStep["kind"],
  logs: string[],
  extras: Partial<Pick<LiveExecutionStep, "command" | "provider" | "deployment" | "role">> = {},
): LiveExecutionStep {
  return { id, label, node, detail, durationMs, kind, logs, ...extras };
}

function genericStep(
  id: string,
  label: string,
  node: string,
  detail: string,
  durationMs: number,
  kind: LiveExecutionStep["kind"],
  logs: string[],
  extras: Partial<Pick<LiveExecutionStep, "command" | "provider" | "deployment" | "role">> = {},
): LiveExecutionStep {
  return { id, label, node, detail, durationMs, kind, logs, ...extras };
}

function createAngularMoviesLiveExecutionRaw(
  kind: AngularLiveExecutionKind,
  startedAtMs: number,
  context: AngularLiveContext,
): AngularLiveExecution {
  const source = context.source ?? 18;
  const target = context.target ?? 21;
  const routeLabel = `Angular ${source} -> ${target}`;

  const phaseSteps: Record<AngularLiveExecutionKind, LiveExecutionStep[]> = {
    BASELINE: [
      movieStep(
        "movies-baseline-identity",
        "Bind source repository identity",
        "baseline.source_identity",
        "Bind the approved tastejs/angular-movies revision and immutable source fingerprint.",
        1500,
        "SYSTEM",
        [
          `Repository: ${ANGULAR_MOVIES_SOURCE.repository}`,
          `Revision: ${ANGULAR_MOVIES_SOURCE.revision}`,
          `Source application: ${ANGULAR_MOVIES_SOURCE.applicationName}`,
          "Immutable source fingerprint recorded.",
        ],
      ),
      movieStep(
        "movies-baseline-manifest",
        "Inspect Nx and Angular manifests",
        "baseline.manifest_inspection",
        "Read package.json, project.json, TypeScript configuration, and lockfile authority.",
        1700,
        "SYSTEM",
        [
          "Angular 18.2.14 · Angular CLI 18.2.21",
          "build-angular 18.2.21 · TypeScript 5.5.4",
          "RxJS 7.8.2 · zone.js 0.14.10",
          "Nx workspace: 1 movies project · 6 lazy feature modules",
          `builder=${ANGULAR_MOVIES_SOURCE.builder}`,
          "package-lock.json authority confirmed.",
        ],
      ),
      movieStep(
        "movies-baseline-install",
        "Clean lockfile install",
        "command.baseline_install",
        "Install exactly from the committed package-lock.json.",
        2600,
        "COMMAND",
        [
          "$ npm ci",
          "Lockfile authority: package-lock.json",
          "100 manifest package entries resolved.",
          "Angular 18 dependency tree materialized.",
          "exit code 0",
        ],
        { command: "npm ci" },
      ),
      movieStep(
        "movies-baseline-build",
        "Build the movies application",
        "command.baseline_build",
        "Build the Nx movies project with its application builder and SSR entrypoint.",
        2800,
        "COMMAND",
        [
          "$ npx nx build movies",
          `Builder: ${ANGULAR_MOVIES_SOURCE.builder}`,
          "Browser bundle and server entrypoint compiled.",
          "Prerender and service-worker configuration preserved.",
          "exit code 0",
        ],
        { command: "npx nx build movies" },
      ),
      movieStep(
        "movies-baseline-tests",
        "Run Jest and browser-flow baseline checks",
        "command.baseline_test",
        "Freeze unit, SSR, and browser-flow evidence before G03 qualification.",
        2500,
        "COMMAND",
        [
          "$ npx nx test movies --runInBand",
          "Jest 29 + jest-preset-angular configured.",
          "SSR route render and browser-flow checks registered.",
          "Push-based user-flow + Puppeteer authority recorded.",
          "Baseline test evidence finalized.",
        ],
        { command: "npx nx test movies --runInBand" },
      ),
      movieStep(
        "movies-baseline-lint",
        "Run Angular ESLint baseline",
        "command.baseline_lint",
        "Run the source lint authority exactly as configured by Angular 18.",
        1800,
        "COMMAND",
        [
          "$ npx nx lint movies",
          "Angular ESLint 18.4 configuration loaded.",
          "Standalone templates and TypeScript source included.",
          "Baseline lint evidence finalized.",
        ],
        { command: "npx nx lint movies" },
      ),
      movieStep(
        "movies-baseline-qualification",
        "Qualify baseline for G03",
        "baseline.qualification.complete",
        "Classify SSR, browser-flow, and dependency evidence for human baseline acceptance.",
        1400,
        "SYSTEM",
        [
          "Baseline reproducibility: qualified.",
          "SSR and browser-flow parity evidence attached.",
          "G03 evidence package finalized.",
        ],
      ),
    ],
    ANALYSIS: [
      movieStep(
        "movies-analysis-inputs",
        "Freeze deterministic analysis inputs",
        "analysis.input_manifest",
        "Bind the accepted baseline, source revision, manifests, and route evidence.",
        1000,
        "SYSTEM",
        [
          `Binding repository revision ${ANGULAR_MOVIES_SOURCE.revision}`,
          "Accepted G03 baseline evidence attached.",
          "package.json · project.json · tsconfig.json registered.",
          "Analysis input manifest checksum finalized.",
        ],
      ),
      movieStep(
        "movies-analysis-topology",
        "Scan Nx and application topology",
        "analysis.topology_scan",
        "Classify the standalone application, lazy route boundaries, SSR entrypoint, and service-worker target.",
        2400,
        "SYSTEM",
        [
          "Nx project: movies",
          "Standalone Angular application detected.",
          "Lazy feature boundaries: movie · person · account",
          "SSR server entry: projects/movies/server.ts",
          "Service worker and prerender targets detected.",
        ],
      ),
      movieStep(
        "movies-analysis-routes",
        "Extract route and browser-flow contracts",
        "analysis.route_scan",
        "Map parameterized routes that must remain equivalent across each adjacent-major stage.",
        2300,
        "SYSTEM",
        ANGULAR_MOVIES_SOURCE.routes.map((route) => `Route ${route} registered.`),
      ),
      movieStep(
        "movies-analysis-ssr",
        "Inspect SSR and hydration behavior",
        "analysis.ssr_scan",
        "Inspect CommonEngine, server rendering, prerender, and browser hydration boundaries.",
        2300,
        "SYSTEM",
        [
          "CommonEngine imported from @angular/ssr in the source revision.",
          "SSR server entrypoint is projects/movies/server.ts.",
          "Angular 19 source update records @angular/ssr/node as the corrected import.",
          "SSR and browser-flow parity checks registered.",
        ],
      ),
      movieStep(
        "movies-analysis-tooling",
        "Inspect dependency and test authorities",
        "analysis.tooling_scan",
        "Classify Nx, RxAngular, Angular ESLint, Jest, and Puppeteer evidence for governed transitions.",
        1800,
        "SYSTEM",
        [
          "84 non-Angular manifest entries detected.",
          "RxAngular state and template primitives detected.",
          "Jest 29 + jest-preset-angular authority detected.",
          "Push-based user-flow + Puppeteer browser authority detected.",
          "package-lock.json remains authoritative.",
        ],
      ),
      movieStep(
        "movies-analysis-proposer",
        "Analysis Proposer",
        "analysis.phase_proposer",
        "Interpret repository evidence and produce structured migration findings.",
        3200,
        "LLM",
        [
          "Azure AI Foundry invocation started.",
          "role=phase_proposer deployment=gpt-5-mini",
          "Repository evidence: Nx · SSR · routes · browser-flow · dependencies.",
          "Source-grounded Angular 19 SSR repair finding generated.",
          "Structured analysis response received.",
        ],
        {
          provider: "azure_foundry",
          deployment: "gpt-5-mini",
          role: "phase_proposer",
        },
      ),
      movieStep(
        "movies-analysis-reviewer",
        "Independent Phase Reviewer",
        "analysis.phase_reviewer",
        "Review findings for source fidelity, unsupported claims, and evidence coverage.",
        3200,
        "REVIEWER",
        [
          "Azure AI Foundry reviewer invocation started.",
          "role=phase_reviewer deployment=Llama-3.3-70B-Instruct",
          "Verified Angular 18.2.14 / CLI 18.2.21 source identity.",
          "Verified SSR import correction against repository history.",
          "Independent review accepted.",
        ],
        {
          provider: "azure_foundry",
          deployment: "Llama-3.3-70B-Instruct",
          role: "phase_reviewer",
        },
      ),
    ],
    FEASIBILITY: [
      movieStep(
        "movies-feasibility-versions",
        "Resolve Angular compatibility cohort",
        "feasibility.version_cohort",
        "Resolve exact Angular, CLI, TypeScript, RxJS, and Node values for the next adjacent stage.",
        2200,
        "SYSTEM",
        [
          "Source cohort: Angular 18.2.14 · CLI 18.2.21",
          "Next cohort: Angular 19.2.25 · CLI 19.2.27",
          "TypeScript 5.8.3 and Node 22.23.1 target values recorded.",
          "Compatibility catalogue: catalog-v4",
        ],
      ),
      movieStep(
        "movies-feasibility-dependencies",
        "Check Nx, RxAngular, and SSR dependencies",
        "feasibility.third_party",
        "Check third-party package compatibility without force resolution.",
        2400,
        "SYSTEM",
        [
          "84 non-Angular entries scheduled for stage resolution.",
          "Nx and RxAngular compatibility watch registered.",
          "@angular/ssr import boundary marked for Angular 19 repair review.",
          "Preserve-first dependency policy remains active.",
        ],
      ),
      movieStep(
        "movies-feasibility-runtime",
        "Certify runtime and browser capabilities",
        "feasibility.runtime",
        "Verify the certified runtime, server rendering, and browser-flow execution profile.",
        2100,
        "SYSTEM",
        [
          "Node 22.23.1 runtime profile available.",
          "SSR server execution profile available.",
          "Puppeteer browser-flow profile available.",
          "Runtime compatibility: supported with governed repair boundary.",
        ],
      ),
      movieStep(
        "movies-feasibility-proposer",
        "Feasibility Proposer and Reviewer",
        "feasibility.phase_review",
        "Bind compatibility warnings and the bounded repair boundary for G05 review.",
        2600,
        "REVIEWER",
        [
          "Azure AI Foundry feasibility review completed.",
          "SSR import correction classified as a bounded source repair.",
          "No force dependency resolution proposed.",
          "G05 evidence package finalized.",
        ],
        {
          provider: "azure_foundry",
          deployment: "Llama-3.3-70B-Instruct",
          role: "phase_reviewer",
        },
      ),
    ],
    PLANNING: [
      movieStep(
        "movies-planning-route",
        "Construct adjacent-major route",
        "planning.route",
        "Construct the requested route from Angular 18 through Angular 21 without skipping majors.",
        1900,
        "SYSTEM",
        ["Route: Angular 18 -> 19 -> 20 -> 21.", "Every stage requires its own human gate."],
      ),
      movieStep(
        "movies-planning-stage",
        "Resolve exact first-stage contract",
        "planning.stage_contract",
        "Resolve the Angular 18 -> 19 cohort, runtime, builder, commands, and SSR validation targets.",
        2200,
        "SYSTEM",
        [
          "First stage: Angular 18.2.14 -> 19.2.25",
          `Builder: ${ANGULAR_MOVIES_SOURCE.builder}`,
          "Command policy: structured-registry-v1",
          "Validation: build · SSR · browser-flow",
        ],
      ),
      movieStep(
        "movies-planning-proposer",
        "Planning Proposer",
        "planning.phase_proposer",
        "Produce the deterministic adjacent-major plan and its bounded repair policy.",
        3000,
        "LLM",
        [
          "Azure AI Foundry invocation started.",
          "Source profile: tastejs/angular-movies.",
          "Real repository correction bound to Angular 18 -> 19.",
          "Plan response received.",
        ],
        {
          provider: "azure_foundry",
          deployment: "gpt-5-mini",
          role: "phase_proposer",
        },
      ),
      movieStep(
        "movies-planning-reviewer",
        "Independent Planning Reviewer",
        "planning.phase_reviewer",
        "Review the route, exact cohort, source profile, and repair policy before G06.",
        3000,
        "REVIEWER",
        [
          "Verified source profile and Angular 18 -> 21 route.",
          "Verified Angular 18 -> 19 SSR repair lineage.",
          "Verified human approval remains required at G10.",
          "Independent planning review accepted.",
        ],
        {
          provider: "azure_foundry",
          deployment: "Llama-3.3-70B-Instruct",
          role: "phase_reviewer",
        },
      ),
    ],
    STAGE_PREPARATION: [
      movieStep(
        "movies-stage-runtime",
        "Resolve certified stage runtime",
        "stage.runtime_resolution",
        `Resolve the certified runtime for ${routeLabel}.`,
        1800,
        "SYSTEM",
        [
          `Runtime profile: factory-runtime-certified-${source}-${target}`,
          "Resolution: PASS",
          "Certification: CERTIFIED",
          "Dependency preflight: PASS",
        ],
      ),
      movieStep(
        "movies-stage-source",
        "Bind previous sealed output",
        "stage.source_binding",
        "Bind the previous sealed stage as the only transformation input.",
        1800,
        "SYSTEM",
        [
          `Source stage: Angular ${source}`,
          `Target stage: Angular ${target}`,
          "Previous sealed output fingerprint accepted.",
        ],
      ),
      movieStep(
        "movies-stage-contract",
        "Prepare PROVEN stage contract",
        "stage.contract",
        "Prepare discovery, dependency, migration, target-proof, and validation groups.",
        1800,
        "SYSTEM",
        [
          "Source proof and target proof groups prepared.",
          "SSR and browser-flow validation targets attached.",
          "G07 package ready for review.",
        ],
      ),
    ],
    STAGE_EXECUTION: [
      movieStep(
        "movies-stage-source-proof",
        "Run source proof",
        "proven.source_proof",
        `Verify the sealed Angular ${source} source before transforming to Angular ${target}.`,
        1800,
        "SYSTEM",
        [
          `Repository: ${ANGULAR_MOVIES_SOURCE.repository}`,
          `Source revision: ${ANGULAR_MOVIES_SOURCE.revision}`,
          "Source lock authority and build evidence verified.",
        ],
      ),
      movieStep(
        "movies-stage-discovery",
        "Run migration discovery",
        "proven.discovery",
        "Generate disposable discovery evidence for the adjacent Angular major.",
        2000,
        "SYSTEM",
        [
          `Discovering Angular ${target} migration changes...`,
          "SSR, standalone, Nx, and browser-flow checks registered.",
          "Discovery evidence frozen.",
        ],
      ),
      movieStep(
        "movies-stage-dependencies",
        "Resolve target dependency cohort",
        "proven.dependency_resolution",
        "Resolve the target package cohort from the previous sealed output.",
        2300,
        "COMMAND",
        [
          `Resolving Angular ${target} package cohort...`,
          "Preserve-first lock resolution applied.",
          "No force resolution used.",
        ],
        { command: "structured dependency registry" },
      ),
      movieStep(
        "movies-stage-transform",
        "Apply Angular migration",
        "proven.migration",
        "Materialize the target stage with the governed transformer runtime.",
        2300,
        "COMMAND",
        [
          `Materializing Angular ${target} candidate...`,
          "Migration ledger recorded.",
          "Target fingerprint bound.",
        ],
        { command: `governed angular ${source} to ${target} transformer` },
      ),
      movieStep(
        "movies-stage-target-proof",
        "Run target proof",
        "proven.target_proof",
        "Verify target versions, dependency authority, and candidate identity.",
        1900,
        "SYSTEM",
        [
          `Angular ${target} version proof passed.`,
          "Dependency authority comparison passed.",
          "Candidate identity frozen.",
        ],
      ),
      movieStep(
        "movies-stage-validation",
        "Run clean validation",
        "proven.validation",
        "Build, render, and exercise the target candidate before stage completion.",
        2600,
        "COMMAND",
        [
          "Clean validation workspace created.",
          "Build completed.",
          "SSR route render started.",
          "Browser-flow validation started.",
        ],
        { command: "build + SSR + browser-flow validation" },
      ),
      movieStep(
        "movies-stage-review",
        "Aggregate validation evidence",
        "proven.validation.aggregate",
        "Aggregate diagnostics and either open the repair boundary or unlock completion.",
        1800,
        "REVIEWER",
        [
          `Angular ${target} candidate validation completed.`,
          "Diagnostic delta attached to the stage package.",
          "Human review boundary determined.",
        ],
        {
          provider: "azure_foundry",
          deployment: "Llama-3.3-70B-Instruct",
          role: "phase_reviewer",
        },
      ),
    ],
    REPAIR_REVIEW: [
      movieStep(
        "movies-repair-failure",
        "Bind failed SSR validation",
        "repair.failure_evidence",
        "Bind the failed Angular 18 to 19 SSR import check to the repair package.",
        1800,
        "SYSTEM",
        [
          `Failure owner: ${ANGULAR_MOVIES_NG19_REPAIR.path}`,
          "Failure category: SSR_COMMON_ENGINE_IMPORT",
          "Validation stopped at the G10 repair boundary.",
        ],
      ),
      movieStep(
        "movies-repair-proposer",
        "Main Repair LLM",
        "repair.phase_proposer",
        "Propose the bounded source patch using the repository's recorded Angular 19 correction.",
        2500,
        "LLM",
        [
          "Azure AI Foundry invocation started.",
          `Repository correction: ${ANGULAR_MOVIES_NG19_REPAIR.targetCommit}`,
          `Candidate file: ${ANGULAR_MOVIES_NG19_REPAIR.path}`,
          "Source patch proposal received.",
        ],
        {
          provider: "azure_foundry",
          deployment: "gpt-5-mini",
          role: "repair_proposer",
        },
      ),
      movieStep(
        "movies-repair-reviewer",
        "Independent Repair Reviewer",
        "repair.phase_reviewer",
        "Review the diff preimage, causal category, source reference, and validation targets.",
        2500,
        "REVIEWER",
        [
          "Azure AI Foundry reviewer invocation started.",
          "Diff preimage matches the source revision.",
          "Causal kind: SOURCE_PATCH",
          "Independent Reviewer verdict: ACCEPT",
        ],
        {
          provider: "azure_foundry",
          deployment: "Llama-3.3-70B-Instruct",
          role: "repair_reviewer",
        },
      ),
      movieStep(
        "movies-repair-package",
        "Prepare G10 repair package",
        "repair.g10_package",
        "Bind the real repository diff, source references, and bounded validation targets for human choice.",
        1700,
        "SYSTEM",
        [
          "Changed file: projects/movies/server.ts",
          "Validation: build · SSR · browser-flow",
          "G10 package ready: accept, ask AI again, or use manual override.",
        ],
      ),
    ],
    REPAIR_VALIDATION: [
      movieStep(
        "movies-repair-apply",
        "Apply approved source patch",
        "repair.apply",
        `Apply the approved bounded replace_text operation to ${ANGULAR_MOVIES_NG19_REPAIR.path}.`,
        1800,
        "COMMAND",
        [
          `Applying source patch to ${ANGULAR_MOVIES_NG19_REPAIR.path}...`,
          "Preimage matched.",
          "Patch applied without changing dependency authority.",
        ],
        { command: "governed replace_text" },
      ),
      movieStep(
        "movies-repair-build",
        "Rebuild Angular 19 candidate",
        "repair.validation.build",
        "Build the repaired candidate and confirm the SSR server entry compiles.",
        2400,
        "COMMAND",
        [
          "$ npx nx build movies",
          "@angular/ssr/node import resolved.",
          "Browser and server bundles generated.",
          "Build exit code 0.",
        ],
        { command: "npx nx build movies" },
      ),
      movieStep(
        "movies-repair-ssr",
        "Validate SSR and browser flow",
        "repair.validation.runtime",
        "Render representative routes and run browser-flow checks against the repaired candidate.",
        2600,
        "COMMAND",
        [
          "SSR server started.",
          "Parameterized list/detail routes rendered.",
          "Account and page-not-found flows verified.",
          "Puppeteer browser-flow validation passed.",
        ],
        { command: "SSR + Puppeteer validation" },
      ),
      movieStep(
        "movies-repair-aggregate",
        "Aggregate repaired validation",
        "repair.validation.aggregate",
        "Freeze repaired candidate evidence before G11 review.",
        1700,
        "REVIEWER",
        [
          "Source patch checksum verified.",
          "Build, SSR, and browser-flow targets passed.",
          "G11 validation package finalized.",
        ],
        {
          provider: "azure_foundry",
          deployment: "Llama-3.3-70B-Instruct",
          role: "phase_reviewer",
        },
      ),
    ],
  };

  return {
    id: id(kind, startedAtMs),
    kind,
    status: "RUNNING",
    startedAtMs,
    steps: phaseSteps[kind],
  };
}

function createAngularGenericLiveExecutionRaw(
  kind: AngularLiveExecutionKind,
  startedAtMs: number,
  context: AngularLiveContext,
): AngularLiveExecution {
  const source = context.source ?? 18;
  const target = context.target ?? 21;
  const routeStages = Array.from({ length: Math.max(0, target - source) }, (_, index) => {
    const stageSource = source + index;
    return `angular-${stageSource}.x -> angular-${stageSource + 1}.x`;
  });
  const routeLabel = routeStages.join(" -> ");
  const firstTarget = source + 1;

  if (kind === "BASELINE") {
    return {
      id: id(kind, startedAtMs),
      kind,
      status: "RUNNING",
      startedAtMs,
      steps: [
        genericStep(
          "generic-baseline-identity",
          "Bind selected source identity",
          "baseline.source_identity",
          `Bind the selected Angular ${source} source workspace and immutable fingerprint.`,
          1600,
          "SYSTEM",
          [
            `Selected source major: Angular ${source}`,
            `Requested target major: Angular ${target}`,
            "Source workspace identity bound from the approved preflight.",
            "Immutable source fingerprint recorded.",
          ],
        ),
        genericStep(
          "generic-baseline-manifest",
          "Inspect selected workspace manifests",
          "baseline.manifest_inspection",
          "Read the selected workspace manifests and preserve the source-defined toolchain authority.",
          1700,
          "SYSTEM",
          [
            `Detected source framework: Angular ${source}.x`,
            "Angular CLI and build builder authority resolved during baseline.",
            "TypeScript, RxJS, and zone.js versions remain source-evidence fields until resolved.",
            "package-lock.json authority confirmed.",
          ],
        ),
        genericStep(
          "generic-baseline-workspace",
          "Create isolated baseline workspace",
          "baseline.workspace.create",
          "Copy the selected source snapshot into a governed baseline workspace.",
          1500,
          "SYSTEM",
          [
            "Creating isolated baseline workspace...",
            "Read-only source boundary preserved.",
            "Workspace fingerprint bound to the selected source revision.",
          ],
        ),
        genericStep(
          "generic-baseline-install",
          "Clean lockfile install",
          "command.baseline_install",
          "Install exactly from the selected workspace lockfile authority.",
          3000,
          "COMMAND",
          [
            "$ npm ci",
            "Lockfile authority: package-lock.json",
            `Angular ${source} dependency tree materialized from the selected workspace.`,
            "exit code 0",
          ],
          { command: "npm ci" },
        ),
        genericStep(
          "generic-baseline-build",
          "Production baseline build",
          "command.baseline_build",
          `Build the selected Angular ${source} application with its source-defined production configuration.`,
          3000,
          "COMMAND",
          [
            "$ npm run build",
            `Angular ${source} baseline build completed.`,
            "Source builder and production configuration preserved.",
            "exit code 0",
          ],
          { command: "npm run build" },
        ),
        genericStep(
          "generic-baseline-tests",
          "Run baseline test authority",
          "command.baseline_test",
          "Run the selected workspace test authority and record its source coverage facts.",
          2500,
          "COMMAND",
          [
            "$ npm test",
            "Test authority resolved from the selected workspace scripts.",
            `Angular ${source} baseline test evidence recorded.`,
          ],
          { command: "npm test" },
        ),
        genericStep(
          "generic-baseline-lint",
          "Run baseline lint authority",
          "command.baseline_lint",
          "Run the selected workspace lint authority without substituting a legacy toolchain.",
          1800,
          "COMMAND",
          [
            "$ npm run lint",
            "Lint authority resolved from the selected workspace configuration.",
            `Angular ${source} baseline lint evidence recorded.`,
          ],
          { command: "npm run lint" },
        ),
        genericStep(
          "generic-baseline-qualification",
          "Qualify baseline for G03",
          "baseline.qualification.complete",
          "Aggregate source-grounded build, test, lint, and workspace evidence before G03 review.",
          1400,
          "SYSTEM",
          [
            `Requested route: ${routeLabel || `angular-${source}.x -> angular-${target}.x`}`,
            "Baseline evidence remains scoped to the selected source workspace.",
            "G03 evidence package finalized.",
          ],
        ),
      ],
    };
  }

  if (kind === "ANALYSIS") {
    return {
      id: id(kind, startedAtMs),
      kind,
      status: "RUNNING",
      startedAtMs,
      steps: [
        genericStep(
          "generic-analysis-inputs",
          "Freeze deterministic analysis inputs",
          "analysis.input_manifest",
          "Bind the accepted baseline, selected source identity, manifests, and code-context evidence.",
          1200,
          "SYSTEM",
          [
            `Source major bound: Angular ${source}`,
            `Requested route bound: ${routeLabel || `angular-${source}.x -> angular-${target}.x`}`,
            "Accepted baseline evidence attached.",
            "Analysis input manifest checksum finalized.",
          ],
        ),
        genericStep(
          "generic-analysis-topology",
          "Scan application topology",
          "analysis.topology_scan",
          "Classify the selected workspace structure, entrypoints, route boundaries, and build targets from source evidence.",
          2400,
          "SYSTEM",
          [
            `Selected Angular ${source} workspace topology scan started.`,
            "Application entrypoints and route boundaries classified.",
            "No source-specific repository facts were synthesized before inspection.",
          ],
        ),
        genericStep(
          "generic-analysis-dependencies",
          "Inspect dependencies and tooling",
          "analysis.dependency_tooling_scan",
          "Record dependency, TypeScript, test, lint, and builder authorities that must be preserved through the route.",
          2400,
          "SYSTEM",
          [
            "Framework and third-party dependency boundaries classified.",
            "Build, test, and lint authorities registered from the selected workspace.",
            "Stage-specific compatibility work remains subject to G05 and G06 review.",
          ],
        ),
        genericStep(
          "generic-analysis-proposer",
          "Analysis Proposer",
          "analysis.phase_proposer",
          "Interpret deterministic source evidence and produce structured migration findings.",
          3500,
          "LLM",
          [
            "Azure AI Foundry invocation started.",
            "role=phase_proposer deployment=gpt-5-mini",
            `Trusted source evidence: Angular ${source} workspace and requested route.`,
            "Structured analysis response received.",
          ],
          { provider: "azure_foundry", deployment: "gpt-5-mini", role: "phase_proposer" },
        ),
        genericStep(
          "generic-analysis-reviewer",
          "Independent Phase Reviewer",
          "analysis.phase_reviewer",
          "Review findings for source fidelity, unsupported claims, and evidence coverage.",
          3400,
          "REVIEWER",
          [
            "Azure AI Foundry reviewer invocation started.",
            "role=phase_reviewer deployment=Llama-3.3-70B-Instruct",
            `Requested route verified: Angular ${source} -> Angular ${target}.`,
            "Source-specific claims require linked evidence.",
            "review verdict=accept",
          ],
          { provider: "azure_foundry", deployment: "Llama-3.3-70B-Instruct", role: "phase_reviewer" },
        ),
        genericStep(
          "generic-analysis-finalize",
          "Finalize G04 evidence package",
          "analysis.g04.finalize",
          "Persist selected source profile, findings, provenance, usage, and immutable evidence.",
          1300,
          "SYSTEM",
          [
            "Application profile persisted from selected source evidence.",
            "Migration findings persisted with evidence references.",
            "G04 review boundary opened.",
          ],
        ),
      ],
    };
  }

  if (kind === "FEASIBILITY") {
    return {
      id: id(kind, startedAtMs),
      kind,
      status: "RUNNING",
      startedAtMs,
      steps: [
        genericStep(
          "generic-compat-core",
          "Evaluate Angular compatibility",
          "compatibility.core",
          `Check Angular ${source} to Angular ${target} compatibility under the adjacent-major route policy.`,
          900,
          "SYSTEM",
          [
            `Angular ${source} -> Angular ${target} route loaded.`,
            "Adjacent-major compatibility policy accepted.",
          ],
        ),
        genericStep(
          "generic-compat-runtime",
          "Resolve runtime compatibility",
          "compatibility.runtime",
          "Resolve certified Node/npm/CLI candidates for each requested stage.",
          1000,
          "SYSTEM",
          [
            `Runtime candidates resolved for ${routeStages.length || 1} stage(s).`,
            "Exact runtime selection remains stage-scoped.",
          ],
        ),
        genericStep(
          "generic-compat-third-party",
          "Scan third-party compatibility",
          "compatibility.third_party",
          "Classify selected workspace dependencies into compatible, migration-required, and review-required groups.",
          1100,
          "SYSTEM",
          [
            "Selected workspace dependency envelope inspected.",
            "Migration-required and review-required items recorded without force resolution.",
          ],
        ),
        genericStep(
          "generic-compat-finalize",
          "Finalize G05 readiness",
          "compatibility.g05.finalize",
          "Bind compatibility, runtime, dependency, and lockfile evidence for human review.",
          700,
          "SYSTEM",
          ["Lockfile authority confirmed.", "G05 readiness package finalized."],
        ),
      ],
    };
  }

  if (kind === "PLANNING") {
    return {
      id: id(kind, startedAtMs),
      kind,
      status: "RUNNING",
      startedAtMs,
      steps: [
        genericStep(
          "generic-planning-inputs",
          "Resolve deterministic Planning inputs",
          "planning.inputs.resolve",
          "Bind accepted readiness evidence, selected source authority, route, runtime facts, and workspace fingerprint.",
          3200,
          "SYSTEM",
          [
            "G05 accepted compatibility evidence bound.",
            `Source exact: Angular ${source}.x.`,
            `Requested target: Angular ${target}.x.`,
            "Package manager and lockfile authority resolved from the selected workspace.",
          ],
        ),
        genericStep(
          "generic-planning-route",
          "Build deterministic MigrationPlan",
          "planning.route.build",
          "Generate the full adjacent-major route without authorizing execution.",
          3600,
          "SYSTEM",
          [
            "Mode: strict_compatibility.",
            `Route: ${routeLabel || `angular-${source}.x -> angular-${target}.x`}.`,
            "stage_plan_strategy=resolve_exact_before_each_stage",
            "approval_policy=mandatory-human-v1",
            "run_mode=PRODUCTION",
          ],
        ),
        genericStep(
          "generic-planning-first-stage",
          "Resolve exact first StageExecutionPlan",
          "planning.first_stage.resolve",
          "Materialize only the first adjacent-major stage; later stages resolve from each sealed predecessor.",
          4200,
          "SYSTEM",
          [
            `Stage: angular-${source}.x -> angular-${firstTarget}.x.`,
            "Exact source and target cohorts resolve from the compatibility catalogue.",
            "execution_profile_id bound to stage runtime authority.",
          ],
        ),
        genericStep(
          "generic-planning-command-contract",
          "Build structured command contract",
          "planning.command_contract",
          "Bind registry-backed command groups, workspace aliases, timeouts, cancellation, and parameter bindings.",
          4500,
          "SYSTEM",
          [
            "Structured command references use shell=false.",
            "Working directory alias bound to governed stage workspace.",
            "Bootstrap, install, build, test, and lint authorities resolved from the selected workspace.",
            "Command contract checksum finalized.",
          ],
        ),
        genericStep(
          "generic-planning-policy-contract",
          "Bind migration policies",
          "planning.policy_contract",
          "Bind validation, recovery, repair, and forbidden-change policies for the requested route.",
          3600,
          "SYSTEM",
          [
            "validation_policy=angular-stage-standard-v2",
            "recovery_policy=safe-boundary-v1",
            "repair_policy=proposer-reviewer-human-v1",
            "Repair requires proposer + reviewer + human apply approval.",
          ],
        ),
        genericStep(
          "generic-planning-review",
          "Review deterministic plan",
          "planning.phase_reviewer",
          "Review the route and first-stage contract for source fidelity and policy compliance.",
          7200,
          "REVIEWER",
          [
            "Azure AI Foundry reviewer invocation started.",
            `Route verified: Angular ${source} -> Angular ${target}.`,
            "No source or target major was substituted.",
            "review verdict=accept",
          ],
          { provider: "azure_foundry", deployment: "Llama-3.3-70B-Instruct", role: "phase_reviewer" },
        ),
        genericStep(
          "generic-planning-finalize",
          "Finalize immutable G06 Planning package",
          "planning.package.finalize",
          "Persist plan, first-stage binding, proposer/reviewer outputs, checksums, and workspace evidence before G06.",
          3900,
          "SYSTEM",
          [
            "PlanningPackage review_status=accepted.",
            "Proposer/reviewer usage ledger recorded.",
            "Workspace fingerprint preserved.",
            "G06 Migration Plan review boundary opened.",
          ],
        ),
      ],
    };
  }

  return createAngularLiveExecutionRaw(kind, startedAtMs, {
    ...context,
    source,
    target,
  });
}

function createAngularLiveExecutionRaw(
  kind: AngularLiveExecutionKind,
  startedAtMs: number,
  context: AngularLiveContext = {},
): AngularLiveExecution {
  const source = context.source ?? 11;
  const target = context.target ?? 12;

  if (kind === "BASELINE") {
    return {
      id: id(kind, startedAtMs),
      kind,
      status: "RUNNING",
      startedAtMs,
      steps: [
        {
          id: "baseline-source-identity",
          label: "Bind source repository identity",
          node: "baseline.source_identity",
          detail:
            "Bind the approved Angular 11 CRUD source revision and immutable source fingerprint.",
          durationMs: 1600,
          kind: "SYSTEM",
          logs: [
            "Repository: cornflourblue/angular-11-crud-example",
            "Revision: eda3cf6278c02e4fb65f91ec73a9281d4325514e",
            "Source application: angular-crud-example",
            "Immutable source fingerprint recorded.",
          ],
        },
        {
          id: "baseline-manifest",
          label: "Inspect Angular workspace manifests",
          node: "baseline.manifest_inspection",
          detail:
            "Read package.json, angular.json, TypeScript configuration, and lockfile authority.",
          durationMs: 1700,
          kind: "SYSTEM",
          logs: [
            "package.json: Angular 11.0.4 · Angular CLI 11.0.4",
            "build-angular 0.1100.4 · TypeScript 4.0.2",
            "RxJS 6.6.x · zone.js 0.10.x",
            "angular.json: 1 application project · angular-crud-example",
            "builder=@angular-devkit/build-angular:browser · AOT enabled",
            "package-lock.json authority confirmed.",
          ],
        },
        {
          id: "baseline-workspace",
          label: "Create isolated baseline workspace",
          node: "baseline.workspace.create",
          detail:
            "Copy the immutable source snapshot into a governed baseline workspace.",
          durationMs: 1500,
          kind: "SYSTEM",
          logs: [
            "Creating isolated baseline workspace...",
            "Read-only source boundary preserved.",
            "Workspace fingerprint bound to approved source revision.",
          ],
        },
        {
          id: "baseline-install",
          label: "Clean lockfile install",
          node: "command.baseline_install",
          detail: "Install exactly from the committed package-lock.json.",
          durationMs: 3000,
          kind: "COMMAND",
          command: "npm ci",
          logs: [
            "$ npm ci",
            "Lockfile authority: package-lock.json",
            "28 manifest package entries resolved.",
            "Angular 11 dependency tree materialized.",
            "exit code 0",
          ],
        },
        {
          id: "baseline-build",
          label: "Production baseline build",
          node: "command.baseline_build",
          detail:
            "Build the Angular 11 application with its production configuration and budgets.",
          durationMs: 3000,
          kind: "COMMAND",
          command: "npm run build -- --prod",
          logs: [
            "$ npm run build -- --prod",
            "Builder: @angular-devkit/build-angular:browser",
            "AOT compilation enabled.",
            "Production file replacement: environment.prod.ts",
            "Initial bundle budget: warning 500kb · error 1mb",
            "Browser application bundle generation complete.",
            "exit code 0",
          ],
        },
        {
          id: "baseline-tests",
          label: "Karma/Jasmine baseline test discovery",
          node: "command.baseline_test",
          detail:
            "Start the configured Karma/Jasmine/Chrome harness and freeze the source test-coverage fact.",
          durationMs: 2500,
          kind: "COMMAND",
          command: "npm test -- --watch=false --browsers=ChromeHeadless",
          logs: [
            "$ npm test -- --watch=false --browsers=ChromeHeadless",
            "Karma 5.1 · Jasmine 3.6 · Chrome launcher configured.",
            "src/test.ts recursively searches for src/**/*.spec.ts.",
            "No src/**/*.spec.ts unit specs discovered in the source revision.",
            "Unit-test coverage gap recorded as known baseline evidence.",
          ],
        },
        {
          id: "baseline-lint",
          label: "TSLint/Codelyzer baseline lint",
          node: "command.baseline_lint",
          detail:
            "Run the source lint authority exactly as configured by Angular 11.",
          durationMs: 1800,
          kind: "COMMAND",
          command: "npm run lint",
          logs: [
            "$ npm run lint",
            "TSLint 6.1 configuration loaded.",
            "Codelyzer 6 Angular rules loaded.",
            "Application/spec/e2e TypeScript configs included.",
            "Baseline lint evidence finalized.",
          ],
        },
        {
          id: "baseline-parity",
          label: "Freeze baseline behavior and test topology",
          node: "baseline.parity.aggregate",
          detail:
            "Aggregate build, lint, routing, and test evidence before G03 qualification.",
          durationMs: 1500,
          kind: "SYSTEM",
          logs: [
            "Protractor 7 E2E configuration detected.",
            "e2e/src/app.e2e-spec.ts present.",
            "Chrome direct-connect E2E authority recorded.",
            "Build/lint/test topology evidence aggregated.",
          ],
        },
        {
          id: "baseline-qualification",
          label: "Qualify baseline for G03",
          node: "baseline.qualification.complete",
          detail:
            "Classify reproducibility and known coverage gaps for human baseline acceptance.",
          durationMs: 1400,
          kind: "SYSTEM",
          logs: [
            "Baseline reproducibility: qualified.",
            "Known gap: Karma harness configured with no source unit specs.",
            "Legacy E2E authority: Protractor 7.",
            "G03 evidence package finalized.",
          ],
        },
      ],
    };
  }

  if (kind === "ANALYSIS") {
    return {
      id: id(kind, startedAtMs),
      kind,
      status: "RUNNING",
      startedAtMs,
      steps: [
        {
          id: "analysis-inputs",
          label: "Freeze deterministic analysis inputs",
          node: "analysis.input_manifest",
          detail:
            "Bind the accepted baseline, source revision, manifests, and code-context evidence.",
          durationMs: 1000,
          kind: "SYSTEM",
          logs: [
            "Binding repository revision " + ANGULAR11_CRUD_SOURCE.revision,
            "Accepted G03 baseline evidence attached.",
            "package.json · angular.json · tsconfig.json registered.",
            "Analysis input manifest checksum finalized.",
          ],
        },
        {
          id: "analysis-topology",
          label: "Scan application/module topology",
          node: "analysis.topology_scan",
          detail:
            "Classify NgModules, components, feature boundaries, and lazy loading.",
          durationMs: 2400,
          kind: "SYSTEM",
          logs: [
            "Reading src/app/app.module.ts",
            "AppModule: BrowserModule · ReactiveFormsModule · HttpClientModule",
            "Reading src/app/app-routing.module.ts",
            "Lazy feature boundary detected: UsersModule",
            "Reading src/app/users/users.module.ts",
            "UsersModule declares LayoutComponent · ListComponent · AddEditComponent",
            "Topology: 1 Angular CLI application · 1 lazy feature module.",
          ],
        },
        {
          id: "analysis-route-service",
          label: "Extract routes and CRUD service contract",
          node: "analysis.route_service_scan",
          detail:
            "Map user-facing routes and HTTP operations that must remain behaviorally equivalent.",
          durationMs: 2500,
          kind: "SYSTEM",
          logs: [
            "Route / → HomeComponent",
            "Route /users → lazy UsersModule",
            "Route /users/add → AddEditComponent",
            "Route /users/edit/:id → AddEditComponent",
            "Reading src/app/_services/user.service.ts",
            "UserService CRUD contract: GET collection · GET by id · POST · PUT · DELETE",
            "Environment API base URL: http://localhost:4000/users",
          ],
        },
        {
          id: "analysis-forms-http",
          label: "Inspect forms, HTTP, and interceptor behavior",
          node: "analysis.forms_http_scan",
          detail:
            "Identify Reactive Forms validation and HTTP/interceptor semantics that migrations must preserve.",
          durationMs: 2500,
          kind: "SYSTEM",
          logs: [
            "Reading src/app/users/add-edit.component.ts",
            "ReactiveFormsModule · Validators.required · Validators.email · Validators.minLength(6)",
            "Cross-field MustMatch(password, confirmPassword) validator detected.",
            "HttpClientModule and ErrorInterceptor registered in AppModule.",
            "Development HTTP interceptor persists CRUD users in localStorage.",
            "Development API responses intentionally delayed by 500ms.",
            "Legacy RxJS throwError(value) call shape detected in error handling.",
          ],
        },
        {
          id: "analysis-tooling",
          label: "Inspect test and legacy tooling",
          node: "analysis.tooling_scan",
          detail:
            "Classify source testing/lint tools that require governed transitions on later Angular majors.",
          durationMs: 1700,
          kind: "SYSTEM",
          logs: [
            "Karma 5.1 + Jasmine 3.6 + Chrome launcher configured.",
            "No src/**/*.spec.ts unit specs found in source tree.",
            "TSLint 6.1 + Codelyzer 6 lint authority detected.",
            "Protractor 7 E2E suite detected.",
            "strict=true · strictTemplates=true in TypeScript/Angular compiler configuration.",
          ],
        },
        {
          id: "analysis-proposer",
          label: "Analysis Proposer",
          node: "analysis.phase_proposer",
          detail:
            "Interpret the deterministic repository evidence and produce structured migration findings.",
          durationMs: 3500,
          kind: "LLM",
          provider: "azure_foundry",
          deployment: "gpt-5-mini",
          role: "phase_proposer",
          logs: [
            "Azure AI Foundry invocation started.",
            "role=phase_proposer deployment=gpt-5-mini",
            "Repository evidence: modules · routes · services · forms · tooling.",
            "NgModule preservation and lazy-route invariants classified.",
            "RxJS/tooling modernization findings generated.",
            "Structured analysis response received.",
          ],
        },
        {
          id: "analysis-reviewer-input",
          label: "Bind proposer output",
          node: "analysis.reviewer_input",
          detail:
            "Checksum the proposer result and bind source evidence before independent review.",
          durationMs: 700,
          kind: "SYSTEM",
          logs: [
            "Proposer output checksum recorded.",
            "Finding-to-source evidence links validated.",
            "Independent reviewer package prepared.",
          ],
        },
        {
          id: "analysis-reviewer",
          label: "Independent Phase Reviewer",
          node: "analysis.phase_reviewer",
          detail:
            "Review migration findings for source fidelity, unsupported claims, and evidence coverage.",
          durationMs: 3400,
          kind: "REVIEWER",
          provider: "azure_foundry",
          deployment: "Llama-3.3-70B-Instruct",
          role: "phase_reviewer",
          logs: [
            "Azure AI Foundry reviewer invocation started.",
            "role=phase_reviewer deployment=Llama-3.3-70B-Instruct",
            "Verified Angular 11.0.4 / CLI 11.0.4 source identity.",
            "Verified UsersModule lazy routing and Reactive Forms invariants.",
            "Verified TSLint/Codelyzer and Protractor migration-required findings.",
            "review verdict=accept",
          ],
        },
        {
          id: "analysis-finalize",
          label: "Finalize G04 evidence package",
          node: "analysis.g04.finalize",
          detail:
            "Persist application profile, migration findings, LLM provenance, usage, and immutable evidence.",
          durationMs: 1300,
          kind: "SYSTEM",
          logs: [
            "Application profile persisted.",
            "Migration findings persisted with evidence references.",
            "Proposer/reviewer usage ledger recorded.",
            "G04 review boundary opened.",
          ],
        },
      ],
    };
  }

  if (kind === "FEASIBILITY") {
    return {
      id: id(kind, startedAtMs),
      kind,
      status: "RUNNING",
      startedAtMs,
      steps: [
        {
          id: "compat-core",
          label: "Evaluate Angular compatibility",
          node: "compatibility.core",
          detail: "Check Angular/TypeScript/RxJS compatibility for the requested route.",
          durationMs: 700,
          kind: "SYSTEM",
          logs: ["Angular family compatibility supported.", "TypeScript/RxJS envelope accepted."],
        },
        {
          id: "compat-runtime",
          label: "Resolve runtime compatibility",
          node: "compatibility.runtime",
          detail: "Check certified Node/npm profiles across adjacent-major stages.",
          durationMs: 800,
          kind: "SYSTEM",
          logs: ["Runtime catalogue loaded.", "Certified stage runtime candidates resolved."],
        },
        {
          id: "compat-third-party",
          label: "Scan third-party compatibility",
          node: "compatibility.third_party",
          detail: "Classify compatible, migration-required, and review-required dependencies.",
          durationMs: 900,
          kind: "SYSTEM",
          logs: ["42 third-party packages inspected.", "2 migration-required · 1 review-required."],
        },
        {
          id: "compat-finalize",
          label: "Finalize G05 readiness",
          node: "compatibility.g05.finalize",
          detail: "Bind compatibility and lockfile evidence for human review.",
          durationMs: 600,
          kind: "SYSTEM",
          logs: ["Lockfile authority confirmed.", "G05 readiness package finalized."],
        },
      ],
    };
  }

  if (kind === "PLANNING") {
    return {
      id: id(kind, startedAtMs),
      kind,
      status: "RUNNING",
      startedAtMs,
      steps: [
        {
          id: "planning-inputs",
          label: "Resolve deterministic Planning inputs",
          node: "planning.inputs.resolve",
          detail:
            "Bind the accepted G05 package, source exact version, route, catalogue, runtime facts, builder, scripts, baseline results, and physical workspace fingerprint.",
          durationMs: 3200,
          kind: "SYSTEM",
          logs: [
            "G05 accepted compatibility evidence bound.",
            "Source exact: Angular 11.0.4.",
            "Workspace: angular-crud-example · builder=@angular-devkit/build-angular:browser.",
            "Package manager: npm · lockfile authority: package-lock.json.",
            "Catalogue authority: catalog-v4.",
            "Physical workspace fingerprint attached.",
          ],
        },
        {
          id: "planning-route",
          label: "Build deterministic MigrationPlan",
          node: "planning.route.build",
          detail:
            "Generate the full adjacent-major route and immutable migration-level policies without authorizing execution.",
          durationMs: 3600,
          kind: "SYSTEM",
          logs: [
            "Mode: strict_compatibility.",
            "Route: angular-11.x → 12.x → 13.x → 14.x → 15.x → 16.x → 17.x → 18.x → 19.x → 20.x → 21.x.",
            "stage_plan_strategy=resolve_exact_before_each_stage",
            "approval_policy=mandatory-human-v1",
            "command_policy=structured-registry-v1",
            "artifact_policy=immutable-stage-scoped-v1",
            "transformer_semantic_version=transformer-plan-v2.2-proven-1",
            "run_mode=PRODUCTION",
          ],
        },
        {
          id: "planning-first-stage",
          label: "Resolve exact first StageExecutionPlan",
          node: "planning.first_stage.resolve",
          detail:
            "Materialize only the first exact adjacent-major stage from catalog-v4; later stages resolve from each sealed predecessor.",
          durationMs: 4200,
          kind: "SYSTEM",
          logs: [
            "Stage: angular-11.x → angular-12.x.",
            "Exact cohort: 11.0.4 → 12.2.17 · CLI 12.2.18.",
            "Runtime proof: Node 12.22.12 · npm 8.19.4.",
            "Target cohort: TypeScript 4.3.5 · RxJS 6.6.7 · zone.js 0.11.8.",
            "Observed proof source: dev-runtimes-real-e2e.",
            "execution_profile_id bound to exact runtime authority.",
          ],
        },
        {
          id: "planning-command-contract",
          label: "Build structured command contract",
          node: "planning.command_contract",
          detail:
            "Bind registry-backed command groups, working-directory aliases, timeouts, network profiles, cancellation policy, and parameter bindings; never raw shell authority.",
          durationMs: 4500,
          kind: "SYSTEM",
          logs: [
            "Structured command references use shell=false.",
            "Working directory alias bound to governed stage workspace.",
            "Cancellation policy: terminate_process_tree.",
            "Bootstrap/final-install/build/test/lint authorities resolved from registered scripts and builder targets.",
            "PROVEN semantics forbid prebinding legacy combined angular_update and migrate_packages groups.",
            "Command contract checksum finalized.",
          ],
        },
        {
          id: "planning-policy-contract",
          label: "Bind validation, recovery, repair, and forbidden-change policies",
          node: "planning.policy_contract",
          detail:
            "Bind the policy set that limits what Transformer and governed repair may execute after G06.",
          durationMs: 3600,
          kind: "SYSTEM",
          logs: [
            "validation_policy=angular-stage-standard-v2",
            "recovery_policy=safe-boundary-v1",
            "repair_policy=proposer-reviewer-human-v1",
            "Repair requires proposer + reviewer + human apply approval.",
            "Forbidden: force dependency resolution.",
            "Forbidden optional migrations: standalone · signals · control-flow · zoneless.",
            "Build system decision: preserve @angular-devkit/build-angular:browser.",
          ],
        },
        {
          id: "planning-checksums",
          label: "Freeze deterministic plan bindings",
          node: "planning.checksum_binding",
          detail:
            "Checksum MigrationPlan, first StageExecutionPlan, prerequisite artifact set, and workspace binding before LLM explanation.",
          durationMs: 2800,
          kind: "SYSTEM",
          logs: [
            "MigrationPlan checksum finalized.",
            "StageExecutionPlan checksum finalized.",
            "Artifact-set checksum finalized.",
            "Workspace fingerprint preserved.",
            "Deterministic plan binding ready for Planning Proposer.",
          ],
        },
        {
          id: "planning-proposer",
          label: "Planning Proposer",
          node: "planning.phase_proposer",
          detail:
            "Explain only the deterministic migration and stage plans, including rationale, risks, and unresolved questions; the LLM cannot change commands, versions, checksums, or approvals.",
          durationMs: 7200,
          kind: "LLM",
          provider: "azure_foundry",
          deployment: "gpt-5-mini",
          role: "phase_proposer",
          logs: [
            "Azure AI Foundry invocation started.",
            "role=phase_proposer task=plan_rationale prompt=planning_agent_v1",
            "Trusted context: MigrationPlan + StageExecutionPlan + deterministic checksum binding.",
            "Generated rationale for adjacent-major execution and exact-first-stage strategy.",
            "Material risks documented: legacy lint/E2E transition, sparse unit coverage, runtime drift, third-party compatibility.",
            "Unresolved questions bounded to later governed validation.",
            "Structured PlanningNarrative schema validation PASS.",
          ],
        },
        {
          id: "planning-reviewer-input",
          label: "Bind proposer output for independent review",
          node: "planning.reviewer_input",
          detail:
            "Persist the proposer checksum and expose the narrative as untrusted reviewer context while preserving trusted deterministic bindings.",
          durationMs: 2200,
          kind: "SYSTEM",
          logs: [
            "Planning proposer output checksum recorded.",
            "Deterministic plan checksum copied into reviewer package.",
            "Proposer output marked untrusted reviewer context.",
            "Reviewer binding package finalized.",
          ],
        },
        {
          id: "planning-reviewer",
          label: "Independent Planning Reviewer",
          node: "planning.phase_reviewer",
          detail:
            "Review explanation accuracy, evidence coverage, material risks, policy consistency, and checksum bindings without authoring or replacing the deterministic plan.",
          durationMs: 6800,
          kind: "REVIEWER",
          provider: "azure_foundry",
          deployment: "Llama-3.3-70B-Instruct",
          role: "phase_reviewer",
          logs: [
            "Azure AI Foundry reviewer invocation started.",
            "role=phase_reviewer deployment=Llama-3.3-70B-Instruct task=planning_review prompt=planning_reviewer_v1",
            "Verified full route and resolve_exact_before_each_stage strategy.",
            "Verified first-stage exact cohort and runtime evidence.",
            "Verified validation/recovery/repair/forbidden-change policies.",
            "No unsupported execution claim detected.",
            "review decision=accept · confidence=HIGH",
          ],
        },
        {
          id: "planning-package",
          label: "Finalize immutable G06 Planning package",
          node: "planning.package.finalize",
          detail:
            "Persist plan version, stage-plan binding, proposer/reviewer outputs and checksums, usage, revision count, and workspace fingerprint before opening G06.",
          durationMs: 3900,
          kind: "SYSTEM",
          logs: [
            "PlanningPackage review_status=accepted.",
            "Plan version=1 · revision_count=0.",
            "Proposer/reviewer usage ledger recorded.",
            "Package checksum bound to plan + stage plan + artifact set + workspace fingerprint.",
            "G06 Migration Plan review boundary opened.",
          ],
        },
      ],
    };
  }

  if (kind === "STAGE_PREPARATION") {
    return {
      id: id(kind, startedAtMs),
      kind,
      status: "RUNNING",
      startedAtMs,
      steps: [
        {
          id: "runtime-resolve",
          label: "Resolve stage runtime",
          node: "stage.runtime.resolve",
          detail: `Resolve Node/npm/Angular CLI authority for Angular ${source} → ${target}.`,
          durationMs: 900,
          kind: "SYSTEM",
          logs: ["Compatibility catalogue consulted.", "Exact runtime candidate selected."],
        },
        {
          id: "runtime-certify",
          label: "Certify runtime binding",
          node: "stage.runtime.certify",
          detail: "Verify the selected runtime profile is certified for this transition.",
          durationMs: 900,
          kind: "SYSTEM",
          logs: ["Runtime checksum verified.", "Runtime certification PASS."],
        },
        {
          id: "workspace-materialize",
          label: "Materialize stage workspace",
          node: "stage.workspace.prepare",
          detail: "Create the contained stage sandbox from the accepted source authority.",
          durationMs: 900,
          kind: "SYSTEM",
          logs: ["Stage sandbox copied.", "Workspace fingerprint bound."],
        },
        {
          id: "stage-preflight",
          label: "Run dependency preflight",
          node: "stage.dependency_preflight",
          detail: "Validate dependency and command authority before G07.",
          durationMs: 800,
          kind: "SYSTEM",
          logs: ["Dependency preflight PASS.", "G07 stage-start evidence finalized."],
        },
      ],
    };
  }

  if (kind === "REPAIR_REVIEW" && source === 15 && target === 16) {
    return {
      id: id(kind, startedAtMs),
      kind,
      status: "RUNNING",
      startedAtMs,
      steps: [
        {
          id: "repair-tooling-failure-freeze",
          label: "Freeze lint-tooling failure evidence",
          node: "repair.failure_evidence.freeze",
          detail:
            "Bind the failed configured lint target, Angular 16 builder registry evidence, workspace fingerprint, and immutable failure checksum before model review.",
          durationMs: 5000,
          kind: "SYSTEM",
          logs: [
            "Configured source command: npm run lint -> ng lint.",
            "Source workspace builder: @angular-devkit/build-angular:tslint.",
            "Angular CLI 16.2.16 build-angular registry does not expose a tslint builder.",
            "Failure category=LEGACY_TSLINT_BUILDER_UNAVAILABLE.",
            "Failure evidence fingerprint finalized.",
          ],
        },
        {
          id: "repair-tooling-owner-route",
          label: "Bind Main Repair ownership",
          node: "repair.failure_owner.bind",
          detail:
            "Classify the source-owned lint configuration incompatibility and route the bounded tooling transition to MAIN_REPAIR without granting command authority to the model.",
          durationMs: 3000,
          kind: "SYSTEM",
          logs: [
            "failure_phase=MAIN_REPAIR",
            "failure_owner=MAIN_REPAIR_LLM",
            "Target surface: package.json, angular.json, .eslintrc.json.",
            "Dropping lint validation is forbidden.",
          ],
        },
        {
          id: "repair-tooling-context",
          label: "Build bounded tooling context",
          node: "repair.context_pack.freeze",
          detail:
            "Provide the source lint scripts, TSLint/Codelyzer manifest entries, Angular workspace lint target, and Angular 16 builder authority as bounded repair context.",
          durationMs: 5000,
          kind: "SYSTEM",
          logs: [
            "Source evidence: codelyzer ^6.0.0 and tslint ~6.1.0.",
            "Angular 16.2.16 builder registry evidence attached.",
            "angular-eslint 16.3.1 builder contract attached.",
            "Arbitrary shell and direct lockfile editing remain forbidden.",
          ],
        },
        {
          id: "repair-tooling-proposer",
          label: "Main Repair LLM · Repair Proposer",
          node: "repair.propose_repair",
          detail:
            "Author a typed tooling-transition candidate that preserves lint authority while replacing the unavailable TSLint builder.",
          durationMs: 12000,
          kind: "LLM",
          provider: "azure_foundry",
          deployment: "gpt-5-mini",
          role: "repair_proposer",
          logs: [
            "role=repair_proposer task=repair_diagnosis",
            "operation=tooling_transition",
            "Remove TSLint/Codelyzer manifest authority.",
            "Add angular-eslint 16.x + ESLint manifest intent.",
            "Replace angular.json lint builder with @angular-eslint/builder:lint.",
            "Create bounded ESLint configuration.",
            "Structured tooling repair proposal received.",
          ],
        },
        {
          id: "repair-tooling-causal-bind",
          label: "Validate and bind tooling candidate",
          node: "repair.causal_review",
          detail:
            "Schema-check the package/config operations, bind candidate checksums, and verify that lint authority is preserved rather than removed.",
          durationMs: 5000,
          kind: "SYSTEM",
          logs: [
            "Proposal schema validation PASS.",
            "Package manifest changes are registry-scoped.",
            "angular.json builder transition is source-confined.",
            "lintFilePatterns preserve TypeScript and template coverage.",
            "Causal review PASS.",
          ],
        },
        {
          id: "repair-tooling-reviewer",
          label: "Independent Reviewer",
          node: "repair.review_repair",
          detail:
            "Independently review the tooling transition, dependency intent, lint coverage, policy constraints, and required validation targets.",
          durationMs: 10000,
          kind: "REVIEWER",
          provider: "azure_foundry",
          deployment: "Llama-3.3-70B-Instruct",
          role: "repair_reviewer",
          logs: [
            "role=repair_reviewer task=repair_review",
            "Verified TSLint builder absence is the recorded failure cause.",
            "Verified lint authority is migrated, not silently disabled.",
            "Required validation: lock generation, npm ci, lint, build, tests.",
            "review decision=accept · risk=MEDIUM",
          ],
        },
        {
          id: "repair-tooling-g10-package",
          label: "Finalize G10 tooling package",
          node: "repair.create_g10",
          detail:
            "Bind failure evidence, package/config diff, reviewer checksum, validation targets, and workspace fingerprint into the human authorization package.",
          durationMs: 5000,
          kind: "SYSTEM",
          logs: [
            "Proposal checksum bound.",
            "Reviewer checksum bound.",
            "Changed files: package.json, angular.json, .eslintrc.json.",
            "G10 package finalized.",
            "No workspace mutation has occurred.",
          ],
        },
      ],
    };
  }

  if (kind === "REPAIR_REVIEW") {
    return {
      id: id(kind, startedAtMs),
      kind,
      status: "RUNNING",
      startedAtMs,
      steps: [
        {
          id: "repair-failure-freeze",
          label: "Freeze failure evidence",
          node: "repair.failure_evidence.freeze",
          detail:
            "Bind the failed test execution, normalized diagnostics, workspace fingerprint, and immutable failure checksum before any model sees context.",
          durationMs: 5000,
          kind: "SYSTEM",
          logs: [
            "Failed validation execution bound to one immutable command result.",
            "Failure evidence fingerprint finalized.",
            "Relevant source target: setup-jest.ts.",
            "Historical dependency and request-changes lineage attached.",
          ],
        },
        {
          id: "repair-owner-route",
          label: "Bind Main Repair ownership",
          node: "repair.failure_owner.bind",
          detail:
            "Route only the explicit source-repair failure to MAIN_REPAIR; dependency and lock failures remain with deterministic owners.",
          durationMs: 3000,
          kind: "SYSTEM",
          logs: [
            "failure_phase=MAIN_REPAIR",
            "failure_owner=MAIN_REPAIR_LLM",
            "Prior attempt 3 review=request_changes.",
            "Child repair lineage prepared from current workspace authority.",
          ],
        },
        {
          id: "repair-context-pack",
          label: "Build bounded repair context",
          node: "repair.context_pack.freeze",
          detail:
            "Expose only bounded failure evidence and authoritative relevant files; previous proposals remain reference-only.",
          durationMs: 5000,
          kind: "SYSTEM",
          logs: [
            "Bounded context pack created.",
            "Current workspace preimage is authoritative.",
            "Arbitrary shell, lockfile edits, path escapes, and policy bypasses are forbidden.",
          ],
        },
        {
          id: "repair-proposer",
          label: "Main Repair LLM · Repair Proposer",
          node: "repair.propose_repair",
          detail:
            "Author one minimal typed candidate from the frozen source failure context. The model does not execute or apply it.",
          durationMs: 12000,
          kind: "LLM",
          provider: "azure_foundry",
          deployment: "gpt-5-mini",
          role: "repair_proposer",
          logs: [
            "role=repair_proposer task=repair_diagnosis",
            "Current authoritative target: setup-jest.ts",
            "operation=replace_text",
            "Legacy setup-jest import identified as the causal source surface.",
            "Candidate replaces the legacy import with setupZoneTestEnv from jest-preset-angular/setup-env/zone.",
            "Structured repair proposal received.",
          ],
        },
        {
          id: "repair-causal-bind",
          label: "Validate and bind candidate",
          node: "repair.causal_review",
          detail:
            "Schema-check the proposal, bind the exact preimage/postimage and candidate diff, then verify causal fit before review.",
          durationMs: 5000,
          kind: "SYSTEM",
          logs: [
            "Proposal schema validation PASS.",
            "replace_text preimage is unique in setup-jest.ts.",
            "Candidate diff checksum finalized.",
            "Causal review PASS.",
          ],
        },
        {
          id: "repair-reviewer",
          label: "Independent Reviewer",
          node: "repair.review_repair",
          detail:
            "Critique causal fit, policy compliance, risk, and required validation targets without changing or applying the candidate.",
          durationMs: 10000,
          kind: "REVIEWER",
          provider: "azure_foundry",
          deployment: "Llama-3.3-70B-Instruct",
          role: "repair_reviewer",
          logs: [
            "role=repair_reviewer task=repair_review",
            "Verified candidate targets the recorded source failure.",
            "No command authority or unrelated dependency mutation detected.",
            "Required validation: affected test, clean install, full build, full tests.",
            "review decision=accept · risk=LOW",
          ],
        },
        {
          id: "repair-g10-package",
          label: "Finalize G10 repair package",
          node: "repair.create_g10",
          detail:
            "Bind failure, proposal, diff, review, workspace fingerprint, parent lineage, and validation targets into the human approval package.",
          durationMs: 5000,
          kind: "SYSTEM",
          logs: [
            "Proposal checksum bound.",
            "Reviewer checksum bound.",
            "Parent request-changes lineage bound.",
            "G10 package finalized.",
            "No workspace mutation has occurred.",
          ],
        },
      ],
    };
  }

  if (kind === "REPAIR_VALIDATION" && source === 15 && target === 16) {
    return {
      id: id(kind, startedAtMs),
      kind,
      status: "RUNNING",
      startedAtMs,
      steps: [
        {
          id: "repair-tooling-apply-prepare",
          label: "Verify approved G10 tooling package",
          node: "repair.apply_prepare",
          detail:
            "Recheck proposal/review checksums, workspace fingerprint, manifest preimage, and Angular workspace preimage before mutation.",
          durationMs: 7000,
          kind: "SYSTEM",
          logs: [
            "G10 decision=APPROVE verified.",
            "Approved tooling package checksum matches persisted evidence.",
            "package.json and angular.json preimages verified.",
            "Workspace fingerprint unchanged since review.",
          ],
        },
        {
          id: "repair-tooling-manifest",
          label: "Apply governed lint dependency intent",
          node: "repair.apply_manifest",
          detail:
            "Apply only the approved package.json intent: remove TSLint/Codelyzer authority and add the reviewed angular-eslint/ESLint packages.",
          durationMs: 10000,
          kind: "SYSTEM",
          logs: [
            "Removed codelyzer and tslint manifest entries.",
            "Added reviewed angular-eslint 16.x package intent.",
            "Added ESLint registry semver intent.",
            "package-lock.json has not been edited directly.",
          ],
        },
        {
          id: "repair-tooling-config",
          label: "Apply lint configuration transition",
          node: "repair.apply_config",
          detail:
            "Replace the unavailable Angular TSLint builder with the reviewed angular-eslint lint target and create the bounded ESLint configuration.",
          durationMs: 10000,
          kind: "SYSTEM",
          logs: [
            "angular.json lint builder -> @angular-eslint/builder:lint.",
            "lintFilePatterns -> src/**/*.ts and src/**/*.html.",
            ".eslintrc.json created from approved candidate.",
            "Lint authority preserved.",
          ],
        },
        {
          id: "repair-tooling-lock",
          label: "Regenerate lock authority",
          node: "repair.lockfile_generation",
          detail:
            "Regenerate package-lock.json through the governed lockfile-only npm command; the model never authors lockfile content.",
          durationMs: 20000,
          kind: "COMMAND",
          command: "npm install --package-lock-only --ignore-scripts --no-audit --no-fund",
          logs: [
            "$ npm install --package-lock-only --ignore-scripts --no-audit --no-fund",
            "Manifest checksum verified before queue.",
            "package-lock.json regenerated by npm.",
            "Lockfile verification PASS.",
          ],
        },
        {
          id: "repair-tooling-install",
          label: "Materialize clean dependency closure",
          node: "repair.final_install",
          detail:
            "Run npm ci against the regenerated lock authority before lint or application validation.",
          durationMs: 25000,
          kind: "COMMAND",
          command: "npm ci",
          logs: [
            "$ npm ci",
            "package-lock.json authority accepted.",
            "angular-eslint builder materialized.",
            "Installed dependency closure PASS.",
            "exit code 0",
          ],
        },
        {
          id: "repair-tooling-lint",
          label: "Re-run configured lint authority",
          node: "repair.revalidate_affected",
          detail:
            "Run the same project lint script that failed before repair and prove both TypeScript and Angular template coverage remain active.",
          durationMs: 18000,
          kind: "COMMAND",
          command: "npm run lint",
          logs: [
            "$ npm run lint",
            "ng lint resolved @angular-eslint/builder:lint.",
            "TypeScript lint target PASS.",
            "Angular template lint target PASS.",
            "exit code 0",
          ],
        },
        {
          id: "repair-tooling-build",
          label: "Replay full production build",
          node: "repair.validation.build",
          detail:
            "Run the governed Angular production build after the tooling transition.",
          durationMs: 23000,
          kind: "COMMAND",
          command: "npm run build -- --configuration production",
          logs: [
            "$ npm run build -- --configuration production",
            "Angular 16 production compilation completed.",
            "Build validation PASS.",
            "exit code 0",
          ],
        },
        {
          id: "repair-tooling-test",
          label: "Replay full test validation",
          node: "repair.validation.test",
          detail:
            "Run the configured test authority after lint and build have passed.",
          durationMs: 22000,
          kind: "COMMAND",
          command: "npm test -- --watch=false",
          logs: [
            "$ npm test -- --watch=false",
            "Configured test target executed.",
            "Full validation PASS.",
            "exit code 0",
          ],
        },
        {
          id: "repair-tooling-finalize",
          label: "Finalize G11 tooling evidence",
          node: "repair.create_g11",
          detail:
            "Bind the tooling apply ledger, lock verification, clean install, lint, build, tests, and final workspace fingerprint for G11.",
          durationMs: 7000,
          kind: "SYSTEM",
          logs: [
            "Tooling repair validation summary finalized.",
            "Final workspace fingerprint bound.",
            "Repair attempt status=validation_passed.",
            "G11 package ready for human review.",
          ],
        },
      ],
    };
  }

  if (kind === "REPAIR_VALIDATION") {
    return {
      id: id(kind, startedAtMs),
      kind,
      status: "RUNNING",
      startedAtMs,
      steps: [
        {
          id: "repair-apply-prepare",
          label: "Verify approved G10 package",
          node: "repair.apply_prepare",
          detail:
            "Recheck proposal/review checksums, expected workspace fingerprint, parent lineage, and exact preimage before mutation.",
          durationMs: 7000,
          kind: "SYSTEM",
          logs: [
            "G10 decision=APPROVE verified.",
            "Approved package checksum matches the persisted repair candidate.",
            "Workspace fingerprint unchanged since review.",
            "Exact setup-jest.ts preimage verified.",
          ],
        },
        {
          id: "repair-apply",
          label: "Apply typed source repair",
          node: "repair.apply_repair",
          detail:
            "PatchApplyService applies only the approved replace_text operation; no model or UI supplies execution authority.",
          durationMs: 8000,
          kind: "SYSTEM",
          logs: [
            "Applying replace_text to setup-jest.ts.",
            "Unique preimage match confirmed.",
            "Approved postimage written inside the governed stage workspace.",
            "Apply ledger finalized.",
          ],
        },
        {
          id: "repair-postimage",
          label: "Verify repair post-state",
          node: "repair.verify_repair",
          detail:
            "Verify the expected postimage, workspace fingerprint change, and apply ledger before any validation command runs.",
          durationMs: 9000,
          kind: "SYSTEM",
          logs: [
            "setup-jest.ts postimage checksum verified.",
            "Workspace fingerprint advanced exactly once.",
            "No unrelated file mutation detected.",
            "Repair post-state verification PASS.",
          ],
        },
        {
          id: "repair-install",
          label: "Materialize clean dependency closure",
          node: "repair.final_install",
          detail:
            "Run the governed clean install against the already approved manifest and lock authority before tests.",
          durationMs: 26000,
          kind: "COMMAND",
          command: "npm ci",
          logs: [
            "$ npm ci",
            "package-lock.json authority accepted.",
            "Installed dependency closure materialized.",
            "exit code 0",
          ],
        },
        {
          id: "repair-affected-validation",
          label: "Run affected validation first",
          node: "repair.revalidate_affected",
          detail:
            "Re-run the Jest validation target that exposed the legacy setup import before the full replay.",
          durationMs: 18000,
          kind: "COMMAND",
          command: "npm test -- --watch=false",
          logs: [
            "$ npm test -- --watch=false",
            "Jest environment loaded.",
            "setupZoneTestEnv initialized.",
            "Affected validation PASS.",
          ],
        },
        {
          id: "repair-full-build",
          label: "Replay full production build",
          node: "repair.validation.build",
          detail:
            "Run the full governed production build against the repaired clean generation.",
          durationMs: 23000,
          kind: "COMMAND",
          command: "npm run build -- --configuration production",
          logs: [
            "$ npm run build -- --configuration production",
            "Angular production compilation completed.",
            "Build validation PASS.",
            "exit code 0",
          ],
        },
        {
          id: "repair-full-test",
          label: "Replay full test validation",
          node: "repair.validation.test",
          detail:
            "Run the complete configured test authority after the affected target has passed.",
          durationMs: 22000,
          kind: "COMMAND",
          command: "npm test -- --watch=false",
          logs: [
            "$ npm test -- --watch=false",
            "Complete governed test target executed.",
            "Full validation PASS.",
            "exit code 0",
          ],
        },
        {
          id: "repair-finalize",
          label: "Finalize G11 post-state evidence",
          node: "repair.create_g11",
          detail:
            "Bind apply verification, clean install, affected validation, full build/test results, and final workspace fingerprint for human G11 acceptance.",
          durationMs: 7000,
          kind: "SYSTEM",
          logs: [
            "Repair validation summary finalized.",
            "Final workspace fingerprint bound.",
            "Repair attempt status=validation_passed.",
            "G11 package ready for human review.",
          ],
        },
      ],
    };
  }

  return {
    id: id(kind, startedAtMs),
    kind,
    status: "RUNNING",
    startedAtMs,
    steps: [
      {
        id: "source-proof",
        label: "Source Proof",
        node: "transformer.source_proof",
        detail: `Freeze source authority for Angular ${source} → ${target}.`,
        durationMs: 1200,
        kind: "COMMAND",
        logs: ["Source install verified.", "Source build/tests captured.", "Source baseline frozen."],
      },
      {
        id: "discovery",
        label: "Discovery",
        node: "transformer.discovery",
        detail: "Run disposable Angular CLI migration discovery.",
        durationMs: 1200,
        kind: "COMMAND",
        logs: ["Disposable discovery workspace created.", "Angular CLI authority proven.", "Migration discovery evidence frozen."],
      },
      {
        id: "dependency-resolution",
        label: "Dependency Resolution",
        node: "transformer.dependency_resolution",
        detail: "Resolve target dependency intent using preserve-first lockfile policy.",
        durationMs: 1300,
        kind: "COMMAND",
        logs: ["Target dependency plan generated.", "Lockfile authority preserved.", "Dependency resolution completed."],
      },
      {
        id: "migration",
        label: "Migration",
        node: "transformer.migration",
        detail: "Execute package-owner migration commands inside the governed workspace.",
        durationMs: 1700,
        kind: "COMMAND",
        command: `ng update Angular ${source} → ${target}`,
        logs: ["Target workspace materialized.", "Migration ledger opened.", "Owner migration commands executed.", "Target authority frozen."],
      },
      {
        id: "target-proof",
        label: "Target Proof",
        node: "transformer.target_proof",
        detail: "Prove target versions, dependency tree, and candidate identity.",
        durationMs: 1100,
        kind: "COMMAND",
        logs: ["Target dependency tree captured.", `Angular ${target} version proof PASS.`, "Candidate fingerprint recorded."],
      },
      {
        id: "validation",
        label: "Validation",
        node: "transformer.validation",
        detail: "Run clean install, build, tests, and diagnostic delta aggregation.",
        durationMs: 1800,
        kind: "COMMAND",
        logs:
          source === 15 && target === 16
            ? [
                "Clean validation generation created.",
                "npm ci completed against authoritative package-lock.json.",
                "Production build completed.",
                "$ npm run lint",
                "ng lint could not resolve @angular-devkit/build-angular:tslint under Angular CLI 16.2.16.",
                "Legacy TSLint/Codelyzer tooling evidence frozen.",
                "Failure routed to governed Main Repair review; lint authority may not be silently dropped.",
              ]
            : source === 20 && target === 21
              ? [
                  "Clean validation generation created.",
                  "npm ci completed against authoritative package-lock.json.",
                  "Build completed.",
                  "Jest validation failed: jest-environment-jsdom was not present.",
                  'Governed dependency_add materialized jest-environment-jsdom@^30.0.0 and regenerated lock authority.',
                  "Validation retried after dependency closure verification.",
                  "setup-jest.ts still imports jest-preset-angular/setup-jest.",
                  "Remaining source failure frozen for Main Repair ownership.",
                ]
              : [
                  "Clean validation generation created.",
                  "npm ci --include=optional completed.",
                  "Build completed.",
                  "Tests completed.",
                  "Diagnostic delta aggregated.",
                ],
      },
    ],
  };
}
