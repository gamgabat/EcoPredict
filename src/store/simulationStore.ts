import { create } from 'zustand';

interface SimulationState {
  temperature: number;
  humidity: number;
  phLevel: number;
  salinity: number;
  setTemperature: (val: number) => void;
  setHumidity: (val: number) => void;
  setPhLevel: (val: number) => void;
  setSalinity: (val: number) => void;
}

export const useSimulationStore = create<SimulationState>((set) => ({
  temperature: 24, // Celsius
  humidity: 60, // Percentage
  phLevel: 7.2, // Neutral-ish
  salinity: 35, // ppt (parts per thousand) typical ocean
  setTemperature: (val) => set({ temperature: val }),
  setHumidity: (val) => set({ humidity: val }),
  setPhLevel: (val) => set({ phLevel: val }),
  setSalinity: (val) => set({ salinity: val }),
}));
