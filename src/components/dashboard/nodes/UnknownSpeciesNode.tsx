import { Handle, Position } from 'reactflow';
import { useSimulationStore } from '@/store/simulationStore';

interface UnknownSpeciesNodeProps {
  data: {
    label: string;
    unknownId: 'alpha' | 'beta';
    accentColor: string;
  }
}

export default function UnknownSpeciesNode({ data }: UnknownSpeciesNodeProps) {
  const store = useSimulationStore();
  
  const isAlpha = data.unknownId === 'alpha';
  const populationEstimate = isAlpha ? store.unknownSpeciesAlpha.populationEstimate : store.unknownSpeciesBeta.populationEstimate;

  const slider1Label = isAlpha ? 'Predation Strength' : 'Disease Resistance';
  const slider1Value = isAlpha ? store.unknownSpeciesAlpha.predationStrength : store.unknownSpeciesBeta.diseaseResistance;
  const setSlider1 = (val: number) => isAlpha ? store.setUnknownSpeciesAlpha({ predationStrength: val }) : store.setUnknownSpeciesBeta({ diseaseResistance: val });

  const slider2Label = isAlpha ? 'Space Competition' : 'Nutrient Uptake';
  const slider2Value = isAlpha ? store.unknownSpeciesAlpha.competitionWithCoral : store.unknownSpeciesBeta.nutrientUptake;
  const setSlider2 = (val: number) => isAlpha ? store.setUnknownSpeciesAlpha({ competitionWithCoral: val }) : store.setUnknownSpeciesBeta({ nutrientUptake: val });

  const impactSummary = isAlpha 
    ? '↓ Algae Cover  ↑ Coral Space Competition' 
    : '↓ SCLTD Risk  ↓ Nitrogen Effect';

  return (
    <div 
      className="border rounded-xl p-3 shadow-xl min-w-[220px] transition-colors duration-500" 
      style={{ backgroundColor: 'var(--color-bgCard)', borderColor: data.accentColor }}
    >
      <Handle type="target" position={Position.Left} className="w-3 h-3 border-2 border-bgCard" style={{ background: data.accentColor }} />
      
      <div className="flex flex-col gap-3">
        {/* Header */}
        <div className="flex flex-col gap-1">
          <div className="flex justify-between items-start">
            <label className="text-sm font-bold truncate pr-2" style={{ color: data.accentColor }}>{data.label}</label>
            <span 
              className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border" 
              style={{ backgroundColor: `${data.accentColor}20`, color: data.accentColor, borderColor: data.accentColor }}
            >
              ✦ AI Predicted
            </span>
          </div>
          <div className="text-[10px] flex justify-between items-center text-textMuted bg-bg/50 px-2 py-1 rounded border border-border">
            <span>Est. Population</span>
            <span className="font-mono font-bold">{populationEstimate}%</span>
          </div>
        </div>

        <div className="flex flex-col gap-2 pt-1 border-t border-border/50">
          {/* Slider 1 */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-[10px] font-bold text-textMuted uppercase tracking-wider">{slider1Label}</label>
              <span className="text-[10px] text-textMuted bg-bg px-1.5 py-0.5 rounded font-mono border border-border">
                {slider1Value}%
              </span>
            </div>
            <input 
              type="range"
              className="nodrag w-full cursor-pointer h-1.5 appearance-none rounded-full bg-textMuted/30"
              style={{ accentColor: data.accentColor }}
              min={0} max={100} step={1}
              value={slider1Value}
              onChange={(e) => setSlider1(parseFloat(e.target.value))}
            />
          </div>

          {/* Slider 2 */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-[10px] font-bold text-textMuted uppercase tracking-wider">{slider2Label}</label>
              <span className="text-[10px] text-textMuted bg-bg px-1.5 py-0.5 rounded font-mono border border-border">
                {slider2Value}%
              </span>
            </div>
            <input 
              type="range"
              className="nodrag w-full cursor-pointer h-1.5 appearance-none rounded-full bg-textMuted/30"
              style={{ accentColor: data.accentColor }}
              min={0} max={100} step={1}
              value={slider2Value}
              onChange={(e) => setSlider2(parseFloat(e.target.value))}
            />
          </div>
        </div>

        {/* Impact Summary */}
        <div className="text-[9px] text-center font-mono py-1 rounded bg-textMuted/10 text-textMuted border border-textMuted/20 tracking-wider">
          {impactSummary}
        </div>
      </div>

      <Handle type="source" position={Position.Right} className="w-3 h-3 border-2 border-bgCard" style={{ background: data.accentColor }} />
    </div>
  );
}
