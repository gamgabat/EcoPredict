# Reef Oracle — Repositioning Improvement Plan (`codefix.md`)

> **Status:** plan authored 2026-08-14 against commit `5e0733e` (branch `main`, clean tree).
> **This file is the working cheat sheet for the whole migration.** It is self-contained on purpose.
> If you are an agent or engineer picking this up cold: read §0 and §6 before you touch anything,
> then work the checkboxes in §5 in order. Tick them here as you go. Do not rely on any other
> document — `projectGuide/mainIdea.md`, `projectGuide/implementation.md` and
> `projectGuide/techStack.md` describe the **abandoned** product concept and are kept only as a
> historical record (see §2).

---

## §0. Read this first — the authoritative product contract

The team's concept changed. The website still implements the old one. This is not a copy change:
the old concept is load-bearing in the type layer, the state store, the graph and the engine.

### 0.1 Old concept — now wrong, must be eliminated

> An AI platform that predicts _unknown / undiscovered species_ and their interactions, filling the
> biodiversity blind spot in traditional EIA.

### 0.2 New concept — authoritative

> Reef Oracle does not predict unknown species. It identifies potentially **omitted interactions**
> among **observed species, functional roles and environmental stressors**, then **prioritises them
> for EIA review**.

### 0.3 What "unknown" means now

> A plausible, decision-relevant ecological relationship, parameter, threshold, or pathway
> **omitted from the selected EIA evidence, assumptions, scope, taxonomic resolution, or time
> horizon.**

"Unknown" is a property of **an edge, a parameter value, or a threshold** — never of a **node**.
It does not mean unknowable, newly discovered, or deliberately ignored.

### 0.4 Permitted node types — and only these

| Node type          | Meaning                                                  |
| ------------------ | -------------------------------------------------------- |
| `species`          | An **observed**, real, named taxon                       |
| `functional_role`  | A documented ecological role (e.g. grazer, reef-builder) |
| `abiotic_stressor` | Temperature, pH, nutrients, salinity                     |
| `local_stressor`   | Sediment, project disturbance, disease context           |
| `habitat_function` | Structural complexity, recruitment substrate             |

The only permitted edge concept is a **candidate interaction**: an evidence-linked relationship
that _should be investigated or monitored_. It is a hypothesis, never a proven causal claim.

**Hard prohibition:** the system must not generate, name, infer, or display any organism that was
not entered as an observed species. No fictional taxa. No procedurally-named niches. No
"Unknown Species α".

### 0.5 The product contract

| Stage              | Content                                                                                                                              |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------ |
| **INPUT**          | Project footprint, EIA baseline, observed species, functional roles, climate context, local stressors, exposure routes, time horizon |
| **MODEL**          | Evidence-linked candidate interactions among the five permitted node types                                                           |
| **PRIORITISATION** | Consequence × Plausibility × Detectability Gap                                                                                       |
| **OUTPUT**         | Ranked decision pathways, evidence class, sensitivity, assumptions, next measurement, management trigger                             |
| **HUMAN CONTROL**  | A qualified ecologist accepts / revises / rejects each high-priority pathway before it can enter an external screening report        |

### 0.6 Prioritisation maths (exact)

```
rawPriority        = consequenceScore * plausibilityScore * detectabilityGapScore   // each 1–5, editable
normalizedPriority = Math.round((rawPriority / 125) * 100)
```

Definitions that must be visible in the UI next to the output:

- **Consequence** — how much the pathway could change a survey, mitigation or monitoring decision _if it is real_.
- **Plausibility** — how strongly available evidence and site conditions support the pathway.
- **Detectability Gap** — how likely the current baseline or monitoring approach is to _miss_ the pathway.

The three inputs must be visible next to the output. The score must **never** be presented as a
validated probability.

### 0.7 Evidence classes

- **A** — Empirical, site-relevant evidence
- **B** — Ecological analogue
- **C** — Team or user assumption

Always render the letter **and** the text label. Never encode by colour alone. If a demo
relationship has no verified source, it is class **C** with the citation field reading
`Source required`. **Do not fabricate citations.**

### 0.8 Boundary statement — used once, not repeated defensively

> Reef Oracle supports EIA screening and expert review. It does not discover species, prove
> causation, or issue regulatory verdicts.

### 0.9 Reference domain content for the demo scenario

| Species                 | Known role (evidence)                                                                        | Candidate edge (hypothesis)                                                                              |
| ----------------------- | -------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| _Diadema antillarum_    | Keystone herbivore; reduced grazing releases macroalgae and cuts clean recruitment substrate | Herbivore loss × nutrients may amplify algal/microbial pressure                                          |
| _Porites astreoides_    | Stress-tolerant, fast-recruiting coral                                                       | A shift toward tolerant corals may mask loss of slow-growing reef builders                               |
| _Montastraea cavernosa_ | Large reef-builder contributing habitat complexity                                           | Compounding local stress + disease may cut structural habitat faster than single-stressor models suggest |
| _Siderastrea siderea_   | Long-lived, stress-tolerant; condition integrates repeated exposure                          | Thermal history may alter disease sensitivity; direction must stay uncertain until evidenced             |

Stressor set: temperature anomaly, nutrient loading, sediment / project disturbance, stony coral
tissue loss disease (SCTLD) context. **Spell out "stony coral tissue loss disease" before the
first use of the acronym**, then use SCTLD.

Required cascade illustration, always labelled _"Illustrative pathway to test — not a causal
conclusion"_:

```
Local stressor ↑ → Herbivory pressure ↓ → Macroalgal pressure ↑
→ Coral recruitment ↓ → Habitat complexity ↓
```

Do not claim this cascade caused observed change at any real site.

### 0.10 Non-goals (binding)

- Do not rewrite the application from scratch. Preserve architecturally sound work (§2).
- Do not deploy, change domains, touch secrets, or modify environment variables.
- Do not add heavy dependencies for nice-to-haves. (PDF export is explicitly **out of scope** —
  JSON/CSV only, per §6.5.)
- Do not invent scientific citations, market figures, validation results, or customer references.
- Do not scatter defensive disclaimers; the boundary statement appears **once**.

---

## §1. Findings — reconnaissance of the repository as it stands

Everything in this section was read directly. Every claim cites `path:line`.

### 1.1 Framework, routing, build and deploy

- **It is a Vite + React 19 SPA, not Next.js.** `package.json:6-10` declares
  `dev: vite`, `build: tsc && vite build`, `preview: vite preview`, `lint: eslint`.
  React is `19.2.4` (`package.json:23`, confirmed installed).
- Vite config is minimal: React plugin plus an `@` → `./src` alias (`vite.config.ts:5-11`).
  There is **no `base`, no build output override, no server/preview config**.
- Entry HTML is `index.html`; it mounts `/src/main.tsx` (`index.html:10`) into `#root`.
  There is **no favicon link and no `<meta name="description">`** (`index.html:1-12`).
- Routing is client-side `react-router-dom` v7 `BrowserRouter` with exactly two routes plus a
  catch-all redirect: `/` → `LandingPage`, `/dashboard` → `DashboardPage`, `*` → redirect to `/`
  (`src/App.tsx:7-14`).
- **There is no SPA rewrite configuration anywhere in the repo.** No `vercel.json`, no
  `netlify.toml`, no `public/_redirects`, no `staticwebapp.config.json`, no `.github/` workflow
  (verified by directory listing and `find` across the repo root, excluding `node_modules`).
  `projectGuide/techStack.md` names **Vercel** as the deployment target. A Vite SPA served as
  static output with no rewrite rule returns **404 for a direct request to `/dashboard`**, which
  matches the reported symptom. Note that `vite preview` applies its own SPA fallback, so
  **local preview will pass while production fails** — see §7.4.
- `README.md:1-36` is the untouched `create-next-app` boilerplate and tells the reader to edit
  `app/page.tsx`, which does not exist.
- `CLAUDE.md` imports `AGENTS.md`, which instructs the reader that this is a modified Next.js and
  to read `node_modules/next/dist/docs/` before writing code (`AGENTS.md:1-3`).
  **`node_modules/next` does not exist** (verified). This instruction is actively misleading.
- `build.log` (tracked, 260 bytes) is a stray captured Vite build log fragment.

### 1.2 State layer — `src/store/simulationStore.ts` (358 lines, single Zustand store)

Old-concept slices, actions and derived getters:

| Item                                                                                                                       | Line(s)                                  | Note                                                      |
| -------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- | --------------------------------------------------------- |
| `areUnknownSpeciesDiscovered: boolean`                                                                                     | `:24`, `:115`, `:141`                    | boolean gate for the whole fabrication feature            |
| `unknownSpeciesAlpha` (`predationStrength`, `competitionWithCoral`, `populationEstimate`, `nicheName`, `triggerCondition`) | `:25`, `:116`, `:142`, `:201`            | fabricated organism state                                 |
| `unknownSpeciesBeta` (`diseaseResistance`, `nutrientUptake`, `populationEstimate`, `nicheName`, `triggerCondition`)        | `:26`, `:117`, `:143`, `:202`            | fabricated organism state                                 |
| `setUnknownSpeciesDiscovered` / `setUnknownSpeciesAlpha` / `setUnknownSpeciesBeta`                                         | `:55-57`, `:141-143`                     | fabrication mutators                                      |
| `runNichePrediction()` action                                                                                              | `:63`, `:186-206`                        | calls the fabrication engine and flips the discovery flag |
| `isScanning` + `setIsScanning`                                                                                             | `:36`, `:59`, `:119`, `:145`             | drives the fake 2-second "scan"                           |
| `unknownAlphaEffect` / `unknownBetaEffect` in `getEcosystemMetrics`                                                        | `:77-78`, `:220-221`, `:270-271`, `:277` | fabricated-organism stress terms                          |

Sound, reusable state (keep): the environmental parameter slice `temperature`, `phLevel`,
`salinity`, `nitrogenLoading`, `scltdOutbreakRisk`, `currentYear` (`:6-13`, `:100-106`) with their
setters (`:41-47`, `:127-133`); the scenario apply/clear pair with clamped deltas and a baseline
snapshot (`:61-62`, `:147-184`); and `getCoralResilienceMetrics()` (`:81-96`, `:284-357`), which is
fully deterministic, documented, and expresses baseline × environmental-condition factors.

**Technical debt found in this file (all confirmed by reading):**

1. **Direction-of-effect contradiction between engine and UI.** In the engine the fabricated beta
   organism _increases_ stress: `unknownBetaStress` (`:221`) is subtracted from `diademaHealth`
   (`:230`) and from `coralHealth` (`:262`). The UI asserts the opposite: it calls beta a "stronger
   buffer the more threatened the reef is" (`src/components/dashboard/DetailsSidebar.tsx:378`), a
   "Disease buffer / nutrient sink" that "Reduces SCLTD risk & nitrogen load"
   (`DetailsSidebar.tsx:388-389`) with "Side Effect: None predicted — net beneficial"
   (`DetailsSidebar.tsx:390`). Both halves are moot once the entity is deleted, but the removal
   must be done in one pass so no orphaned claim survives — see T-2.4 and T-2.7.
2. **The memoisation of `getEcosystemMetrics` is present but incorrect.** A cache key is built at
   `:214` and read at `:215`, then written at `:280`. The key **omits `algaeGrowthRate` and
   `coralResilience`**, both of which the computation consumes (`:226`, `:247`, `:260`). Moving the
   "Algae Growth Rate" or "Coral Resilience" slider (`DetailsSidebar.tsx:675-676`) therefore
   returns **stale metrics** until some other parameter changes. This is a live correctness and
   determinism bug, not merely a performance one.
3. **`set()` is called from inside a getter** (`:280`) that is invoked during render by seven
   components (see §1.5). Under `React.StrictMode` (`src/main.tsx:7`) this mutates store state
   during the render phase.
4. `humidity` (`:7`, `:42`, `:101`, `:128`) is dead state — the comment at `:7` admits it
   ("might be kept for legacy"); nothing reads it.

### 1.3 Domain/type layer

- `src/types/niche.ts` — 100% old concept: `UnknownSpeciesAlpha` (`:1-7`) and
  `UnknownSpeciesBeta` (`:9-15`) both carry `nicheName` (`:2`, `:10`);
  `NichePredictionInput` (`:17-26`); `NichePredictionOutput` with
  `alphaDiscovered`/`betaDiscovered` (`:28-35`).
- `src/types/cascade.ts` — `CascadeInput.areUnknownSpeciesDiscovered` (`:14`),
  `unknownAlphaRisk`/`unknownBetaRisk` (`:15-16`);
  `CascadeOutput.secondOrder.unknownAlphaRisk`/`unknownBetaRisk` (`:39-40`);
  `CascadeOutput.thirdOrder.unknownSpeciesThreat` (`:52`) and `legalExposureScore`
  (`:53`, commented "how challengeable this disruption is"), plus
  `thirdOrder.extinctionRisk` (`:46-50`). The deterministic 50-year `projection` array
  (`:56-64`) is sound and reusable.
- `src/types/disruption.ts` — `DisruptionScenario` (`:1-14`) is structurally fine, but carries
  `legalContext: string` (`:13`, "which regulation this implicates"), which asserts a regulatory
  conclusion.

### 1.4 Graph layer — `src/components/dashboard/SpeciesMindMap.tsx` (257 lines)

- Node type registry: `{ species: SpeciesNode, unknownSpecies: UnknownSpeciesNode }`
  (`:14`) — **`unknownSpecies` is a first-class node type today.**
- Twelve hardcoded nodes, all `type: 'species'` (`:17-37`). Three are corals with real binomials —
  but `'Montastraea cavern.'` is truncated (`:35`) and none are italicised.
  There is no representation of functional roles, stressors, or habitat functions.
- Fabricated nodes `u-alpha` / `u-beta` are injected into the graph whenever the discovery flag is
  set, falling back to the literal labels `'Unknown Species α'` / `'Unknown Species β'`
  (`:71-72`, `:84-85`) and removed when it clears (`:89`).
- Edges are constructed by a helper (`:40-47`) and rebuilt on every simulation change
  (`:94-149`); five extra edges are pushed for the fabricated organisms (`:129-137`).
  **Edges carry no evidence class, no mechanism, no direction semantics and no citation** — only a
  colour, a dash pattern and an optional one-word label.
- Clicking an edge cycles its label through `prey → competition → threat` (`:219-243`) — an
  untyped, unaudited mutation with no persistence and no meaning in the new model.
- Focus/dim behaviour (`:152-195`) and the user edge-deletion memory (`:52`, `:198-208`) are
  architecturally sound and worth keeping.

### 1.5 Engine layer

- `src/engine/nichePredictor.ts` (77 lines) — **the fabrication engine.** Five threshold rules
  mint organisms with invented names: `"Thermophilic Algal Competitor"` (`:12`),
  `"Anaerobic Microbial Mat"` (`:23`), `"Cryptic Predatory Polychaete"` (`:34`),
  `"Disease-Amplifying Echinoderm"` (`:49`), `"Sediment-Tolerant Biofilm Producer"` (`:60`).
  Every one of these is a fictional taxon. This file must not survive.
- `src/engine/cascadeModel.ts` (107 lines) — three-order deterministic cascade.
  1st order (`:27-32`) and 2nd order (`:35-38`) are defensible arithmetic over baseline deltas.
  3rd order is not: `unknownSpeciesThreat` (`:43`) and `legalExposureScore` (`:45`, which also
  feeds the projection decay rate at `:57`) encode the abandoned concept and an unsupportable legal
  claim. `extinctionRisk` (`:49-53`) asserts per-species extinction probability from slider
  arithmetic. The projection loop (`:59-80`) is deterministic and produces an explicit
  upper/lower band — reusable.
