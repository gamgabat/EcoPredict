export interface UnknownSpeciesAlpha {
  nicheName: string;
  predationStrength: number;
  competitionWithCoral: number;
  populationEstimate: number;
  triggerCondition: string;
}

export interface UnknownSpeciesBeta {
  nicheName: string;
  diseaseResistance: number;
  nutrientUptake: number;
  populationEstimate: number;
  triggerCondition: string;
}

export interface NichePredictionInput {
  temperature: number;
  phLevel: number;
  salinity: number;
  nitrogenLoading: number;
  scltdOutbreakRisk: number;
  lionfishPresence: number;
  parrotfishPopulation: number;
  diademaPopulation: number;
}

export interface NichePredictionOutput {
  alphaDiscovered: boolean;
  betaDiscovered: boolean;
  alpha: UnknownSpeciesAlpha | null;
  beta: UnknownSpeciesBeta | null;
  alphaRule: string; // which rule triggered, or 'none'
  betaRule: string;
}
