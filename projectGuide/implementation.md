> SUPERSEDED — see projectGuide/codefix.md
# EcoPredict — AI Implementation Guide & Improvement Plan

> **For AI agents executing this plan:** Read this entire document before touching any file.
> Every section builds on the previous. Do not skip phases or reorder tasks.
> The codebase is Vite + React 18 + TypeScript + Zustand + ReactFlow + Recharts.
> All simulation logic lives in `src/store/simulationStore.ts`. All UI is in `src/components/dashboard/`.

---

## 0. Context & What This Product Is Supposed to Do

EcoPredict's core claim is this:

> "Traditional EIA companies only model known species. We predict the unknown species that likely exist in a given site, then simulate how a proposed human disruption cascades through them — producing defensible, ES/EIS-grade evidence."

The product has two user types:
- **Development firms** — want to prove their project causes minimal cascading harm
- **Environmental NGOs / regulators** — want to prove the opposite

Both users need the **same engine** but interpret outputs differently.

The current prototype does none of this. It is a slider toy with a hardcoded "reveal" button. The plan below transforms it into a credible simulation engine in four phases.

---

## 1. What Is Currently Wrong (Root Cause Analysis)

Read this section fully. Every task in later phases traces back to one of these root problems.

### Problem 1 — Unknown Species Are Hardcoded Theatre
`unknownSpeciesAlpha` and `unknownSpeciesBeta` are initialized with fixed values in the store
(`predationStrength: 20`, `competitionWithCoral: 10`, etc.) and never change regardless of
environmental conditions. The "Discover Unknown Species" button simply flips a boolean.
There is no algorithm connecting site conditions to species prediction.

**What it should do:** Given the current environmental parameter profile (temperature, salinity,
pH, nitrogen loading, SCLTD risk) and the known species inventory, a rule-based niche model should
derive which ecological niches are unfilled, then generate unknown species with traits that match
those niches. Different parameter profiles must produce meaningfully different unknown species.

### Problem 2 — Unknown Species Improve the Ecosystem
`unknownSpeciesBeta.diseaseResistance` currently reduces effective SCLTD risk, and
`unknownSpeciesBeta.nutrientUptake` reduces effective nitrogen loading in `getEcosystemMetrics()`.
This means discovering unknown species makes the reef healthier. This is backwards for the
product's purpose. Unknown species represent **unassessed risk** — their presence should introduce
uncertainty, new threat vectors, and cascade vulnerabilities, not clean up the ecosystem.

**What it should do:** Unknown species should introduce at minimum: (a) competition pressure on
known species, (b) predation risk to vulnerable populations, (c) sensitivity to the proposed
disruption that known species do not share. Their net effect on the ecosystem should generally be
neutral-to-negative unless specific conditions are met.

### Problem 3 — No Disruption Scenario Input
The sliders represent raw environmental parameters with no framing. There is no concept of
"a company wants to do X at this site." Users cannot model "before project" vs "after project."
Without a disruption scenario, there is nothing to legally challenge and no report to produce.

**What it should do:** The dashboard must accept a defined disruption type (e.g. thermal
discharge, chemical pollutant, dredging, water intake) with specific parameter delta values
attached. The simulation should compute a baseline state and a disrupted state, then show the
delta — especially for unknown species, which are the product's differentiator.

### Problem 4 — No Cascade Structure (3-Order Model Is Missing)
The `ImpactSimulationChart` renders a single "stability" number that declines linearly with
`Math.random()` noise added. This is not a cascade model. The architecture spec explicitly called
for three cascade orders. None exist.

**What it should do:** The chart and impact summary must compute and display:
- **1st order:** Direct abiotic change from disruption (temperature delta, chemical concentration, etc.)
- **2nd order:** Population-level responses of known and unknown species to those abiotic changes
- **3rd order:** Ecosystem-level outcomes (coral cover loss %, extinction risk per species,
  food web stability score, threat level to unknown species niches)

### Problem 5 — ImpactSimulationChart Uses Math.random() Inside useMemo
The chart data is regenerated with random noise on every render. This means the chart shows
a different line every time any slider moves. This destroys credibility for a product that
must produce defensible outputs.

**What it should do:** Remove `Math.random()` entirely from chart data generation. Projection
uncertainty should be represented as a confidence band (upper/lower bounds computed
deterministically from parameter variance), not random noise.

### Problem 6 — getEcosystemMetrics Is Not Memoized and Is Called Everywhere
`getEcosystemMetrics()` is a function that runs full computation every call. It is invoked in
`SpeciesMindMap`, `SpeciesNode`, `DetailsSidebar`, `ImpactSimulationChart`, and
`SimulationViewMap`. Every slider movement triggers all of these recomputations simultaneously.

