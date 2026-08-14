import { Handle, Position } from 'reactflow';
import { useSimulationStore } from '@/store/simulationStore';

type SpeciesId =
  | 'diadema'
  | 'algae'
  | 'coral'
  | 'parrotfish'
  | 'surgeonfish'
  | 'grouper'
  | 'lionfish'
  | 'damselfish'
  | 'zooplankton'
  | 'sponge';

interface SpeciesNodeProps {
  data: {
    label: string;
    speciesId: SpeciesId;
    accentColor: string;
  };
}

export default function SpeciesNode({ data }: SpeciesNodeProps) {
  const store = useSimulationStore();
  const metrics = store.getEcosystemMetrics();

  let healthValue = 0;
  let statusText = '';
  let isBleaching = false;
  let isInvader = false;

  switch (data.speciesId) {
    case 'diadema':
      healthValue = metrics.diademaHealth;
      statusText = healthValue < 30 ? 'Crash' : healthValue < 60 ? 'Declining' : 'Healthy';
      break;
    case 'algae':
      healthValue = metrics.algaeCover;
      statusText = healthValue > 60 ? 'Dominant' : healthValue > 40 ? 'Blooming' : 'Controlled';
      break;
    case 'coral':
      healthValue = metrics.coralHealth;
      isBleaching = metrics.bleachingRisk > 30;
      statusText = isBleaching ? 'Bleaching' : healthValue < 40 ? 'Stressed' : 'Healthy';
      break;
    case 'parrotfish':
      healthValue = metrics.parrotfishHealth;
      statusText = healthValue < 30 ? 'Depleted' : healthValue < 60 ? 'Low' : 'Abundant';
      break;
    case 'surgeonfish':
      healthValue = metrics.surgeonFishHealth;
      statusText = healthValue < 30 ? 'Depleted' : healthValue < 60 ? 'Low' : 'Abundant';
      break;
    case 'grouper':
      healthValue = metrics.grouperHealth;
      statusText = healthValue < 30 ? 'Rare' : healthValue < 60 ? 'Low' : 'Present';
      break;
    case 'lionfish':
      healthValue = metrics.lionfishDanger;
      isInvader = true;
      statusText = healthValue < 20 ? 'Minimal' : healthValue < 50 ? 'Spreading' : 'Dominant';
      break;
    case 'damselfish':
      healthValue = metrics.damselFishActivity;
      statusText = healthValue < 30 ? 'Inactive' : healthValue < 60 ? 'Active' : 'Territorial';
      break;
    case 'zooplankton':
      healthValue = metrics.zooplanktonDensity;
      statusText = healthValue < 30 ? 'Depleted' : healthValue < 60 ? 'Sparse' : 'Dense';
      break;
    case 'sponge':
      healthValue = metrics.spongeCompetition;
      statusText = healthValue < 30 ? 'Low' : healthValue < 60 ? 'Growing' : 'Competing';
      break;
  }

  const barColor = isBleaching ? '#ffffff' : data.accentColor;
  const bgColor = isBleaching
    ? '#ffffff'
    : isInvader
      ? 'var(--color-textMain)'
      : 'var(--color-bgCard)';
  const textColor = isBleaching
    ? '#111111'
    : isInvader
      ? 'var(--color-bg)'
      : 'var(--color-textMain)';
  const badgeColor = isInvader ? '#ef4444' : isBleaching ? '#ef4444' : data.accentColor;

  return (
    <div
      className="border rounded-sm p-3 shadow-xl min-w-[160px] transition-colors duration-500"
      style={{ backgroundColor: bgColor, borderColor: barColor }}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 border-2 border-bgCard"
        style={{ background: barColor }}
      />

      <div className="flex flex-col gap-2.5">
        <div className="flex justify-between items-start gap-2">
          <label className="text-xs font-bold leading-tight" style={{ color: textColor }}>
            {data.label}
          </label>
          <span
            className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded-sm border flex-shrink-0"
            style={{
              backgroundColor: `${badgeColor}25`,
              color: textColor,
              borderColor: badgeColor,
            }}
          >
            {statusText}
          </span>
        </div>

        <div className="w-full bg-textMuted/20 rounded-full h-1.5 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${Math.max(0, Math.min(100, healthValue))}%`,
              backgroundColor: barColor,
            }}
          />
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 border-2 border-bgCard"
        style={{ background: barColor }}
      />
    </div>
  );
}
