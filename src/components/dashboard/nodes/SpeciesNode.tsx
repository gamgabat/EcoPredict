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
  const { getEcosystemMetrics } = useSimulationStore();
  const { diademaHealth, algaeCover, coralHealth, bleachingRisk } = getEcosystemMetrics();

  let healthValue = 0;
  let statusText = '';
  let isBleaching = false;

  if (data.speciesId === 'diadema') {
    healthValue = diademaHealth;
    statusText = healthValue < 40 ? 'Population Crash' : 'Healthy';
  } else if (data.speciesId === 'algae') {
    healthValue = algaeCover;
    statusText = healthValue > 40 ? 'Blooming' : 'Controlled';
  } else if (data.speciesId === 'coral') {
    healthValue = coralHealth;
    isBleaching = bleachingRisk > 30;
    statusText = isBleaching ? 'Bleaching!' : (healthValue < 40 ? 'Smothered' : 'Healthy');
  }

  // Adjust display logic
  const barColor = isBleaching ? '#f8fafc' : data.accentColor;
  const bgColor = isBleaching ? '#fdfbf7' : 'var(--color-bgCard)';
  const textColor = isBleaching ? '#0f172a' : 'var(--color-textMain)';

  return (
    <div 
      className="border rounded-xl p-3 shadow-xl min-w-[180px] transition-colors duration-500" 
      style={{ backgroundColor: bgColor, borderColor: barColor }}
    >
      {/* Target handle from the left */}
      <Handle type="target" position={Position.Left} className="w-3 h-3 border-2 border-bgCard" style={{ background: barColor }} />
      
      <div className="flex flex-col gap-2">
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

        {/* Dynamic Inner Element */}
        <div className="w-full bg-textMuted/20 rounded-full h-2 mt-1 overflow-hidden">
          <div 
            className="h-full transition-all duration-300" 
            style={{ width: `${Math.max(0, Math.min(100, healthValue))}%`, backgroundColor: barColor }} 
          />
        </div>
      </div>

      {/* Source handle to the right */}
      <Handle type="source" position={Position.Right} className="w-3 h-3 border-2 border-bgCard" style={{ background: barColor }} />
    </div>
  );
}
