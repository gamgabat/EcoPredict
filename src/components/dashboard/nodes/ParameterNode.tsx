import { Handle, Position } from 'reactflow';
import { useSimulationStore } from '@/store/simulationStore';

interface ParameterNodeProps {
  data: {
    label: string;
    paramId: 'temperature' | 'salinity' | 'phLevel' | 'nitrogenLoading' | 'scltdOutbreakRisk';
    min: number;
    max: number;
    step: number;
    unit: string;
    accentColor: string;
  };
}

export default function ParameterNode({ data }: ParameterNodeProps) {
  // We subscribe to the entire store so we can map dynamically based on paramId
  const store = useSimulationStore();
  const value = store[data.paramId];

  // We find the specific setter manually since we know the mapping
  const setValue = (val: number) => {
    switch (data.paramId) {
      case 'temperature':
        store.setTemperature(val);
        break;
      case 'salinity':
        store.setSalinity(val);
        break;
      case 'phLevel':
        store.setPhLevel(val);
        break;
      case 'nitrogenLoading':
        store.setNitrogenLoading(val);
        break;
      case 'scltdOutbreakRisk':
        store.setScltdOutbreakRisk(val);
        break;
    }
  };

  return (
    <div
      className="bg-bgCard border border-border rounded-sm p-3 shadow-lg min-w-[200px]"
      style={{ borderColor: data.accentColor }}
    >
      <div className="flex justify-between items-center mb-2">
        <label className="text-xs font-bold text-textMain uppercase tracking-wider">
          {data.label}
        </label>
        <span className="text-xs text-textMuted bg-bg px-2 py-0.5 rounded-sm font-mono border border-border">
          {typeof value === 'number' ? value.toFixed(data.step < 1 ? 1 : 0) : value}
          {data.unit}
        </span>
      </div>

      {/* 
        The 'nodrag' class prevents React Flow from dragging the node when user tries to slide the input! 
      */}
      <input
        type="range"
        className="nodrag w-full cursor-pointer h-1.5 appearance-none rounded-full bg-textMuted/30"
        style={{ accentColor: data.accentColor }}
        min={data.min}
        max={data.max}
        step={data.step}
        value={value}
        onChange={(e) => setValue(parseFloat(e.target.value))}
      />

      {/* Target logic: Flowing out to right side */}
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 border-2 border-bgCard"
        style={{ background: data.accentColor }}
      />
    </div>
  );
}
