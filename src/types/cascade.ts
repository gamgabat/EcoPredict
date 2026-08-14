import { DisruptionScenario } from './disruption';

export interface CascadeInput {
  temperature: number;
  phLevel: number;
  salinity: number;
  nitrogenLoading: number;
  scltdOutbreakRisk: number;
  currentYear: number;
  diademaPopulation: number;
  parrotfishPopulation: number;
  grouperPopulation: number;
  lionfishPresence: number;
  areUnknownSpeciesDiscovered: boolean;
  unknownAlphaRisk: number; // passed from simulationStore unknownAlphaEffect
  unknownBetaRisk: number; // passed from simulationStore unknownBetaEffect
  activeScenario: DisruptionScenario | null;
  baselineSnapshot: Record<string, number> | null;
  algaeCover: number;
  coralHealth: number;
}

export interface CascadeOutput {
  // 1st order — abiotic changes from disruption
  firstOrder: {
    temperatureDelta: number; // degrees C change from baseline
    salinityDelta: number;
    phDelta: number;
    nitrogenDelta: number;
    overallAbioticStress: number; // 0-100 composite
  };

  // 2nd order — population responses
  secondOrder: {
    diademaDecline: number; // % population loss from disruption
    parrotfishDecline: number;
    coralCoverLoss: number;
    algaeSurge: number;
    unknownAlphaRisk: number; // risk to or from unknown alpha
    unknownBetaRisk: number;
  };

  // 3rd order — ecosystem outcomes
  thirdOrder: {
    reefCollapseRisk: number; // 0-100
    extinctionRisk: {
      diadema: number;
      parrotfish: number;
      coral: number;
    };
    foodWebStability: number; // 0-100 (100 = stable)
    unknownSpeciesThreat: number; // 0-100 — risk to unknown species niches
    legalExposureScore: number; // 0-100 — how challengeable this disruption is
  };

  // Projection: 50-year trajectory (deterministic, no random)
  projection: Array<{
    year: number;
    coralCover: number;
    algaeCover: number;
    stability: number;
    upperBound: number;
    lowerBound: number;
  }>;
}