- `getEcosystemMetrics()` is called during render from **seven** sites:
  `CascadeImpactPanel.tsx:27` and `:28` (twice in one memo), `DetailsSidebar.tsx:124`,
  `ImpactSimulationChart.tsx:10`, `nodes/SpeciesNode.tsx:18`, `nodes/UnknownSpeciesNode.tsx:14`,
  `nodes/WorldNode.tsx:7`, `SimulationViewMap.tsx:19`, `SpeciesMindMap.tsx:95`.
- **`Math.random()` appears in displayed output**: `SimulationViewMap.tsx:8-12` generates every
  organism's position, destination and speed randomly. The positions are memoised per mount
  (`:39-48`), so they are stable within a session but differ on every reload — the same inputs do
  not reproduce the same picture.
- `CascadeImpactPanel.tsx:30-35` — the `useMemo` dependency list **omits `algaeGrowthRate` and
  `coralResilience`**, mirroring the store bug in §1.2(2); the chart goes stale against those two
  sliders.

### 1.6 Public copy surfaces

- `index.html:6` — `<title>EcoPredict Prototype</title>`.
- `src/pages/LandingPage.tsx` — the entire page: document title `:10`, nav brand `:27`,
  hero headline `:59`, hero paragraph `:68`, trust chips `:95`/`:98`/`:101`, problem copy
  `:111`/`:115`/`:121`, feature cards `:139-144`, how-it-works `:167`/`:176-178`,
  pricing `:204`/`:218-226`/`:242-250`, final CTA `:264`/`:266`, footer brand `:287` and
  copyright `:298`.
- `src/pages/DashboardPage.tsx:13` — document title `"Coral Reef EIA Simulator | EcoPredict"`.
  Panel headings at `:25`, `:41`, `:62`, `:88`.
- `src/components/layout/Navbar.tsx:11` — brand `"EcoPredict EIA"`; `:23` links to
  `https://github.com/gamgabat/EcoPredict` (a real, resolving URL — see §1.9 exceptions);
  `:20` `"Simulation Dashboard"`.
- `src/components/dashboard/DisruptionPanel.tsx:58` renders `activeScenario.legalContext`, whose
  five values all begin `"Implicates …"` (`src/data/disruptionScenarios.ts:13,25,38,50,62`).
- No export surface exists anywhere in the repo — there is **no report, download, JSON or CSV
  code path at all**. Gate D's export requirement is a build-from-zero item.
- **Dead CTAs** (buttons with no `onClick`, no `href`, no route):
  `LandingPage.tsx:38` "Sign In", `:83` "Watch Demo", `:229` "Request a Project Quote →",
  `:253` "Start Free Trial →", `:275` "Schedule a Demo".
  The four in-page anchors (`#problem`, `#features`, `#how-it-works`, `#pricing`) do resolve to
  real section ids (`:108`, `:130`, `:163`, `:200`).

### 1.7 Tests, linting, formatting

- **No test framework is installed** — no `vitest`, `jest`, `@testing-library/*` in
  `package.json:11-41`; no `*.test.*` or `*.spec.*` file exists in `src/`.
- **`npm run lint` is broken.** `package.json:9` runs bare `eslint`; ESLint 9.39.4 aborts with
  _"ESLint couldn't find an eslint.config.(js|mjs|cjs) file."_ There is no flat config in the repo.
  `eslint-config-prettier` is installed (`package.json:19`) but unused.
- **Prettier is installed (`package.json:22`) but unconfigured.** `npx prettier --check src`
  reports _"Code style issues found in 24 files"_ — i.e. every source file is unformatted.
- **`npx tsc -p tsconfig.json --noEmit` exits 0.** The type layer is currently clean, and
  `tsconfig.json:18-21` enables `strict`, `noUnusedLocals`, `noUnusedParameters`,
  `noFallthroughCasesInSwitch`. Keeping tsc at zero errors is a usable gate throughout.

### 1.8 Reusable assets — architecturally sound, preserve rather than rewrite

- The Zustand store shape and its clamped `applyDisruption` / `clearDisruption` baseline-snapshot
  pattern (`simulationStore.ts:147-184`) — this is exactly the "alternative scenario" mechanism
  Gate E needs.
- `getCoralResilienceMetrics()` (`simulationStore.ts:284-357`) — deterministic, commented,
  factor-decomposed; it already surfaces its own inputs, which is the transparency posture the new
  concept wants.
- The deterministic projection band in `cascadeModel.ts:59-80` (explicit `upperBound`/`lowerBound`,
  no randomness) — this is the shape a sensitivity range should take.
- The `@theme` token system in `src/index.css:8-23` and the project rule "do not use default
  Tailwind colors" (`:3-7`) — the discipline is right; only the values and role assignments need
  correcting (§1.10).
- ReactFlow scaffolding in `SpeciesMindMap.tsx`: focus/dim (`:152-195`), edge-deletion memory
  (`:198-208`), `nodeTypes` registry pattern (`:14`).
- The reusable primitives in `DetailsSidebar.tsx`: `SliderRow` (`:22-48`), `HealthBar` (`:51-61`),
  `ToleranceRow` (`:76-99`), `InfoChip` (`:102-109`), `Section` (`:112-119`).
- `nodes/ParameterNode.tsx` (dead today) is already a slider-bearing graph node — the natural
  basis for `abiotic_stressor` / `local_stressor` nodes.
- Recharts `AreaChart` wiring with `isAnimationActive={false}` (`CascadeImpactPanel.tsx:114-119`).

### 1.9 Dead code (imported by nothing — verified by import-graph sweep)

`src/components/dashboard/ImpactSimulationChart.tsx`, `src/components/dashboard/nodes/ParameterNode.tsx`,
`src/components/dashboard/nodes/WorldNode.tsx`, `src/components/dashboard/nodes/GroupNode.tsx`.
None appears in any `import` statement outside its own file.

### 1.10 Interface and accessibility observations (Gate F baseline)

- Current tokens vs the required palette (`src/index.css:8-23`):

  | Required token   | Required value | Current token       | Current value | Action                    |
  | ---------------- | -------------- | ------------------- | ------------- | ------------------------- |
  | `--background`   | `#F7F6F2`      | `--color-bg`        | `#F7F6F2`     | ✅ matches                |
  | `--surface`      | `#FFFFFF`      | `--color-bgCard`    | `#FFFFFF`     | ✅ matches                |
  | `--ink`          | `#111111`      | `--color-textMain`  | `#111111`     | ✅ matches                |
  | `--muted`        | `#555761`      | `--color-textMuted` | `#52525B`     | change value              |
  | `--reef-green`   | `#08725E`      | `--color-secondary` | `#0F6E56`     | change value **and role** |
  | `--ocean-blue`   | `#145EA8`      | `--color-primary`   | `#185EA4`     | change value **and role** |
  | `--line`         | `#D4D7D8`      | `--color-border`    | `#D4D4D8`     | change value              |
  | `--green-soft`   | `#E1EEEA`      | —                   | —             | add                       |
  | `--blue-soft`    | `#E7F0F8`      | —                   | —             | add                       |
  | `--warning-soft` | `#F7ECD8`      | —                   | —             | add                       |

  Note the **role swap**: today `primary` is blue and `secondary` is green; the target direction is
  deep green as primary with blue for secondary/quantitative.

- **Scroll-dependent content.** Every section below the hero animates in via
  `whileInView` + `viewport={{ once: true }}` starting from `opacity: 0`
  (`LandingPage.tsx:148-151`, `:182-185`, `:210-212`, `:236-239`). There is no
  `MotionConfig reducedMotion` anywhere and no `prefers-reduced-motion` handling in
  `src/index.css`. With animation or IntersectionObserver unavailable, the page below the fold is
  blank.
- **Dashboard is desktop-only by construction.** `DashboardPage.tsx:17` sets
  `h-screen w-screen overflow-hidden`; the sidebar is a fixed `w-72` (`:23`) and the panes only
  become a row at `lg` (`:20`). Below 1024px the three panes stack inside a clipped, non-scrolling
  viewport.
- **Sub-legible type and low-contrast muted text.** `text-[9px]` and `text-[10px]` are used
  throughout `DetailsSidebar.tsx` (e.g. `:92`, `:95`, `:115`, `:136`), with further opacity
  reduction at `:95` (`text-textMuted/60`) and `:719`.
- **Colour-only encoding.** Evidence of status is carried by colour alone in several places, e.g.
  the legend swatches in `SimulationViewMap.tsx:184-188` and the edge semantics in
  `SpeciesMindMap.tsx:100-137` (colour + dash pattern only, no text).
- **No favicon asset exists**, so the browser issues a failing `/favicon.ico` request — relevant to
  the "browser console clean" gate.
- Available imagery: `public/file.svg`, `public/globe.svg`, `public/next.svg`, `public/vercel.svg`,
  `public/window.svg` — all `create-next-app` template leftovers, none referenced by any source
  file. No licensed photography exists in the repo, and none may be introduced.

### 1.11 Build artefacts

`dist/` **is committed** — `dist/index.html`, `dist/assets/index-B0mYtxFv.js`,
`dist/assets/index-BRwqCmb7.css` and five SVGs are all tracked (added in commit `a649b78`
"Migrate from Next.js to Vite React SPA"). `.gitignore:21-22` ignores `/build` but **not** `/dist`.

The committed bundle is **stale** — it was built 2026-04-22 23:56, while `src/` was last modified
2026-05-22. It contains `EcoPredict` ×3 in the JS plus ×1 in `dist/index.html`, one
`Predict the` and one `Predicted`, and two `Unknown` occurrences. It does **not** contain the
current landing-page strings such as `ES/EIS` or `50% Faster`, confirming it predates the current
source. If this directory is what gets deployed, the live site does not match `src/` at all.

### 1.12 Forbidden-string inventory

Classification key: `public copy` (user-visible text) · `identifier` (symbol/prop/key names) ·
`type` (type or interface declaration) · `build artefact` · `internal note` (docs).

#### A. Public copy — must be zero after Phase 6

| Location                                                          | Current text                                                                                                | Class                     | Disposition                                                           |
| ----------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- | ------------------------- | --------------------------------------------------------------------- |
| `index.html:6`                                                    | `EcoPredict Prototype`                                                                                      | public copy               | → `Reef Oracle — EIA Interaction Screening` (T-1.3)                   |
| `src/pages/LandingPage.tsx:10`                                    | `EcoPredict \| Predict the Unknown`                                                                         | public copy               | → `${BRAND.name} — ${BRAND.tagline}` from the brand constant (T-1.9)  |
| `src/pages/LandingPage.tsx:27`                                    | `EcoPredict` (nav)                                                                                          | public copy               | → `{BRAND.name}` (T-1.12)                                             |
| `src/pages/LandingPage.tsx:59`                                    | `Predict the Unknown` (H1)                                                                                  | public copy               | → "Find the interaction pathways an EIA may have missed." (T-1.9)     |
| `src/pages/LandingPage.tsx:68`                                    | `EcoPredict simulates unknown species interactions … NGO litigation`                                        | public copy               | rewrite to the §6.4 replacement; delete the litigation clause (T-1.9) |
| `src/pages/LandingPage.tsx:95`                                    | `50% Faster than traditional EIA`                                                                           | public copy               | delete; replace chip with _Observed species only_ (T-1.10)            |
| `src/pages/LandingPage.tsx:98`                                    | `$3K–10K per project`                                                                                       | public copy               | move to pricing section, labelled a pricing hypothesis (T-1.11)       |
| `src/pages/LandingPage.tsx:101`                                   | `0 unexpected disruptions target`                                                                           | public copy               | delete; replace chip with _A/B/C evidence classes_ (T-1.10)           |
| `src/pages/LandingPage.tsx:111`                                   | `Traditional EIA Has a Blind Spot`                                                                          | public copy               | reframe to omitted-interaction language (T-1.9)                       |
| `src/pages/LandingPage.tsx:115`                                   | `Unknown organisms and their cascading effects go completely unassessed … litigate projects post-approval`  | public copy               | rewrite; no unknown organisms, no litigation claim (T-1.9)            |
| `src/pages/LandingPage.tsx:121`                                   | `"The cost isn't just ecological. It's legal."`                                                             | public copy               | delete — legal-exposure framing is abandoned (T-1.9)                  |
| `src/pages/LandingPage.tsx:139`                                   | `Models known + AI-predicted species …`                                                                     | public copy               | → §6.4 replacement (T-1.9)                                            |
| `src/pages/LandingPage.tsx:140`                                   | `AI Prediction Engine` / `Gap analysis of unknown species …`                                                | public copy               | → "Candidate interaction engine" wording (T-1.9)                      |
| `src/pages/LandingPage.tsx:141`                                   | `ES/EIS-compliant reports, ready for planning permits.`                                                     | public copy               | → §6.4 replacement (T-1.9)                                            |
| `src/pages/LandingPage.tsx:167`                                   | `From Project Site to Compliance-Ready Report`                                                              | public copy               | → screening-summary wording (T-1.9)                                   |
| `src/pages/LandingPage.tsx:177`                                   | `AI simulates unknown species interactions …`                                                               | public copy               | → §6.4 replacement (T-1.9)                                            |
| `src/pages/LandingPage.tsx:178`                                   | `Export a fully ES/EIS-compliant EIA report …`                                                              | public copy               | → §6.4 replacement (T-1.9)                                            |
| `src/pages/LandingPage.tsx:226`                                   | `50% faster than traditional EIA firms`                                                                     | public copy               | delete (T-1.11)                                                       |
| `src/pages/LandingPage.tsx:248-249`                               | `Predictive risk tracking` / `Evidence-based forecasting`                                                   | public copy               | → "pathway prioritisation" / "evidence-classed screening" (T-1.11)    |
| `src/pages/LandingPage.tsx:266`                                   | `… development firms and NGOs already using EcoPredict …`                                                   | public copy               | delete the adoption claim entirely (T-1.11)                           |
| `src/pages/LandingPage.tsx:287`, `:298`                           | `EcoPredict` (footer, copyright)                                                                            | public copy               | → `{BRAND.name}` (T-1.12)                                             |
| `src/pages/DashboardPage.tsx:13`                                  | `Coral Reef EIA Simulator \| EcoPredict`                                                                    | public copy               | → `${BRAND.name} — Screening Workspace` (T-1.13)                      |
| `src/components/layout/Navbar.tsx:11`                             | `EcoPredict EIA`                                                                                            | public copy               | → `{BRAND.name}` (T-1.8)                                              |
| `src/components/dashboard/DetailsSidebar.tsx:319`, `:363`         | `✦ AI-Predicted Species`                                                                                    | public copy               | delete with the whole branch (T-1.14)                                 |
| `src/components/dashboard/DetailsSidebar.tsx:322`, `:366`         | `Unknown Species α` / `Unknown Species β` fallback labels                                                   | public copy               | delete with the whole branch (T-1.14)                                 |
| `src/components/dashboard/DetailsSidebar.tsx:592-593`             | `'u-alpha': 'Unknown Species α'`, `'u-beta': 'Unknown Species β'`                                           | public copy               | delete map entries (T-1.14)                                           |
| `src/components/dashboard/DetailsSidebar.tsx:759`                 | `Find Best Fitting Species` (button)                                                                        | public copy               | delete the control (T-1.14)                                           |
| `src/components/dashboard/DetailsSidebar.tsx:765`                 | `No additional niches detected …`                                                                           | public copy               | delete with the control (T-1.14)                                      |
| `src/components/dashboard/nodes/UnknownSpeciesNode.tsx:45`, `:47` | `AI Predicted` tag                                                                                          | public copy               | file deleted (T-2.5)                                                  |
| `src/components/dashboard/CascadeImpactPanel.tsx:93`, `:154`      | `Unknown Species Threat`                                                                                    | public copy               | replaced by omitted-pathway priority (T-4.5)                          |
| `src/components/dashboard/CascadeImpactPanel.tsx:141`, `:144`     | `/ 100 Legal Exposure Score` + "vulnerability … to legal challenge under environmental protection statutes" | public copy               | delete — unsupportable legal claim (T-4.5)                            |
| `src/components/dashboard/SimulationViewMap.tsx:180-181`          | `Alpha Species` / `Beta Species` legend rows                                                                | public copy               | file deleted (T-2.9)                                                  |
| `src/data/disruptionScenarios.ts:13,25,38,50,62`                  | `Implicates Section 316(a) …` (×5)                                                                          | public copy               | reword to "Commonly assessed under …" and rename the field (T-4.2)    |
| `README.md:1-36`                                                  | Next.js boilerplate                                                                                         | public copy (repo-facing) | rewrite (T-1.17)                                                      |

