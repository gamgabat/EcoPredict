import { useCallback, useState, useEffect, useMemo } from 'react';
import ReactFlow, {
  Background, Controls,
  Node, Edge,
  applyNodeChanges, applyEdgeChanges,
  NodeChange, EdgeChange,
  addEdge, Connection
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useSimulationStore } from "@/store/simulationStore";
import SpeciesNode from './nodes/SpeciesNode';
import UnknownSpeciesNode from './nodes/UnknownSpeciesNode';

const nodeTypes = { species: SpeciesNode, unknownSpecies: UnknownSpeciesNode };

// ── Layout: left-to-right food web ───────────────────────────────────────────
const defaultNodes: Node[] = [
  // Col A – Producers
  { id: 'zoo',      type: 'species', position: { x: 0,   y: 30  }, data: { label: 'Zooplankton',          speciesId: 'zooplankton', accentColor: '#06b6d4' } },
  { id: 's-algae',  type: 'species', position: { x: 0,   y: 260 }, data: { label: 'Macroalgae Turf',       speciesId: 'algae',       accentColor: '#10b981' } },

  // Col B – Herbivores / Grazers
  { id: 's-diadema', type: 'species', position: { x: 240, y: 0   }, data: { label: 'Diadema (Urchin)',      speciesId: 'diadema',     accentColor: '#64748b' } },
  { id: 'p-surgeon', type: 'species', position: { x: 240, y: 140 }, data: { label: 'Surgeonfish',           speciesId: 'surgeonfish', accentColor: '#0ea5e9' } },
  { id: 'p-parrot',  type: 'species', position: { x: 240, y: 280 }, data: { label: 'Parrotfish',            speciesId: 'parrotfish',  accentColor: '#8b5cf6' } },
  { id: 'p-damsel',  type: 'species', position: { x: 240, y: 420 }, data: { label: 'Damselfish',            speciesId: 'damselfish',  accentColor: '#f59e0b' } },

  // Col C – Predators / Competitors
  { id: 'p-grouper', type: 'species', position: { x: 480, y: 70  }, data: { label: 'Grouper',               speciesId: 'grouper',     accentColor: '#475569' } },
  { id: 'p-lion',    type: 'species', position: { x: 480, y: 240 }, data: { label: 'Lionfish (Invasive)',   speciesId: 'lionfish',    accentColor: '#dc2626' } },
  { id: 'p-sponge',  type: 'species', position: { x: 480, y: 400 }, data: { label: 'Sponges',               speciesId: 'sponge',      accentColor: '#d97706' } },

  // Col D – Reef Builders
  { id: 'c-porites', type: 'species', position: { x: 720, y: 40  }, data: { label: 'Porites astreoides',    speciesId: 'coral',       accentColor: '#f97316' } },
  { id: 'c-monta',   type: 'species', position: { x: 720, y: 210 }, data: { label: 'Montastraea cavern.',   speciesId: 'coral',       accentColor: '#f97316' } },
  { id: 'c-sidera',  type: 'species', position: { x: 720, y: 380 }, data: { label: 'Siderastrea siderea',   speciesId: 'coral',       accentColor: '#f97316' } },
];

// ── Edge helper ───────────────────────────────────────────────────────────────
const edge = (id: string, src: string, tgt: string, color: string, label?: string, opts = {}): Edge => ({
  id, source: src, target: tgt,
  style: { stroke: color, strokeWidth: 1.8 },
  labelBgStyle: { fill: 'var(--color-bgCard)' },
  labelStyle: { fill: color, fontSize: 10 },
  label,
  ...opts,
});

