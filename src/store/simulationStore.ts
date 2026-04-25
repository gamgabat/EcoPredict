import { create } from 'zustand';

interface SimulationState {
  temperature: number; // Celsius, 26-32 typical for reef
  humidity: number; // Optional, might be kept for legacy
  phLevel: number; // 7.0 - 8.5
  salinity: number; // 30-40 ppt
  nitrogenLoading: number; // 0-100%
  scltdOutbreakRisk: number; // 0-100%
  
  currentYear: number; // 2024 to 2074

  setTemperature: (val: number) => void;
  setHumidity: (val: number) => void;
  setPhLevel: (val: number) => void;
  setSalinity: (val: number) => void;
  setNitrogenLoading: (val: number) => void;
  setScltdOutbreakRisk: (val: number) => void;
  setCurrentYear: (val: number) => void;

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

  setTemperature: (val) => set({ temperature: val }),
  setHumidity: (val) => set({ humidity: val }),
  setPhLevel: (val) => set({ phLevel: val }),
  setSalinity: (val) => set({ salinity: val }),
  setNitrogenLoading: (val) => set({ nitrogenLoading: val }),
  setScltdOutbreakRisk: (val) => set({ scltdOutbreakRisk: val }),
  setCurrentYear: (val) => set({ currentYear: val }),

  getEcosystemMetrics: () => {
    const { temperature, phLevel, nitrogenLoading, scltdOutbreakRisk, currentYear } = get();

    // The decay factor models how time amplifies existing stressors.
    // 0 years passed = 0 decay amplification. 50 years = up to 50x decay multiplier.
    const yearsPassed = currentYear - 2024;
    const timeDecayFactor = yearsPassed * 0.5;

    // 1. Bleaching Risk triggered by high temp, worsens over time
    let bleachingRisk = 0;
    if (temperature > 29) {
      bleachingRisk = Math.min(100, ((temperature - 29) * 30) + (timeDecayFactor * 0.5));
    }
    
    // 2. Diadema Antillarum Health
    // Hurt severely by SCLTD-like pathogens or general stress over time
    // If outbreak is high, time kills them off steadily.
    let diademaHealth = 100 - scltdOutbreakRisk - (scltdOutbreakRisk > 20 ? timeDecayFactor * 2 : timeDecayFactor * 0.2);
    diademaHealth = Math.max(0, diademaHealth);

    // 3. Algae Cover
    // Increases significantly if Diadema dies (missing herbivore buffer) AND Nitrogen is high
    let algaeCover = 10 + (nitrogenLoading * 0.5) + ((100 - diademaHealth) * 0.4);
    // Over time, if algae has hold, it blooms exponentially
    if(algaeCover > 40) {
        algaeCover += timeDecayFactor;
    }
    algaeCover = Math.min(100, algaeCover);

    // 4. Overall Coral Health (Porites, Montastraea, Siderastrea average)
    // Hurt by bleaching, high algae cover (smothering), and acidic pH
    let phStress = phLevel < 7.9 ? (7.9 - phLevel) * 100 : 0;
    let coralHealth = 100 - bleachingRisk - (algaeCover * 0.5) - scltdOutbreakRisk - phStress;
    
    // Gradual time degradation specifically mapped to the base health
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