**What it should do:** Convert the derived metrics into a Zustand computed/derived slice or wrap
in a `useMemo` at the component level with proper dependency arrays. The function should compute
once per state change, not once per component per render.

---

## 2. Phase Plan Overview

```
Phase 1 — Foundation Fixes          (no new features, fixes broken internals)
Phase 2 — Disruption Scenario Input  (the "what is the project" layer)
Phase 3 — Niche Prediction Engine    (the "what unknown species exist" layer)
Phase 4 — Cascade Model & Output     (the "what happens" layer + report)
```

Each phase has its own strict criteria section and checklist below.

---

## 3. Phase 1 — Foundation Fixes

### 3.1 Goal
Fix the five broken internals before adding any new functionality. Nothing in Phase 2 or later
will work correctly until these are resolved.

### 3.2 Tasks

#### Task 1.1 — Remove Math.random() From ImpactSimulationChart

**File:** `src/components/dashboard/ImpactSimulationChart.tsx`

The current `data` computation inside `useMemo` contains:
```ts
const randomFluctuation = Math.random() * 4 - 2;
```
Remove this line. Replace with a deterministic uncertainty band computed as follows:

```
stressIndex = (temperature - 28) * 0.3 + nitrogenLoading * 0.01 + scltdOutbreakRisk * 0.01
upperBound  = min(100, baseValue - decay + stressIndex * 2)
lowerBound  = max(0,   baseValue - decay - stressIndex * 2)
midLine     = (upperBound + lowerBound) / 2
```

The chart should render three Area series: `upper`, `mid`, `lower` — giving a visual confidence
band that communicates uncertainty without being random.

**Acceptance criteria:**
- Moving any slider produces a stable, non-flickering chart that updates smoothly
- The chart shows a band (three lines or shaded area between upper/lower), not a single line
- No `Math.random()` call exists anywhere in chart data generation

#### Task 1.2 — Fix Unknown Species Impact Direction

**File:** `src/store/simulationStore.ts`

Find the `getEcosystemMetrics` function. Remove these two lines (or their equivalent):
```ts
const betaDiseaseResistance = areUnknownSpeciesDiscovered ? unknownSpeciesBeta.diseaseResistance : 0;
const betaNutrientUptake    = areUnknownSpeciesDiscovered ? unknownSpeciesBeta.nutrientUptake : 0;
const effectiveScltd        = Math.max(0, scltdOutbreakRisk - (betaDiseaseResistance * 0.5));
const effectiveNitrogen     = Math.max(0, nitrogenLoading   - (betaNutrientUptake * 0.8));
```

Replace with the following logic where unknown species add stress, not remove it:
```
unknownAlphaStress  = areUnknownSpeciesDiscovered
                      ? unknownSpeciesAlpha.predationStrength * 0.3
                        + unknownSpeciesAlpha.competitionWithCoral * 0.4
                      : 0

unknownBetaStress   = areUnknownSpeciesDiscovered
                      ? unknownSpeciesBeta.populationEstimate * 0.2
                      : 0

// Apply alpha stress to parrotfish and coral health
parrotfishHealth   -= unknownAlphaStress * 0.4
coralHealth        -= (unknownAlphaStress * 0.3 + unknownBetaStress * 0.2)
```

The exact coefficients can be tuned, but the direction — unknown species adding pressure —
must be preserved.

**Acceptance criteria:**
- Discovering unknown species has a net negative or neutral effect on coralHealth and parrotfishHealth
- The magnitude of stress scales with the unknown species trait values
- No ecological variable improves solely as a result of unknown species being discovered

#### Task 1.3 — Stabilize getEcosystemMetrics Performance

**File:** `src/store/simulationStore.ts` + all components that call `getEcosystemMetrics()`

Add a derived metrics cache to the store. Pattern:

```ts
// In store state, add:
_cachedMetrics: EcosystemMetrics | null;
_metricsKey: string; // hash of relevant inputs

// In getEcosystemMetrics():
const key = `${temperature}-${phLevel}-${salinity}-${nitrogenLoading}-${scltdOutbreakRisk}-${currentYear}-${diademaPopulation}-${parrotfishPopulation}-${grouperPopulation}-${lionfishPresence}-${areUnknownSpeciesDiscovered}`;
if (get()._metricsKey === key && get()._cachedMetrics) return get()._cachedMetrics;
// ... run computation ...
set({ _cachedMetrics: result, _metricsKey: key });
return result;
```

**Acceptance criteria:**
- `getEcosystemMetrics()` does not re-run its computation when called twice with identical state
- No console performance warnings from React about expensive re-renders on slider movement

