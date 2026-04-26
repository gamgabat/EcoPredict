import { useCallback, useState, useEffect } from 'react';
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
import { useSimulationStore } from "@/store/simulationStore";
import ParameterNode from './nodes/ParameterNode';
import SpeciesNode from './nodes/SpeciesNode';
import WorldNode from './nodes/WorldNode';
import GroupNode from './nodes/GroupNode';
import UnknownSpeciesNode from './nodes/UnknownSpeciesNode';

const nodeTypes = {
  parameter: ParameterNode,
  species: SpeciesNode,
  world: WorldNode,
  customGroup: GroupNode,
  unknownSpecies: UnknownSpeciesNode,
};

const initialNodes: Node[] = [
  // --- GROUP BOUNDING BOXES ---
  { 
    id: 'group-env', type: 'customGroup', position: { x: -50, y: -50 }, 
    data: { label: 'Environment Constraints', color: '#10b981', width: 260, height: 600 },
    style: { zIndex: -1 } 
  },
  { 
    id: 'group-bio', type: 'customGroup', position: { x: 700, y: -50 }, 
    data: { label: 'Target Species', color: '#3b82f6', width: 500, height: 480 },
    style: { zIndex: -1 } 
  },
  { 
    id: 'group-unknown', type: 'customGroup', position: { x: 700, y: 510 }, 
    data: { label: '✦ AI-Predicted Unknown Species', color: '#a855f7', width: 560, height: 240 },
    style: { zIndex: -1 } 
  },

  // --- CENTRAL HUB ---
  { id: 'hub-world', type: 'world', position: { x: 340, y: 130 }, data: { label: 'World' } },

  // --- COLUMN 1: PARAMETERS (Inside group-env) ---
  { id: 'p-temp', type: 'parameter', parentNode: 'group-env', extent: 'parent', position: { x: 20, y: 40 }, data: { label: 'Temperature', paramId: 'temperature', min: 20, max: 35, step: 0.5, unit: '°C', accentColor: '#f59e0b' } },
  { id: 'p-scltd', type: 'parameter', parentNode: 'group-env', extent: 'parent', position: { x: 20, y: 150 }, data: { label: 'SCLTD Disease', paramId: 'scltdOutbreakRisk', min: 0, max: 100, step: 1, unit: '%', accentColor: '#ef4444' } },
  { id: 'p-nitrogen', type: 'parameter', parentNode: 'group-env', extent: 'parent', position: { x: 20, y: 260 }, data: { label: 'Nitrogen Loading', paramId: 'nitrogenLoading', min: 0, max: 100, step: 1, unit: '%', accentColor: '#84cc16' } },
  { id: 'p-ph', type: 'parameter', parentNode: 'group-env', extent: 'parent', position: { x: 20, y: 370 }, data: { label: 'pH Level', paramId: 'phLevel', min: 7.0, max: 8.5, step: 0.1, unit: '', accentColor: '#10b981' } },
  { id: 'p-salinity', type: 'parameter', parentNode: 'group-env', extent: 'parent', position: { x: 20, y: 480 }, data: { label: 'Salinity', paramId: 'salinity', min: 20, max: 45, step: 1, unit: ' ppt', accentColor: '#3b82f6' } },

  // --- COLUMN 2: INTERMEDIARY BIOLOGY (Inside group-bio, Left side) ---
  { id: 's-diadema', type: 'species', parentNode: 'group-bio', extent: 'parent', position: { x: 30, y: 80 }, data: { label: 'Diadema (Urchin)', speciesId: 'diadema', accentColor: '#64748b' } },
  { id: 's-algae', type: 'species', parentNode: 'group-bio', extent: 'parent', position: { x: 30, y: 250 }, data: { label: 'Macroalgae Turf', speciesId: 'algae', accentColor: '#10b981' } },

  // --- COLUMN 3: CORALS (Inside group-bio, Right side) ---
  { id: 'c-porites', type: 'species', parentNode: 'group-bio', extent: 'parent', position: { x: 290, y: 40 }, data: { label: 'Porites astreoides', speciesId: 'coral', accentColor: '#f97316' } },
  { id: 'c-monta', type: 'species', parentNode: 'group-bio', extent: 'parent', position: { x: 290, y: 165 }, data: { label: 'Montastraea cavern.', speciesId: 'coral', accentColor: '#f97316' } },
  { id: 'c-sidera', type: 'species', parentNode: 'group-bio', extent: 'parent', position: { x: 290, y: 290 }, data: { label: 'Siderastrea siderea', speciesId: 'coral', accentColor: '#f97316' } },

  // --- UNKNOWN SPECIES (Inside group-unknown) ---
  { id: 'u-alpha', type: 'unknownSpecies', parentNode: 'group-unknown', extent: 'parent', position: { x: 20, y: 60 }, data: { label: 'Unknown Species α', unknownId: 'alpha', accentColor: '#a855f7' } },
  { id: 'u-beta', type: 'unknownSpecies', parentNode: 'group-unknown', extent: 'parent', position: { x: 300, y: 60 }, data: { label: 'Unknown Species β', unknownId: 'beta', accentColor: '#7c3aed' } },
];

