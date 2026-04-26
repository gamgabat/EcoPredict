import { create } from 'zustand';

interface SimulationState {
  temperature: number; // Celsius, 26-32 typical for reef
  humidity: number; // Optional, might be kept for legacy
  phLevel: number; // 7.0 - 8.5
  salinity: number; // 30-40 ppt
  nitrogenLoading: number; // 0-100%
  scltdOutbreakRisk: number; // 0-100%
  
  currentYear: number; // 2024 to 2074

  // --- Controllable Species Attributes ---
  diademaPopulation: number;
  algaeGrowthRate: number;
  coralResilience: number;

  // --- Unknown Species (AI-predicted) ---
  unknownSpeciesAlpha: { predationStrength: number; competitionWithCoral: number; populationEstimate: number; };
  unknownSpeciesBeta: { diseaseResistance: number; nutrientUptake: number; populationEstimate: number; };

  setTemperature: (val: number) => void;
  setHumidity: (val: number) => void;
  setPhLevel: (val: number) => void;
  setSalinity: (val: number) => void;
  setNitrogenLoading: (val: number) => void;
  setScltdOutbreakRisk: (val: number) => void;
  setCurrentYear: (val: number) => void;
  
  setDiademaPopulation: (val: number) => void;
  setAlgaeGrowthRate: (val: number) => void;
  setCoralResilience: (val: number) => void;
  setUnknownSpeciesAlpha: (val: Partial<SimulationState['unknownSpeciesAlpha']>) => void;
  setUnknownSpeciesBeta: (val: Partial<SimulationState['unknownSpeciesBeta']>) => void;

  getEcosystemMetrics: () => {
    diademaHealth: number; // 0-100
    algaeCover: number; // 0-100
    coralHealth: number; // 0-100
    bleachingRisk: number; // 0-100
  }
}

export const useSimulationStore = create<SimulationState>((set, get) => ({
  temperature: 28, 
  humidity: 60,
  phLevel: 8.1,
  salinity: 35,
  nitrogenLoading: 20,
  scltdOutbreakRisk: 5,
  currentYear: 2024,
  
  diademaPopulation: 100,
  algaeGrowthRate: 50,
  coralResilience: 50,

  unknownSpeciesAlpha: { predationStrength: 20, competitionWithCoral: 10, populationEstimate: 30 },
  unknownSpeciesBeta: { diseaseResistance: 20, nutrientUptake: 40, populationEstimate: 45 },

  setTemperature: (val) => set({ temperature: val }),
  setHumidity: (val) => set({ humidity: val }),
  setPhLevel: (val) => set({ phLevel: val }),
  setSalinity: (val) => set({ salinity: val }),
  setNitrogenLoading: (val) => set({ nitrogenLoading: val }),
  setScltdOutbreakRisk: (val) => set({ scltdOutbreakRisk: val }),
  setCurrentYear: (val) => set({ currentYear: val }),
  
  setDiademaPopulation: (val) => set({ diademaPopulation: val }),
  setAlgaeGrowthRate: (val) => set({ algaeGrowthRate: val }),
  setCoralResilience: (val) => set({ coralResilience: val }),
  setUnknownSpeciesAlpha: (val) => set((state) => ({ unknownSpeciesAlpha: { ...state.unknownSpeciesAlpha, ...val } })),
  setUnknownSpeciesBeta: (val) => set((state) => ({ unknownSpeciesBeta: { ...state.unknownSpeciesBeta, ...val } })),

  getEcosystemMetrics: () => {
    const { temperature, phLevel, nitrogenLoading, scltdOutbreakRisk, currentYear,
            diademaPopulation, algaeGrowthRate, coralResilience,
            unknownSpeciesAlpha, unknownSpeciesBeta } = get();

    const yearsPassed = currentYear - 2024;
    const timeDecayFactor = yearsPassed * 0.5;

    // Dampen SCLTD and Nitrogen based on Beta
    const effectiveScltd = Math.max(0, scltdOutbreakRisk - (unknownSpeciesBeta.diseaseResistance * 0.5));
    const effectiveNitrogen = Math.max(0, nitrogenLoading - (unknownSpeciesBeta.nutrientUptake * 0.8));

    // 1. Bleaching Risk triggered by high temp, modulated by coralResilience
    let bleachingRisk = 0;
    if (temperature > 29) {
      const resilienceBuffer = coralResilience * 0.2;
      bleachingRisk = Math.max(0, Math.min(100, ((temperature - 29) * 30) - resilienceBuffer + (timeDecayFactor * 0.5)));
    }
    
    // 2. Diadema Antillarum Health (Starts from custom baseline)
    let diademaHealth = diademaPopulation - effectiveScltd - (effectiveScltd > 20 ? timeDecayFactor * 2 : timeDecayFactor * 0.2);
    diademaHealth = Math.max(0, diademaHealth);

    // 3. Algae Cover
    // Base growth moderated by Growth Rate slider. Reduced by direct Urchin AND Alpha predation.
    const totalPredation = ((100 - diademaHealth) * 0.4) - (unknownSpeciesAlpha.predationStrength * 0.3);
    let algaeCover = (algaeGrowthRate * 0.2) + (effectiveNitrogen * 0.5) + totalPredation;
    
    if(algaeCover > 40) {
        algaeCover += timeDecayFactor;
    }
    algaeCover = Math.max(0, Math.min(100, algaeCover));

    // 4. Overall Coral Health
    let phStress = phLevel < 7.9 ? (7.9 - phLevel) * 100 : 0;
    let baseHealth = 100 + (coralResilience * 0.2); // Base boost from resilience
    let coralHealth = baseHealth - bleachingRisk - (algaeCover * 0.5) - effectiveScltd - phStress - (unknownSpeciesAlpha.competitionWithCoral * 0.4);
    
    const temporalDegradation = timeDecayFactor * ((100 - coralHealth) / 100);
    coralHealth = Math.max(0, Math.min(100, coralHealth - temporalDegradation));

    return {
      diademaHealth,
      algaeCover,
      coralHealth,
      bleachingRisk
    };
  }
}));