#### Task 1.4 — Replace Hardcoded Unknown Species Initial Values With Null State

**File:** `src/store/simulationStore.ts`

Change the initial state of unknown species from hardcoded trait values to a neutral/null state
that communicates "not yet predicted":

```ts
unknownSpeciesAlpha: {
  predationStrength:    0,
  competitionWithCoral: 0,
  populationEstimate:   0,
  nicheName:            '',
  triggerCondition:     '',
},
unknownSpeciesBeta: {
  diseaseResistance:  0,
  nutrientUptake:     0,
  populationEstimate: 0,
  nicheName:          '',
  triggerCondition:   '',
},
```

The trait values will be populated by the Niche Prediction Engine in Phase 3.
Add `nicheName` and `triggerCondition` fields to both unknown species — these will hold
human-readable strings generated by the prediction engine.

**Acceptance criteria:**
- Unknown species start with all-zero traits and empty string labels
- The `nicheName` and `triggerCondition` fields exist in the TypeScript interface
- The `areUnknownSpeciesDiscovered` flag remains false until the prediction engine runs

---

### 3.3 Phase 1 Checklist

| # | Task | File(s) | Priority | Done |
|---|------|---------|----------|------|
| 1.1 | Remove Math.random() from chart; add deterministic upper/mid/lower bands | ImpactSimulationChart.tsx | CRITICAL | ☐ |
| 1.2 | Flip unknown species impact direction from positive to negative/neutral | simulationStore.ts | CRITICAL | ☐ |
| 1.3 | Add metrics caching to getEcosystemMetrics | simulationStore.ts | REQUIRED | ☐ |
| 1.4 | Reset unknown species initial values to zero/null; add nicheName and triggerCondition fields | simulationStore.ts | REQUIRED | ☐ |

**Phase 1 is complete when all four checkboxes are ticked AND:**
- The chart no longer flickers when sliders move
- Discovering unknown species does not improve any ecological metric
- The TypeScript compiler reports zero errors (`npx tsc --noEmit`)

---

## 4. Phase 2 — Disruption Scenario Input

### 4.1 Goal
Give users a way to define *what the proposed project is*, not just manually dial in raw
environmental numbers. This is the layer that makes the tool useful for EIA challenges.

### 4.2 New Concept: DisruptionScenario

A `DisruptionScenario` is a named project type with predefined parameter deltas applied on
top of the current baseline. It answers the question: "if Company X builds this here, what
do the parameters become?"

Define the following type in `src/types/disruption.ts` (create this file):

```ts
export interface DisruptionScenario {
  id:          string;
  name:        string;
  description: string;
  category:    'thermal' | 'chemical' | 'physical' | 'biological';
  parameterDeltas: {
    temperature?:       number; // +/- Celsius
    salinity?:          number; // +/- ppt
    phLevel?:           number; // +/- pH units
    nitrogenLoading?:   number; // +/- percentage points
    scltdOutbreakRisk?: number; // +/- percentage points
  };
  legalContext: string; // One sentence: which regulation this implicates
}
```

Define the following built-in scenarios in `src/data/disruptionScenarios.ts` (create this file):

```
1. Thermal Discharge (Power Plant Cooling)
   category: thermal
   deltas: temperature +3.5°C, salinity +1.5 ppt
   legalContext: "Implicates Section 316(a) of the Clean Water Act thermal variance provisions."

2. Chemical Pollutant (Industrial Runoff)
   category: chemical
   deltas: nitrogenLoading +35, phLevel -0.3, scltdOutbreakRisk +25
   legalContext: "Implicates MARPOL Annex V and regional EIS marine discharge thresholds."

3. Dredging Operation
   category: physical
   deltas: salinity +3, nitrogenLoading +20, scltdOutbreakRisk +15, phLevel -0.15
   legalContext: "Implicates Section 404 of the Clean Water Act and NEPA EIS requirements."

4. Water Intake Structure
   category: physical
   deltas: temperature +1.5, salinity +2, scltdOutbreakRisk +10
   legalContext: "Implicates Section 316(b) of the Clean Water Act (impingement/entrainment)."

5. Aquaculture Discharge
   category: biological
   deltas: nitrogenLoading +45, scltdOutbreakRisk +30, phLevel -0.2
   legalContext: "Implicates EPA effluent guidelines for Concentrated Aquatic Animal Production."
```

### 4.3 Store Changes

Add to `simulationStore.ts`:

```ts
// New state fields:
activeScenario:   DisruptionScenario | null;
baselineSnapshot: Record<string, number> | null; // parameter values before disruption applied

// New actions:
applyDisruption:  (scenario: DisruptionScenario) => void;
clearDisruption:  () => void;
```

