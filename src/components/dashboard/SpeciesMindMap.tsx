import { useCallback, useState } from 'react';
import ReactFlow, { 
  Background, 
  Controls, 
  Node,
  Edge,
  applyNodeChanges,
  applyEdgeChanges,
  NodeChange,
  EdgeChange
} from 'reactflow';
import 'reactflow/dist/style.css';

const initialNodes: Node[] = [
  { id: '1', position: { x: 250, y: 50 }, data: { label: 'Known: Phytoplankton' }, style: { background: 'var(--color-bgCard)', color: 'var(--color-textMain)', border: '1px solid var(--color-primary)', borderRadius: '8px', padding: '10px' } },
  { id: '2', position: { x: 100, y: 150 }, data: { label: 'Known: Zooplankton' }, style: { background: 'var(--color-bgCard)', color: 'var(--color-textMain)', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '10px' } },
  { id: '3', position: { x: 400, y: 150 }, data: { label: 'Predicted: Unknown Filter Feeder' }, style: { background: 'var(--color-bgHover)', color: 'var(--color-accent)', border: '2px dashed var(--color-accent)', borderRadius: '8px', padding: '10px', fontWeight: 'bold' } },
  { id: '4', position: { x: 250, y: 300 }, data: { label: 'Known: Small Fish' }, style: { background: 'var(--color-bgCard)', color: 'var(--color-textMain)', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '10px' } },
];

const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2', animated: true, style: { stroke: 'var(--color-textMuted)' } },
  { id: 'e1-3', source: '1', target: '3', animated: true, style: { stroke: 'var(--color-accent)', strokeWidth: 2 }, label: '87% match', labelBgStyle: { fill: 'var(--color-bgCard)' }, labelStyle: { fill: 'var(--color-textMain)' } },
  { id: 'e2-4', source: '2', target: '4', style: { stroke: 'var(--color-textMuted)' } },
  { id: 'e3-4', source: '3', target: '4', animated: true, style: { stroke: 'var(--color-error)', strokeWidth: 2 }, label: 'Predation', labelBgStyle: { fill: 'var(--color-bgCard)' }, labelStyle: { fill: 'var(--color-error)' } },
];

export default function SpeciesMindMap() {
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );
  
  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  return (
    <div className="bg-bgCard border border-border p-2 rounded-xl shadow-lg h-[450px] flex flex-col">
      <h2 className="text-lg font-bold text-textMain px-3 pt-2 mb-2">Species Interaction Map</h2>
      <div className="flex-1 w-full rounded-lg overflow-hidden border border-border/50 relative">
        <ReactFlow 
          nodes={nodes} 
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          fitView
          className="bg-bg"
        >
          <Background color="var(--color-border)" gap={16} />
          <Controls showInteractive={false} />
        </ReactFlow>
      </div>
    </div>
  );
}
