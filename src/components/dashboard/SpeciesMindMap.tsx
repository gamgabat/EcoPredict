import { useCallback, useState, useEffect, useMemo } from 'react';
import ReactFlow, {
  Background,
  Controls,
  Node,
  Edge,
  applyNodeChanges,
  applyEdgeChanges,
  NodeChange,
  EdgeChange,
  addEdge,
  Connection,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useSimulationStore } from '@/store/simulationStore';
import SpeciesNode from './nodes/SpeciesNode';

const nodeTypes = { species: SpeciesNode };

// ── Layout: left-to-right food web ───────────────────────────────────────────
const defaultNodes: Node[] = [
  // Col A – Producers
  {
    id: 'zoo',
    type: 'species',
    position: { x: 0, y: 30 },
    data: { label: 'Zooplankton', speciesId: 'zooplankton', accentColor: '#d4d4d4' },
  },
  {
    id: 's-algae',
    type: 'species',
    position: { x: 0, y: 260 },
    data: { label: 'Macroalgae Turf', speciesId: 'algae', accentColor: '#d4d4d4' },
  },

  // Col B – Herbivores / Grazers
  {
    id: 's-diadema',
    type: 'species',
    position: { x: 240, y: 0 },
    data: { label: 'Diadema (Urchin)', speciesId: 'diadema', accentColor: '#a3a3a3' },
  },
  {
    id: 'p-surgeon',
    type: 'species',
    position: { x: 240, y: 140 },
    data: { label: 'Surgeonfish', speciesId: 'surgeonfish', accentColor: '#a3a3a3' },
  },
  {
    id: 'p-parrot',
    type: 'species',
    position: { x: 240, y: 280 },
    data: { label: 'Parrotfish', speciesId: 'parrotfish', accentColor: '#a3a3a3' },
  },
  {
    id: 'p-damsel',
    type: 'species',
    position: { x: 240, y: 420 },
    data: { label: 'Damselfish', speciesId: 'damselfish', accentColor: '#a3a3a3' },
  },

  // Col C – Predators / Competitors
  {
    id: 'p-grouper',
    type: 'species',
    position: { x: 480, y: 70 },
    data: { label: 'Grouper', speciesId: 'grouper', accentColor: '#737373' },
  },
  {
    id: 'p-lion',
    type: 'species',
    position: { x: 480, y: 240 },
    data: { label: 'Lionfish (Invasive)', speciesId: 'lionfish', accentColor: '#ef4444' },
  },
  {
    id: 'p-sponge',
    type: 'species',
    position: { x: 480, y: 400 },
    data: { label: 'Sponges', speciesId: 'sponge', accentColor: '#737373' },
  },

  // Col D – Reef Builders
  {
    id: 'c-porites',
    type: 'species',
    position: { x: 720, y: 40 },
    data: { label: 'Porites astreoides', speciesId: 'coral', accentColor: '#525252' },
  },
  {
    id: 'c-monta',
    type: 'species',
    position: { x: 720, y: 210 },
    data: { label: 'Montastraea cavern.', speciesId: 'coral', accentColor: '#525252' },
  },
  {
    id: 'c-sidera',
    type: 'species',
    position: { x: 720, y: 380 },
    data: { label: 'Siderastrea siderea', speciesId: 'coral', accentColor: '#525252' },
  },
];

// ── Edge helper ───────────────────────────────────────────────────────────────
const edge = (
  id: string,
  src: string,
  tgt: string,
  color: string,
  label?: string,
  opts = {},
): Edge => ({
  id,
  source: src,
  target: tgt,
  style: { stroke: color, strokeWidth: 1.8 },
  labelBgStyle: { fill: 'var(--color-bgCard)' },
  labelStyle: { fill: color, fontSize: 10 },
  label,
  ...opts,
});