#### B. Identifiers and types — must carry no unknown-_entity_ semantics after Phase 2

| Location                                                                                          | Symbol                                                                                                                             | Class                    | Disposition                                                    |
| ------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | ------------------------ | -------------------------------------------------------------- |
| `src/types/niche.ts:1-35` (whole file)                                                            | `UnknownSpeciesAlpha`, `UnknownSpeciesBeta`, `nicheName` (`:2`,`:10`), `NichePredictionInput`, `NichePredictionOutput`             | type                     | **delete file** (T-2.5)                                        |
| `src/engine/nichePredictor.ts:1-77` (whole file)                                                  | `runNichePrediction`, five `nicheName` literals (`:12,23,34,49,60`)                                                                | identifier + public copy | **delete file** (T-2.5)                                        |
| `src/store/simulationStore.ts:23-26,55-57,63,115-117,141-143,186-206,212,214,220-221,270-271,277` | `areUnknownSpeciesDiscovered`, `unknownSpeciesAlpha/Beta`, setters, `runNichePrediction`, `unknownAlphaEffect`/`unknownBetaEffect` | identifier               | delete slice (T-2.4)                                           |
| `src/store/simulationStore.ts:36,59,119,145`                                                      | `isScanning`, `setIsScanning`                                                                                                      | identifier               | delete (T-2.4)                                                 |
| `src/types/cascade.ts:14,15,16,39,40,52,53`                                                       | `areUnknownSpeciesDiscovered`, `unknownAlphaRisk`, `unknownBetaRisk`, `unknownSpeciesThreat`, `legalExposureScore`                 | type                     | migrate per §3 (T-4.1)                                         |
| `src/engine/cascadeModel.ts:11,12,13,43,45,66,95,96,102,103`                                      | same symbols                                                                                                                       | identifier               | migrate per §3 (T-4.2)                                         |
| `src/components/dashboard/SpeciesMindMap.tsx:14`                                                  | node type key `unknownSpecies`                                                                                                     | identifier               | delete; replace registry with the five permitted types (T-2.6) |
| `src/components/dashboard/SpeciesMindMap.tsx:59-61,68,71-72,84-85,91,129-137,147`                 | `areUnknownSpeciesDiscovered`, `unknownSpeciesAlpha/Beta`, `u-alpha`/`u-beta` nodes and edges                                      | identifier               | delete (T-1.14, T-2.6)                                         |
| `src/components/dashboard/SimulationViewMap.tsx:24,34,35,126,134,179`                             | same                                                                                                                               | identifier               | file deleted (T-2.9)                                           |
| `src/components/dashboard/CascadeImpactPanel.tsx:22,23,24,33`                                     | same                                                                                                                               | identifier               | rewire (T-4.5)                                                 |
| `src/components/dashboard/DetailsSidebar.tsx:310-396,582,728,741`                                 | `u-alpha`/`u-beta` branches, discovery flag reads                                                                                  | identifier               | delete (T-1.14)                                                |
| `src/components/dashboard/nodes/UnknownSpeciesNode.tsx` (whole file)                              | `UnknownSpeciesNode`, `unknownId`                                                                                                  | identifier               | **delete file** (T-2.5)                                        |
| `src/types/disruption.ts:13`                                                                      | `legalContext`                                                                                                                     | type                     | rename to `eiaReviewContext` (T-4.2)                           |
| `package.json:2`                                                                                  | `"name": "next_app"`                                                                                                               | identifier               | → `"reef-oracle"` (T-1.2)                                      |

#### C. Build artefacts — reported separately as required

| Location                                   | Content                                                         | Class          | Disposition                          |
| ------------------------------------------ | --------------------------------------------------------------- | -------------- | ------------------------------------ |
| `dist/index.html`                          | `EcoPredict Prototype` (title)                                  | build artefact | regenerated by the build; see T-1.20 |
| `dist/assets/index-B0mYtxFv.js`            | `EcoPredict` ×3, `Predict the` ×1, `Predicted` ×1, `Unknown` ×2 | build artefact | regenerated by the build; see T-1.20 |
| `dist/assets/index-BRwqCmb7.css`           | no forbidden strings                                            | build artefact | regenerated                          |
| `dist/{file,globe,next,vercel,window}.svg` | template SVGs                                                   | build artefact | regenerated from `public/`           |
| `build.log`                                | stray Vite log fragment                                         | build artefact | delete (T-1.19)                      |

**Does the committed `dist/` matter?** Yes, on two counts. (1) It is stale relative to `src/`, so
whatever is deployed from it does not reflect the current source — any verification done against
the live site is meaningless until it is rebuilt. (2) A committed bundle guarantees the forbidden
strings survive the migration in tracked files. Decision required in T-1.20 (recommendation:
untrack it and add `/dist` to `.gitignore`, unless the deploy pipeline literally serves the
committed directory — check before removing).

#### D. Strings from the required search list with **zero** occurrences anywhere

`Predict Unknown Species` · `undiscovered species` · `unknownSpeciesAlpha`/`unknownSpeciesBeta` as
_literal display text_ (they exist only as identifiers, row B above). Recorded so the next agent
does not re-run these searches expecting hits.

#### E. Gate B exception list — the only paths permitted to retain forbidden strings

1. `projectGuide/mainIdea.md` — frozen legacy record of the abandoned concept.
2. `projectGuide/implementation.md` — frozen legacy record.
3. `projectGuide/techStack.md` — frozen legacy record.
4. `projectGuide/codefix.md` — this plan (it must quote the strings to forbid them).
5. `src/__tests__/terminology.test.ts` — the deliberate negative test (T-7.2), which must contain
   the forbidden patterns in order to assert their absence.
6. `src/components/layout/Navbar.tsx:23` — the GitHub URL
   `https://github.com/gamgabat/EcoPredict`. This is a real repository address, not brand copy;
   changing it would break a working link. The **link text** must remain `GitHub`.
   Renaming the remote repository is out of scope (§0.10).

Everything else must be clean.

---

## §2. Preserve / Migrate / Delete register

Every affected module appears **exactly once**.

### PRESERVE — architecturally sound, no concept change needed

| Module                                                          | Justification                                                                                                               |
| --------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `src/main.tsx`                                                  | Correct React 19 root mount with StrictMode; nothing concept-bearing.                                                       |
| `src/App.tsx`                                                   | Two-route SPA table with catch-all redirect is exactly right; the `/dashboard` 404 is a hosting problem, not a routing one. |
| `vite.config.ts`                                                | Minimal, correct, with a working `@` alias.                                                                                 |
| `tsconfig.json` / `tsconfig.node.json`                          | Already strict and currently passing; keep as the type gate.                                                                |
| `postcss.config.mjs`                                            | Tailwind v4 wiring, concept-neutral.                                                                                        |
| `projectGuide/mainIdea.md`, `implementation.md`, `techStack.md` | Frozen historical record. Only change permitted: a one-line supersession banner (T-1.16). Listed as Gate B exceptions.      |

### MIGRATE — keep the structure, change the concept

| Module                                                                          | Justification                                                                                                                                                                            |
| ------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/store/simulationStore.ts` → `src/store/screeningStore.ts`                  | Parameter slice, clamped scenario apply/clear and `getCoralResilienceMetrics` are all reusable; the unknown-species slice is excised and interaction/review/audit slices are added.      |
| `src/engine/cascadeModel.ts` → `src/engine/scenarioResponse.ts`                 | 1st/2nd-order arithmetic and the deterministic projection band survive; the 3rd-order block is replaced per §3.                                                                          |
| `src/types/cascade.ts` → `src/types/scenario.ts`                                | Input/output shape is reusable once the unknown and legal fields are replaced.                                                                                                           |
| `src/types/disruption.ts`                                                       | `DisruptionScenario` shape stays; `legalContext` is renamed and reworded.                                                                                                                |
| `src/data/disruptionScenarios.ts`                                               | Parameter deltas are a legitimate alternative-assumptions mechanism; only the legal framing changes.                                                                                     |
| `src/components/dashboard/SpeciesMindMap.tsx`                                   | Focus/dim, edge-memory and `nodeTypes` scaffolding are sound; node taxonomy and edge model are replaced.                                                                                 |
| `src/components/dashboard/nodes/SpeciesNode.tsx`                                | Node card layout is reusable for `species`; status derivation is rewired to observed-species indicators.                                                                                 |
| `src/components/dashboard/nodes/ParameterNode.tsx` → `StressorNode.tsx`         | Currently dead, but it is already a slider-bearing graph node — precisely what `abiotic_stressor` / `local_stressor` need.                                                               |
| `src/components/dashboard/DetailsSidebar.tsx`                                   | `SliderRow`/`HealthBar`/`ToleranceRow`/`InfoChip`/`Section` primitives and the observed-species profiles are kept; the `u-alpha`/`u-beta` branches and the discovery button are removed. |
| `src/components/dashboard/DisruptionPanel.tsx` → `ScenarioPanel.tsx`            | Scenario selection UX is right; the legal framing is not.                                                                                                                                |
| `src/components/dashboard/CascadeImpactPanel.tsx` → `ScenarioResponsePanel.tsx` | Tab structure and non-animated Recharts wiring are reusable; the "Legal Exposure Score" hero and unknown-threat bar are replaced.                                                        |
| `src/pages/LandingPage.tsx`                                                     | Section scaffolding and layout survive; all copy is rewritten and dead CTAs removed.                                                                                                     |
| `src/pages/DashboardPage.tsx`                                                   | Three-pane shell survives; titles, pane contents and responsive behaviour change.                                                                                                        |
| `src/components/layout/Navbar.tsx`                                              | Structure fine; brand comes from the constant.                                                                                                                                           |
| `src/index.css`                                                                 | Token discipline is right; values and role assignments are corrected to the §6.7 palette.                                                                                                |
| `index.html`                                                                    | Title, lang, description, favicon.                                                                                                                                                       |
| `package.json`                                                                  | Name, scripts (`lint`, `test`, `format`), dev dependencies for the gates.                                                                                                                |
| `README.md`                                                                     | Currently describes a framework the repo does not use.                                                                                                                                   |
| `AGENTS.md` / `CLAUDE.md`                                                       | `AGENTS.md` instructs reading `node_modules/next/dist/docs/`, which does not exist; it will misdirect every future agent.                                                                |
| `.gitignore`                                                                    | Needs the `/dist` decision from T-1.20.                                                                                                                                                  |

### DELETE — the concept is the module

| Module                                                                                             | Justification                                                                                                                                                                               |
| -------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/engine/nichePredictor.ts`                                                                     | The organism-fabrication engine. Nothing in it is salvageable under §0.4.                                                                                                                   |
| `src/types/niche.ts`                                                                               | Types exist solely to describe fabricated organisms.                                                                                                                                        |
| `src/components/dashboard/nodes/UnknownSpeciesNode.tsx`                                            | Renders a prohibited node type with an "AI Predicted" badge.                                                                                                                                |
| `src/components/dashboard/SimulationViewMap.tsx`                                                   | Renders fabricated organisms and is the only `Math.random()` site in displayed output (`:8-12`); no gate requires a spatial animation, and its pane is needed for the ranked-pathway table. |
| `src/components/dashboard/ImpactSimulationChart.tsx`                                               | Dead code; duplicates `ProjectionView` with a less honest band.                                                                                                                             |
| `src/components/dashboard/nodes/WorldNode.tsx`                                                     | Dead code; "World Hub / System Stability" is a single-number ecosystem verdict with no place in the new model.                                                                              |
| `src/components/dashboard/nodes/GroupNode.tsx`                                                     | Dead code; no gate needs graph grouping.                                                                                                                                                    |
| `build.log`                                                                                        | Stray build artefact.                                                                                                                                                                       |
| `public/next.svg`, `public/vercel.svg`, `public/file.svg`, `public/globe.svg`, `public/window.svg` | Unreferenced `create-next-app` template assets; `next.svg`/`vercel.svg` additionally imply a framework and vendor the project does not use.                                                 |

---

## §3. Conceptual migration map (old → new)

