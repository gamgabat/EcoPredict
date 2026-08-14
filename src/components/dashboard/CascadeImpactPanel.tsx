import { useState, useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from 'recharts';
import { useSimulationStore } from '@/store/simulationStore';
import { computeCascade } from '@/engine/cascadeModel';
import type { CascadeOutput } from '@/types/cascade';

export default function CascadeImpactPanel() {
  const [activeTab, setActiveTab] = useState<'cascade' | 'projection' | 'summary'>('cascade');
  const {
    temperature,
    phLevel,
    salinity,
    nitrogenLoading,
    scltdOutbreakRisk,
    currentYear,
    diademaPopulation,
    parrotfishPopulation,
    grouperPopulation,
    lionfishPresence,
    areUnknownSpeciesDiscovered,
    unknownSpeciesAlpha,
    unknownSpeciesBeta,
    activeScenario,
    baselineSnapshot,
    getEcosystemMetrics,
  } = useSimulationStore();

  const cascadeOutput = useMemo(() => {
    const metrics = getEcosystemMetrics();
    return computeCascade({
      temperature,
      phLevel,
      salinity,
      nitrogenLoading,
      scltdOutbreakRisk,
      currentYear,
      diademaPopulation,
      parrotfishPopulation,
      grouperPopulation,
      lionfishPresence,
      areUnknownSpeciesDiscovered,
      unknownAlphaRisk:
        unknownSpeciesAlpha.predationStrength + unknownSpeciesAlpha.competitionWithCoral,
      unknownBetaRisk:
        unknownSpeciesBeta.diseaseResistance * 0.5 + unknownSpeciesBeta.nutrientUptake * 0.5,
      activeScenario,
      baselineSnapshot,
      algaeCover: metrics.algaeCover,
      coralHealth: metrics.coralHealth,
    });
  }, [
    temperature,
    phLevel,
    salinity,
    nitrogenLoading,
    scltdOutbreakRisk,
    currentYear,
    diademaPopulation,
    parrotfishPopulation,
    grouperPopulation,
    lionfishPresence,
    areUnknownSpeciesDiscovered,
    unknownSpeciesAlpha,
    unknownSpeciesBeta,
    activeScenario,
    baselineSnapshot,
    getEcosystemMetrics,
  ]);

  return (
    <div className="h-full flex flex-col gap-3">
      <div className="flex items-center gap-2 border-b border-border pb-2 flex-shrink-0">
        <button
          className={`px-3 py-1 text-xs font-bold rounded ${activeTab === 'cascade' ? 'bg-primary text-bg' : 'text-textMuted hover:text-textMain'}`}
          onClick={() => setActiveTab('cascade')}
        >
          Cascade View
        </button>
        <button
          className={`px-3 py-1 text-xs font-bold rounded ${activeTab === 'projection' ? 'bg-primary text-bg' : 'text-textMuted hover:text-textMain'}`}
          onClick={() => setActiveTab('projection')}
        >
          Projection
        </button>
        <button
          className={`px-3 py-1 text-xs font-bold rounded ${activeTab === 'summary' ? 'bg-primary text-bg' : 'text-textMuted hover:text-textMain'}`}
          onClick={() => setActiveTab('summary')}
        >
          Impact Summary
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {activeTab === 'cascade' && <CascadeView output={cascadeOutput} />}
        {activeTab === 'projection' && <ProjectionView projection={cascadeOutput.projection} />}
        {activeTab === 'summary' && <SummaryView output={cascadeOutput} />}
      </div>
    </div>
  );
}

function CascadeView({ output }: { output: CascadeOutput }) {
  const Bar = ({
    label,
    value,
    max = 100,
    color,
  }: {
    label: string;
    value: number;
    max?: number;
    color: string;
  }) => (
    <div className="flex items-center gap-2 text-xs">
      <div className="w-32 truncate text-textMuted font-medium" title={label}>
        {label}
      </div>
      <div className="flex-1 h-2 bg-bg rounded overflow-hidden">
        <div
          className="h-full"
          style={{ width: `${Math.min(100, (value / max) * 100)}%`, backgroundColor: color }}
        />
      </div>
      <div className="w-10 text-right font-mono text-[10px]">{value.toFixed(1)}</div>
    </div>
  );

  return (
    <div className="flex gap-6 h-full p-1">
      <div className="flex-1">
        <h4 className="text-[10px] uppercase font-bold text-textMain opacity-70 mb-2 border-b border-border pb-1">
          1st Order: Abiotic Stress
        </h4>
        <div className="flex flex-col gap-2">
          <Bar
            label="Temp Delta"
            value={Math.abs(output.firstOrder.temperatureDelta)}
            max={5}
            color="#f59e0b"
          />
          <Bar
            label="pH Delta"
            value={Math.abs(output.firstOrder.phDelta)}
            max={1}
            color="#10b981"
          />
          <Bar
            label="Salinity Delta"
            value={Math.abs(output.firstOrder.salinityDelta)}
            max={10}
            color="#3b82f6"
          />
          <Bar
            label="Nitrogen Delta"
            value={Math.abs(output.firstOrder.nitrogenDelta)}
            max={50}
            color="#84cc16"
          />
          <div className="mt-1 pt-1 border-t border-border">
            <Bar
              label="Overall Stress"
              value={output.firstOrder.overallAbioticStress}
              color="#ef4444"
            />
          </div>
        </div>
      </div>
      <div className="flex-1">
        <h4 className="text-[10px] uppercase font-bold text-textMain opacity-70 mb-2 border-b border-border pb-1">
          2nd Order: Population Hits
        </h4>
        <div className="flex flex-col gap-2">
          <Bar label="Diadema Decline" value={output.secondOrder.diademaDecline} color="#a3a3a3" />
          <Bar
            label="Parrotfish Decline"
            value={output.secondOrder.parrotfishDecline}
            color="#a3a3a3"
          />
          <Bar label="Coral Cover Loss" value={output.secondOrder.coralCoverLoss} color="#525252" />
          <Bar label="Algae Surge" value={output.secondOrder.algaeSurge} color="#eab308" />
        </div>
      </div>
      <div className="flex-1">
        <h4 className="text-[10px] uppercase font-bold text-textMain opacity-70 mb-2 border-b border-border pb-1">
          3rd Order: Outcomes
        </h4>
        <div className="flex flex-col gap-2">
          <Bar
            label="Reef Collapse Risk"
            value={output.thirdOrder.reefCollapseRisk}
            color="#ef4444"
          />
          <Bar
            label="Food Web Stability"
            value={output.thirdOrder.foodWebStability}
            color="#3b82f6"
          />
          <Bar
            label="Unknown Species Threat"
            value={output.thirdOrder.unknownSpeciesThreat}
            color="#a855f7"
          />
        </div>
      </div>
    </div>
  );
}

function ProjectionView({ projection }: { projection: CascadeOutput['projection'] }) {
  return (
    <div className="h-full w-full relative min-h-[150px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={projection} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
          <XAxis dataKey="year" stroke="#71717a" fontSize={10} tickMargin={8} />
          <YAxis stroke="#71717a" fontSize={10} domain={[0, 100]} />
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--color-bgCard)',
              border: '1px solid var(--color-border)',
              borderRadius: '4px',
              fontSize: '12px',
            }}
            itemStyle={{ fontSize: '12px' }}
          />
          <Legend wrapperStyle={{ fontSize: '10px' }} iconType="circle" />

          <Area
            type="monotone"
            dataKey="upperBound"
            stroke="none"
            fill="#10b981"
            fillOpacity={0.1}
            isAnimationActive={false}
          />
          <Area
            type="monotone"
            dataKey="lowerBound"
            stroke="none"
            fill="var(--color-bgCard)"
            fillOpacity={1}
            isAnimationActive={false}
          />

          <Area
            type="monotone"
            dataKey="stability"
            name="Stability"
            stroke="#10b981"
            strokeWidth={2}
            fill="none"
            isAnimationActive={false}
          />
          <Area
            type="monotone"
            dataKey="coralCover"
            name="Coral Cover"
            stroke="#f43f5e"
            strokeWidth={2}
            fill="none"
            isAnimationActive={false}
          />
          <Area
            type="monotone"
            dataKey="algaeCover"
            name="Algae Cover"
            stroke="#eab308"
            strokeWidth={2}
            fill="none"
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function SummaryView({ output }: { output: CascadeOutput }) {
  const { thirdOrder } = output;
  const score = thirdOrder.legalExposureScore;
  let scoreColor = '#10b981';
  if (score > 30) scoreColor = '#f59e0b';
  if (score > 60) scoreColor = '#ef4444';

  return (
    <div className="flex gap-4 text-xs text-textMain h-full">
      <div className="bg-bg p-4 rounded border border-border flex-1 flex flex-col justify-center">
        <h3 className="font-bold text-sm mb-2 uppercase tracking-wider text-textMuted">
          Hero Metric
        </h3>
        <div className="flex items-end gap-2">
          <span className="text-4xl font-bold font-mono leading-none" style={{ color: scoreColor }}>
            {score.toFixed(1)}
          </span>
          <span className="text-textMuted mb-1 font-bold">/ 100 Legal Exposure Score</span>
        </div>
        <p className="text-textMuted mt-3 leading-relaxed">
          This score represents the vulnerability of the current disruption scenario to legal
          challenge under environmental protection statutes.
        </p>
      </div>

      <div className="flex-1 flex flex-col gap-2">
        <div className="bg-bg p-3 rounded border border-border">
          <h4 className="font-bold text-textMuted uppercase mb-2 text-[10px]">Ecosystem Threats</h4>
          <ul className="space-y-1">
            <li className="flex justify-between">
              Reef Collapse:{' '}
              <span className="font-mono font-bold text-error">
                {thirdOrder.reefCollapseRisk.toFixed(1)}%
              </span>
            </li>
            <li className="flex justify-between">
              Food Web Stability:{' '}
              <span className="font-mono font-bold" style={{ color: '#3b82f6' }}>
                {thirdOrder.foodWebStability.toFixed(1)}%
              </span>
            </li>
            <li className="flex justify-between">
              Unknown Species Threat:{' '}
              <span className="font-mono font-bold" style={{ color: '#a855f7' }}>
                {thirdOrder.unknownSpeciesThreat.toFixed(1)}%
              </span>
            </li>
          </ul>
        </div>

        <p className="text-[10px] text-textMuted italic bg-primary/10 p-2 border-l-2 border-primary rounded-r">
          Determined via multi-order cascade model without stochastic components.
        </p>
      </div>
    </div>
  );
}
