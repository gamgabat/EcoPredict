import { Handle, Position } from 'reactflow';
import { useSimulationStore } from '@/store/simulationStore';

interface UnknownSpeciesNodeProps {
  data: {
    label: string;
    unknownId: 'alpha' | 'beta';
    accentColor: string;
  };
}

export default function UnknownSpeciesNode({ data }: UnknownSpeciesNodeProps) {
  const store = useSimulationStore();
  const metrics = store.getEcosystemMetrics();

  const isAlpha = data.unknownId === 'alpha';
  const effectValue = isAlpha ? metrics.unknownAlphaEffect : metrics.unknownBetaEffect;

  // Status label based on live effectiveness
  let statusText: string;
  if (effectValue < 20) statusText = 'Dormant';
  else if (effectValue < 50) statusText = 'Active';
  else statusText = 'Dominant';

  return (
    <div
      className="border rounded-sm p-3 shadow-xl min-w-[160px] transition-colors duration-500"
      style={{ backgroundColor: 'var(--color-bgCard)', borderColor: data.accentColor }}
    >
      <Handle type="target" position={Position.Left} className="w-3 h-3 border-2 border-bgCard" style={{ background: data.accentColor }} />

      <div className="flex flex-col gap-2.5">
        <div className="flex justify-between items-start gap-2">
          <label className="text-xs font-bold leading-tight" style={{ color: 'var(--color-textMain)' }}>
            {data.label}
          </label>
          <span
            className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded-sm border flex-shrink-0"
            style={{ backgroundColor: `${data.accentColor}25`, color: 'var(--color-textMain)', borderColor: data.accentColor }}
          >
            {statusText}
          </span>
        </div>

        {/* AI Predicted tag */}
        <div className="text-[9px] font-bold flex items-center gap-1" style={{ color: data.accentColor }}>
          ✦ AI Predicted
        </div>

        {/* Live effectiveness bar */}
        <div className="w-full bg-textMuted/20 rounded-full h-1.5 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${Math.max(0, Math.min(100, effectValue))}%`, backgroundColor: data.accentColor }}
          />
        </div>
      </div>

      <Handle type="source" position={Position.Right} className="w-3 h-3 border-2 border-bgCard" style={{ background: data.accentColor }} />
    </div>
  );
}
