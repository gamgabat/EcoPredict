import { DisruptionScenario } from '../types/disruption';

export const disruptionScenarios: DisruptionScenario[] = [
  {
    id: 'thermal_discharge',
    name: 'Thermal Discharge',
    description: 'Power Plant Cooling',
    category: 'thermal',
    parameterDeltas: {
      temperature: 3.5,
      salinity: 1.5
    },
    legalContext: 'Implicates Section 316(a) of the Clean Water Act thermal variance provisions.'
  },
  {
    id: 'chemical_pollutant',
    name: 'Chemical Pollutant',
    description: 'Industrial Runoff',
    category: 'chemical',
    parameterDeltas: {
      nitrogenLoading: 35,
      phLevel: -0.3,
      scltdOutbreakRisk: 25
    },
    legalContext: 'Implicates MARPOL Annex V and regional EIS marine discharge thresholds.'
  },
  {
    id: 'dredging_operation',
    name: 'Dredging Operation',
    description: 'Physical displacement and turbidity',
    category: 'physical',
    parameterDeltas: {
      salinity: 3,
      nitrogenLoading: 20,
      scltdOutbreakRisk: 15,
      phLevel: -0.15
    },
    legalContext: 'Implicates Section 404 of the Clean Water Act and NEPA EIS requirements.'
  },
  {
    id: 'water_intake',
    name: 'Water Intake Structure',
    description: 'Impingement and entrainment',
    category: 'physical',
    parameterDeltas: {
      temperature: 1.5,
      salinity: 2,
      scltdOutbreakRisk: 10
    },
    legalContext: 'Implicates Section 316(b) of the Clean Water Act (impingement/entrainment).'
  },
  {
    id: 'aquaculture_discharge',
    name: 'Aquaculture Discharge',
    description: 'Nutrient and biological loading',
    category: 'biological',
    parameterDeltas: {
      nitrogenLoading: 45,
      scltdOutbreakRisk: 30,
      phLevel: -0.2
    },
    legalContext: 'Implicates EPA effluent guidelines for Concentrated Aquatic Animal Production.'
  }
];
