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
  parrotfishPopulation: number;  // 0-100
  grouperPopulation: number;     // 0-100
  lionfishPresence: number;      // 0-100 (invasive)

  // --- Unknown Species (AI-predicted) ---
  areUnknownSpeciesDiscovered: boolean;
  unknownSpeciesAlpha: { predationStrength: number; competitionWithCoral: number; populationEstimate: number; };
  unknownSpeciesBeta: { diseaseResistance: number; nutrientUptake: number; populationEstimate: number; };

  // --- Selected Node (for Details pane) ---
  selectedNodeId: string | null;

  // --- Discovery scanning state ---
  isScanning: boolean;

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
  setParrotfishPopulation: (val: number) => void;
  setGrouperPopulation: (val: number) => void;
  setLionfishPresence: (val: number) => void;
  setUnknownSpeciesDiscovered: (val: boolean) => void;
  setUnknownSpeciesAlpha: (val: Partial<SimulationState['unknownSpeciesAlpha']>) => void;
  setUnknownSpeciesBeta: (val: Partial<SimulationState['unknownSpeciesBeta']>) => void;
  setSelectedNodeId: (id: string | null) => void;
  setIsScanning: (val: boolean) => void;

  getEcosystemMetrics: () => {
    diademaHealth: number;
    algaeCover: number;
    coralHealth: number;
    bleachingRisk: number;
    parrotfishHealth: number;
    surgeonFishHealth: number;
    grouperHealth: number;
    lionfishDanger: number;
    damselFishActivity: number;
    zooplanktonDensity: number;
    spongeCompetition: number;
    unknownAlphaEffect: number;
    unknownBetaEffect: number;
  };

  getCoralResilienceMetrics: () => {
    /** 0–100 final resilience score for each species */
    porites: number;
    siderastrea: number;
    montastraea: number;
    /** The shared environmental condition score (0–1) */
    envScore: number;
    /** Individual factor scores (0–1) for display */
    factors: {
      temperature: number;
      scltd: number;
      nitrogen: number;
      ph: number;
      salinity: number;
    };
  };
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
  parrotfishPopulation: 65,
  grouperPopulation: 50,
  lionfishPresence: 10,

  areUnknownSpeciesDiscovered: false,
  unknownSpeciesAlpha: { predationStrength: 20, competitionWithCoral: 10, populationEstimate: 30 },
  unknownSpeciesBeta: { diseaseResistance: 20, nutrientUptake: 40, populationEstimate: 45 },
  selectedNodeId: null,
  isScanning: false,

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
  setParrotfishPopulation: (val) => set({ parrotfishPopulation: val }),
  setGrouperPopulation: (val) => set({ grouperPopulation: val }),
  setLionfishPresence: (val) => set({ lionfishPresence: val }),
  setUnknownSpeciesDiscovered: (val) => set({ areUnknownSpeciesDiscovered: val }),
  setUnknownSpeciesAlpha: (val) => set((state) => ({ unknownSpeciesAlpha: { ...state.unknownSpeciesAlpha, ...val } })),
  setUnknownSpeciesBeta: (val) => set((state) => ({ unknownSpeciesBeta: { ...state.unknownSpeciesBeta, ...val } })),
  setSelectedNodeId: (id) => set({ selectedNodeId: id }),
  setIsScanning: (val) => set({ isScanning: val }),

  getEcosystemMetrics: () => {
    const { temperature, phLevel, nitrogenLoading, scltdOutbreakRisk, currentYear,
            diademaPopulation, algaeGrowthRate, coralResilience,
            parrotfishPopulation, grouperPopulation, lionfishPresence,
            unknownSpeciesAlpha, unknownSpeciesBeta, areUnknownSpeciesDiscovered } = get();

    const yearsPassed = currentYear - 2024;
    const timeDecayFactor = yearsPassed * 0.5;

    const betaDiseaseResistance = areUnknownSpeciesDiscovered ? unknownSpeciesBeta.diseaseResistance : 0;
    const betaNutrientUptake = areUnknownSpeciesDiscovered ? unknownSpeciesBeta.nutrientUptake : 0;
    const effectiveScltd = Math.max(0, scltdOutbreakRisk - (betaDiseaseResistance * 0.5));
    const effectiveNitrogen = Math.max(0, nitrogenLoading - (betaNutrientUptake * 0.8));

    // 1. Bleaching Risk
    let bleachingRisk = 0;
    if (temperature > 29) {
      bleachingRisk = Math.max(0, Math.min(100, ((temperature - 29) * 30) - (coralResilience * 0.2) + (timeDecayFactor * 0.5)));
    }

    // 2. Diadema health
    let diademaHealth = diademaPopulation - effectiveScltd - (effectiveScltd > 20 ? timeDecayFactor * 2 : timeDecayFactor * 0.2);
    diademaHealth = Math.max(0, diademaHealth);

    // 3. New fish metrics
    let parrotfishHealth = parrotfishPopulation - (lionfishPresence * 0.5) - (grouperPopulation * 0.06);
    parrotfishHealth = Math.max(0, Math.min(100, parrotfishHealth));

    let surgeonFishHealth = 70 - (lionfishPresence * 0.4) - (temperature > 30 ? (temperature - 30) * 8 : 0);
    surgeonFishHealth = Math.max(0, Math.min(100, surgeonFishHealth));

    let grouperHealth = grouperPopulation - (temperature > 29 ? (temperature - 29) * 7 : 0) - (lionfishPresence * 0.15);
    grouperHealth = Math.max(0, Math.min(100, grouperHealth));

    const lionfishDanger = Math.min(100, lionfishPresence);

    // 4. Algae Cover (parrotfish + surgeonfish help graze)
    const alphaPredationStrength = areUnknownSpeciesDiscovered ? unknownSpeciesAlpha.predationStrength : 0;
    const herbivoreGrazing = ((100 - diademaHealth) * 0.3) + (parrotfishHealth * 0.15) + (surgeonFishHealth * 0.12);
    let algaeCover = (algaeGrowthRate * 0.2) + (effectiveNitrogen * 0.5) - herbivoreGrazing - (alphaPredationStrength * 0.3);
    if (algaeCover > 40) algaeCover += timeDecayFactor;
    algaeCover = Math.max(0, Math.min(100, algaeCover));

    // 5. Derived from algae: damselfish love high-algae zones
    let damselFishActivity = Math.min(100, algaeCover * 0.8 + 15);

    // 6. Zooplankton density (bleaching events kill zooxanthellae hosts)
    let zooplanktonDensity = 85 - (bleachingRisk * 0.5) - (effectiveNitrogen * 0.2);
    zooplanktonDensity = Math.max(0, Math.min(100, zooplanktonDensity));

    // 7. Coral Health
    const phStress = phLevel < 7.9 ? (7.9 - phLevel) * 100 : 0;
    const alphaCompetition = areUnknownSpeciesDiscovered ? unknownSpeciesAlpha.competitionWithCoral : 0;
    let coralHealth = 100 + (coralResilience * 0.2) + (zooplanktonDensity * 0.05)
      - bleachingRisk - (algaeCover * 0.5) - effectiveScltd - phStress
      - (alphaCompetition * 0.4) - (parrotfishHealth * 0.03);
    coralHealth = Math.max(0, Math.min(100, coralHealth - timeDecayFactor * ((100 - coralHealth) / 100)));

    // 8. Sponge competition (thrive when corals are stressed + nitrogen high)
    let spongeCompetition = 20 + (effectiveNitrogen * 0.3) + (Math.max(0, 60 - coralHealth) * 0.4);
    spongeCompetition = Math.max(0, Math.min(100, spongeCompetition));

    // 9. Unknown species effectiveness (how much they're actually helping/hurting)
    // Alpha: grazes algae → effectiveness scales with current algae problem
    const unknownAlphaEffect = areUnknownSpeciesDiscovered
      ? Math.min(100, (unknownSpeciesAlpha.predationStrength * (algaeCover / 100)) * 1.5 + unknownSpeciesAlpha.populationEstimate * 0.3)
      : 0;

    // Beta: fights disease + nitrogen → effectiveness scales with current threat level
    const unknownBetaEffect = areUnknownSpeciesDiscovered
      ? Math.min(100, (unknownSpeciesBeta.diseaseResistance * (effectiveScltd / 100)) * 1.2 + (unknownSpeciesBeta.nutrientUptake * (effectiveNitrogen / 100)) * 0.8 + unknownSpeciesBeta.populationEstimate * 0.3)
      : 0;

    return {
      diademaHealth, algaeCover, coralHealth, bleachingRisk,
      parrotfishHealth, surgeonFishHealth, grouperHealth, lionfishDanger,
      damselFishActivity, zooplanktonDensity, spongeCompetition,
      unknownAlphaEffect, unknownBetaEffect,
    };
  },

  getCoralResilienceMetrics: () => {
    const { temperature, phLevel, salinity, nitrogenLoading, scltdOutbreakRisk } = get();

    // ── Baseline resiliences (under optimal conditions) ───────────────────────
    // Porites astreoides  : 78% — tolerates sedimentation, turbidity, light var.
    //                             but susceptible to SCLTD
    // Siderastrea siderea : 63% — massive, long-lived, but susceptible to
    //                             temperature stress and disease
    // Montastraea cavernosa: 40% — highly susceptible to SCLTD; sensitive to
    //                              nitrogen and pH changes
    const BASELINE = { porites: 78, siderastrea: 63, montastraea: 40 };

    // ── Environmental factor scores (0–1) ─────────────────────────────────────
    // Temperature: optimal 23–28°C → score 1.0; degrades above/below
    let tempScore: number;
    if (temperature <= 23) {
      tempScore = Math.max(0, 1 - (23 - temperature) * 0.15);
    } else if (temperature <= 28) {
      tempScore = 1.0;
    } else if (temperature <= 29) {
      tempScore = 1.0 - (temperature - 28) * 0.2;
    } else {
      tempScore = Math.max(0, 0.8 - (temperature - 29) * 0.25);
    }

    // SCLTD: 0% → 1.0, 16% → 0.80, 50% → 0.50, 100% → 0.0
    const scltdScore = Math.max(0, 1 - scltdOutbreakRisk / 100);

    // Nitrogen: 0% → 1.0, 52% → 0.60, 100% → 0.20
    const nitrogenScore = Math.max(0, 1 - (nitrogenLoading / 100) * 0.8);

    // pH: 8.1–8.3 optimal → 1.0; 7.5 → ~0.55; below 7.0 → 0
    let phScore: number;
    if (phLevel >= 8.1) {
      phScore = Math.max(0, 1 - (phLevel - 8.3) * 0.5); // above 8.3 → slight drop
    } else if (phLevel >= 7.9) {
      phScore = 1.0 - (8.1 - phLevel) * 0.3;
    } else {
      phScore = Math.max(0, 0.94 - (7.9 - phLevel) * 1.3);
    }
    phScore = Math.max(0, Math.min(1, phScore));

    // Salinity: 34–36 ppt optimal → 1.0; outside range → drops
    let salinityScore: number;
    if (salinity >= 34 && salinity <= 36) {
      salinityScore = 1.0;
    } else if (salinity < 34) {
      salinityScore = Math.max(0, 1 - (34 - salinity) * 0.1);
    } else {
      salinityScore = Math.max(0, 1 - (salinity - 36) * 0.1);
    }

    // ── Combined environmental condition score ────────────────────────────────
    const envScore = tempScore * scltdScore * nitrogenScore * phScore * salinityScore;

    // ── Final resilience per species ──────────────────────────────────────────
    const porites     = BASELINE.porites     * envScore;
    const siderastrea = BASELINE.siderastrea * envScore;
    const montastraea = BASELINE.montastraea * envScore;

    return {
      porites,
      siderastrea,
      montastraea,
      envScore,
      factors: {
        temperature: tempScore,
        scltd:       scltdScore,
        nitrogen:    nitrogenScore,
        ph:          phScore,
        salinity:    salinityScore,
      },
    };
  },
}));