export default function SpeciesMindMap() {
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>([]);

  const { temperature, phLevel, nitrogenLoading, scltdOutbreakRisk, salinity, currentYear, getEcosystemMetrics } = useSimulationStore();

  useEffect(() => {
    const { algaeCover, bleachingRisk } = getEcosystemMetrics();
    const isAlgaeBlooming = algaeCover > 40;
    const isBleaching = bleachingRisk > 30;

    const dynamicEdges: Edge[] = [
      // 1. All Parameters route into World Hub (Left Handle)
      { id: 'e-in-temp', source: 'p-temp', target: 'hub-world', style: { stroke: 'var(--color-primary)', strokeWidth: 1.5, opacity: 0.5 }, animated: true },
      { id: 'e-in-scltd', source: 'p-scltd', target: 'hub-world', style: { stroke: 'var(--color-primary)', strokeWidth: 1.5, opacity: 0.5 }, animated: true },
      { id: 'e-in-nitro', source: 'p-nitrogen', target: 'hub-world', style: { stroke: 'var(--color-primary)', strokeWidth: 1.5, opacity: 0.5 }, animated: true },
      { id: 'e-in-ph', source: 'p-ph', target: 'hub-world', style: { stroke: 'var(--color-primary)', strokeWidth: 1.5, opacity: 0.5 }, animated: true },
      { id: 'e-in-salin', source: 'p-salinity', target: 'hub-world', style: { stroke: 'var(--color-primary)', strokeWidth: 1.5, opacity: 0.5 }, animated: true },

      // 2. World Hub routes out to Biological Agents (Right Handle to Left Handle of agents)
      { id: 'e-out-diadema', source: 'hub-world', target: 's-diadema', style: { stroke: 'var(--color-secondary)', strokeWidth: 2 } },
      { id: 'e-out-algae', source: 'hub-world', target: 's-algae', style: { stroke: 'var(--color-secondary)', strokeWidth: 2 } },
      { id: 'e-out-porites', source: 'hub-world', target: 'c-porites', style: { stroke: 'var(--color-secondary)', strokeWidth: 2 }, animated: isBleaching },
      { id: 'e-out-monta', source: 'hub-world', target: 'c-monta', style: { stroke: 'var(--color-secondary)', strokeWidth: 2 }, animated: isBleaching },
      { id: 'e-out-sidera', source: 'hub-world', target: 'c-sidera', style: { stroke: 'var(--color-secondary)', strokeWidth: 2 }, animated: isBleaching },
      
      // 3. Internal Biological Constraints (Algae smothers Corals, Diadema eats Algae)
      { id: 'e-bio-dia-alg', source: 's-diadema', target: 's-algae', animated: true, style: { stroke: '#64748b', strokeDasharray: '5 5' }, label: 'Grazing', labelBgStyle: { fill: 'var(--color-bgCard)'}, labelStyle: { fill: 'var(--color-textMuted)'} },
      
      { id: 'e-bio-alg-por', source: 's-algae', target: 'c-porites', animated: isAlgaeBlooming, style: { stroke: isAlgaeBlooming ? '#ef4444' : '#334155', strokeWidth: isAlgaeBlooming ? 3 : 1 } },
      { id: 'e-bio-alg-mon', source: 's-algae', target: 'c-monta', animated: isAlgaeBlooming, style: { stroke: isAlgaeBlooming ? '#ef4444' : '#334155', strokeWidth: isAlgaeBlooming ? 3 : 1 }, label: isAlgaeBlooming ? 'Smothering' : '', labelBgStyle: { fill: 'var(--color-bgCard)'}, labelStyle: { fill: '#ef4444'} },
      { id: 'e-bio-alg-sid', source: 's-algae', target: 'c-sidera', animated: isAlgaeBlooming, style: { stroke: isAlgaeBlooming ? '#ef4444' : '#334155', strokeWidth: isAlgaeBlooming ? 3 : 1 } },
      
      // 4. Unknown Species Wires & Interactions
      // Unknown species receive world conditions
      { id: 'e-world-alpha', source: 'hub-world', target: 'u-alpha', style: { stroke: '#a855f7', strokeWidth: 1.5, strokeDasharray: '6 3' }, animated: true },
      { id: 'e-world-beta', source: 'hub-world', target: 'u-beta', style: { stroke: '#7c3aed', strokeWidth: 1.5, strokeDasharray: '6 3' }, animated: true },

      // Alpha predates algae — show connection
      { id: 'e-alpha-algae', source: 'u-alpha', target: 's-algae', style: { stroke: '#a855f7', strokeDasharray: '4 4', strokeWidth: 1.5 }, label: 'Predation', labelBgStyle: { fill: 'var(--color-bgCard)' }, labelStyle: { fill: '#a855f7' } },

      // Beta buffers SCLTD
      { id: 'e-beta-scltd', source: 'u-beta', target: 'p-scltd', style: { stroke: '#7c3aed', strokeDasharray: '4 4', strokeWidth: 1.5 }, label: 'Buffers', labelBgStyle: { fill: 'var(--color-bgCard)' }, labelStyle: { fill: '#7c3aed' } },
    ];
    setEdges(dynamicEdges);
  }, [temperature, phLevel, nitrogenLoading, scltdOutbreakRisk, salinity, currentYear, getEcosystemMetrics]);

  const onNodesChange = useCallback((changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)), []);
  const onEdgesChange = useCallback((changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)), []);

  return (
    <ReactFlow 
      nodes={nodes} 
      edges={edges}
      nodeTypes={nodeTypes}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      fitView
      className="bg-bg"
      nodesDraggable={true}
    >
      <Background color="var(--color-border)" gap={24} />
      <Controls showInteractive={false} className="bg-bgCard border border-border fill-textMain" />
    </ReactFlow>
  );
}
