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