`applyDisruption` must:
1. Save current parameter values as `baselineSnapshot`
2. Set `activeScenario` to the chosen scenario
3. Apply the `parameterDeltas` on top of current values (clamped to valid ranges)
4. The applied parameters become the new slider values

`clearDisruption` must:
1. Restore all parameters from `baselineSnapshot`
2. Set `activeScenario` to null
3. Set `baselineSnapshot` to null

### 4.4 UI Changes

#### 4.4.1 — Disruption Selector Panel

Create `src/components/dashboard/DisruptionPanel.tsx`.

This component renders at the top of `DetailsSidebar`, above the parameter sliders.
It shows:
- A heading: "Disruption Scenario"
- If no scenario is active: a dropdown or button group listing the 5 scenarios by name and category
- If a scenario is active:
  - The scenario name and category badge
  - A compact list of the parameter deltas applied (e.g. "+3.5°C temperature")
  - The legal context string in italics
  - A "Clear Scenario" button that calls `clearDisruption()`

When a scenario is active, the parameter sliders in `DetailsSidebar` should be locked
(read-only / visually muted) to communicate that values are set by the scenario, not
manual input. They may remain visible for reference.

#### 4.4.2 — Before/After Indicator in DetailsSidebar

When a scenario is active and `baselineSnapshot` exists, each slider row in `DetailsSidebar`
should show a small delta label next to the current value:

```
Temperature   31.5°C   [↑ +3.5 from baseline]
```

The delta label should be red for increases harmful to coral and blue for neutral changes.

#### 4.4.3 — Scenario Badge in Navbar

In `src/components/layout/Navbar.tsx`, when `activeScenario` is not null, show a small
pill/badge on the right side of the nav: e.g. `⚠ Thermal Discharge Active`.

### 4.5 Phase 2 Checklist

| # | Task | File(s) | Priority | Done |
|---|------|---------|----------|------|
| 2.1 | Create DisruptionScenario type | src/types/disruption.ts (new) | REQUIRED | ☐ |
| 2.2 | Create 5 built-in disruption scenarios | src/data/disruptionScenarios.ts (new) | REQUIRED | ☐ |
| 2.3 | Add activeScenario, baselineSnapshot, applyDisruption, clearDisruption to store | simulationStore.ts | REQUIRED | ☐ |
| 2.4 | Create DisruptionPanel component | src/components/dashboard/DisruptionPanel.tsx (new) | REQUIRED | ☐ |
| 2.5 | Lock sliders when scenario active; show delta labels | DetailsSidebar.tsx | REQUIRED | ☐ |
| 2.6 | Add scenario badge to Navbar | Navbar.tsx | IMPORTANT | ☐ |
| 2.7 | Verify applyDisruption clamps values to valid parameter ranges | simulationStore.ts | REQUIRED | ☐ |
| 2.8 | Verify clearDisruption fully restores baseline snapshot | simulationStore.ts | REQUIRED | ☐ |

**Phase 2 is complete when:**
- Selecting "Thermal Discharge" sets temperature to baseline + 3.5, salinity to baseline + 1.5
- Clicking "Clear Scenario" restores exact prior values
- Sliders are visually locked and show delta labels when scenario is active
- Zero TypeScript errors

---

## 5. Phase 3 — Niche Prediction Engine

### 5.1 Goal
Replace the hardcoded "discover" toggle with a rule-based prediction engine that derives
unknown species traits from the current environmental profile and known species inventory.
Different site conditions must produce different unknown species outputs.

### 5.2 Concept: Ecological Niche Logic

A niche gap is a set of environmental conditions that a known species would exploit, but
where the known species inventory is insufficient to fill that ecological role. When the
niche gap exceeds a threshold, an unknown species is likely to exist there.

Define the following niche detection rules. These are the minimum required rules. More can
be added. Each rule produces a candidate unknown species with populated traits.

**Niche Rule 1 — Thermophilic Algal Competitor**
Trigger: `temperature >= 30 AND nitrogenLoading >= 50`
Logic: High temperature + high nutrients = open niche for heat-tolerant algal competitor
Produces unknownSpeciesAlpha with:
  - nicheName: "Thermophilic Algal Competitor"
  - predationStrength: 5
  - competitionWithCoral: 10 + (temperature - 30) * 8 + (nitrogenLoading - 50) * 0.3
  - populationEstimate: 20 + (nitrogenLoading - 50) * 0.8
  - triggerCondition: "Elevated temperature + nitrogen loading exceeds competitive threshold"