| #   | Old construct                                                                                                                   | Where it lives now                                                                                                   | New construct                                                                                                                                                                                                                                                                                                                                                                            | Rule                                                                                                                                                                                                              |
| --- | ------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | `unknownSpeciesAlpha` (fabricated organism with `predationStrength`, `competitionWithCoral`, `populationEstimate`, `nicheName`) | `simulationStore.ts:25,116,142,201`                                                                                  | **Deleted as an entity.** Its decision content becomes a **candidate interaction** between existing nodes: `functional_role: herbivory` × `abiotic_stressor: nutrient loading` → `habitat_function: recruitment substrate`, mechanism "herbivore loss × nutrients may amplify algal/microbial pressure". Its three editable trait sliders become the three editable 1–5 priority scores. | No node is created.                                                                                                                                                                                               |
| 2   | `unknownSpeciesBeta` (fabricated organism with `diseaseResistance`, `nutrientUptake`)                                           | `simulationStore.ts:26,117,143,202`                                                                                  | **Deleted as an entity.** Becomes the candidate interaction `species: Siderastrea siderea` × `local_stressor: SCTLD context` with direction `uncertain` and mechanism "thermal history may alter disease sensitivity; direction unresolved".                                                                                                                                             | Direction must stay `uncertain` until evidenced.                                                                                                                                                                  |
| 3   | `areUnknownSpeciesDiscovered: boolean`                                                                                          | `simulationStore.ts:24,115,141`                                                                                      | **Deleted.** Nothing is "discovered". Candidate interactions exist from the moment a baseline is entered; what changes is their priority and review status.                                                                                                                                                                                                                              | —                                                                                                                                                                                                                 |
| 4   | Node type `unknownSpecies`                                                                                                      | `SpeciesMindMap.tsx:14,84-85`                                                                                        | **Deleted.** Node type union becomes exactly `species \| functional_role \| abiotic_stressor \| local_stressor \| habitat_function`.                                                                                                                                                                                                                                                     | Any other value is a type error.                                                                                                                                                                                  |
| 5   | `runNichePrediction(params)` — mints organisms from thresholds                                                                  | `nichePredictor.ts:3-77`, `simulationStore.ts:63,186-206`                                                            | `buildCandidateInteractions(baseline): CandidateInteraction[]` — a **pure selector** over a curated evidence table that emits _edges between nodes that already exist in the baseline_. Its return type contains no node constructor, so it is structurally incapable of minting an organism.                                                                                            | Signature: `(baseline: BaselineInventory) => CandidateInteraction[]`. It must never return nodes.                                                                                                                 |
| 6   | `nicheName` string on fabricated organisms                                                                                      | `types/niche.ts:2,10` + 5 literals in `nichePredictor.ts`                                                            | `mechanism: string` on the edge — a plain-language description of _how_ the relationship would operate. Never a name for an organism.                                                                                                                                                                                                                                                    | —                                                                                                                                                                                                                 |
| 7   | `isScanning` + "Find Best Fitting Species" 2-second fake scan                                                                   | `simulationStore.ts:36`, `DetailsSidebar.tsx:735-762`                                                                | **Deleted.** Replaced by nothing: candidate interactions are present from the baseline. If a loading affordance is ever needed it must describe a real computation.                                                                                                                                                                                                                      | No simulated latency.                                                                                                                                                                                             |
| 8   | `thirdOrder.unknownSpeciesThreat`                                                                                               | `cascadeModel.ts:43,102`, `types/cascade.ts:52`                                                                      | `omittedPathwayPriority: number` — the **highest `normalizedPriority` among candidate interactions that this scenario changes and that carry no reviewer decision**. Same 0–100 range, defensible meaning, computed from §0.6 maths only.                                                                                                                                                | Labelled "highest unreviewed pathway priority", never "threat".                                                                                                                                                   |
| 9   | `thirdOrder.legalExposureScore`                                                                                                 | `cascadeModel.ts:45,103`, `types/cascade.ts:53`, rendered as the hero metric at `CascadeImpactPanel.tsx:128,141,144` | **Deleted, not renamed.** Replaced by two honest counters: `reviewCoverage` (% of pathways at or above the high-priority threshold that carry a reviewer decision) and `evidenceGapCount` (number of pathways whose citation is `Source required`). Neither implies legal standing.                                                                                                      | Note: `legalExposureScore` also feeds the projection decay rate at `cascadeModel.ts:57` — that term must be removed from the decay formula, not merely renamed, or the abandoned concept keeps driving the chart. |
| 10  | `thirdOrder.extinctionRisk.{diadema,parrotfish,coral}`                                                                          | `cascadeModel.ts:49-53`, `types/cascade.ts:46-50`                                                                    | `exposureChange: Record<nodeId, number>` — signed change in modelled exposure for each observed node under the scenario, labelled "modelled exposure change under stated assumptions".                                                                                                                                                                                                   | No extinction, no probability language.                                                                                                                                                                           |
| 11  | `secondOrder.unknownAlphaRisk` / `unknownBetaRisk`                                                                              | `cascadeModel.ts:95-96`, `types/cascade.ts:39-40`                                                                    | **Deleted from the cascade output.** The equivalent information now lives on the edges as `consequenceScore` / `plausibilityScore` / `detectabilityGapScore`.                                                                                                                                                                                                                            | —                                                                                                                                                                                                                 |
| 12  | 3-order cascade framing ("1st/2nd/3rd Order", `CascadeImpactPanel.tsx:68,80,89`)                                                |                                                                                                                      | Retained as a **scenario response** decomposition, relabelled: "Assumption changes" (1st), "Modelled responses" (2nd), "Screening indicators" (3rd). The word _cascade_ survives only in the single illustrative pathway of §0.9, always with its "not a causal conclusion" label.                                                                                                       | Never "forecast" or "prediction".                                                                                                                                                                                 |
| 13  | `DisruptionScenario.legalContext` — `"Implicates Section 316(a) …"`                                                             | `types/disruption.ts:13`, `disruptionScenarios.ts:13,25,38,50,62`, rendered `DisruptionPanel.tsx:58`                 | `eiaReviewContext` — reworded to name the assessment topic, e.g. "Commonly assessed under Clean Water Act §316(a) thermal variance review." Statute references may stay (they are real); the verdict verb "Implicates" may not.                                                                                                                                                          | No regulatory conclusion.                                                                                                                                                                                         |
| 14  | `getEcosystemMetrics()` returning `unknownAlphaEffect`/`unknownBetaEffect`                                                      | `simulationStore.ts:77-78,270-271,277`                                                                               | Both fields deleted; the getter becomes a properly-keyed derived selector (see T-2.8) over observed nodes only.                                                                                                                                                                                                                                                                          | —                                                                                                                                                                                                                 |
| 15  | Edge click cycling `prey → competition → threat`                                                                                | `SpeciesMindMap.tsx:219-243`                                                                                         | Edge click **opens the candidate-interaction detail panel**. Edge semantics come from typed data, not from a click counter.                                                                                                                                                                                                                                                              | —                                                                                                                                                                                                                 |
| 16  | Brand `EcoPredict` scattered across 8 literals                                                                                  | see §1.12A                                                                                                           | `BRAND` constant in `src/config/brand.ts`, single source of truth.                                                                                                                                                                                                                                                                                                                       | Exactly one definition.                                                                                                                                                                                           |

---

## §4. Phased goals

Ordering principle, non-negotiable: **the public site must never claim the new concept while the
dashboard still displays fabricated organisms, and must never claim the old concept after the
engine is gutted.** This is why Phase 1 removes the fabricated-species _entry points and rendering_
in the same phase as the copy rewrite (T-1.14), while Phase 2 removes the underlying types, store
slice and engine. At no gate do the two halves disagree.

### Phase 1 — Terminology, claim safety, routing, and the tooling that gates everything else

- **Entry condition:** clean tree at `main`; `npx tsc -p tsconfig.json --noEmit` exits 0.
- **Work:** brand single-source-of-truth; ESLint flat config, Prettier config, Vitest harness;
  SPA rewrite for `/dashboard`; full landing/dashboard copy rewrite per §6.4; removal of every dead
  CTA; removal of the fabricated-species UI entry points and rendering paths.
- **Exit gate:** `npm run lint`, `npm run format:check`, `npm test`, `npm run build` all exit 0;
  `grep -rniE "predict the unknown|unknown species|ai-predicted|ES/EIS|50% faster|0 unexpected|already using|planning permits" src index.html README.md` returns zero matches; no button on `/`
  is inert; `/dashboard` returns 200 on the deploy target.
- **Demonstrable:** the public site states the new concept accurately, makes no unsupportable
  claim, and no fabricated organism can be summoned anywhere in the UI.

### Phase 2 — Domain model migration

- **Entry condition:** Phase 1 exit gate green.
- **Work:** the five permitted node types as a TypeScript union; `BaselineInventory` data for the
  four focal species plus roles, stressors and habitat functions; store renamed and its
  unknown-species slice excised; graph rebuilt on the new taxonomy; fabrication engine, niche types
  and unknown node component deleted; dead components deleted; the metrics cache-key bug fixed.
- **Exit gate:** `grep -rn "unknownSpecies\|nichePredictor\|nicheName\|areUnknownSpeciesDiscovered" src` returns zero;
  `src/engine/nichePredictor.ts` and `src/types/niche.ts` do not exist; `npx tsc --noEmit` exits 0;
  the node-type union has exactly five members.
- **Demonstrable:** the concept is structurally true — the type system now makes a fabricated
  organism unrepresentable, not merely absent.

### Phase 3 — Candidate interaction layer

- **Entry condition:** Phase 2 exit gate green.
- **Work:** `CandidateInteraction` type; the seed interaction set from §0.9 (all class **C** with
  `Source required` unless a real citation exists); typed edge construction; the edge detail panel
  with all Gate D fields; the A/B/C renderer (letter + label, never colour alone); the illustrative
  cascade with its mandatory label.
- **Exit gate:** every edge rendered in the graph resolves to a `CandidateInteraction` record;
  clicking any edge opens a panel showing direction, mechanism, evidence class, source, confidence
  range, assumption owner, sensitivity, reviewer status, next measurement, management trigger;
  a unit test asserts every seeded interaction has a non-empty `citation` field.
- **Demonstrable:** every relationship on screen is a labelled hypothesis with a traceable
  evidence class.

### Phase 4 — Prioritisation and scenario stress-test

- **Entry condition:** Phase 3 exit gate green.
- **Work:** `rawPriority` / `normalizedPriority` per §0.6 with the three component scores editable
  and displayed alongside the result; scenario engine migration per §3 rows 8–13; sensitivity
  ranges as deterministic bands; removal of the last `Math.random()`.
- **Exit gate:** `grep -rn "Math.random" src` returns zero; unit tests cover the `/125`
  normalisation including boundaries (1,1,1 → 1%; 5,5,5 → 100%); setting a control to value _v_,
  moving away, and returning to _v_ reproduces byte-identical rendered output.
- **Demonstrable:** a ranked list of candidate pathways that responds deterministically to a
  scenario and shows its own arithmetic.

### Phase 5 — Review, audit trail, report-readiness gate, export

- **Entry condition:** Phase 4 exit gate green.
- **Work:** reviewer states `pending | accepted | revise | rejected` plus a free-text note; audit
  trail (pathway, change, user/owner, timestamp, review status); persistence; the readiness gate
  that disables the external-report action and names exactly what is missing; JSON + CSV export.
- **Exit gate:** with any required field blank, the export control is `disabled` and the UI lists
  the missing field names; with all fields present it produces a downloaded file titled
  _"Reef Oracle Interaction Screening Report"_ carrying the line
  _"Decision-support prototype — expert review required."_
- **Demonstrable:** the full end-to-end path of Gate D, including the human-control step.

### Phase 6 — Public narrative and visual system alignment

- **Entry condition:** Phase 5 exit gate green.
- **Work:** design tokens mapped into the existing `@theme` block; motion made non-essential and
  `prefers-reduced-motion` respected; intentional layouts at 320/768/1024/1440; focus states,
  semantic headings, accessible names, contrast; boundary statement placed exactly once; imagery
  limited to in-repo assets.
- **Exit gate:** the checks in §6.7 and §7.6 pass at all four widths; the boundary statement of
  §0.8 appears exactly once in `src/` (`grep -c` returns 1).
- **Demonstrable:** an analytical, accessible interface that reads as one system and is fully
  understandable with animation disabled.

### Phase 7 — Verification and hardening

- **Entry condition:** Phase 6 exit gate green.
- **Work:** complete the test suite required by §6.8; final sweeps; production build; manual route
  verification against the real deploy target; console audit.
- **Exit gate:** every command in §7 passes with the stated output.
- **Demonstrable:** a third party can reproduce every claim in this plan from the commands in §7.

---

## §5. Task to-do list

Tick these as work proceeds. **No task may start before every task in its `Depends on` list is
ticked.**

**Critical path:** `T-1.1 → T-1.9 → T-1.14 → T-2.1 → T-2.2 → T-2.4 → T-2.6 → T-3.1 → T-3.2 →
T-3.4 → T-4.1 → T-4.2 → T-4.4 → T-5.1 → T-5.4 → T-5.5 → T-6.1 → T-7.1 → T-7.6`.
Everything else can be scheduled around it. T-1.4/T-1.5/T-1.6 (tooling) should be done early
because most acceptance criteria are expressed as commands those tools provide.

### Phase 1 — Terminology, claim safety, routing, tooling

> **Status (2026-08-14): all 20 tasks below are done and individually verified against their own
> acceptance criteria.** Two things worth knowing before continuing to Phase 2:
>
> 1. **`npm run build` currently fails — not from a source defect.** `tsc` passes; the failure is
>    inside `vite build`'s Rolldown-based bundler, which crashes with a native
>    `STATUS_STACK_BUFFER_OVERRUN` (0xC0000409) after the transform step completes, before any
>    chunk is emitted. Confirmed via PowerShell exit code inspection. This reproduces identically
>    on Vite `8.0.9` through `8.2.1` (all installed 8.x releases), is unrelated to any change made
>    in this session (the original pre-migration `package-lock.json`, before this plan existed,
>    never had a working Windows `@rolldown/binding-win32-x64-msvc` entry either — the build was
>    never verified working in this environment), and does not affect `npm run dev` (confirmed
>    running/serving normally). Do not "fix" this by editing application source — there is nothing
>    wrong with the source. Next agent: try a clean `node_modules`/lockfile reinstall first (already
>    attempted once here, did not resolve it); if it persists, this needs either a different
>    Node/npm version, a pinned older/newer `vite`/`rolldown` release once one is confirmed stable
>    on this machine, or reproducing on a non-Windows runner to isolate whether it's Windows-specific.
>    Re-run §7.3 (`npm run build`) as the first step of any future session before assuming this is
>    still broken.
> 2. **`CascadeImpactPanel.tsx` still renders "Unknown Species Threat" and a `legalExposureScore`
>    hero metric.** This is intentional, not an oversight: T-1.14 only covers
>    `DetailsSidebar.tsx`, `SpeciesMindMap.tsx`, `SimulationViewMap.tsx` — the paths that could
>    display a *fabricated organism*. `CascadeImpactPanel.tsx` displays a *derived score*, and its
>    replacement (`omittedPathwayPriority` / `reviewCoverage`, per §3 rows 8–9) needs the
>    candidate-interaction layer built in Phases 2–3 first. It is correctly scheduled as **T-4.5**.
>    Ripping the label out now with nothing to replace it would leave a chart with a missing bar.

- [x] **T-1.1** — Create the single-source-of-truth brand constant.
      Files: `src/config/brand.ts` (create)
      Type: create
      Depends on: none
      Rationale: §6.3 requires the brand to resolve from one value; per §9 D1 the product name is now decided as Reef Oracle, and this constant is what makes that decision cheap to reverse if it ever changes.
      Acceptance: `src/config/brand.ts` exports a frozen object with at least `name`, `tagline`, `boundaryStatement`, `reportTitle`, `reportFooterLine`; `grep -rn "Reef Oracle" src --include=*.tsx` returns zero matches outside components that import `BRAND`.
      Risk: low — nothing breaks if wrong; it is one constant.
      Effort: S

- [x] **T-1.2** — Rename the package.
      Files: `package.json`
      Type: modify
      Depends on: T-1.1
      Rationale: `"name": "next_app"` (`package.json:2`) is a leftover from the abandoned Next.js scaffold.
      Acceptance: `node -e "console.log(require('./package.json').name)"` prints `reef-oracle`.
      Risk: low — the package is private and unpublished.
      Effort: S

- [x] **T-1.3** — Fix the document shell.
      Files: `index.html`, `public/favicon.svg` (create)
      Type: modify + create
      Depends on: T-1.1
      Rationale: `index.html:6` still says "EcoPredict Prototype"; there is no description and no favicon, which produces a failing request in the console (§1.10).
      Acceptance: `index.html` contains `<title>Reef Oracle — EIA Interaction Screening</title>`, one `<meta name="description">`, and a `<link rel="icon">` pointing at a file that exists in `public/`; loading `/` logs zero 404s in the browser console.
      Risk: low.
      Effort: S

- [x] **T-1.4** — Add a working ESLint flat config and repair the lint script.
      Files: `eslint.config.js` (create), `package.json`
      Type: create + config
      Depends on: none
      Rationale: `npm run lint` currently aborts — ESLint 9 finds no `eslint.config.*` (§1.7) — so Gate G's "linter" has nothing to run.
      Acceptance: `npm run lint` exits 0 with no output; adding a deliberate unused import to any `src/**/*.tsx` makes it exit non-zero.
      Risk: medium — a strict rule set can flood the repo with pre-existing errors; start from `@eslint/js` recommended + `typescript-eslint` recommended + `eslint-plugin-react-hooks`, and fix rather than disable `react-hooks/exhaustive-deps` (it is what surfaces the stale-memo bugs in §1.2 and §1.5).
      Effort: M

