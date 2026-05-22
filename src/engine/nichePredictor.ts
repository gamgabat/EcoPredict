import { NichePredictionInput, NichePredictionOutput, UnknownSpeciesAlpha, UnknownSpeciesBeta } from '../types/niche';

export function runNichePrediction(params: NichePredictionInput): NichePredictionOutput {
  const { temperature, phLevel, salinity, nitrogenLoading, scltdOutbreakRisk, lionfishPresence, parrotfishPopulation, diademaPopulation } = params;

  let alpha: UnknownSpeciesAlpha | null = null;
  let alphaRule = 'none';

  // Rule 1 — Thermophilic Algal Competitor
  if (temperature >= 30 && nitrogenLoading >= 50) {
    alpha = {
      nicheName: "Thermophilic Algal Competitor",
      predationStrength: 5,
      competitionWithCoral: 10 + (temperature - 30) * 8 + (nitrogenLoading - 50) * 0.3,
      populationEstimate: 20 + (nitrogenLoading - 50) * 0.8,
      triggerCondition: "Elevated temperature + nitrogen loading exceeds competitive threshold"
    };
    alphaRule = 'Rule 1';
  } 
  // Rule 2 — Anaerobic Microbial Mat
  else if (phLevel <= 7.8 && nitrogenLoading >= 40) {
    alpha = {
      nicheName: "Anaerobic Microbial Mat",
      predationStrength: 0,
      competitionWithCoral: 5 + (7.8 - phLevel) * 20,
      populationEstimate: 30 + nitrogenLoading * 0.4,
      triggerCondition: "pH depression combined with eutrophication creates anoxic substrate niche"
    };
    alphaRule = 'Rule 2';
  }
  // Rule 3 — Cryptic Predatory Polychaete
  else if (lionfishPresence >= 50 && parrotfishPopulation <= 30) {
    alpha = {
      nicheName: "Cryptic Predatory Polychaete",
      predationStrength: 15 + (lionfishPresence - 50) * 0.4,
      competitionWithCoral: 8,
      populationEstimate: 25 + (50 - parrotfishPopulation) * 0.3,
      triggerCondition: "Disrupted herbivore guild creates invertebrate predation niche"
    };
    alphaRule = 'Rule 3';
  }

  let beta: UnknownSpeciesBeta | null = null;
  let betaRule = 'none';

  // Rule 4 — Disease-Amplifying Echinoderm
  if (scltdOutbreakRisk >= 40 && diademaPopulation <= 30) {
    beta = {
      nicheName: "Disease-Amplifying Echinoderm",
      diseaseResistance: 80,
      nutrientUptake: 10,
      populationEstimate: 20 + scltdOutbreakRisk * 0.3,
      triggerCondition: "SCLTD outbreak risk with collapsed urchin density favors disease-resistant echinoderm"
    };
    betaRule = 'Rule 4';
  }
  // Rule 5 — Sediment-Tolerant Biofilm Producer
  else if (salinity >= 38 || salinity <= 30) {
    beta = {
      nicheName: "Sediment-Tolerant Biofilm Producer",
      diseaseResistance: 20,
      nutrientUptake: 30,
      populationEstimate: 15 + Math.abs(35 - salinity) * 4,
      triggerCondition: "Salinity deviation beyond reef tolerance opens benthic biofilm niche"
    };
    betaRule = 'Rule 5';
  }

  return {
    alphaDiscovered: alpha !== null,
    betaDiscovered: beta !== null,
    alpha,
    beta,
    alphaRule,
    betaRule
  };
}