export default function SpeciesMindMap() {
  const [nodes, setNodes] = useState<Node[]>(defaultNodes);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [deletedEdges, setDeletedEdges] = useState<Set<string>>(new Set());
  const [userEdgeMods, setUserEdgeMods] = useState<Record<string, Partial<Edge>>>({});

  const {
    temperature,
    phLevel,
    nitrogenLoading,
    scltdOutbreakRisk,
    salinity,
    currentYear,
    parrotfishPopulation,
    grouperPopulation,
    lionfishPresence,
    getEcosystemMetrics,
    selectedNodeId,
    setSelectedNodeId,
  } = useSimulationStore();

  // Rebuild dynamic edges on simulation change
  useEffect(() => {
    const { algaeCover, lionfishDanger } = getEcosystemMetrics();
    const algaeThreat = algaeCover > 40;
    const lf = lionfishDanger > 30;

    const dynamicEdges: Edge[] = [
      edge('e-zoo-por', 'zoo', 'c-porites', '#a3a3a3'),
      edge('e-zoo-mon', 'zoo', 'c-monta', '#a3a3a3'),
      edge('e-zoo-sid', 'zoo', 'c-sidera', '#a3a3a3'),

      edge('e-alg-dia', 's-algae', 's-diadema', '#a3a3a3'),
      edge('e-alg-sur', 's-algae', 'p-surgeon', '#a3a3a3'),
      edge('e-alg-par', 's-algae', 'p-parrot', '#a3a3a3'),

      edge('e-dam-alg', 'p-damsel', 's-algae', '#737373', undefined, { animated: true }),

      edge('e-dia-dam', 's-diadema', 'p-damsel', '#737373', undefined, {
        style: { stroke: '#737373', strokeDasharray: '5,3', strokeWidth: 1.2 },
      }),

      edge('e-grp-par', 'p-grouper', 'p-parrot', '#a3a3a3'),
      edge('e-grp-sur', 'p-grouper', 'p-surgeon', '#a3a3a3'),

      edge('e-lion-par', 'p-lion', 'p-parrot', '#ef4444', undefined, {
        animated: lf,
        style: { stroke: '#ef4444', strokeDasharray: '4,2', strokeWidth: lf ? 2.5 : 1.2 },
      }),
      edge('e-lion-sur', 'p-lion', 'p-surgeon', '#ef4444', undefined, {
        animated: lf,
        style: { stroke: '#ef4444', strokeDasharray: '4,2', strokeWidth: lf ? 2.5 : 1.2 },
      }),
      edge('e-lion-grp', 'p-lion', 'p-grouper', '#737373', undefined, {
        style: { stroke: '#737373', strokeDasharray: '5,3', strokeWidth: 1.2 },
      }),

      edge('e-par-mon', 'p-parrot', 'c-monta', '#737373', undefined, {
        style: { stroke: '#737373', strokeDasharray: '6,3', strokeWidth: 1.2 },
      }),

      edge('e-spo-por', 'p-sponge', 'c-porites', '#737373', undefined, {
        style: { stroke: '#737373', strokeDasharray: '5,3', strokeWidth: 1.2 },
      }),
      edge('e-spo-mon', 'p-sponge', 'c-monta', '#737373', undefined, {
        style: { stroke: '#737373', strokeDasharray: '5,3', strokeWidth: 1.2 },
      }),

      edge('e-alg-por', 's-algae', 'c-porites', algaeThreat ? '#ef4444' : '#27272a', undefined, {
        animated: algaeThreat,
        style: { stroke: algaeThreat ? '#ef4444' : '#27272a', strokeWidth: algaeThreat ? 2.5 : 1 },
      }),
      edge('e-alg-mon', 's-algae', 'c-monta', algaeThreat ? '#ef4444' : '#27272a', undefined, {
        animated: algaeThreat,
        style: { stroke: algaeThreat ? '#ef4444' : '#27272a', strokeWidth: algaeThreat ? 2.5 : 1 },
      }),
      edge('e-alg-sid', 's-algae', 'c-sidera', algaeThreat ? '#ef4444' : '#27272a', undefined, {
        animated: algaeThreat,
        style: { stroke: algaeThreat ? '#ef4444' : '#27272a', strokeWidth: algaeThreat ? 2.5 : 1 },
      }),
    ];

    const dynamicIds = new Set(dynamicEdges.map((e) => e.id));
    setEdges((cur) => [
      ...dynamicEdges.filter((e) => !deletedEdges.has(e.id)),
      ...cur.filter((e) => !dynamicIds.has(e.id)),
    ]);
  }, [
    temperature,
    phLevel,
    nitrogenLoading,
    scltdOutbreakRisk,
    salinity,
    currentYear,
    parrotfishPopulation,
    grouperPopulation,
    lionfishPresence,
    getEcosystemMetrics,
    deletedEdges,
  ]);

  // ── Focus mode: dim unrelated nodes & edges when a node is selected ──────────
  const displayNodes = useMemo(() => {
    if (!selectedNodeId) return nodes;

    // Collect all node IDs directly connected to the selected node
    const connectedIds = new Set<string>([selectedNodeId]);
    edges.forEach((e) => {
      if (e.source === selectedNodeId) connectedIds.add(e.target);
      if (e.target === selectedNodeId) connectedIds.add(e.source);
    });

    return nodes.map((n) => ({
      ...n,
      style: {
        ...n.style,
        opacity: connectedIds.has(n.id) ? 1 : 0.1,
        transition: 'opacity 0.25s ease',
      },
    }));
  }, [nodes, edges, selectedNodeId]);

  const displayEdges = useMemo(() => {
    const baseEdges = edges.map((e) => {
      if (userEdgeMods[e.id]) {
        return { ...e, ...userEdgeMods[e.id] };
      }
      return e;
    });

    if (!selectedNodeId) return baseEdges;

    return baseEdges.map((e) => {
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
  }, [edges, selectedNodeId, userEdgeMods]);

  const onNodesChange = useCallback(
    (c: NodeChange[]) => setNodes((n) => applyNodeChanges(c, n)),
    [],
  );
  const onEdgesChange = useCallback((c: EdgeChange[]) => {
    setEdges((e) => applyEdgeChanges(c, e));
    const removedIds = c
      .filter(
        (change): change is Extract<EdgeChange, { type: 'remove' }> => change.type === 'remove',
      )
      .map((change) => change.id);
    if (removedIds.length > 0) {
      setDeletedEdges((prev) => {
        const next = new Set(prev);
        removedIds.forEach((id) => next.add(id));
        return next;
      });
    }
  }, []);
  const onConnect = useCallback(
    (p: Connection | Edge) =>
      setEdges((e) =>
        addEdge(
          {
            ...p,
            label: 'prey',
            style: { stroke: '#a3a3a3', strokeWidth: 1.8 },
            labelBgStyle: { fill: 'var(--color-bgCard)' },
            labelStyle: { fill: '#a3a3a3', fontSize: 10 },
          },
          e,
        ),
      ),
    [],
  );
  const onNodeClick = useCallback(
    (_: React.MouseEvent, n: Node) => setSelectedNodeId(n.id),
    [setSelectedNodeId],
  );
  const onPaneClick = useCallback(() => setSelectedNodeId(null), [setSelectedNodeId]);

  const onEdgeClick = useCallback((_: React.MouseEvent, clickedEdge: Edge) => {
    setUserEdgeMods((prev) => {
      const currentLabel = prev[clickedEdge.id]?.label || clickedEdge.label || '';
      let nextLabel = 'prey';
      let nextStyle: React.CSSProperties = { stroke: '#a3a3a3', strokeWidth: 1.8 };

      if (currentLabel === 'prey') {
        nextLabel = 'competition';
        nextStyle = { stroke: '#737373', strokeDasharray: '4,2', strokeWidth: 1.8 };
      } else if (currentLabel === 'competition') {
        nextLabel = 'threat';
        nextStyle = { stroke: '#ef4444', strokeWidth: 2.5 };
      }

      return {
        ...prev,
        [clickedEdge.id]: {
          label: nextLabel,
          style: nextStyle,
          labelBgStyle: { fill: 'var(--color-bgCard)' },
          labelStyle: { fill: nextStyle.stroke, fontSize: 10 },
        },
      };
    });
  }, []);

  return (
    <ReactFlow
      nodes={displayNodes}
      edges={displayEdges}
      nodeTypes={nodeTypes}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      onNodeClick={onNodeClick}
      onPaneClick={onPaneClick}
      onEdgeClick={onEdgeClick}
      fitView
      className="bg-bg"
      nodesDraggable
    >
      <Background color="var(--color-border)" gap={24} />
      <Controls showInteractive={false} className="bg-bgCard border border-border fill-textMain" />
    </ReactFlow>
  );
}