**Niche Rule 2 — Anaerobic Microbial Mat**
Trigger: `phLevel <= 7.8 AND nitrogenLoading >= 40`
Logic: Acidic + eutrophic = bottom anoxia niche
Produces unknownSpeciesAlpha with:
  - nicheName: "Anaerobic Microbial Mat"
  - predationStrength: 0
  - competitionWithCoral: 5 + (7.8 - phLevel) * 20
  - populationEstimate: 30 + nitrogenLoading * 0.4
  - triggerCondition: "pH depression combined with eutrophication creates anoxic substrate niche"

**Niche Rule 3 — Cryptic Predatory Polychaete**
Trigger: `lionfishPresence >= 50 AND parrotfishPopulation <= 30`
Logic: Disrupted fish community = open predation niche for benthic invertebrate predator
Produces unknownSpeciesAlpha with:
  - nicheName: "Cryptic Predatory Polychaete"
  - predationStrength: 15 + (lionfishPresence - 50) * 0.4
  - competitionWithCoral: 8
  - populationEstimate: 25 + (50 - parrotfishPopulation) * 0.3
  - triggerCondition: "Disrupted herbivore guild creates invertebrate predation niche"

**Niche Rule 4 — Disease-Amplifying Echinoderm**
Trigger: `scltdOutbreakRisk >= 40 AND diademaPopulation <= 30`
Logic: Disease pressure + depleted urchin = niche for disease vector
Produces unknownSpeciesBeta with:
  - nicheName: "Disease-Amplifying Echinoderm"
  - diseaseResistance: 80 (resistant itself, but carries pathogen)
  - nutrientUptake: 10
  - populationEstimate: 20 + scltdOutbreakRisk * 0.3
  - triggerCondition: "SCLTD outbreak risk with collapsed urchin density favors disease-resistant echinoderm"

**Niche Rule 5 — Sediment-Tolerant Biofilm Producer**
Trigger: `salinity >= 38 OR salinity <= 30`
Logic: Salinity stress = open biofilm niche on degraded coral substrate
Produces unknownSpeciesBeta with:
  - nicheName: "Sediment-Tolerant Biofilm Producer"
  - diseaseResistance: 20
  - nutrientUptake: 30
  - populationEstimate: 15 + Math.abs(35 - salinity) * 4
  - triggerCondition: "Salinity deviation beyond reef tolerance opens benthic biofilm niche"

**Priority logic:** If multiple Alpha rules trigger, use the first one that fires (highest
temperature rule first). Same for Beta. If no rule triggers, unknown species remain at zero
values and `areUnknownSpeciesDiscovered` remains false.

### 5.3 Implementation

Create `src/engine/nichePredictor.ts` (new file).

This module exports a single function:
```ts
export function runNichePrediction(params: NichePredictionInput): NichePredictionOutput
```

Where:
```ts
interface NichePredictionInput {
  temperature:       number;
  phLevel:           number;
  salinity:          number;
  nitrogenLoading:   number;
  scltdOutbreakRisk: number;
  lionfishPresence:  number;
  parrotfishPopulation: number;
  diademaPopulation: number;
}

interface NichePredictionOutput {
  alphaDiscovered: boolean;
  betaDiscovered:  boolean;
  alpha: UnknownSpeciesAlpha | null;
  beta:  UnknownSpeciesBeta  | null;
  alphaRule: string; // which rule triggered, or 'none'
  betaRule:  string;
}
```

This function must be pure (no side effects, no store access). The store calls it and
applies the output.

### 5.4 Store Integration

Add to `simulationStore.ts`:

```ts
runNichePrediction: () => void;
```

This action calls `nichePredictor.runNichePrediction(currentParams)`, then:
- Sets `unknownSpeciesAlpha` and `unknownSpeciesBeta` from the output
- Sets `areUnknownSpeciesDiscovered` to true if either alpha or beta was found
- Replaces the current "Discover" scan button logic

The scan button in `DetailsSidebar` should call `runNichePrediction()` instead of
directly setting `areUnknownSpeciesDiscovered`.

### 5.5 UI: Prediction Result Display

In `DetailsSidebar`, when the scan completes and unknown species are found:
- Show the `nicheName` of each discovered species (not just "Unknown Species α")
- Show the `triggerCondition` string beneath the name in smaller text
- If no niche was detected (all rules failed), show a message:
  "No additional niches detected under current conditions. Try applying a disruption scenario."

In `SpeciesMindMap`, update the ReactFlow node labels for unknown species to use `nicheName`
instead of the hardcoded "Unknown Species α" / "Unknown Species β".

### 5.6 Phase 3 Checklist

