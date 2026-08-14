import { CascadeInput, CascadeOutput } from '../types/cascade';

export function computeCascade(params: CascadeInput): CascadeOutput {
  const {
    temperature,
    phLevel,
    salinity,
    nitrogenLoading,
    scltdOutbreakRisk,
    currentYear,
    areUnknownSpeciesDiscovered,
    unknownAlphaRisk,
    unknownBetaRisk,
    activeScenario,
    baselineSnapshot,
    algaeCover,
    coralHealth,
  } = params;

  // 1. Calculate Deltas
  const tempDelta =
    activeScenario && baselineSnapshot ? temperature - baselineSnapshot.temperature : 0;
  const salDelta = activeScenario && baselineSnapshot ? salinity - baselineSnapshot.salinity : 0;
  const phDelta = activeScenario && baselineSnapshot ? phLevel - baselineSnapshot.phLevel : 0;
  const nitDelta =
    activeScenario && baselineSnapshot ? nitrogenLoading - baselineSnapshot.nitrogenLoading : 0;

  // 2. 1st Order: Abiotic Stress
  const overallAbioticStress = Math.min(
    100,
    Math.max(
      0,
      Math.abs(tempDelta) * 10 +
        Math.abs(phDelta) * 30 +
        Math.abs(nitDelta) * 0.2 +
        Math.abs(salDelta) * 1.5,
    ),
  );

  // 3. 2nd Order: Population Responses
  const diademaDecline = Math.min(
    100,
    Math.max(0, overallAbioticStress * 0.5 + scltdOutbreakRisk * 0.4),
  );
  const parrotfishDecline = Math.min(100, Math.max(0, overallAbioticStress * 0.3 + tempDelta * 5));
  const coralCoverLoss = Math.min(
    100,
    Math.max(0, overallAbioticStress * 0.7 + (100 - coralHealth) * 0.2),
  );
  const algaeSurge = Math.min(100, Math.max(0, nitDelta * 0.8 + overallAbioticStress * 0.2));

  // 4. 3rd Order: Ecosystem Outcomes
  const reefCollapseRisk = Math.max(
    0,
    Math.min(100, overallAbioticStress * 0.6 + algaeSurge * 0.3 + coralCoverLoss * 0.1),
  );

  const unknownSpeciesThreat = areUnknownSpeciesDiscovered
    ? Math.min(100, unknownAlphaRisk * 0.6 + unknownBetaRisk * 0.4)
    : 0;

  const legalExposureScore = Math.max(
    0,
    Math.min(100, unknownSpeciesThreat * 0.5 + reefCollapseRisk * 0.3 + unknownAlphaRisk * 0.2),
  );

  const foodWebStability = Math.max(
    0,
    100 - (reefCollapseRisk * 0.5 + diademaDecline * 0.3 + parrotfishDecline * 0.2),
  );

  const extinctionRisk = {
    diadema: Math.min(100, diademaDecline * 1.2),
    parrotfish: Math.min(100, parrotfishDecline * 1.2),
    coral: Math.min(100, coralCoverLoss * 1.2),
  };

  // 5. Projection: 50-Year Trajectory
  const projection = [];
  const baseDecayRate = overallAbioticStress * 0.05 + legalExposureScore * 0.02;

  for (let i = 0; i <= 50; i += 5) {
    const decay = i * baseDecayRate;
    const projectedCoral = Math.max(0, Math.min(100, coralHealth - decay));
    const projectedAlgae = Math.max(0, Math.min(100, algaeCover + decay * 0.5));

    // Stability metric with deterministic bounds based on abiotic stress
    const stabilityBase = Math.max(0, Math.min(100, foodWebStability - decay * 0.8));
    const variance = (overallAbioticStress + unknownSpeciesThreat) * 0.2; // Higher stress = wider bounds

    const upperBound = Math.min(100, stabilityBase + variance);
    const lowerBound = Math.max(0, stabilityBase - variance);
    const stabilityMid = (upperBound + lowerBound) / 2;

    projection.push({
      year: currentYear + i,
      coralCover: projectedCoral,
      algaeCover: projectedAlgae,
      stability: stabilityMid,
      upperBound,
      lowerBound,
    });
  }

  return {
    firstOrder: {
      temperatureDelta: tempDelta,
      salinityDelta: salDelta,
      phDelta: phDelta,
      nitrogenDelta: nitDelta,
      overallAbioticStress,
    },
    secondOrder: {
      diademaDecline,
      parrotfishDecline,
      coralCoverLoss,
      algaeSurge,
      unknownAlphaRisk,
      unknownBetaRisk,
    },
    thirdOrder: {
      reefCollapseRisk,
      extinctionRisk,
      foodWebStability,
      unknownSpeciesThreat,
      legalExposureScore,
    },
    projection,
  };
}
