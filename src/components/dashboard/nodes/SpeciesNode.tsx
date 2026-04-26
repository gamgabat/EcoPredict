import { Handle, Position } from 'reactflow';
import { useSimulationStore } from '@/store/simulationStore';

interface SpeciesNodeProps {
  data: {
    label: string;
    speciesId: 'diadema' | 'algae' | 'coral';
    accentColor: string;
  };
}

export default function SpeciesNode({ data }: SpeciesNodeProps) {
  const store = useSimulationStore();
  const { diademaHealth, algaeCover, coralHealth, bleachingRisk } = store.getEcosystemMetrics();

  let healthValue = 0;
  let statusText = '';
  let isBleaching = false;
  
  // Custom Slider Props
  let sliderValue = 0;
  let sliderLabel = '';
  let onSliderChange: (val: number) => void = () => {};

  if (data.speciesId === 'diadema') {
    healthValue = diademaHealth;
    statusText = healthValue < 40 ? 'Population Crash' : 'Healthy';
    sliderValue = store.diademaPopulation;
    sliderLabel = 'Population Density';
    onSliderChange = store.setDiademaPopulation;
  } else if (data.speciesId === 'algae') {
    healthValue = algaeCover;
    statusText = healthValue > 40 ? 'Blooming' : 'Controlled';
    sliderValue = store.algaeGrowthRate;
    sliderLabel = 'Growth Rate';
    onSliderChange = store.setAlgaeGrowthRate;
  } else if (data.speciesId === 'coral') {
    healthValue = coralHealth;
    isBleaching = bleachingRisk > 30;
    statusText = isBleaching ? 'Bleaching!' : (healthValue < 40 ? 'Smothered' : 'Healthy');
    sliderValue = store.coralResilience;
    sliderLabel = 'Resilience';
    onSliderChange = store.setCoralResilience;
  }

  const barColor = isBleaching ? '#f8fafc' : data.accentColor;
  const bgColor = isBleaching ? '#fdfbf7' : 'var(--color-bgCard)';
  const textColor = isBleaching ? '#0f172a' : 'var(--color-textMain)';

  return (
    <div 
      className="border rounded-xl p-3 shadow-xl min-w-[200px] transition-colors duration-500" 
      style={{ backgroundColor: bgColor, borderColor: barColor }}
    >
      <Handle type="target" position={Position.Left} className="w-3 h-3 border-2 border-bgCard" style={{ background: barColor }} />
      
      <div className="flex flex-col gap-3">
        <div className="flex justify-between items-start">
          <label className="text-sm font-bold truncate pr-4" style={{ color: textColor }}>{data.label}</label>
          <span 
            className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border" 
            style={{ 
              backgroundColor: isBleaching ? '#ef4444' : `${barColor}30`, 
              color: isBleaching ? 'white' : barColor,
              borderColor: isBleaching ? '#ef4444' : barColor
            }}
          >
            {statusText}
          </span>
        </div>

        {/* Health Bar */}
        <div className="w-full bg-textMuted/20 rounded-full h-2 overflow-hidden">
          <div 
            className="h-full transition-all duration-300" 
            style={{ width: `${Math.max(0, Math.min(100, healthValue))}%`, backgroundColor: barColor }} 
          />
        </div>

        {/* Interactive Parameter Slider */}
        <div className="mt-1 pt-2 border-t border-border/50">
          <div className="flex justify-between items-center mb-1">
            <label className="text-[10px] font-bold text-textMuted uppercase tracking-wider">{sliderLabel}</label>
            <span className="text-[10px] text-textMuted bg-bg px-1.5 py-0.5 rounded font-mono border border-border">
              {sliderValue}%
            </span>
          </div>
          <input 
            type="range"
            className="nodrag w-full cursor-pointer h-1.5 appearance-none rounded-full bg-textMuted/30"
            style={{ accentColor: barColor }}
            min={0}
            max={100}
            step={1}
            value={sliderValue}
            onChange={(e) => onSliderChange(parseFloat(e.target.value))}
          />
        </div>
      </div>

      <Handle type="source" position={Position.Right} className="w-3 h-3 border-2 border-bgCard" style={{ background: barColor }} />
    </div>
  );
}