| # | Task | File(s) | Priority | Done |
|---|------|---------|----------|------|
| 3.1 | Create nichePredictor.ts with all 5 rules as pure function | src/engine/nichePredictor.ts (new) | CRITICAL | ☐ |
| 3.2 | Define NichePredictionInput and NichePredictionOutput types | src/types/niche.ts (new) | REQUIRED | ☐ |
| 3.3 | Add runNichePrediction action to store | simulationStore.ts | REQUIRED | ☐ |
| 3.4 | Connect scan button to runNichePrediction (not to direct boolean flip) | DetailsSidebar.tsx | REQUIRED | ☐ |
| 3.5 | Show nicheName and triggerCondition in DetailsSidebar after scan | DetailsSidebar.tsx | REQUIRED | ☐ |
| 3.6 | Show "no niche detected" message if all rules fail | DetailsSidebar.tsx | REQUIRED | ☐ |
| 3.7 | Update ReactFlow unknown species node labels to use nicheName | SpeciesMindMap.tsx | IMPORTANT | ☐ |
| 3.8 | Verify: thermal discharge scenario triggers Niche Rule 1 | Manual test | CRITICAL | ☐ |
| 3.9 | Verify: chemical pollutant scenario triggers Niche Rule 2 | Manual test | CRITICAL | ☐ |
| 3.10 | Verify: different scenarios produce different unknown species | Manual test | CRITICAL | ☐ |
| 3.11 | Verify: nichePredictor.ts has zero store imports (pure function) | Code review | REQUIRED | ☐ |

**Phase 3 is complete when:**
- Applying "Thermal Discharge" and then scanning produces the Thermophilic Algal Competitor
- Applying "Chemical Pollutant" and scanning produces the Anaerobic Microbial Mat
- Default parameters (no scenario) produce no unknown species on scan
- nichePredictor.ts is a pure function with no Zustand imports
- Zero TypeScript errors

---

## 6. Phase 4 — Cascade Model & Impact Output

### 6.1 Goal
Replace the single "stability" chart with a proper 3-order cascade breakdown, and add an
impact summary panel that outputs human-readable findings suitable for an EIA challenge.

### 6.2 Three-Order Cascade Model

Create `src/engine/cascadeModel.ts` (new file).

This module exports:
```ts
export function computeCascade(params: CascadeInput): CascadeOutput
```

#### CascadeInput
All current simulation store parameters plus the active disruption scenario (or null).

#### CascadeOutput (all values 0–100 unless noted)
```ts
interface CascadeOutput {
  // 1st order — abiotic changes from disruption
  firstOrder: {
    temperatureDelta:     number; // degrees C change from baseline
    salinityDelta:        number;
    phDelta:              number;
    nitrogenDelta:        number;
    overallAbioticStress: number; // 0-100 composite
  };

  // 2nd order — population responses
  secondOrder: {
    diademaDecline:       number; // % population loss from disruption
    parrotfishDecline:    number;
    coralCoverLoss:       number;
    algaeSurge:           number;
    unknownAlphaRisk:     number; // risk to or from unknown alpha
    unknownBetaRisk:      number;
  };

  // 3rd order — ecosystem outcomes
  thirdOrder: {
    reefCollapseRisk:     number; // 0-100
    extinctionRisk: {
      diadema:    number;
      parrotfish: number;
      coral:      number;
    };
    foodWebStability:     number; // 0-100 (100 = stable)
    unknownSpeciesThreat: number; // 0-100 — risk to unknown species niches
    legalExposureScore:   number; // 0-100 — how challengeable this disruption is
  };

  // Projection: 50-year trajectory (deterministic, no random)
  projection: Array<{
    year:        number;
    coralCover:  number;
    algaeCover:  number;
    stability:   number;
    upperBound:  number;
    lowerBound:  number;
  }>;
}
```

**Key computation rules:**

`overallAbioticStress` = weighted sum:
  `temperatureDelta * 0.35 + abs(phDelta) * 30 + nitrogenDelta * 0.2 + salinityDelta * 0.15`

`reefCollapseRisk` = `max(0, min(100, overallAbioticStress * 0.6 + algaeSurge * 0.3 + coralCoverLoss * 0.1))`

`legalExposureScore` = `max(0, min(100, unknownSpeciesThreat * 0.5 + reefCollapseRisk * 0.3 + unknownAlphaRisk * 0.2))`
(This is the key metric for EIA challenges — high legal exposure = strong grounds to contest the project)

`unknownSpeciesThreat` = 0 if `areUnknownSpeciesDiscovered` is false, otherwise:
  `min(100, unknownAlphaRisk * 0.6 + unknownBetaRisk * 0.4)`

The projection array must be deterministic. Compute decay rates from `overallAbioticStress`
and `legalExposureScore`. No `Math.random()`.

### 6.3 Cascade Display Component