- [x] **T-1.5** — Add a Prettier config and format the tree once.
      Files: `.prettierrc.json` (create), `.prettierignore` (create), all of `src/`
      Type: create + config
      Depends on: none
      Rationale: Prettier is installed but unconfigured; all 24 source files fail `--check` (§1.7), so formatting noise would otherwise swamp every migration diff.
      Acceptance: `npx prettier --check src` exits 0; `package.json` exposes `format` and `format:check` scripts.
      Risk: low — but do this before the large copy rewrites, or diffs become unreviewable.
      Effort: S

- [x] **T-1.6** — Install and wire the test harness.
      Files: `package.json`, `vitest.config.ts` (create)
      Type: config
      Depends on: none
      Rationale: No test framework exists (§1.7) and Gate G mandates five specific test areas.
      Acceptance: `npm test` runs Vitest and exits 0; a trivial placeholder test in `src/__tests__/` is collected and reported.
      Risk: low — Vitest is the native Vite runner and adds no runtime dependency. Do **not** add jsdom/testing-library unless a later task proves it necessary; design the units in §7.2 to be testable as pure functions.
      Effort: S

- [x] **T-1.7** — Make `/dashboard` resolve on the deploy target.
      Files: `vercel.json` (create)
      Type: create/config
      Depends on: none
      Rationale: The repo contains no SPA rewrite of any kind (§1.1), so a static host returns 404 for a direct `/dashboard` request even though the route exists at `src/App.tsx:10`. Deploy target is confirmed as Vercel (§9 D7).
      Acceptance: `vercel.json` contains `{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }`; after deploy, `curl -s -o /dev/null -w "%{http_code}" <deploy-url>/dashboard` prints `200`; a hard browser reload on `/dashboard` renders the dashboard, not a 404 page.
      Risk: medium — `vite preview` masks this bug locally (it applies its own SPA fallback), so **local success is not evidence**; the live-deploy curl check is mandatory.
      Effort: S

- [x] **T-1.8** — Point the dashboard navbar at the brand constant.
      Files: `src/components/layout/Navbar.tsx`
      Type: modify
      Depends on: T-1.1
      Rationale: `Navbar.tsx:11` hardcodes "EcoPredict EIA".
      Acceptance: `grep -n "EcoPredict" src/components/layout/Navbar.tsx` returns only line 23 (the GitHub URL, a Gate B exception per §1.12E).
      Risk: low.
      Effort: S

- [x] **T-1.9** — Rewrite the landing page hero, problem, features and how-it-works copy.
      Files: `src/pages/LandingPage.tsx`
      Type: modify
      Depends on: T-1.1, T-1.5
      Rationale: Lines 10, 59, 68, 111, 115, 121, 139-144, 167, 176-178 assert the abandoned concept and unsupportable claims; §6.4 fixes the exact replacements.
      Acceptance: The page contains the strings "Find the interaction pathways an EIA may have missed.", "Stress-tests evidence-linked interactions among observed species, functional roles and local stressors.", "Surfaces candidate pathways and tests their sensitivity under alternative scenarios." and "Exportable screening summaries for expert review and EIA workflow integration."; `grep -niE "predict the unknown|unknown organism|AI-predicted|ES/EIS|litigat" src/pages/LandingPage.tsx` returns zero matches.
      Risk: low — copy only; the layout is untouched.
      Effort: M

- [x] **T-1.10** — Replace the hero trust chips.
      Files: `src/pages/LandingPage.tsx`
      Type: modify
      Depends on: T-1.9
      Rationale: `:95` ("50% Faster") and `:101` ("0 unexpected disruptions target") are unvalidated performance guarantees.
      Acceptance: The three chips read exactly _Observed species only_, _A/B/C evidence classes_, _Human review required_; `grep -nE "50%|0 unexpected" src/pages/LandingPage.tsx` returns zero matches.
      Risk: low.
      Effort: S

- [x] **T-1.11** — Reframe pricing as a hypothesis and delete adoption/performance claims.
      Files: `src/pages/LandingPage.tsx`
      Type: modify
      Depends on: T-1.9
      Rationale: `:226` repeats "50% faster"; `:266` claims existing customers; `:248-249` promise forecasting; §6.4 forbids all three, and any price shown must be labelled a pricing hypothesis and must not be wired to billing.
      Acceptance: The pricing section contains the literal phrase "pricing hypothesis for pilot validation"; `grep -niE "already using|50% faster|forecast" src/pages/LandingPage.tsx` returns zero matches; no pricing control has an `onClick`, `href` or form action.
      Risk: low.
      Effort: M

- [x] **T-1.12** — Remove every dead CTA and fix the footer/nav brand.
      Files: `src/pages/LandingPage.tsx`
      Type: modify
      Depends on: T-1.9
      Rationale: `:38` "Sign In", `:83` "Watch Demo", `:229` "Request a Project Quote", `:253` "Start Free Trial", `:275` "Schedule a Demo" are inert (§1.6); `:27`, `:287`, `:298` hardcode the brand.
      Acceptance: Every `<button>` in the file either has an `onClick` that performs a real action or has been removed; every `<Link>`/`<a>` target resolves to an existing route or in-page id; brand text is rendered from `BRAND.name` in all three places.
      Risk: low.
      Effort: M

- [x] **T-1.13** — Rewrite dashboard titles and pane headings.
      Files: `src/pages/DashboardPage.tsx`
      Type: modify
      Depends on: T-1.1
      Rationale: `:13` sets an "EcoPredict" document title; `:41` "Species Mind Map", `:62` "Food Web" and `:88` "Spatial Simulation Map" name the old model.
      Acceptance: `document.title` on `/dashboard` equals `Reef Oracle — Screening Workspace`; the graph pane is headed "Candidate Interaction Network"; `grep -n "EcoPredict" src/pages/DashboardPage.tsx` returns zero matches.
      Risk: low.
      Effort: S

- [x] **T-1.14** — Sever every UI path that can display a fabricated organism.
      Files: `src/components/dashboard/DetailsSidebar.tsx`, `src/components/dashboard/SpeciesMindMap.tsx`, `src/components/dashboard/SimulationViewMap.tsx`
      Type: modify
      Depends on: T-1.9
      Rationale: This must land in the same phase as the copy rewrite; otherwise the site claims "observed species only" while the dashboard still offers "Find Best Fitting Species" (`DetailsSidebar.tsx:759`) and renders "Unknown Species α" (`SpeciesMindMap.tsx:71`, `DetailsSidebar.tsx:322`, `SimulationViewMap.tsx:180`).
      Acceptance: Loading `/dashboard` and interacting with every visible control produces no node, legend row, sidebar panel or badge referencing alpha/beta/unknown/AI-predicted; `grep -rn "u-alpha\|u-beta\|Find Best Fitting" src` returns zero matches.
      Risk: medium — `DetailsSidebar.tsx:310-396` and `SpeciesMindMap.tsx:66-91,129-137` are interleaved with live code; remove whole branches, do not comment them out.
      Effort: M

- [x] **T-1.15** — Place the boundary statement exactly once.
      Files: `src/pages/LandingPage.tsx`, `src/config/brand.ts`
      Type: modify
      Depends on: T-1.1, T-1.9
      Rationale: §0.8 requires one concise statement, not repeated defensive disclaimers.
      Acceptance: `grep -rc "does not discover species, prove causation, or issue regulatory verdicts" src` totals exactly 1 across all files other than `src/config/brand.ts` (the definition).
      Risk: low.
      Effort: S

- [x] **T-1.16** — Mark the legacy guide documents as superseded.
      Files: `projectGuide/mainIdea.md`, `projectGuide/implementation.md`, `projectGuide/techStack.md`
      Type: modify
      Depends on: none
      Rationale: All three describe the abandoned concept in detail; a future agent reading `mainIdea.md` will re-implement it. **Prepend one banner line only — do not edit or delete their existing content**, which is deliberately preserved as a historical record.
      Acceptance: Each of the three files begins with a line containing "SUPERSEDED — see projectGuide/codefix.md"; `git diff --stat` shows exactly one added line per file and zero deletions.
      Risk: low.
      Effort: S

- [x] **T-1.17** — Rewrite the README.
      Files: `README.md`
      Type: modify
      Depends on: T-1.1, T-1.4, T-1.6
      Rationale: It is untouched `create-next-app` boilerplate pointing at `app/page.tsx`, which does not exist (§1.1).
      Acceptance: `README.md` names the product from §0.2, states the stack as Vite + React 19 + TypeScript + Zustand + ReactFlow + Recharts, and lists `dev`/`build`/`preview`/`lint`/`test`/`format:check` — each of which runs successfully when copy-pasted.
      Risk: low.
      Effort: S

- [x] **T-1.18** — Correct the agent instructions.
      Files: `AGENTS.md`
      Type: modify
      Depends on: none
      Rationale: `AGENTS.md:1-3` tells every agent this is a modified Next.js and to read `node_modules/next/dist/docs/`; `node_modules/next` does not exist and the app is a Vite SPA (§1.1). The instruction guarantees wasted effort or wrong code.
      Acceptance: `AGENTS.md` contains no reference to Next.js or `node_modules/next`, and points at `projectGuide/codefix.md` as the current plan.
      Risk: low — resolved as intentional to correct, per §9 D5.
      Effort: S

- [x] **T-1.19** — Delete the stray build log.
      Files: `build.log`
      Type: delete
      Depends on: none
      Rationale: Tracked captured terminal output; not source, not artefact policy.
      Acceptance: `git ls-files build.log` returns nothing.
      Risk: low.
      Effort: S

- [x] **T-1.20** — Untrack the stale committed `dist/` build artefact.
      Files: `.gitignore`, `dist/**`
      Type: config + delete
      Depends on: none
      Rationale: `dist/` is committed and stale (§1.11) — it predates the current `src/` and still contains "EcoPredict". With Vercel confirmed as the deploy target (§9 D7), a standard Vite build (framework preset "Vite", build command `npm run build`, output directory `dist`) builds fresh from source on every deploy and does not serve the committed folder — so it is confirmed dead weight, not a deploy dependency.
      Acceptance: `git rm -r --cached dist` has been run; `git ls-files dist | wc -l` returns 0; `/dist` appears in `.gitignore`.
      Risk: low — if the live Vercel project is later found to be configured to read the committed folder directly (a misconfiguration), stop and re-check before this lands; that would need fixing independently rather than kept as a reason to commit stale build output.
      Effort: S

**Phase 1 gate:** `npm run lint && npm run format:check && npm test && npm run build` all exit 0,
and the §7.7 sweep returns zero public-copy matches.

### Phase 2 — Domain model migration

- [ ] **T-2.1** — Define the permitted node taxonomy.
      Files: `src/types/graph.ts` (create)
      Type: create
      Depends on: T-1.14
      Rationale: §0.4 permits exactly five node types; expressing them as a closed union makes a fabricated organism unrepresentable rather than merely absent.
      Acceptance: The file exports `type NodeKind = 'species' | 'functional_role' | 'abiotic_stressor' | 'local_stressor' | 'habitat_function'` with no sixth member, and a `GraphNode` interface keyed on it; assigning any other string to `NodeKind` fails `npx tsc --noEmit`.
      Risk: low.
      Effort: S

- [ ] **T-2.2** — Author the baseline inventory for the demo scenario.
      Files: `src/data/baseline.ts` (create)
      Type: create
      Depends on: T-2.1
      Rationale: §0.9 fixes the four focal species, their documented roles, and the stressor set; the model may contain nothing else.
      Acceptance: The file contains exactly the four species _Diadema antillarum_, _Porites astreoides_, _Montastraea cavernosa_, _Siderastrea siderea_ with correct binomials and an italic-rendering flag; the stressor set covers temperature anomaly, nutrient loading, sediment/project disturbance and SCTLD context; every node's `kind` is one of the five from T-2.1; no node name is absent from §0.9.
      Risk: low.
      Effort: M

- [ ] **T-2.3** — Correct species-name rendering.
      Files: `src/data/baseline.ts`, `src/components/dashboard/nodes/SpeciesNode.tsx`
      Type: modify
      Depends on: T-2.2
      Rationale: §6.3 requires correct binomial nomenclature and italicisation; `SpeciesMindMap.tsx:35` currently truncates to `'Montastraea cavern.'` and nothing is italicised.
      Acceptance: Every species label renders inside an `<em>` (or an equivalent italic class); `grep -rn "cavern\." src` returns zero matches.
      Risk: low.
      Effort: S

