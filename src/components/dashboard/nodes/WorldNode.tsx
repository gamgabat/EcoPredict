import { Handle, Position } from 'reactflow';
import { useSimulationStore } from '@/store/simulationStore';
import { Globe, Activity } from 'lucide-react';

export default function WorldNode() {
  const { getEcosystemMetrics } = useSimulationStore();
  const { diademaHealth, algaeCover, coralHealth, bleachingRisk } = getEcosystemMetrics();

  // "World" calculates a crude holistic stability index.
  // We want to average the 'positive' components and subtract the 'negative'.
  // Perfect health: Diadema 100, Coral 100, Algae 0, Bleaching 0 -> 100%.
  
  const positiveForces = (diademaHealth + coralHealth) / 2;
  const negativeForces = (algaeCover + bleachingRisk) / 2;
  
  let worldStability = positiveForces - negativeForces;
  worldStability = Math.max(0, Math.min(100, worldStability));

  let stabilityState = 'Critical';
  let glowColor = 'rgba(239, 68, 68, 0.4)'; // Red
  let mainColor = '#ef4444';

  if (worldStability > 70) {
    stabilityState = 'Optimal';
    glowColor = 'rgba(34, 197, 94, 0.4)'; // Green
    mainColor = '#22c55e';
  } else if (worldStability > 40) {
    stabilityState = 'Stressed';
    glowColor = 'rgba(245, 158, 11, 0.4)'; // Orange
    mainColor = '#f59e0b';
  }

  return (
    <div 
      className="rounded-full shadow-2xl flex flex-col items-center justify-center p-8 bg-bgCard border-4 transition-all duration-700" 
      style={{ 
        borderColor: mainColor, 
        boxShadow: `0 0 30px ${glowColor}`,
        width: '240px',
        height: '240px',
      }}
    >
      {/* Massive Target handle spanning left side */}
      <Handle type="target" position={Position.Left} className="w-4 h-16 rounded-md border-0 absolute -left-2 top-1/2 -translate-y-1/2" style={{ background: 'var(--color-primary)' }} />
      
      <div className="flex flex-col items-center gap-3 relative z-10 w-full text-center">
        <Globe className="w-12 h-12" style={{ color: mainColor }} />
        <h1 className="text-2xl font-black text-textMain tracking-widest uppercase">World Hub</h1>
        
        <div className="flex flex-col items-center bg-bg/50 px-4 py-2 rounded-xl backdrop-blur-md border border-border mt-2">
          <span className="text-[10px] text-textMuted uppercase font-bold flex items-center gap-1">
            <Activity className="w-3 h-3" /> System Stability
          </span>
          <span className="text-3xl font-black" style={{ color: mainColor }}>
            {worldStability.toFixed(1)}%
          </span>
        </div>
        
        <span className="text-xs uppercase font-bold px-3 py-1 rounded-full border border-border bg-bg/80" style={{ color: mainColor }}>
          {stabilityState}
        </span>
      </div>

      {/* Massive Source handle spanning right side */}
      <Handle type="source" position={Position.Right} className="w-4 h-16 rounded-md border-0 absolute -right-2 top-1/2 -translate-y-1/2" style={{ background: '#3b82f6' }} />
    </div>
  );
}