Replace `ImpactSimulationChart.tsx` entirely. Rename it to `CascadeImpactPanel.tsx`.

This component renders:

**Tab 1 — Cascade View (default)**
Three horizontal sections labeled "1st Order", "2nd Order", "3rd Order".
Each section shows its metrics as labeled progress bars or a small bar chart using Recharts.
The 3rd order section highlights `legalExposureScore` in red if > 60, amber if > 30.

**Tab 2 — 50-Year Projection**
The existing AreaChart, now using deterministic projection data from `cascadeModel.ts`.
Show three area series: coralCover, algaeCover, and a stability band (upperBound/lowerBound).

**Tab 3 — Impact Summary**
A structured text output that an EIA reviewer could read. Generate this from cascade output:

```
ECOSYSTEM IMPACT ASSESSMENT — [Scenario Name or "Baseline"]
Site: Coral Reef Demonstration Area
Assessment Date: [current year from timeline slider]

FIRST-ORDER ABIOTIC CHANGES
  Temperature delta:  +X.X°C above ambient baseline
  [... other deltas ...]
  Overall abiotic stress index: XX/100

SECOND-ORDER POPULATION IMPACTS
  Diadema (sea urchin): -XX% population from disruption
  [... others ...]
  Predicted unknown species affected: [nicheName if discovered, else "scan not performed"]

THIRD-ORDER ECOSYSTEM OUTCOMES
  Reef collapse risk:      XX/100
  Food web stability:      XX/100
  Unknown species threat:  XX/100
  Legal exposure score:    XX/100 [HIGH/MEDIUM/LOW]

LEGAL CONTEXT
  [scenario.legalContext if active scenario, else "No disruption scenario selected."]

NOTE: Unknown species predictions are derived from niche gap analysis of observed
environmental parameters. Species names and trait values are model estimates, not
confirmed field observations. This output is intended to flag unassessed ecological
risk for further field investigation.
```

### 6.4 Phase 4 Checklist

| # | Task | File(s) | Priority | Done |
|---|------|---------|----------|------|
| 4.1 | Create cascadeModel.ts with 3-order computation and projection | src/engine/cascadeModel.ts (new) | CRITICAL | ☐ |
| 4.2 | Define CascadeInput and CascadeOutput types | src/types/cascade.ts (new) | REQUIRED | ☐ |
| 4.3 | Rebuild ImpactSimulationChart as CascadeImpactPanel with 3 tabs | src/components/dashboard/CascadeImpactPanel.tsx | CRITICAL | ☐ |
| 4.4 | Update DashboardPage.tsx to import CascadeImpactPanel | DashboardPage.tsx | REQUIRED | ☐ |
| 4.5 | Cascade View tab: render 1st/2nd/3rd order metrics as labeled bars | CascadeImpactPanel.tsx | REQUIRED | ☐ |
| 4.6 | Projection tab: use deterministic cascadeModel projection data | CascadeImpactPanel.tsx | REQUIRED | ☐ |
| 4.7 | Impact Summary tab: render structured text report | CascadeImpactPanel.tsx | REQUIRED | ☐ |
| 4.8 | legalExposureScore highlighted red > 60, amber > 30, green <= 30 | CascadeImpactPanel.tsx | REQUIRED | ☐ |
| 4.9 | unknownSpeciesThreat = 0 when species not yet discovered | cascadeModel.ts | CRITICAL | ☐ |
| 4.10 | Verify cascadeModel.ts has zero store imports (pure function) | Code review | REQUIRED | ☐ |
| 4.11 | Verify no Math.random() in cascadeModel.ts or CascadeImpactPanel.tsx | Code review | CRITICAL | ☐ |
| 4.12 | Verify legalExposureScore increases when unknown species are discovered | Manual test | CRITICAL | ☐ |
| 4.13 | Verify Impact Summary renders scenario legalContext when scenario active | Manual test | REQUIRED | ☐ |

**Phase 4 is complete when:**
- The three-tab panel renders without errors
- Applying Thermal Discharge → running scan → viewing Cascade tab shows non-zero values at all three orders
- legalExposureScore is higher after unknown species are discovered than before
- Impact Summary tab produces readable text that changes when scenario changes
- Zero TypeScript errors

---

## 7. Global Rules for AI Agents Executing This Plan

These rules apply across all phases and must never be violated.

**Rule 1 — No Math.random() in simulation code.**
Simulation outputs must be deterministic. `Math.random()` is permitted only in visual-only
effects (e.g. initial positions of animated dots in `SimulationViewMap.tsx`). Any ecological
metric, projection value, or score must be computable identically given the same inputs.

