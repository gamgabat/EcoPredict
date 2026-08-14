import { NodeProps } from 'reactflow';

export default function GroupNode({ data, selected }: NodeProps) {
  // We use the data object passed from the graph (label, color, dimensions)
  const color = data.color || 'var(--color-primary)';
  const width = data.width || 300;
  const height = data.height || 600;

  return (
    <div
      className={`rounded-sm transition-all duration-300 ${selected ? 'shadow-[0_0_15px_rgba(255,255,255,0.2)]' : ''}`}
      style={{
        width: `${width}px`,
        height: `${height}px`,
        backgroundColor: `${color}05`, // e.g. rgba 5% opacity
        border: `2px dashed ${color}`,
        position: 'relative',
      }}
    >
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 py-1 rounded-sm font-bold text-xs uppercase tracking-widest border backdrop-blur-md z-10"
        style={{
          backgroundColor: `${color}20`,
          borderColor: color,
          color: 'var(--color-textMain)',
          whiteSpace: 'nowrap',
        }}
      >
        {data.label}
      </div>
    </div>
  );
}