export default function SpeciesMindMap() {
  const [nodes, setNodes] = useState<Node[]>(defaultNodes);
  const [edges, setEdges] = useState<Edge[]>([]);

  const {
    temperature, phLevel, nitrogenLoading, scltdOutbreakRisk, salinity,
    currentYear, parrotfishPopulation, grouperPopulation, lionfishPresence,
    getEcosystemMetrics,
    areUnknownSpeciesDiscovered,
    selectedNodeId,
    setSelectedNodeId,
  } = useSimulationStore();

  // Reveal / hide unknown species nodes
  useEffect(() => {
    if (areUnknownSpeciesDiscovered) {
      setNodes(nds => {
        if (nds.find(n => n.id === 'u-alpha')) return nds;
        return [
          ...nds,
          { id: 'u-alpha', type: 'unknownSpecies', position: { x: 420, y: -120 }, data: { label: 'Unknown Species α', unknownId: 'alpha', accentColor: '#a855f7' } },
          { id: 'u-beta',  type: 'unknownSpecies', position: { x: 200, y: -120 }, data: { label: 'Unknown Species β', unknownId: 'beta',  accentColor: '#7c3aed' } },
        ];
      });
    } else {
      setNodes(nds => nds.filter(n => n.id !== 'u-alpha' && n.id !== 'u-beta'));
    }
  }, [areUnknownSpeciesDiscovered]);

  // Rebuild dynamic edges on simulation change
  useEffect(() => {
    const { algaeCover, lionfishDanger } = getEcosystemMetrics();
    const algaeThreat = algaeCover > 40;
    const lf = lionfishDanger > 30;

    const dynamicEdges: Edge[] = [
      edge('e-zoo-por', 'zoo', 'c-porites', '#06b6d4'),
      edge('e-zoo-mon', 'zoo', 'c-monta',   '#06b6d4'),
      edge('e-zoo-sid', 'zoo', 'c-sidera',  '#06b6d4'),

      edge('e-alg-dia', 's-algae', 's-diadema', '#10b981'),
      edge('e-alg-sur', 's-algae', 'p-surgeon', '#10b981'),
      edge('e-alg-par', 's-algae', 'p-parrot',  '#10b981'),

      edge('e-dam-alg', 'p-damsel', 's-algae', '#f59e0b', undefined, { animated: true }),

      edge('e-dia-dam', 's-diadema', 'p-damsel', '#94a3b8', undefined, { style: { stroke: '#94a3b8', strokeDasharray: '5,3', strokeWidth: 1.2 } }),

      edge('e-grp-par', 'p-grouper', 'p-parrot',  '#475569'),
      edge('e-grp-sur', 'p-grouper', 'p-surgeon', '#475569'),

      edge('e-lion-par', 'p-lion', 'p-parrot',  '#dc2626', undefined, { animated: lf, style: { stroke: '#dc2626', strokeDasharray: '4,2', strokeWidth: lf ? 2.5 : 1.2 } }),
      edge('e-lion-sur', 'p-lion', 'p-surgeon', '#dc2626', undefined, { animated: lf, style: { stroke: '#dc2626', strokeDasharray: '4,2', strokeWidth: lf ? 2.5 : 1.2 } }),
      edge('e-lion-grp', 'p-lion', 'p-grouper', '#f59e0b', undefined, { style: { stroke: '#f59e0b', strokeDasharray: '5,3', strokeWidth: 1.2 } }),

      edge('e-par-mon', 'p-parrot', 'c-monta', '#d97706', undefined, { style: { stroke: '#d97706', strokeDasharray: '6,3', strokeWidth: 1.2 } }),

      edge('e-spo-por', 'p-sponge', 'c-porites', '#d97706', undefined, { style: { stroke: '#d97706', strokeDasharray: '5,3', strokeWidth: 1.2 } }),
      edge('e-spo-mon', 'p-sponge', 'c-monta',   '#d97706', undefined, { style: { stroke: '#d97706', strokeDasharray: '5,3', strokeWidth: 1.2 } }),

      edge('e-alg-por', 's-algae', 'c-porites', algaeThreat ? '#ef4444' : '#334155', undefined, { animated: algaeThreat, style: { stroke: algaeThreat ? '#ef4444' : '#334155', strokeWidth: algaeThreat ? 2.5 : 1 } }),
      edge('e-alg-mon', 's-algae', 'c-monta',   algaeThreat ? '#ef4444' : '#334155', undefined, { animated: algaeThreat, style: { stroke: algaeThreat ? '#ef4444' : '#334155', strokeWidth: algaeThreat ? 2.5 : 1 } }),
      edge('e-alg-sid', 's-algae', 'c-sidera',  algaeThreat ? '#ef4444' : '#334155', undefined, { animated: algaeThreat, style: { stroke: algaeThreat ? '#ef4444' : '#334155', strokeWidth: algaeThreat ? 2.5 : 1 } }),
    ];

    if (areUnknownSpeciesDiscovered) {
      dynamicEdges.push(
        edge('e-alg-alpha', 's-algae', 'u-alpha', '#a855f7', undefined, { animated: true }),
        edge('e-alpha-mon', 'u-alpha', 'c-monta', '#ef4444'),
        edge('e-beta-por',  'u-beta',  'c-porites', '#7c3aed', undefined, { animated: true }),
        edge('e-beta-mon',  'u-beta',  'c-monta',   '#7c3aed', undefined, { animated: true }),
        edge('e-beta-sid',  'u-beta',  'c-sidera',  '#7c3aed', undefined, { animated: true }),
      );
    }

    const dynamicIds = new Set(dynamicEdges.map(e => e.id));
    setEdges(cur => [...dynamicEdges, ...cur.filter(e => !dynamicIds.has(e.id))]);
  }, [
    temperature, phLevel, nitrogenLoading, scltdOutbreakRisk, salinity,
    currentYear, parrotfishPopulation, grouperPopulation, lionfishPresence,
    getEcosystemMetrics, areUnknownSpeciesDiscovered,
  ]);

  // ── Focus mode: dim unrelated nodes & edges when a node is selected ──────────
  const displayNodes = useMemo(() => {
    if (!selectedNodeId) return nodes;

    // Collect all node IDs directly connected to the selected node
    const connectedIds = new Set<string>([selectedNodeId]);
    edges.forEach(e => {
      if (e.source === selectedNodeId) connectedIds.add(e.target);
      if (e.target === selectedNodeId) connectedIds.add(e.source);
    });

    return nodes.map(n => ({
      ...n,
      style: {
        ...n.style,
        opacity: connectedIds.has(n.id) ? 1 : 0.1,
        transition: 'opacity 0.25s ease',
      },
    }));
  }, [nodes, edges, selectedNodeId]);

  const displayEdges = useMemo(() => {
    if (!selectedNodeId) return edges;

    return edges.map(e => {
      const isRelated = e.source === selectedNodeId || e.target === selectedNodeId;
      return {
        ...e,
        style: {
          ...e.style,
          opacity: isRelated ? 1 : 0.06,
          transition: 'opacity 0.25s ease',
        },
        // Dim the animated marker too by suppressing animation on unrelated edges
        animated: isRelated ? e.animated : false,
      };
    });
  }, [edges, selectedNodeId]);

  const onNodesChange = useCallback((c: NodeChange[]) => setNodes(n => applyNodeChanges(c, n)), []);
  const onEdgesChange = useCallback((c: EdgeChange[]) => setEdges(e => applyEdgeChanges(c, e)), []);
  const onConnect     = useCallback((p: Connection | Edge) => setEdges(e => addEdge(p, e)), []);
  const onNodeClick   = useCallback((_: any, n: Node) => setSelectedNodeId(n.id), [setSelectedNodeId]);
  const onPaneClick   = useCallback(() => setSelectedNodeId(null), [setSelectedNodeId]);

  return (
    <ReactFlow
      nodes={displayNodes} edges={displayEdges} nodeTypes={nodeTypes}
      onNodesChange={onNodesChange} onEdgesChange={onEdgesChange}
      onConnect={onConnect} onNodeClick={onNodeClick} onPaneClick={onPaneClick}
      fitView className="bg-bg" nodesDraggable
    >
      <Background color="var(--color-border)" gap={24} />
      <Controls showInteractive={false} className="bg-bgCard border border-border fill-textMain" />
    </ReactFlow>
  );
}
