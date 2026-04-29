import { useCallback, useState, useEffect } from 'react';
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
// Col A (x:0)   Producers      Col B (x:240) Herbivores
// Col C (x:480) Predators      Col D (x:720) Reef builders
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

// ── Edge helpers ──────────────────────────────────────────────────────────────
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
    const { algaeCover, bleachingRisk, parrotfishHealth, lionfishDanger, grouperHealth } = getEcosystemMetrics();
    const algaeThreat = algaeCover > 40;
    const lf = lionfishDanger > 30; // lionfish actively dangerous

    const dynamicEdges: Edge[] = [
      // ── Producers → Corals ──
      edge('e-zoo-por', 'zoo', 'c-porites', '#06b6d4', 'Feeds'),
      edge('e-zoo-mon', 'zoo', 'c-monta',   '#06b6d4'),
      edge('e-zoo-sid', 'zoo', 'c-sidera',  '#06b6d4'),

      // ── Algae → Herbivores (eaten by) ──
      edge('e-alg-dia', 's-algae', 's-diadema', '#10b981', 'Grazed'),
      edge('e-alg-sur', 's-algae', 'p-surgeon', '#10b981', 'Grazed'),
      edge('e-alg-par', 's-algae', 'p-parrot',  '#10b981', 'Grazed'),

      // ── Damselfish farms algae (promotes it) ──
      edge('e-dam-alg', 'p-damsel', 's-algae', '#f59e0b', 'Farms', { animated: true }),

      // ── Herbivore competition for algae patch territory ──
      edge('e-dia-dam', 's-diadema', 'p-damsel', '#94a3b8', 'Compete', { style: { stroke: '#94a3b8', strokeDasharray: '5,3', strokeWidth: 1.2 } }),

      // ── Grouper predates herbivores ──
      edge('e-grp-par', 'p-grouper', 'p-parrot',  '#475569', 'Predates'),
      edge('e-grp-sur', 'p-grouper', 'p-surgeon', '#475569'),

      // ── Lionfish (invasive) predates herbivores + competes with grouper ──
      edge('e-lion-par', 'p-lion', 'p-parrot',  '#dc2626', 'Invasive', { animated: lf, style: { stroke: '#dc2626', strokeDasharray: '4,2', strokeWidth: lf ? 2.5 : 1.2 } }),
      edge('e-lion-sur', 'p-lion', 'p-surgeon', '#dc2626', undefined,  { animated: lf, style: { stroke: '#dc2626', strokeDasharray: '4,2', strokeWidth: lf ? 2.5 : 1.2 } }),
      edge('e-lion-grp', 'p-lion', 'p-grouper', '#f59e0b', 'Competes', { style: { stroke: '#f59e0b', strokeDasharray: '5,3', strokeWidth: 1.2 } }),

      // ── Parrotfish bioerodes coral ──
      edge('e-par-mon', 'p-parrot', 'c-monta', '#d97706', 'Bioerodes', { style: { stroke: '#d97706', strokeDasharray: '6,3', strokeWidth: 1.2 } }),

      // ── Sponges outcompete corals for space ──
      edge('e-spo-por', 'p-sponge', 'c-porites', '#d97706', 'Space Compete', { style: { stroke: '#d97706', strokeDasharray: '5,3', strokeWidth: 1.2 } }),
      edge('e-spo-mon', 'p-sponge', 'c-monta',   '#d97706', undefined, { style: { stroke: '#d97706', strokeDasharray: '5,3', strokeWidth: 1.2 } }),

      // ── Algae smothers corals (dynamic severity) ──
      edge('e-alg-por', 's-algae', 'c-porites', algaeThreat ? '#ef4444' : '#334155', algaeThreat ? 'Smothers' : 'Competes', { animated: algaeThreat, style: { stroke: algaeThreat ? '#ef4444' : '#334155', strokeWidth: algaeThreat ? 2.5 : 1 } }),
      edge('e-alg-mon', 's-algae', 'c-monta',   algaeThreat ? '#ef4444' : '#334155', undefined, { animated: algaeThreat, style: { stroke: algaeThreat ? '#ef4444' : '#334155', strokeWidth: algaeThreat ? 2.5 : 1 } }),
      edge('e-alg-sid', 's-algae', 'c-sidera',  algaeThreat ? '#ef4444' : '#334155', undefined, { animated: algaeThreat, style: { stroke: algaeThreat ? '#ef4444' : '#334155', strokeWidth: algaeThreat ? 2.5 : 1 } }),
    ];

    if (areUnknownSpeciesDiscovered) {
      dynamicEdges.push(
        edge('e-alg-alpha', 's-algae',  'u-alpha', '#a855f7', 'Eaten By', { animated: true }),
        edge('e-alpha-mon', 'u-alpha',  'c-monta', '#ef4444', 'Competes'),
        edge('e-beta-por',  'u-beta',   'c-porites','#7c3aed', 'Protects', { animated: true }),
        edge('e-beta-mon',  'u-beta',   'c-monta',  '#7c3aed', undefined, { animated: true }),
        edge('e-beta-sid',  'u-beta',   'c-sidera', '#7c3aed', undefined, { animated: true }),
      );
    }

    const dynamicIds = new Set(dynamicEdges.map(e => e.id));
    setEdges(cur => [...dynamicEdges, ...cur.filter(e => !dynamicIds.has(e.id))]);
  }, [
    temperature, phLevel, nitrogenLoading, scltdOutbreakRisk, salinity,
    currentYear, parrotfishPopulation, grouperPopulation, lionfishPresence,
    getEcosystemMetrics, areUnknownSpeciesDiscovered,
  ]);

  const onNodesChange = useCallback((c: NodeChange[]) => setNodes(n => applyNodeChanges(c, n)), []);
  const onEdgesChange = useCallback((c: EdgeChange[]) => setEdges(e => applyEdgeChanges(c, e)), []);
  const onConnect     = useCallback((p: Connection | Edge) => setEdges(e => addEdge(p, e)), []);
  const onNodeClick   = useCallback((_: any, n: Node) => setSelectedNodeId(n.id), [setSelectedNodeId]);
  const onPaneClick   = useCallback(() => setSelectedNodeId(null), [setSelectedNodeId]);

  return (
    <ReactFlow
      nodes={nodes} edges={edges} nodeTypes={nodeTypes}
      onNodesChange={onNodesChange} onEdgesChange={onEdgesChange}
      onConnect={onConnect} onNodeClick={onNodeClick} onPaneClick={onPaneClick}
      fitView className="bg-bg" nodesDraggable
    >
      <Background color="var(--color-border)" gap={24} />
      <Controls showInteractive={false} className="bg-bgCard border border-border fill-textMain" />
    </ReactFlow>
  );
}