**Rule 2 — Engine files are pure functions.**
`src/engine/nichePredictor.ts` and `src/engine/cascadeModel.ts` must not import from
`src/store/simulationStore.ts`. They take inputs as plain function arguments and return
plain objects. No React hooks, no Zustand access, no side effects.

**Rule 3 — Unknown species always add risk, never remove it.**
No ecological variable (coral health, diadema health, food web stability) should improve
as a direct result of `areUnknownSpeciesDiscovered` becoming true. Unknown species represent
unmodeled risk, not beneficial discovery.

**Rule 4 — TypeScript must compile clean at every phase boundary.**
Run `npx tsc --noEmit` before marking any phase complete. Zero errors required. Warnings
are acceptable but must be documented.

**Rule 5 — Do not remove existing UI that works.**
`SpeciesMindMap`, `SimulationViewMap`, and `DetailsSidebar` parameter controls are
functional and should not be removed or replaced — only extended.

**Rule 6 — legalExposureScore must be the product's hero metric.**
Every design decision about what to show prominently should favor surfacing
`legalExposureScore`. This is the number a regulator or NGO cares about most.
It should be the largest, most prominent number in the UI when a disruption scenario
is active and unknown species have been discovered.

**Rule 7 — The "scan" must depend on disruption scenario context.**
Running the niche scan without an active disruption scenario should either be disabled
or produce no unknown species (all rules will fail at default parameter values by design).
This forces the correct workflow: select scenario → observe parameter changes → run scan → see cascade.

---

## 8. Master Checklist (All Phases)

### Phase 1 — Foundation
- ☐ 1.1 Remove Math.random() from ImpactSimulationChart; add upper/mid/lower bands
- ☐ 1.2 Flip unknown species impact direction to negative/neutral
- ☐ 1.3 Add metrics caching to getEcosystemMetrics
- ☐ 1.4 Reset unknown species initial values; add nicheName + triggerCondition fields

### Phase 2 — Disruption Scenario
- ☐ 2.1 Create DisruptionScenario type
- ☐ 2.2 Create 5 built-in disruption scenarios
- ☐ 2.3 Add activeScenario, baselineSnapshot, applyDisruption, clearDisruption to store
- ☐ 2.4 Create DisruptionPanel component
- ☐ 2.5 Lock sliders + show delta labels when scenario active
- ☐ 2.6 Add scenario badge to Navbar
- ☐ 2.7 Verify applyDisruption clamps to valid ranges
- ☐ 2.8 Verify clearDisruption restores exact baseline

### Phase 3 — Niche Prediction Engine
- ☐ 3.1 Create nichePredictor.ts with 5 rules
- ☐ 3.2 Define NichePrediction types
- ☐ 3.3 Add runNichePrediction to store
- ☐ 3.4 Connect scan button to runNichePrediction
- ☐ 3.5 Show nicheName and triggerCondition in sidebar
- ☐ 3.6 Show "no niche detected" message on failed scan
- ☐ 3.7 Update ReactFlow node labels to nicheName
- ☐ 3.8 Thermal discharge triggers Niche Rule 1
- ☐ 3.9 Chemical pollutant triggers Niche Rule 2
- ☐ 3.10 Different scenarios → different unknown species
- ☐ 3.11 nichePredictor.ts has zero store imports

### Phase 4 — Cascade Model & Output
- ☐ 4.1 Create cascadeModel.ts with 3-order computation
- ☐ 4.2 Define CascadeInput and CascadeOutput types
- ☐ 4.3 Rebuild chart as CascadeImpactPanel with 3 tabs
- ☐ 4.4 Update DashboardPage to use CascadeImpactPanel
- ☐ 4.5 Cascade tab: 1st/2nd/3rd order metric bars
- ☐ 4.6 Projection tab: deterministic data from cascadeModel
- ☐ 4.7 Impact Summary tab: structured text report
- ☐ 4.8 legalExposureScore color coding (red/amber/green)
- ☐ 4.9 unknownSpeciesThreat = 0 before species discovered
- ☐ 4.10 cascadeModel.ts has zero store imports
- ☐ 4.11 No Math.random() in engine or panel files
- ☐ 4.12 legalExposureScore higher after unknown species discovered
- ☐ 4.13 Impact Summary shows scenario legalContext when active

### Final Validation
- ☐ `npx tsc --noEmit` — zero errors
- ☐ Full user flow works: land → go to dashboard → select scenario → apply → scan → view cascade → read impact summary
- ☐ Two different scenarios produce two different unknown species
- ☐ legalExposureScore is visually prominent and changes meaningfully across scenarios
- ☐ No simulation metric improves solely from discovering unknown species
- ☐ No Math.random() in any file under src/engine/ or src/store/

---

*End of EcoPredict Improvement Plan v1.0*