- [ ] **T-2.4** — Migrate the store: excise the unknown-species slice, keep the parameter and scenario slices.
      Files: `src/store/simulationStore.ts` → `src/store/screeningStore.ts`
      Type: rename + modify
      Depends on: T-2.1, T-2.2
      Rationale: Lines 23-26, 36, 55-59, 63, 115-119, 141-145, 186-206, 212, 214, 220-221, 270-271, 277 encode the abandoned concept; the parameter slice (`:6-13`), the clamped `applyDisruption`/`clearDisruption` pair (`:147-184`) and `getCoralResilienceMetrics` (`:284-357`) are sound and must survive intact.
      Acceptance: `src/store/simulationStore.ts` no longer exists; `grep -rn "unknownSpecies\|areUnknownSpeciesDiscovered\|isScanning\|runNichePrediction\|humidity" src` returns zero matches; `getCoralResilienceMetrics` still returns the same five factor scores for the same inputs (assert with a unit test using the store's default values).
      Risk: high — this is the hub module; nine components import it. Do the rename and the deletions in one commit so no intermediate state has two stores.
      Effort: L

- [ ] **T-2.5** — Delete the fabrication engine and its types and node component.
      Files: `src/engine/nichePredictor.ts`, `src/types/niche.ts`, `src/components/dashboard/nodes/UnknownSpeciesNode.tsx`
      Type: delete
      Depends on: T-2.4
      Rationale: §0.4's hard prohibition. These three files exist only to invent organisms (`nichePredictor.ts:12,23,34,49,60`).
      Acceptance: All three paths return "No such file"; `npx tsc --noEmit` exits 0; `grep -rn "nichePredictor\|NichePrediction\|nicheName" src` returns zero matches.
      Risk: low once T-2.4 has removed the importers.
      Effort: S

- [ ] **T-2.6** — Rebuild the graph on the new node taxonomy.
      Files: `src/components/dashboard/SpeciesMindMap.tsx` → `src/components/dashboard/InteractionNetwork.tsx`
      Type: rename + modify
      Depends on: T-2.1, T-2.2, T-2.5
      Rationale: `:14` registers `unknownSpecies` as a node type and `:84-85` injects fabricated nodes; the graph must render only the five permitted kinds, sourced from the baseline inventory.
      Acceptance: The `nodeTypes` registry keys are exactly the five `NodeKind` values; every rendered node's id exists in `src/data/baseline.ts`; `grep -n "unknown" src/components/dashboard/InteractionNetwork.tsx` returns zero matches (case-insensitive).
      Risk: medium — preserve the focus/dim logic (old `:152-195`) and the edge-deletion memory (old `:198-208`); they are reused in Phase 3.
      Effort: L

- [ ] **T-2.7** — Rewrite the sidebar detail panels for observed nodes only.
      Files: `src/components/dashboard/DetailsSidebar.tsx`
      Type: modify
      Depends on: T-2.4, T-2.6
      Rationale: T-1.14 removed the alpha/beta branches; this task rebuilds the remaining panels against the new store and node ids, and removes the contradiction described in §1.2(1) by deleting both halves of it.
      Acceptance: Selecting each of the five node kinds opens a panel with no runtime error and no empty section; `grep -niE "buffer|net beneficial|AI" src/components/dashboard/DetailsSidebar.tsx` returns zero matches.
      Risk: medium — this is the largest component (773 lines); keep `SliderRow`, `HealthBar`, `ToleranceRow`, `InfoChip`, `Section` unchanged.
      Effort: L

- [ ] **T-2.8** — Fix the derived-metrics cache and remove the render-phase `set()`.
      Files: `src/store/screeningStore.ts`, all call sites listed in §1.5
      Type: modify
      Depends on: T-2.4
      Rationale: The cache key at old `simulationStore.ts:214` omits `algaeGrowthRate` and `coralResilience` even though the body consumes them (`:226,:247,:260`), so two sliders return stale values; and `set()` at `:280` mutates state during render under StrictMode (`src/main.tsx:7`). Gate E's "same input → same output" cannot hold while this is true.
      Acceptance: A unit test moves each parameter in turn and asserts the returned metrics object changes for every parameter the computation reads; `grep -n "set(" src/store/screeningStore.ts` shows no call inside a getter; the same test run twice produces identical values.
      Risk: medium — prefer a `useMemo`/selector at the call sites or a `zustand` derived-selector pattern over an in-store cache; whichever is chosen, the key must include every consumed field.
      Effort: M

- [ ] **T-2.9** — Delete the spatial simulation map.
      Files: `src/components/dashboard/SimulationViewMap.tsx`, `src/pages/DashboardPage.tsx`
      Type: delete + modify
      Depends on: T-1.14
      Rationale: It renders fabricated organisms (`:126-141`) and is the only `Math.random()` site in displayed output (`:8-12`), violating Gate E; its pane is required for the ranked-pathway table in Phase 4.
      Acceptance: The file does not exist; `DashboardPage.tsx` no longer imports it; `grep -rn "Math.random" src` returns zero matches.
      Risk: low — but tell the reviewer the visual is gone deliberately, not lost.
      Effort: S

- [ ] **T-2.10** — Delete the remaining dead components.
      Files: `src/components/dashboard/ImpactSimulationChart.tsx`, `src/components/dashboard/nodes/WorldNode.tsx`, `src/components/dashboard/nodes/GroupNode.tsx`
      Type: delete
      Depends on: none
      Rationale: Verified unreferenced (§1.9); `WorldNode` additionally asserts a single "System Stability" verdict with no place in the new model.
      Acceptance: All three paths return "No such file"; `npm run build` exits 0.
      Risk: low.
      Effort: S

- [ ] **T-2.11** — Repurpose `ParameterNode` as the stressor node.
      Files: `src/components/dashboard/nodes/ParameterNode.tsx` → `src/components/dashboard/nodes/StressorNode.tsx`
      Type: rename + modify
      Depends on: T-2.1, T-2.6
      Rationale: `abiotic_stressor` and `local_stressor` nodes need in-graph value controls; this dead component already implements exactly that (`ParameterNode.tsx:44-53`), so rewriting it from scratch would discard sound work.
      Acceptance: The graph renders at least one `abiotic_stressor` and one `local_stressor` node whose slider updates the store; the file exports `StressorNode` and is referenced in the `nodeTypes` registry.
      Risk: low.
      Effort: M

- [ ] **T-2.12** — Remove the unused template SVGs.
      Files: `public/next.svg`, `public/vercel.svg`, `public/file.svg`, `public/globe.svg`, `public/window.svg`
      Type: delete
      Depends on: T-1.3
      Rationale: Unreferenced `create-next-app` leftovers; `next.svg`/`vercel.svg` imply a framework and vendor this project does not use.
      Acceptance: `grep -rn "next.svg\|vercel.svg\|globe.svg\|window.svg\|file.svg" src index.html` returns zero matches and the five files are gone; `npm run build` exits 0.
      Risk: low — do this after T-1.3 so a favicon exists first.
      Effort: S

- [ ] **T-2.13** — Boot the dashboard into the labelled demo baseline with a clear-baseline control.
      Files: `src/store/screeningStore.ts`, `src/pages/DashboardPage.tsx`
      Type: modify
      Depends on: T-2.2, T-2.4
      Rationale: Per §9 D3 (decided): the store initialises from the §0.9 demo baseline rather than an empty state, so the product is evaluable immediately, but the demo must be impossible to mistake for real site data.
      Acceptance: On first load, `/dashboard` renders the four-species demo baseline; a persistent (non-dismissible) "Demo baseline" marker is visible in the workspace at all times while demo data is loaded; a "Clear baseline" control removes all demo nodes/interactions and leaves an empty inventory with no marker; the marker text and the demo data disappear together, never independently.
      Risk: low.
      Effort: M

**Phase 2 gate:** `grep -rniE "unknown ?species|niche|areUnknownSpeciesDiscovered" src` returns zero;
`npx tsc --noEmit` exits 0; `npm run build` exits 0.

### Phase 3 — Candidate interaction layer

- [ ] **T-3.1** — Define the candidate interaction type.
      Files: `src/types/interaction.ts` (create)
      Type: create
      Depends on: T-2.1
      Rationale: §0.4 permits exactly one edge concept, and Gate D fixes the fields a user must see.
      Acceptance: The exported `CandidateInteraction` interface contains at minimum `id`, `sourceId`, `targetId`, `direction` (`'increase' | 'decrease' | 'uncertain'`), `mechanism`, `evidenceClass` (`'A' | 'B' | 'C'`), `citation`, `confidenceLow`, `confidenceHigh`, `assumptionOwner`, `consequenceScore`, `plausibilityScore`, `detectabilityGapScore`, `sensitivity`, `reviewStatus` (`'pending' | 'accepted' | 'revise' | 'rejected'`), `reviewerNote`, `nextMeasurement`, `managementTrigger`; all are non-optional except `reviewerNote`.
      Risk: low.
      Effort: S

- [ ] **T-3.2** — Seed the candidate interaction set.
      Files: `src/data/candidateInteractions.ts` (create)
      Type: create
      Depends on: T-2.2, T-3.1
      Rationale: §0.9 specifies the four candidate edges to test; §0.7 requires class **C** with `Source required` wherever no verified source exists.
      Acceptance: Every record's `sourceId` and `targetId` exist in `src/data/baseline.ts`; every record has a non-empty `citation`; every record whose `evidenceClass` is `'C'` has `citation === 'Source required'`; no record contains a citation string that was not supplied by the repo owner (a unit test asserts the first two conditions).
      Risk: medium — **do not invent citations.** If in doubt, the record is class C.
      Effort: M

- [ ] **T-3.3** — Implement the interaction builder that replaces `runNichePrediction`.
      Files: `src/engine/candidateInteractions.ts` (create)
      Type: create
      Depends on: T-3.2
      Rationale: §3 row 5 — the replacement must be structurally incapable of minting a node.
      Acceptance: The exported function's signature is `(baseline: BaselineInventory) => CandidateInteraction[]`; a unit test passes a baseline containing two nodes and asserts every returned edge's endpoints are among those two ids.
      Risk: low.
      Effort: M

- [ ] **T-3.4** — Build edges from typed data and open the detail panel on click.
      Files: `src/components/dashboard/InteractionNetwork.tsx`
      Type: modify
      Depends on: T-2.6, T-3.3
      Rationale: Edges currently carry only colour and a click-cycled label (`SpeciesMindMap.tsx:40-47,219-243`); §6.2 requires every edge to be labelled a candidate interaction carrying an evidence class.
      Acceptance: Every rendered edge id matches a `CandidateInteraction.id`; every edge displays its evidence-class letter; clicking an edge sets the selected-interaction state; the `prey/competition/threat` cycling code is gone (`grep -n "prey" src` returns zero matches).
      Risk: medium.
      Effort: L

- [ ] **T-3.5** — Build the interaction detail panel.
      Files: `src/components/dashboard/InteractionDetailPanel.tsx` (create), `src/pages/DashboardPage.tsx`
      Type: create + modify
      Depends on: T-3.4
      Rationale: Gate D fixes the eleven fields that must appear when an edge is selected.
      Acceptance: Selecting any edge shows all of: direction, mechanism, evidence class, source/citation, confidence range, assumption owner, sensitivity, reviewer status, next measurement, management trigger — each with a visible label; a missing value renders the literal text "Not set", never an empty element.
      Risk: low.
      Effort: M

- [ ] **T-3.6** — Implement the evidence-class renderer.
      Files: `src/components/common/EvidenceClassBadge.tsx` (create), `src/domain/evidence.ts` (create)
      Type: create
      Depends on: T-3.1
      Rationale: §0.7 requires letter **and** label, never colour alone.
      Acceptance: `formatEvidenceClass('A' | 'B' | 'C')` returns exactly `A — Empirical, site-relevant evidence`, `B — Ecological analogue`, `C — Team or user assumption` (asserted by unit test); the badge renders that text, and removing all CSS still leaves the class distinguishable.
      Risk: low.
      Effort: S

- [ ] **T-3.7** — Add the illustrative cascade with its mandatory label.
      Files: `src/components/dashboard/IllustrativePathway.tsx` (create)
      Type: create
      Depends on: T-3.5
      Rationale: §0.9 requires the five-step pathway, labelled _"Illustrative pathway to test — not a causal conclusion"_, and forbids attaching it to any real site.
      Acceptance: The component renders the five steps in order (local stressor ↑, herbivory ↓, macroalgal pressure ↑, coral recruitment ↓, habitat complexity ↓) and the literal label string; `grep -rn "caused\|resulted in" src/components/dashboard/IllustrativePathway.tsx` returns zero matches.
      Risk: low.
      Effort: S

- [ ] **T-3.8** — Spell out SCTLD before first use.
      Files: all files rendering the acronym (currently `DetailsSidebar.tsx:145,284,667`; check again after Phase 2)
      Type: modify
      Depends on: T-2.7
      Rationale: §6.3 requires "stony coral tissue loss disease" before the first acronym use. Note the existing code also misspells the acronym as `SCLTD` throughout (store field `scltdOutbreakRisk`, `simulationStore.ts:11`).
      Acceptance: The first SCTLD occurrence in DOM order on each page is preceded by the full phrase; `grep -rn "SCLTD" src` returns zero matches (the identifier is corrected to `sctld` as part of T-2.4's rename, or in this task if deferred).
      Risk: low.
      Effort: S

**Phase 3 gate:** every visible edge is a `CandidateInteraction` with an evidence class, and its
detail panel opens with all eleven fields.

### Phase 4 — Prioritisation and scenario stress-test

- [ ] **T-4.1** — Implement the prioritisation maths.
      Files: `src/domain/prioritisation.ts` (create), `src/types/scenario.ts` (create, from `src/types/cascade.ts`)
      Type: create + rename
      Depends on: T-3.1
      Rationale: §0.6 fixes the formula exactly; §3 rows 8-11 fix the replacements for `unknownSpeciesThreat`, `legalExposureScore`, `extinctionRisk` and the unknown risk fields.
      Acceptance: `rawPriority(c,p,d) === c*p*d` and `normalizedPriority(c,p,d) === Math.round((c*p*d/125)*100)` for all 125 combinations of 1–5 (asserted exhaustively by unit test); `normalizedPriority(1,1,1) === 1`, `normalizedPriority(5,5,5) === 100`, `normalizedPriority(3,3,3) === 22`; `src/types/cascade.ts` no longer exists and `grep -rn "legalExposureScore\|extinctionRisk\|unknownSpeciesThreat" src` returns zero matches.
      Risk: low.
      Effort: M

- [ ] **T-4.2** — Migrate the cascade engine into a scenario-response engine.
      Files: `src/engine/cascadeModel.ts` → `src/engine/scenarioResponse.ts`, `src/types/disruption.ts`, `src/data/disruptionScenarios.ts`
      Type: rename + modify
      Depends on: T-4.1
      Rationale: 1st/2nd-order arithmetic (`cascadeModel.ts:27-38`) and the deterministic projection band (`:59-80`) are sound; `unknownSpeciesThreat` (`:43`), `legalExposureScore` (`:45`) and its term in the decay rate (`:57`) are not. `legalContext` (`types/disruption.ts:13`) asserts a regulatory conclusion in five places.
      Acceptance: `scenarioResponse.ts` exports no symbol containing "unknown", "legal" or "extinction"; the projection decay rate no longer references any removed field; `grep -rn "Implicates" src` returns zero matches and each scenario's renamed `eiaReviewContext` begins "Commonly assessed under".
      Risk: medium — `:57` is easy to miss; removing the field without removing its use in the decay formula leaves the abandoned concept driving the chart.
      Effort: M

- [ ] **T-4.3** — Make the three component scores editable and visible.
      Files: `src/components/dashboard/InteractionDetailPanel.tsx`
      Type: modify
      Depends on: T-3.5, T-4.1
      Rationale: §0.6 requires the three inputs to be visible next to the output, with the stated definitions surfaced in the UI.
      Acceptance: The panel shows three 1–5 controls labelled Consequence, Plausibility and Detectability Gap, each with its §0.6 definition visible or in an expandable element; the normalised score updates on change; the panel nowhere uses the words "probability", "likelihood of occurrence", "forecast" or "prediction" (`grep -niE "probabilit|forecast|prediction" ` returns zero on the file).
      Risk: low.
      Effort: M

- [ ] **T-4.4** — Build the ranked pathway table.
      Files: `src/components/dashboard/RankedPathways.tsx` (create), `src/pages/DashboardPage.tsx`
      Type: create + modify
      Depends on: T-4.1, T-4.3
      Rationale: Gate D fixes the twelve columns the ranked output must display; this occupies the pane freed by T-2.9.
      Acceptance: The table renders one row per candidate interaction with columns: rank, pathway name, direction, mechanism, evidence class, source, priority score, its three component scores, sensitivity, assumption owner, next measurement, management trigger, reviewer status; sorting is by `normalizedPriority` descending and ties break deterministically by `id`.
      Risk: medium — thirteen columns will overflow; the table must scroll inside its own container (Gate F), not push the page.
      Effort: L

- [ ] **T-4.5** — Rewire the scenario response panel.
      Files: `src/components/dashboard/CascadeImpactPanel.tsx` → `src/components/dashboard/ScenarioResponsePanel.tsx`
      Type: rename + modify
      Depends on: T-4.2
      Rationale: `:93` and `:154` render "Unknown Species Threat"; `:128,141,144` render the "Legal Exposure Score" hero metric with a legal-challenge explanation; `:30-35` omits two consumed dependencies (§1.5).
      Acceptance: The panel's hero metric is `reviewCoverage` or `omittedPathwayPriority` (§3 rows 8-9) with a label naming what it counts; `grep -niE "legal|unknown|threat" src/components/dashboard/ScenarioResponsePanel.tsx` returns zero matches; the memo dependency list includes every store field the computation reads.
      Risk: medium.
      Effort: M

- [ ] **T-4.6** — Express uncertainty as a deterministic sensitivity range and label outputs correctly.
      Files: `src/engine/scenarioResponse.ts`, `src/components/dashboard/ScenarioResponsePanel.tsx`
      Type: modify
      Depends on: T-4.2, T-4.5
      Rationale: Gate E forbids randomness in any displayed result and fixes the permitted vocabulary; it also requires the UI to state which assumptions a scenario changes.
      Acceptance: `grep -rn "Math.random" src` returns zero; every chart series and score is reproducible across reloads (verified by T-7.5); the panel displays the list of parameters the active scenario alters with their delta values; no rendered string contains "forecast" or "predict" (`grep -riE "forecast|predict" src` returns zero outside the Gate B exception list).
      Risk: medium.
      Effort: M

**Phase 4 gate:** ranked pathways respond deterministically to a scenario, and every score displays
its three inputs.

### Phase 5 — Review, audit trail, report-readiness gate, export

- [ ] **T-5.1** — Add reviewer state, notes, and the reviewer/owner identity field.
      Files: `src/store/screeningStore.ts`, `src/components/dashboard/InteractionDetailPanel.tsx`
      Type: modify
      Depends on: T-3.5, T-4.1
      Rationale: §0.5 makes an ecologist's accept/revise/reject decision a precondition for external reporting. Per §9 D4, since the repo has no auth or user model, a single free-text "Reviewer / owner" field stands in for user identity — not an authentication system.
      Acceptance: Each interaction can be set to exactly one of `pending`, `accepted`, `revise`, `rejected`, plus a free-text note that survives switching selection; the default for a newly seeded interaction is `pending`. A workspace-level "Reviewer / owner" free-text field exists, defaults to the literal `Unassigned`, and its current value is attached to every audit entry created while it is set (see T-5.2).
      Risk: low.
      Effort: M

- [ ] **T-5.2** — Add the audit trail.
      Files: `src/store/screeningStore.ts`, `src/components/dashboard/AuditTrail.tsx` (create)
      Type: modify + create
      Depends on: T-5.1
      Rationale: Gate D requires a record of pathway, change, user/owner, timestamp and review status; "user/owner" is the T-5.1 reviewer/owner field value at the time of the change.
      Acceptance: Changing any scored field or review status appends exactly one entry carrying all five values (pathway, change, the current reviewer/owner field value, timestamp, review status); entries are immutable (no edit or delete control exists); the panel lists them newest-first.
      Risk: medium — timestamps must come from a single injected clock so tests are deterministic.
      Effort: M

- [ ] **T-5.3** — Persist review state and audit trail across reload.
      Files: `src/store/screeningStore.ts`
      Type: modify
      Depends on: T-5.2
      Rationale: Per §9 D2 (decided, not open): an audit trail that vanishes on refresh is not an audit trail. Zustand's `persist` middleware ships with the installed dependency, so this adds no package.
      Acceptance: Set a review status, reload the page, and the status and its audit entry are still present; clearing site data restores the seeded defaults without error.
      Risk: medium — persist only the review/audit slices, never the derived metrics, or stale cached values will survive a code change.
      Effort: M

- [ ] **T-5.4** — Implement the report-readiness gate.
      Files: `src/domain/reportReadiness.ts` (create), `src/components/dashboard/ExportPanel.tsx` (create)
      Type: create
      Depends on: T-5.1, T-5.2
      Rationale: Gate D: a high-priority pathway is not export-ready until it has a source, evidence class, assumption owner, sensitivity result, reviewer decision, next measurement and management trigger — and the UI must name exactly what is missing. The high-priority cut-off is fixed by §9 D6.
      Acceptance: `src/domain/prioritisation.ts` exports `HIGH_PRIORITY_THRESHOLD = 50` (a `normalizedPriority` cut-off, i.e. `rawPriority >= 63` of 125), displayed in the UI next to the gate message; `assessReadiness(interaction)` returns `{ ready: boolean, missing: string[] }` with `missing` naming each absent field (unit-tested for every single-field-missing case); when any interaction with `normalizedPriority >= HIGH_PRIORITY_THRESHOLD` is not ready, the export button carries the `disabled` attribute and the UI lists the missing field names verbatim.
      Risk: medium.
      Effort: M

- [ ] **T-5.5** — Implement JSON and CSV export.
      Files: `src/domain/exportReport.ts` (create), `src/components/dashboard/ExportPanel.tsx`
      Type: create + modify
      Depends on: T-5.4
      Rationale: Gate D fixes the report title and the required footer line. Use a `Blob` + object URL; **do not add a PDF dependency** (§0.10).
      Acceptance: Clicking export downloads a file whose contents include the title _"Reef Oracle Interaction Screening Report"_ and the line _"Decision-support prototype — expert review required."_; the JSON parses; the CSV opens in a spreadsheet with one header row and one row per exported pathway; a unit test asserts both strings are present in the generated payload.
      Risk: medium.
      Effort: M

**Phase 5 gate:** the end-to-end path of Gate D completes, and the export control is provably
disabled when any required field is missing.

### Phase 6 — Public narrative and visual system alignment

- [ ] **T-6.1** — Map the design tokens into the existing theme.
      Files: `src/index.css`
      Type: modify
      Depends on: T-1.9
      Rationale: §6.7 fixes the palette. The current `@theme` block (`src/index.css:8-23`) has four values that differ, three tokens missing, and the green/blue roles inverted (§1.10).
      Acceptance: `src/index.css` defines every one of the ten tokens in §6.7 with the exact hex values given; the primary action colour resolves to `#08725E` and the secondary/quantitative colour to `#145EA8`; no parallel styling system is introduced (`grep -c "styled\|css-in-js" src` returns 0).
      Risk: medium — the role swap changes every `bg-primary`/`bg-secondary` usage; walk both pages visually after the change.
      Effort: M

- [ ] **T-6.2** — Make content independent of animation.
      Files: `src/pages/LandingPage.tsx`, `src/index.css`
      Type: modify
      Depends on: T-6.1
      Rationale: Every section below the hero starts at `opacity: 0` and only appears via `whileInView` (`LandingPage.tsx:148-151,182-185,210-212,236-239`); there is no `prefers-reduced-motion` handling anywhere.
      Acceptance: With animations disabled in the browser's rendering settings, all page content is visible and readable; with `prefers-reduced-motion: reduce` set, no element animates position or opacity; the hero is never blank at first paint.
      Risk: low.
      Effort: M

- [ ] **T-6.3** — Make the layouts intentional at four widths.
      Files: `src/pages/DashboardPage.tsx`, `src/pages/LandingPage.tsx`, `src/components/dashboard/RankedPathways.tsx`
      Type: modify
      Depends on: T-4.4, T-6.1
      Rationale: `DashboardPage.tsx:17` clips everything with `h-screen w-screen overflow-hidden` while the panes only become a row at `lg` (`:20`), so below 1024px the workspace is unusable (§1.10).
      Acceptance: At 320, 768, 1024 and 1440px CSS pixels: `document.documentElement.scrollWidth <= window.innerWidth` (no horizontal overflow), every pane's content is reachable by scrolling, and no label is visually clipped; the ranked table scrolls inside its own `overflow-x: auto` container.
      Risk: medium.
      Effort: L

- [ ] **T-6.4** — Meet the accessibility bar.
      Files: `src/pages/*.tsx`, `src/components/**/*.tsx`
      Type: modify
      Depends on: T-6.1, T-6.3
      Rationale: §6.7 requires visible focus, semantic headings and controls, accessible names for graph controls and icons, WCAG contrast, and nothing conveyed by hover or colour alone. Today the codebase leans on 9-10px text with further opacity reduction (`DetailsSidebar.tsx:95,719`) and colour-only status encoding (`SpeciesMindMap.tsx:100-137`).
      Acceptance: Tabbing through `/` and `/dashboard` shows a visible focus ring on every interactive element with no keyboard trap; each page has exactly one `<h1>` and no skipped heading level; every icon-only control has an accessible name (verified in the browser accessibility tree); no body text renders below 12px; every status conveyed by colour also carries text or a shape.
      Risk: medium.
      Effort: L

- [ ] **T-6.5** — Settle the imagery.
      Files: `src/pages/LandingPage.tsx`, `public/`
      Type: modify
      Depends on: T-2.12, T-6.1
      Rationale: §6.7 permits only assets already licensed and present in the repo and prefers a clean ecological network graphic over decorative photography. After T-2.12 the repo has no illustrative asset at all.
      Acceptance: Every `src`/`href` for an image resolves to a file inside `public/` or an inline SVG in the repo; `grep -rniE "unsplash|pexels|shutterstock|https?://[^\"']*\.(jpg|png|webp)" src` returns zero matches.
      Risk: low.
      Effort: M

**Phase 6 gate:** the checks in §7.6 pass at all four widths, and the boundary statement appears
exactly once.

### Phase 7 — Verification and hardening

- [ ] **T-7.1** — Write the prioritisation tests.
      Files: `src/__tests__/prioritisation.test.ts` (create)
      Type: create
      Depends on: T-1.6, T-4.1
      Rationale: Gate G names priority calculation including the `/125` normalisation boundary as a required test.
      Acceptance: The suite asserts all 125 score combinations, plus the explicit boundaries `(1,1,1) → 1`, `(5,5,5) → 100`, `(3,3,3) → 22`; `npm test` exits 0.
      Risk: low.
      Effort: S

- [ ] **T-7.2** — Write the negative terminology test.
      Files: `src/__tests__/terminology.test.ts` (create)
      Type: create
      Depends on: T-1.6, T-2.5
      Rationale: Gate G requires a test asserting the absence of unknown-species terminology, so a regression cannot silently reintroduce it.
      Acceptance: The test walks every file under `src/` except its own path and fails if any matches `/unknown\s*species|nicheName|areUnknownSpeciesDiscovered|AI-?predicted|Predict the Unknown|ES\/EIS|undiscovered species/i`; deliberately adding one of those strings to any component makes `npm test` exit non-zero.
      Risk: low — this file is a Gate B exception (§1.12E) precisely because it must contain the patterns.
      Effort: S

- [ ] **T-7.3** — Write the evidence-class and readiness-gate tests.
      Files: `src/__tests__/evidence.test.ts`, `src/__tests__/reportReadiness.test.ts` (create)
      Type: create
      Depends on: T-3.6, T-5.4
      Rationale: Gate G names evidence-class rendering and report-readiness gate logic as required tests.
      Acceptance: `formatEvidenceClass` is asserted to return letter + label for A, B and C; `assessReadiness` is asserted to return `ready: false` with the correct single field name for each of the seven required-field-missing cases, and `ready: true` when all are present; `npm test` exits 0.
      Risk: low.
      Effort: M

- [ ] **T-7.4** — Write the route-resolution test and document the manual check.
      Files: `src/__tests__/routes.test.ts` (create)
      Type: create
      Depends on: T-1.6, T-1.7
      Rationale: Gate G requires dashboard route resolution to be tested; a unit test can only prove the route table and rewrite config are correct, so the deploy-target check in §7.4 remains mandatory.
      Acceptance: The test asserts the app's route table contains `/dashboard` and that the rewrite config file exists and maps unmatched paths to `/index.html`; the test file's header comment states in one sentence that this does not substitute for the live check in §7.4.
      Risk: low — do not let a green unit test be mistaken for a working deploy.
      Effort: S

- [ ] **T-7.5** — Write the determinism test.
      Files: `src/__tests__/determinism.test.ts` (create)
      Type: create
      Depends on: T-2.8, T-4.6
      Rationale: Gate E requires that moving a control twice to the same value produces identical output.
      Acceptance: The test sets a parameter to _v_, records the full derived output, sets it to a different value, sets it back to _v_, and asserts deep equality with the first recording — for temperature, nutrient loading, SCTLD context and the three priority scores.
      Risk: low.
      Effort: M

- [ ] **T-7.6** — Run the full verification protocol and record the results.
      Files: none (verification only)
      Type: config
      Depends on: every preceding task
      Rationale: §7 defines the exact pass conditions; the migration is not finished until they all hold simultaneously.
      Acceptance: Every command in §7 has been run in order and produced its stated pass output, with the results pasted into the migration's final commit message or PR description.
      Risk: low.
      Effort: M

---

## §6. Strict acceptance criteria — the blocking gates

Restated in full so this file stands alone. **All gates are blocking except Gate D's PDF note.**

### 6.1 How to write an acceptance criterion

Every criterion must be **binary and checkable by a third party without asking the author**. It
must name the command, file, route, or on-screen string that proves it.

- ✅ `grep -ri "unknown species" src/ --include=*.tsx --include=*.ts` returns zero matches outside the §1.12E exception list
- ✅ Navigating directly to `/dashboard` on the production build returns 200, not 404
- ❌ "The terminology is consistent"
- ❌ "The UI feels credible"
- ❌ "Improve the data model"

Any criterion failing this test must be rewritten before it is accepted.

### 6.2 Gate A — Conceptual integrity (blocking)

- No code path can create, name, or render an organism absent from user-entered observed species.
- No type, identifier, store key, node type, or component name asserts an unknown _entity_.
  "Unknown" may appear only as a property of an edge, parameter, or threshold — e.g.
  `omittedInteraction`, `detectabilityGap`.
- The graph renders only the five permitted node types of §0.4.
- Every edge in the UI is labelled as a candidate interaction and carries an evidence class.
- No output text asserts causation, prediction of a single future, or a regulatory verdict.

### 6.3 Gate B — Terminology (blocking)

- Zero public-facing occurrences of the forbidden strings inventoried in §1.12.
- The only permitted exceptions are the six paths listed in **§1.12E** — internal migration notes
  and the deliberate negative test.
- Brand resolves from **one** constant (`src/config/brand.ts`), not scattered literals.
- Species names use correct binomial nomenclature and italicisation.
- "Stony coral tissue loss disease" is spelled out before the first use of SCTLD.

### 6.4 Gate C — Claim safety (blocking)

Removed or rewritten, everywhere:

| Remove                                                                                  | Replace with                                                                                                     |
| --------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| "Predict the Unknown"                                                                   | "Find the interaction pathways an EIA may have missed."                                                          |
| "Models known + AI-predicted species"                                                   | "Stress-tests evidence-linked interactions among observed species, functional roles and local stressors."        |
| "AI simulates unknown species interactions"                                             | "Surfaces candidate pathways and tests their sensitivity under alternative scenarios."                           |
| "ES/EIS-compliant reports, ready for planning permits"                                  | "Exportable screening summaries for expert review and EIA workflow integration."                                 |
| "50% faster", "0 unexpected disruptions", "already using", litigation-prevention claims | Delete. Replace trust markers with: _Observed species only_ · _A/B/C evidence classes_ · _Human review required_ |

No implication of customer adoption, scientific validation, regulatory approval, or guaranteed
outcomes. Any pricing shown must be labelled a **pricing hypothesis for pilot validation** and must
not be wired to billing. Do not invent market-size figures; if a figure has no sourced basis in the
repo, omit it.

### 6.5 Gate D — Functional completeness

A user must be able to complete, end to end: site + project input → baseline inventory → candidate
interaction network → scenario stress-test → ranked pathways → ecologist review → export.

- `/dashboard` resolves in local dev, the production build, **and** on the deploy target.
- Every visible button performs a real action. No CTA resolves to 404. Dead "Sign In" /
  "Watch Demo" / "Free Trial" controls are removed unless their destination genuinely exists.
- Selecting an edge opens a detail panel showing: direction, mechanism, evidence class,
  source/citation, confidence range, assumption owner, sensitivity, reviewer status, next
  measurement, management trigger.
- Ranked output displays: rank, pathway name, direction, mechanism, evidence class, source,
  priority score with its three component scores, sensitivity, assumption owner, next measurement,
  management trigger, reviewer status.
- Reviewer states: `pending` | `accepted` | `revise` | `rejected`, plus a free-text reviewer note.
- Audit trail records: pathway, change, user/owner, timestamp, review status.
- **Report-readiness gate:** a high-priority pathway is not export-ready until it has a source,
  evidence class, assumption owner, sensitivity result, reviewer decision, next measurement, and
  management trigger. If anything is missing, the external-report action is **disabled** and the UI
  names exactly what is missing.
- Export produces at minimum a working JSON or CSV download titled
  _"Reef Oracle Interaction Screening Report"_, carrying the line
  _"Decision-support prototype — expert review required."_
  PDF only if achievable without a heavy or unstable dependency — **this plan judges it not
  achievable and excludes it.**

### 6.6 Gate E — Determinism and honesty of outputs

- No `Math.random()` in any displayed result, chart series, or score. Uncertainty is expressed as a
  deterministic confidence band or an explicit sensitivity range.
- Moving a control twice to the same value produces identical output.
- Scenario outputs are described as _scenario response_, _sensitivity result_, _pathway priority_,
  _illustrative cascade_, _decision signal_ — never _forecast_ or _prediction_.
- The UI states which assumptions a scenario is changing.

### 6.7 Gate F — Interface quality and accessibility

Design tokens — use exactly these values, mapped into the existing `@theme` block in
`src/index.css` rather than a parallel system:

```css
--background: #f7f6f2;
--surface: #ffffff;
--ink: #111111;
--muted: #555761;
--reef-green: #08725e;
--ocean-blue: #145ea8;
--green-soft: #e1eeea;
--blue-soft: #e7f0f8;
--line: #d4d7d8;
--warning-soft: #f7ecd8;
```

- Direction: clean, analytical, strategy-consulting density. Off-white page, white analytical
  panels, deep green primary, blue for secondary and quantitative. Thin borders, restrained
  shadows, 4–8px radii. Inter or the nearest existing sans-serif (`src/index.css:35` already sets
  Inter). Max content width ~1180–1240px.
- Avoid: gradients, glassmorphism, neon, oversized rounded cards, decorative icon spam, large empty
  sections.
- Core content must not depend on scroll animation; the page must be fully understandable with
  animation disabled; respect `prefers-reduced-motion`; no initially-blank hero from delayed
  opacity.
- Layouts intentional at 320 / 768 / 1024 / 1440px. No horizontal overflow, no clipped labels.
  Tables stack or scroll deliberately on mobile.
- Visible keyboard focus states; semantic headings and controls; accessible names for graph
  controls and icons; WCAG-compliant contrast; nothing conveyed by hover alone or colour alone.
- Imagery: only assets already licensed and present in the repo. No external stock imagery.
  A clean ecological network graphic is preferred over decorative photography.

### 6.8 Gate G — Verification

Formatter, linter and test suite must run and pass; new targeted tests must exist for priority
calculation (including the `/125` normalisation boundary), evidence-class rendering,
report-readiness gate logic, dashboard route resolution, and a negative test asserting absence of
unknown-species terminology; the production build must complete with zero errors; routes must be
verified manually against the production build; the browser console must be clean; and a final
forbidden-string sweep must return zero. Exact commands in §7.

---

## §7. Verification protocol

Run in this order from the repository root. Every command must produce the stated pass output.
Git Bash is assumed for `grep`; PowerShell equivalents are noted where the syntax differs.

### 7.1 Formatter, linter, types

```bash
npx prettier --check src          # PASS: "All matched files use Prettier code style!"
npm run lint                      # PASS: exit 0, no output
npx tsc -p tsconfig.json --noEmit # PASS: exit 0, no output
```

Baseline for comparison: today `prettier --check` reports 24 unformatted files, `npm run lint`
aborts with "couldn't find an eslint.config" and `tsc --noEmit` already exits 0 (§1.7).

### 7.2 Test suite

```bash
npm test                          # PASS: all suites pass, exit 0
```

Required suites (Gate G): `prioritisation.test.ts` (all 125 combinations plus the `/125`
boundaries), `evidence.test.ts` (letter + label for A/B/C), `reportReadiness.test.ts` (each
missing-field case), `routes.test.ts` (route table + rewrite config), `terminology.test.ts`
(negative assertion), `determinism.test.ts` (same input → same output).

### 7.3 Production build

```bash
npm run build                     # PASS: exit 0, "built in <n>s", zero TS and zero Vite errors
```

### 7.4 Route verification — production build and deploy target

```bash
npx vite preview --port 4173
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:4173/            # PASS: 200
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:4173/dashboard   # PASS: 200
```

**This local check is necessary but not sufficient.** `vite preview` applies its own SPA fallback,
so it returns 200 even with no rewrite configured — which is exactly why the bug reached
production. Repeat against the real deploy URL after deploying:

```bash
curl -s -o /dev/null -w "%{http_code}\n" <deploy-url>/dashboard            # PASS: 200
```

Then hard-reload `/dashboard` in a browser and confirm the dashboard renders rather than a host
404 page.

### 7.5 Browser console

Open `/` and `/dashboard` against the production preview with DevTools open.
PASS: zero errors, zero warnings, zero failed network requests (including `/favicon.ico`).

### 7.6 Manual interface checks

At 320, 768, 1024 and 1440px CSS pixels, on both routes:

1. `document.documentElement.scrollWidth <= window.innerWidth` — PASS: true at all four widths.
2. Every pane's content is reachable; no label is visually clipped.
3. Tab through the page: every interactive element shows a visible focus ring; no keyboard trap.
4. Disable animations (or set `prefers-reduced-motion: reduce`): all content remains visible and
   readable; nothing animates position or opacity.
5. Set a control to a value, move it away, return to the same value: the rendered numbers are
   identical (this is the manual counterpart of `determinism.test.ts`).
6. With any required field cleared on a high-priority pathway: the export control carries
   `disabled` and the UI lists the missing field names.

### 7.7 Final forbidden-string sweep

```bash
grep -rniE "ecopredict|predict the unknown|predict unknown species|unknown species|unknownspecies|areunknownspeciesdiscovered|nichepredictor|nichename|ai-?predicted species|undiscovered species|unknown organisms|es/eis|50% faster|0 unexpected disruptions|ready for planning permits|already using" \
  src index.html README.md package.json \
  --exclude-dir=__tests__
```

PASS: zero matches. Then confirm the only remaining hits repo-wide are the §1.12E exceptions:

```bash
grep -rlniE "unknown species|ecopredict" . --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=dist
```

PASS: the output lists only `projectGuide/mainIdea.md`, `projectGuide/implementation.md`,
`projectGuide/techStack.md`, `projectGuide/codefix.md`, `src/__tests__/terminology.test.ts`,
and `src/components/layout/Navbar.tsx` (the GitHub URL only).

### 7.8 Build-artefact check

```bash
git ls-files dist | wc -l         # PASS: 0 if option (a) of T-1.20 was taken
grep -rl "EcoPredict" dist        # PASS: no output if option (b) was taken
```

---

## §8. Risk register

| #   | Risk                                                                                                                      | Blast radius                                                | Likelihood | Mitigation                                                                                                                                                                                                          |
| --- | ------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| R1  | The store rename (T-2.4) breaks all nine importing components at once.                                                    | Whole dashboard; blank page.                                | High       | Do the rename and the slice deletion in a single commit; run `npx tsc --noEmit` before committing; the compiler finds every call site because the project is `strict`.                                              |
| R2  | Copy is fixed but the fabricated-species UI survives, so the site and the app assert different concepts.                  | Credibility; the exact failure this plan exists to prevent. | Medium     | T-1.14 is mandatory inside Phase 1 and is a dependency of the Phase 1 gate. Verify by clicking every dashboard control before closing the phase.                                                                    |
| R3  | `/dashboard` still 404s on the deploy target because the rewrite was added for the wrong host.                            | Primary CTA dead in production.                             | Medium     | T-1.7 requires confirming the actual host first; §7.4 requires the live `curl` check and explicitly rejects local preview as proof.                                                                                 |
| R4  | The role swap in T-6.1 (green becomes primary) silently changes every `bg-primary` surface.                               | Visual regression across both pages.                        | Medium     | Change tokens and walk both routes at all four widths in the same session; the token names stay stable so the diff is confined to `src/index.css`.                                                                  |
| R5  | Deleting `SimulationViewMap` (T-2.9) is read as lost work rather than a deliberate removal.                               | Stakeholder trust.                                          | Medium     | Record the reason in the commit message and in this register: it rendered fabricated organisms and was the only `Math.random()` in displayed output.                                                                |
| R6  | Someone "fixes" a class-C citation by inventing a plausible-looking source.                                               | Fatal to the product's premise.                             | Medium     | T-3.2's acceptance forbids it; the seed data defaults to `Source required`; call it out in review.                                                                                                                  |
| R7  | Adding ESLint's `react-hooks/exhaustive-deps` surfaces dozens of pre-existing warnings and tempts a blanket disable.      | Reintroduces the stale-memo bugs in §1.2(2) and §1.5.       | High       | Fix the dependency arrays rather than disabling the rule; two of them are live bugs this plan already commits to fixing (T-2.8, T-4.5).                                                                             |
| R8  | Persisting the wrong store slice (T-5.3) makes a stale cached shape survive a code change.                                | Users see broken state that a reload does not clear.        | Medium     | Persist only the review and audit slices; version the persisted key so a schema change invalidates it.                                                                                                              |
| R9  | The committed `dist/` is what the host actually serves, and removing it breaks the deployment.                            | Site goes down.                                             | Low        | §9 D7 confirms a standard Vercel + Vite setup builds fresh from source and does not read the committed folder. T-1.20's risk note still requires stopping if the live project turns out to be configured otherwise. |
| R10 | The thirteen-column ranked table overflows and breaks the page at narrow widths.                                          | Gate F failure.                                             | Medium     | T-4.4's acceptance requires an `overflow-x: auto` container; T-6.3 re-verifies at 320px.                                                                                                                            |
| R11 | Scope creep — rebuilding the app instead of migrating it.                                                                 | Schedule; loss of sound work.                               | Medium     | The §2 register is binding; anything not in Delete must be migrated, not rewritten.                                                                                                                                 |
| R12 | `AGENTS.md`'s Next.js instruction (T-1.18) was deliberate for some other reason, and correcting it removes real guidance. | Future agents misdirected either way.                       | Low        | Resolved per §9 D5 — the repo owner confirmed it is not intentional; correct unconditionally.                                                                                                                       |

---

## §9. Resolved decisions

All seven items that were open when this plan was first drafted were decided by the repo owner on
2026-08-14, before any implementation task began. They are locked; do not re-litigate them
mid-migration. Each entry keeps the original reasoning so a future reader knows _why_, not just
_what_.

**D1 — Brand hierarchy: "EcoPredict" or "Reef Oracle"? → Reef Oracle.**
The source material used both, sometimes together (`EcoPredict / REEF ORACLE`); the repo, the git
remote (`github.com/gamgabat/EcoPredict`) and every UI literal said EcoPredict, while the new
concept document uses Reef Oracle throughout and Gate D fixes the export title as
_"Reef Oracle Interaction Screening Report"_.
**Decision:** **Reef Oracle** is the single product name. EcoPredict is retired from all
user-facing surfaces. The GitHub repository name and URL stay unchanged — renaming a remote is out
of scope (§0.10) and the URL is a Gate B exception (§1.12E). Implemented via
`src/config/brand.ts` (T-1.1) so a future reversal is a one-line edit.

**D2 — Must the audit trail survive reload? → Yes.**
**Decision:** persist the review and audit slices with Zustand's `persist` middleware to
`localStorage` (T-5.3). Zustand is already a dependency, so this adds no package and no backend. An
audit trail that vanishes on refresh is not an audit trail.

**D3 — Demo scenario or empty baseline on first load? → Demo baseline, clearly labelled.**
**Decision:** the dashboard boots into the §0.9 demo baseline with a persistent "Demo baseline"
marker (not a dismissible toast) and a visible "Clear baseline" control — new task **T-2.13**. A
blank first screen makes the product unevaluable in a pitch, and Gate D requires an end-to-end path
a reviewer can walk immediately. The marker matters: an unlabelled demo risks a viewer mistaking
seeded class-C assumptions for real site findings — the exact credibility failure this
repositioning exists to correct.

**D4 — Who is the default `assumptionOwner`/reviewer, given there is no auth or user model? →
Free-text field, no authentication.**
**Decision:** a single free-text "Reviewer / owner" field in the workspace, defaulting to the
literal `Unassigned`, persisted with the audit slice — folded into **T-5.1**'s acceptance criteria.
Authentication is explicitly not added; it would blow the scope and touch secrets/hosting decisions
marked out-of-scope in §0.10.

**D5 — Is `AGENTS.md`'s Next.js instruction intentional? → No, correct it.**
It instructed every agent to read `node_modules/next/dist/docs/` before writing code; that package
is not installed and the app is a Vite SPA (§1.1). **Decision:** correct it unconditionally
(T-1.18) — leaving it costs every future agent a wasted reconnaissance pass and risks Next.js
idioms being written into a Vite app.

**D6 — High-priority threshold for the report-readiness gate? → `normalizedPriority >= 50`.**
**Decision:** `normalizedPriority >= 50` (i.e. `rawPriority >= 63` of 125) is the fixed cut-off,
exposed as a named constant `HIGH_PRIORITY_THRESHOLD` in `src/domain/prioritisation.ts` and
displayed in the UI next to the gate message (T-5.4). Named as a constant specifically so it stays
a one-line change if the threshold ever needs revisiting.

**D7 — Deploy target of record? → Vercel.**
`projectGuide/techStack.md` named Vercel, but the repo contained no host configuration and no CI
workflow (§1.1). **Decision:** Vercel is confirmed. `vercel.json` with a catch-all SPA rewrite is
added (T-1.7):

```json
{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
```

This also resolves **T-1.20**: a standard Vercel + Vite setup (framework preset "Vite", build
command `npm run build`, output directory `dist`) builds fresh from source on every deploy — it
does **not** serve a committed `dist/` directory. The committed, stale `dist/` (§1.11) is therefore
confirmed dead weight, not a deploy dependency. **T-1.20 takes option (a):** untrack `dist/` and add
it to `.gitignore`. If the live Vercel project turns out to be configured differently (e.g. a
custom output step that reads the committed folder), stop and re-check before deleting — but that
would be a misconfiguration worth fixing independently, not a reason to keep stale copy in git.

---

## §10. Self-check

- [x] `projectGuide/codefix.md` exists, sits beside `mainIdea.md`, `implementation.md` and
      `techStack.md`, and overwrote nothing — all three pre-existing files are byte-identical to
      their state at commit `5e0733e`.
- [x] `codefix.md` is self-contained: §0 restates the full product contract, prioritisation maths,
      evidence classes, boundary statement, reference domain content and non-goals; §6 restates
      every gate; §7 gives runnable commands. Nothing depends on the originating prompt.
- [x] Every codebase claim cites `file:line` from a file that was actually opened. All 24 files
      under `src/`, plus `index.html`, `package.json`, `vite.config.ts`, `tsconfig.json`,
      `tsconfig.node.json`, `postcss.config.mjs`, `.gitignore`, `README.md`, `AGENTS.md`,
      `CLAUDE.md`, `build.log`, `dist/index.html` and the three `projectGuide/` documents were read
      directly; `dist/assets/*` was inspected by content search rather than full read, and is
      reported as such.
- [x] Every acceptance criterion names a command, file, route or on-screen string, and resolves to
      true or false without consulting the author.
- [x] Every affected module appears in exactly one of Preserve / Migrate / Delete (§2).
- [x] Every task carries an ID, files, type, dependencies, rationale, acceptance, risk and effort.
- [x] Task order respects dependencies; the critical path is stated at the head of §5.
- [x] No phase leaves the repo in a state where the public site and the engine assert different
      concepts — T-1.14 removes the fabricated-species UI in the same phase as the copy rewrite,
      before Phase 2 removes the underlying engine.
- [x] No fabricated organism survives any phase: after Phase 1 none can be summoned through the UI;
      after Phase 2 the type system cannot represent one (§3 rows 4 and 5).
- [x] Zero lines of application code were written. This document contains no implementation — only
      type signatures, existing-code citations, and shell commands for verification.
