import { useSimulationStore } from "@/store/simulationStore";
import { Thermometer, Droplets, FlaskConical, Waves } from "lucide-react";

export default function EnvironmentalControls() {
  const { 
    temperature, setTemperature,
    humidity, setHumidity,
    phLevel, setPhLevel,
    salinity, setSalinity
  } = useSimulationStore();

  return (
    <div className="flex flex-col gap-6 bg-bgCard border border-border rounded-xl p-5 shadow-lg">
      <h2 className="text-lg font-bold text-textMain border-b border-border pb-3">
        Environmental Parameters
      </h2>

      {/* Temperature */}
      <div className="flex flex-col gap-2">
        <label className="flex items-center justify-between text-sm text-textMuted font-medium">
          <span className="flex items-center gap-2"><Thermometer className="w-4 h-4 text-accent" /> Temperature</span>
          <span className="text-textMain">{temperature}°C</span>
        </label>
        <input 
          type="range" min="0" max="50" step="1" 
          value={temperature}
          onChange={(e) => setTemperature(parseFloat(e.target.value))}
          className="w-full accent-accent cursor-pointer"
        />
      </div>

      {/* Humidity */}
      <div className="flex flex-col gap-2">
        <label className="flex items-center justify-between text-sm text-textMuted font-medium">
          <span className="flex items-center gap-2"><Droplets className="w-4 h-4 text-primary" /> Humidity</span>
          <span className="text-textMain">{humidity}%</span>
        </label>
        <input 
          type="range" min="0" max="100" step="1" 
          value={humidity}
          onChange={(e) => setHumidity(parseFloat(e.target.value))}
          className="w-full accent-primary cursor-pointer"
        />
      </div>

      {/* pH Level */}
      <div className="flex flex-col gap-2">
        <label className="flex items-center justify-between text-sm text-textMuted font-medium">
          <span className="flex items-center gap-2"><FlaskConical className="w-4 h-4 text-success" /> pH Level</span>
          <span className="text-textMain">{phLevel.toFixed(1)}</span>
        </label>
        <input 
          type="range" min="0" max="14" step="0.1" 
          value={phLevel}
          onChange={(e) => setPhLevel(parseFloat(e.target.value))}
          className="w-full accent-success cursor-pointer"
        />
      </div>

      {/* Salinity */}
      <div className="flex flex-col gap-2">
        <label className="flex items-center justify-between text-sm text-textMuted font-medium">
          <span className="flex items-center gap-2"><Waves className="w-4 h-4 text-secondary" /> Salinity</span>
          <span className="text-textMain">{salinity} ppt</span>
        </label>
        <input 
          type="range" min="0" max="50" step="1" 
          value={salinity}
          onChange={(e) => setSalinity(parseFloat(e.target.value))}
          className="w-full accent-secondary cursor-pointer"
        />
      </div>
    </div>
  );
}
