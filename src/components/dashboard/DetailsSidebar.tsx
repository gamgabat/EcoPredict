import React from 'react';
import { useSimulationStore } from '@/store/simulationStore';
import { motion, AnimatePresence } from 'framer-motion';

// ── Reusable slider row ───────────────────────────────────────────────────────
interface SliderRowProps {
  label: string;
  value: number;
  unit: string;
  accentColor: string;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  locked?: boolean;
}

function SliderRow({ label, value, unit, accentColor, min, max, step, onChange, locked }: SliderRowProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex justify-between items-center">
        <label className="text-xs font-bold text-textMuted">{label}</label>
        <span className="text-xs text-textMain font-mono bg-bg px-1.5 py-0.5 rounded border border-border">
          {typeof value === 'number' ? value.toFixed(step < 1 ? 1 : 0) : value}{unit}
        </span>
      </div>
      <input
        type="range"
        disabled={locked}
        className="w-full h-1.5 cursor-pointer appearance-none rounded-full bg-textMuted/30 disabled:opacity-40 disabled:cursor-not-allowed"
        style={{ accentColor }}
        min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
      />
    </div>
  );
}

// ── Health bar ────────────────────────────────────────────────────────────────
function HealthBar({ value, color }: { value: number; color: string }) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div className="w-full bg-textMuted/20 rounded-full h-2 overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${clamped}%`, backgroundColor: color }}
      />
    </div>
  );
}

// ── Tolerance row ─────────────────────────────────────────────────────────────
interface ToleranceRowProps {
  label: string;
  current: number;
  safeMin: number;
  safeMax: number;
  warnMin?: number;
  warnMax?: number;
  unit: string;
  icon: string;
  invertDanger?: boolean; // for metrics where higher is worse (e.g. disease)
}

function ToleranceRow({ label, current, safeMin, safeMax, warnMin, warnMax, unit, icon, invertDanger }: ToleranceRowProps) {
  const inSafe = current >= safeMin && current <= safeMax;
  const inWarn = !inSafe && warnMin !== undefined && warnMax !== undefined && current >= warnMin && current <= warnMax;
  const status = inSafe ? 'safe' : inWarn ? 'warn' : 'danger';
  const colors = { safe: '#22c55e', warn: '#f59e0b', danger: '#ef4444' };
  const labels = { safe: 'OK', warn: 'Stress', danger: 'Critical' };
  const color = colors[status];

  return (
    <div className="flex items-center gap-2">
      <span className="text-base w-5 flex-shrink-0">{icon}</span>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center">
          <span className="text-[10px] font-bold text-textMuted truncate">{label}</span>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <span className="text-[10px] font-mono text-textMain">{typeof current === 'number' && !Number.isInteger(current) ? current.toFixed(1) : current}{unit}</span>
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ backgroundColor: `${color}20`, color }}>{labels[status]}</span>
          </div>
        </div>
        <div className="text-[9px] text-textMuted/60 mt-0.5">Safe: {safeMin}–{safeMax}{unit}</div>
      </div>
    </div>
  );
}

// ── Info chip row ─────────────────────────────────────────────────────────────
function InfoChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-start gap-2">
      <span className="text-[10px] text-textMuted flex-shrink-0">{label}</span>
      <span className="text-[10px] text-textMain text-right font-medium">{value}</span>
    </div>
  );
}

// ── Section divider ───────────────────────────────────────────────────────────
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2.5">
      <span className="text-[9px] font-bold text-textMuted uppercase tracking-widest opacity-60">{title}</span>
      {children}
    </div>
  );
}

// ── Per-creature detail content ───────────────────────────────────────────────
function CreatureDetail({ nodeId }: { nodeId: string }) {
  const store = useSimulationStore();
  const { diademaHealth, algaeCover, coralHealth, bleachingRisk } = store.getEcosystemMetrics();
  const { temperature, phLevel, salinity, nitrogenLoading, scltdOutbreakRisk } = store;

  if (nodeId === 's-diadema') {
    const status = diademaHealth < 40 ? 'Population Crash' : diademaHealth < 65 ? 'Declining' : 'Healthy';
    const statusColor = diademaHealth < 40 ? '#ef4444' : diademaHealth < 65 ? '#f59e0b' : '#22c55e';
    return (
      <div className="flex flex-col gap-4">
        <Section title="Population Status">
          <div className="flex justify-between items-center">
            <HealthBar value={diademaHealth} color="#64748b" />
            <span className="text-[10px] font-bold ml-2 flex-shrink-0" style={{ color: statusColor }}>{Math.round(diademaHealth)}%</span>
          </div>
          <span className="text-[10px] font-bold" style={{ color: statusColor }}>{status}</span>
        </Section>

        <Section title="Environmental Tolerances">
          <ToleranceRow label="Temperature" current={temperature} safeMin={22} safeMax={29} warnMin={20} warnMax={31} unit="°C" icon="🌡️" />
          <ToleranceRow label="pH Level" current={phLevel} safeMin={7.9} safeMax={8.3} warnMin={7.7} warnMax={8.5} unit="" icon="⚗️" />
          <ToleranceRow label="Salinity" current={salinity} safeMin={33} safeMax={36} warnMin={30} warnMax={40} unit=" ppt" icon="🧂" />
          <ToleranceRow label="SCLTD Risk" current={scltdOutbreakRisk} safeMin={0} safeMax={15} warnMin={0} warnMax={30} unit="%" icon="🦠" invertDanger />
        </Section>

        <Section title="Controls">
          <SliderRow label="Population Density" value={store.diademaPopulation} unit="%" accentColor="#64748b" min={0} max={100} step={1} onChange={store.setDiademaPopulation} />
        </Section>

        <Section title="Species Profile">
          <InfoChip label="Classification" value="Echinodermata · Echinoidea" />
          <InfoChip label="Lifespan" value="~10–15 years" />
          <InfoChip label="Diet" value="Macroalgae, turf algae, detritus" />
          <InfoChip label="Reproduction" value="Broadcast spawning" />
          <InfoChip label="Key Threat" value="SCLTD disease (1983 mass die-off wiped 97% of Caribbean population)" />
          <InfoChip label="Ecological Role" value="Primary bioeroder & reef grazer; prevents algal takeover" />
        </Section>
      </div>
    );
  }

  if (nodeId === 's-algae') {
    const status = algaeCover > 60 ? 'Dominant' : algaeCover > 40 ? 'Blooming' : algaeCover > 20 ? 'Moderate' : 'Controlled';
    const statusColor = algaeCover > 60 ? '#ef4444' : algaeCover > 40 ? '#f59e0b' : '#10b981';
    return (
      <div className="flex flex-col gap-4">
        <Section title="Cover Status">
          <div className="flex justify-between items-center">
            <HealthBar value={algaeCover} color="#10b981" />
            <span className="text-[10px] font-bold ml-2 flex-shrink-0" style={{ color: statusColor }}>{Math.round(algaeCover)}%</span>
          </div>
          <span className="text-[10px] font-bold" style={{ color: statusColor }}>{status}</span>
          {algaeCover > 40 && <div className="bg-error/10 border border-error/30 rounded p-2 text-[10px] text-error">⚠ Above 40% cover — smothering corals</div>}
        </Section>

        <Section title="Growth Conditions (Current)">
          <ToleranceRow label="Temperature" current={temperature} safeMin={20} safeMax={32} unit="°C" icon="🌡️" />
          <ToleranceRow label="Nitrogen Loading" current={nitrogenLoading} safeMin={0} safeMax={20} warnMin={0} warnMax={40} unit="%" icon="⚗️" invertDanger />
          <ToleranceRow label="pH Level" current={phLevel} safeMin={7.0} safeMax={9.0} unit="" icon="💧" />
          <ToleranceRow label="Salinity" current={salinity} safeMin={25} safeMax={40} unit=" ppt" icon="🧂" />
        </Section>

        <Section title="Controls">
          <SliderRow label="Growth Rate Multiplier" value={store.algaeGrowthRate} unit="%" accentColor="#10b981" min={0} max={100} step={1} onChange={store.setAlgaeGrowthRate} />
        </Section>

        <Section title="Species Profile">
          <InfoChip label="Classification" value="Chlorophyta / Rhodophyta" />
          <InfoChip label="Growth" value="0.5–2 cm/day under high nutrients" />
          <InfoChip label="Critical Threshold" value=">40% cover → smothering phase" />
          <InfoChip label="Key Driver" value="Nitrogen runoff + loss of herbivores" />
          <InfoChip label="Natural Controls" value="Diadema urchins, parrotfish, surgeonfish" />
          <InfoChip label="Ecological Risk" value="Phase shift from coral to algae-dominated reef is often irreversible" />
        </Section>
      </div>
    );
  }

  if (nodeId === 'c-porites' || nodeId === 'c-monta' || nodeId === 'c-sidera') {
    const isBleaching = bleachingRisk > 30;
    const status = isBleaching ? 'Bleaching' : coralHealth < 30 ? 'Critical' : coralHealth < 55 ? 'Stressed' : 'Healthy';
    const statusColor = isBleaching ? '#ef4444' : coralHealth < 30 ? '#ef4444' : coralHealth < 55 ? '#f59e0b' : '#22c55e';

    const speciesData: Record<string, { name: string; depth: string; growth: string; resilience: string; notes: string }> = {
      'c-porites': { name: 'Porites astreoides', depth: '0–50 m', growth: '3–5 mm/yr (massive form)', resilience: 'High — tolerates turbidity & pollution', notes: 'Star coral; one of the most common Caribbean coral. Can survive mild bleaching.' },
      'c-monta': { name: 'Montastraea cavernosa', depth: '1–70 m', growth: '5–12 mm/yr', resilience: 'Moderate — sensitive to sedimentation', notes: 'Great star coral; ecologically dominant in deep reef zones. Major reef builder.' },
      'c-sidera': { name: 'Siderastrea siderea', depth: '0–70 m', growth: '4–6 mm/yr', resilience: 'Very High — most tolerant of Caribbean corals', notes: 'Massive starlet coral; extremely durable. Survives bleaching events that kill others.' },
    };
    const sp = speciesData[nodeId];

    return (
      <div className="flex flex-col gap-4">
        <Section title="Colony Health">
          <div className="flex justify-between items-center">
            <HealthBar value={coralHealth} color="#f97316" />
            <span className="text-[10px] font-bold ml-2 flex-shrink-0" style={{ color: statusColor }}>{Math.round(coralHealth)}%</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold" style={{ color: statusColor }}>{status}</span>
            {isBleaching && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-error/20 text-error font-bold animate-pulse">BLEACHING</span>}
          </div>
          {isBleaching && <div className="bg-error/10 border border-error/30 rounded p-2 text-[10px] text-error">⚠ Reduce temperature below 29°C or increase coral resilience to halt bleaching.</div>}
        </Section>

        <Section title="Environmental Tolerances">
          <ToleranceRow label="Temperature" current={temperature} safeMin={23} safeMax={29} warnMin={20} warnMax={31} unit="°C" icon="🌡️" />
          <ToleranceRow label="pH Level" current={phLevel} safeMin={7.9} safeMax={8.3} warnMin={7.7} warnMax={8.5} unit="" icon="⚗️" />
          <ToleranceRow label="Salinity" current={salinity} safeMin={32} safeMax={42} warnMin={28} warnMax={45} unit=" ppt" icon="🧂" />
          <ToleranceRow label="Algae Cover" current={algaeCover} safeMin={0} safeMax={25} warnMin={0} warnMax={40} unit="%" icon="🌿" invertDanger />
          <ToleranceRow label="SCLTD Risk" current={scltdOutbreakRisk} safeMin={0} safeMax={20} warnMin={0} warnMax={40} unit="%" icon="🦠" invertDanger />
        </Section>

        <Section title="Controls">
          <SliderRow label="Resilience (all coral spp.)" value={store.coralResilience} unit="%" accentColor="#f97316" min={0} max={100} step={1} onChange={store.setCoralResilience} />
        </Section>

        <Section title="Species Profile">
          <InfoChip label="Species" value={sp.name} />
          <InfoChip label="Depth Range" value={sp.depth} />
          <InfoChip label="Growth Rate" value={sp.growth} />
          <InfoChip label="Resilience" value={sp.resilience} />
          <InfoChip label="Bleach Threshold" value=">29°C for 2+ weeks" />
          <InfoChip label="Notes" value={sp.notes} />
        </Section>
      </div>
    );
  }

  if (nodeId === 'u-alpha') {
    return (
      <div className="flex flex-col gap-4">
        <div className="text-[10px] px-2 py-1 rounded-full font-bold inline-flex items-center gap-1 self-start"
          style={{ backgroundColor: '#a855f720', color: '#a855f7', border: '1px solid #a855f740' }}>
          ✦ AI-Predicted Species
        </div>
        <Section title="Predicted Traits">
          <SliderRow label="Predation Strength" value={store.unknownSpeciesAlpha.predationStrength} unit="%" accentColor="#a855f7" min={0} max={100} step={1} onChange={(v) => store.setUnknownSpeciesAlpha({ predationStrength: v })} />
          <SliderRow label="Space Competition" value={store.unknownSpeciesAlpha.competitionWithCoral} unit="%" accentColor="#a855f7" min={0} max={100} step={1} onChange={(v) => store.setUnknownSpeciesAlpha({ competitionWithCoral: v })} />
          <SliderRow label="Population Estimate" value={store.unknownSpeciesAlpha.populationEstimate} unit="%" accentColor="#a855f7" min={0} max={100} step={1} onChange={(v) => store.setUnknownSpeciesAlpha({ populationEstimate: v })} />
        </Section>
        <Section title="Predicted Profile">
          <InfoChip label="Primary Role" value="Algae predator / herbivore" />
          <InfoChip label="Key Effect" value="Reduces macroalgae cover" />
          <InfoChip label="Side Effect" value="Competes with coral for settlement space" />
          <InfoChip label="Confidence" value="Model-derived — not field-verified" />
          <InfoChip label="Basis" value="Trait inferred from current algae overload and grazer deficit" />
        </Section>
      </div>
    );
  }

  if (nodeId === 'u-beta') {
    return (
      <div className="flex flex-col gap-4">
        <div className="text-[10px] px-2 py-1 rounded-full font-bold inline-flex items-center gap-1 self-start"
          style={{ backgroundColor: '#7c3aed20', color: '#7c3aed', border: '1px solid #7c3aed40' }}>
          ✦ AI-Predicted Species
        </div>
        <Section title="Predicted Traits">
          <SliderRow label="Disease Resistance" value={store.unknownSpeciesBeta.diseaseResistance} unit="%" accentColor="#7c3aed" min={0} max={100} step={1} onChange={(v) => store.setUnknownSpeciesBeta({ diseaseResistance: v })} />
          <SliderRow label="Nutrient Uptake" value={store.unknownSpeciesBeta.nutrientUptake} unit="%" accentColor="#7c3aed" min={0} max={100} step={1} onChange={(v) => store.setUnknownSpeciesBeta({ nutrientUptake: v })} />
          <SliderRow label="Population Estimate" value={store.unknownSpeciesBeta.populationEstimate} unit="%" accentColor="#7c3aed" min={0} max={100} step={1} onChange={(v) => store.setUnknownSpeciesBeta({ populationEstimate: v })} />
        </Section>
        <Section title="Predicted Profile">
          <InfoChip label="Primary Role" value="Disease buffer / nutrient sink" />
          <InfoChip label="Key Effect" value="Reduces SCLTD risk & nitrogen load" />
          <InfoChip label="Side Effect" value="None predicted — net beneficial" />
          <InfoChip label="Confidence" value="Model-derived — not field-verified" />
          <InfoChip label="Basis" value="Trait inferred from high disease risk and nitrogen overload in current conditions" />
        </Section>
      </div>
    );
  }

  if (nodeId === 'p-parrot') {
    const h = metrics.parrotfishHealth;
    const status = h < 30 ? 'Depleted' : h < 60 ? 'Low' : 'Abundant';
    const sc = h < 30 ? '#ef4444' : h < 60 ? '#f59e0b' : '#22c55e';
    return (
      <div className="flex flex-col gap-4">
        <Section title="Population Status">
          <div className="flex justify-between items-center"><HealthBar value={h} color="#8b5cf6" /><span className="text-[10px] font-bold ml-2 flex-shrink-0" style={{ color: sc }}>{Math.round(h)}%</span></div>
          <span className="text-[10px] font-bold" style={{ color: sc }}>{status}</span>
        </Section>
        <Section title="Environmental Tolerances">
          <ToleranceRow label="Temperature" current={temperature} safeMin={22} safeMax={30} warnMin={20} warnMax={32} unit="°C" icon="🌡️" />
          <ToleranceRow label="Lionfish Presence" current={lionfishPresence} safeMin={0} safeMax={20} warnMin={0} warnMax={40} unit="%" icon="🔴" invertDanger />
          <ToleranceRow label="pH Level" current={phLevel} safeMin={7.8} safeMax={8.3} unit="" icon="⚗️" />
        </Section>
        <Section title="Controls">
          <SliderRow label="Population" value={store.parrotfishPopulation} unit="%" accentColor="#8b5cf6" min={0} max={100} step={1} onChange={store.setParrotfishPopulation} />
        </Section>
        <Section title="Species Profile">
          <InfoChip label="Classification" value="Labridae (Scarinae)" />
          <InfoChip label="Diet" value="Macroalgae, coral tissue (biting)" />
          <InfoChip label="Role" value="Major reef grazer & bioeroder" />
          <InfoChip label="Sand Origin" value="Digests coral skeleton → 80% of reef sand" />
          <InfoChip label="Key Threat" value="Overfishing, Lionfish predation on juveniles" />
          <InfoChip label="Lifespan" value="7–12 years" />
        </Section>
      </div>
    );
  }

  if (nodeId === 'p-surgeon') {
    const h = metrics.surgeonFishHealth;
    const sc = h < 30 ? '#ef4444' : h < 60 ? '#f59e0b' : '#22c55e';
    return (
      <div className="flex flex-col gap-4">
        <Section title="Population Status">
          <div className="flex justify-between items-center"><HealthBar value={h} color="#0ea5e9" /><span className="text-[10px] font-bold ml-2 flex-shrink-0" style={{ color: sc }}>{Math.round(h)}%</span></div>
        </Section>
        <Section title="Environmental Tolerances">
          <ToleranceRow label="Temperature" current={temperature} safeMin={22} safeMax={30} warnMin={20} warnMax={32} unit="°C" icon="🌡️" />
          <ToleranceRow label="Lionfish Pressure" current={lionfishPresence} safeMin={0} safeMax={20} warnMin={0} warnMax={45} unit="%" icon="🔴" invertDanger />
        </Section>
        <Section title="Species Profile">
          <InfoChip label="Classification" value="Acanthuridae" />
          <InfoChip label="Diet" value="Turf algae, detritus" />
          <InfoChip label="Role" value="Secondary grazer, complements urchins" />
          <InfoChip label="Defense" value="Caudal spine (surgeonfish name origin)" />
          <InfoChip label="Key Threat" value="Lionfish predation on juveniles" />
        </Section>
      </div>
    );
  }

  if (nodeId === 'p-grouper') {
    const h = metrics.grouperHealth;
    const sc = h < 30 ? '#ef4444' : h < 60 ? '#f59e0b' : '#22c55e';
    return (
      <div className="flex flex-col gap-4">
        <Section title="Population Status">
          <div className="flex justify-between items-center"><HealthBar value={h} color="#475569" /><span className="text-[10px] font-bold ml-2 flex-shrink-0" style={{ color: sc }}>{Math.round(h)}%</span></div>
        </Section>
        <Section title="Environmental Tolerances">
          <ToleranceRow label="Temperature" current={temperature} safeMin={21} safeMax={29} warnMin={19} warnMax={31} unit="°C" icon="🌡️" />
          <ToleranceRow label="Lionfish Competition" current={lionfishPresence} safeMin={0} safeMax={30} warnMin={0} warnMax={60} unit="%" icon="⚔️" invertDanger />
        </Section>
        <Section title="Controls">
          <SliderRow label="Population" value={store.grouperPopulation} unit="%" accentColor="#475569" min={0} max={100} step={1} onChange={store.setGrouperPopulation} />
        </Section>
        <Section title="Species Profile">
          <InfoChip label="Classification" value="Epinephelidae" />
          <InfoChip label="Role" value="Apex reef predator; controls herbivore populations" />
          <InfoChip label="Diet" value="Parrotfish, surgeonfish, snappers" />
          <InfoChip label="Ecological Value" value="Trophic cascade: fewer groupers → more parrotfish → less algae" />
          <InfoChip label="Key Threat" value="Overfishing, warm-water stress, lionfish competition" />
        </Section>
      </div>
    );
  }

  if (nodeId === 'p-lion') {
    const h = metrics.lionfishDanger;
    const sc = h < 20 ? '#22c55e' : h < 50 ? '#f59e0b' : '#ef4444';
    const label = h < 20 ? 'Minimal Threat' : h < 50 ? 'Spreading' : 'Dominant Threat';
    return (
      <div className="flex flex-col gap-4">
        <div className="bg-error/10 border border-error/30 rounded p-2 text-[10px] text-error font-bold">⚠ Invasive Species — native to Indo-Pacific</div>
        <Section title="Threat Level">
          <div className="flex justify-between items-center"><HealthBar value={h} color="#dc2626" /><span className="text-[10px] font-bold ml-2 flex-shrink-0" style={{ color: sc }}>{Math.round(h)}%</span></div>
          <span className="text-[10px] font-bold" style={{ color: sc }}>{label}</span>
        </Section>
        <Section title="Conditions (Thrives in)">
          <ToleranceRow label="Temperature" current={temperature} safeMin={22} safeMax={35} unit="°C" icon="🌡️" />
          <ToleranceRow label="Reef Complexity" current={100 - metrics.coralHealth} safeMin={20} safeMax={80} unit="%" icon="🪸" />
        </Section>
        <Section title="Controls">
          <SliderRow label="Presence / Pressure" value={store.lionfishPresence} unit="%" accentColor="#dc2626" min={0} max={100} step={1} onChange={store.setLionfishPresence} />
        </Section>
        <Section title="Species Profile">
          <InfoChip label="Classification" value="Scorpaenidae · Pterois volitans" />
          <InfoChip label="Origin" value="Indo-Pacific; first Caribbean sighting 1985" />
          <InfoChip label="Diet" value="Juvenile parrotfish, surgeonfish, crustaceans" />
          <InfoChip label="Danger" value="No natural Caribbean predators; reproduces every 4 days" />
          <InfoChip label="Control" value="Manual removal (culling), training grouper" />
        </Section>
      </div>
    );
  }

  if (nodeId === 'p-damsel') {
    const h = metrics.damselFishActivity;
    const sc = h < 30 ? '#64748b' : h < 60 ? '#f59e0b' : '#ef4444';
    return (
      <div className="flex flex-col gap-4">
        <Section title="Activity Level">
          <div className="flex justify-between items-center"><HealthBar value={h} color="#f59e0b" /><span className="text-[10px] font-bold ml-2 flex-shrink-0" style={{ color: sc }}>{Math.round(h)}%</span></div>
          <span className="text-[10px] text-textMuted text-[9px]">Higher algae cover = higher damselfish territoriality</span>
        </Section>
        <Section title="Species Profile">
          <InfoChip label="Classification" value="Pomacentridae" />
          <InfoChip label="Behavior" value="Farms algae patches; aggressively defends territory" />
          <InfoChip label="Net Effect" value="Increases local algae cover; reduces grazer access" />
          <InfoChip label="Competition" value="Territorial conflict with Diadema urchins" />
          <InfoChip label="Note" value="Paradoxically harms reef by promoting the algae that smothers it" />
        </Section>
      </div>
    );
  }

  if (nodeId === 'zoo') {
    const h = metrics.zooplanktonDensity;
    const sc = h < 30 ? '#ef4444' : h < 60 ? '#f59e0b' : '#22c55e';
    return (
      <div className="flex flex-col gap-4">
        <Section title="Population Density">
          <div className="flex justify-between items-center"><HealthBar value={h} color="#06b6d4" /><span className="text-[10px] font-bold ml-2 flex-shrink-0" style={{ color: sc }}>{Math.round(h)}%</span></div>
        </Section>
        <Section title="Environmental Tolerances">
          <ToleranceRow label="Temperature" current={temperature} safeMin={20} safeMax={29} warnMin={18} warnMax={31} unit="°C" icon="🌡️" />
          <ToleranceRow label="Nitrogen Loading" current={nitrogenLoading} safeMin={0} safeMax={30} warnMin={0} warnMax={60} unit="%" icon="⚗️" invertDanger />
          <ToleranceRow label="pH Level" current={phLevel} safeMin={7.8} safeMax={8.4} unit="" icon="💧" />
        </Section>
        <Section title="Species Profile">
          <InfoChip label="Group" value="Copepods, amphipods, larvae, fish eggs" />
          <InfoChip label="Role" value="Primary food source for filter-feeding corals" />
          <InfoChip label="Coral Link" value="Zooplankton provides ~70% of coral nitrogen budget" />
          <InfoChip label="Key Threat" value="Bleaching events, ocean acidification, eutrophication" />
        </Section>
      </div>
    );
  }

  if (nodeId === 'p-sponge') {
    const h = metrics.spongeCompetition;
    const sc = h < 30 ? '#64748b' : h < 60 ? '#f59e0b' : '#ef4444';
    return (
      <div className="flex flex-col gap-4">
        <Section title="Competitive Pressure">
          <div className="flex justify-between items-center"><HealthBar value={h} color="#d97706" /><span className="text-[10px] font-bold ml-2 flex-shrink-0" style={{ color: sc }}>{Math.round(h)}%</span></div>
          <span className="text-[9px] text-textMuted">Higher value = more coral space displaced</span>
        </Section>
        <Section title="Growth Conditions">
          <ToleranceRow label="Temperature" current={temperature} safeMin={20} safeMax={33} unit="°C" icon="🌡️" />
          <ToleranceRow label="Nitrogen (benefits)" current={nitrogenLoading} safeMin={10} safeMax={100} unit="%" icon="⚗️" />
        </Section>
        <Section title="Species Profile">
          <InfoChip label="Phylum" value="Porifera" />
          <InfoChip label="Role" value="Filter feeders; compete with coral for hard substrate" />
          <InfoChip label="Nitrogen Tolerance" value="Thrive in eutrophic conditions that stress corals" />
          <InfoChip label="Net Effect" value="Reef phase-shift indicator: high sponge cover = degraded reef" />
          <InfoChip label="Benefit" value="Provide habitat; support biodiversity during transitions" />
        </Section>
      </div>
    );
  }

  return null;
}


// ── Main sidebar ──────────────────────────────────────────────────────────────
export default function DetailsSidebar() {
  const store = useSimulationStore();
  const { 
    selectedNodeId,
    areUnknownSpeciesDiscovered, setUnknownSpeciesDiscovered,
    isScanning, setIsScanning,
    setUnknownSpeciesAlpha, setUnknownSpeciesBeta,
    nitrogenLoading, scltdOutbreakRisk, getEcosystemMetrics
  } = store;

  const NODE_LABELS: Record<string, string> = {
    's-diadema': 'Diadema (Urchin)',
    's-algae':   'Macroalgae Turf',
    'c-porites': 'Porites astreoides',
    'c-monta':   'Montastraea cavern.',
    'c-sidera':  'Siderastrea siderea',
    'u-alpha':   'Unknown Species α',
    'u-beta':    'Unknown Species β',
    'zoo':       'Zooplankton',
    'p-parrot':  'Parrotfish',
    'p-surgeon': 'Surgeonfish',
    'p-grouper': 'Grouper',
    'p-lion':    'Lionfish (Invasive)',
    'p-damsel':  'Damselfish',
    'p-sponge':  'Sponges',
  };

  const NODE_COLORS: Record<string, string> = {
    's-diadema': '#64748b',
    's-algae':   '#10b981',
    'c-porites': '#f97316',
    'c-monta':   '#f97316',
    'c-sidera':  '#f97316',
    'u-alpha':   '#a855f7',
    'u-beta':    '#7c3aed',
    'zoo':       '#06b6d4',
    'p-parrot':  '#8b5cf6',
    'p-surgeon': '#0ea5e9',
    'p-grouper': '#475569',
    'p-lion':    '#dc2626',
    'p-damsel':  '#f59e0b',
    'p-sponge':  '#d97706',
  };

  return (
    <div className="h-full flex flex-col gap-0 overflow-hidden">
      {/* ── Top: Global Environment ── */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 border-b border-border">
        <h3 className="text-xs font-bold text-textMain uppercase tracking-widest opacity-70">Environment</h3>
        <SliderRow label="Temperature" value={store.temperature} unit="°C" accentColor="#f59e0b" min={20} max={35} step={0.5} onChange={store.setTemperature} />
        <SliderRow label="SCLTD Disease" value={store.scltdOutbreakRisk} unit="%" accentColor="#ef4444" min={0} max={100} step={1} onChange={store.setScltdOutbreakRisk} />
        <SliderRow label="Nitrogen Loading" value={store.nitrogenLoading} unit="%" accentColor="#84cc16" min={0} max={100} step={1} onChange={store.setNitrogenLoading} />
        <SliderRow label="pH Level" value={store.phLevel} unit="" accentColor="#10b981" min={7.0} max={8.5} step={0.1} onChange={store.setPhLevel} />
        <SliderRow label="Salinity" value={store.salinity} unit=" ppt" accentColor="#3b82f6" min={20} max={45} step={1} onChange={store.setSalinity} />
        <div className="border-t border-border pt-3">
          <h3 className="text-xs font-bold text-textMain uppercase tracking-widest opacity-70 mb-3">Species Controls</h3>
          <div className="flex flex-col gap-3">
            <SliderRow label="Urchin Density" value={store.diademaPopulation} unit="%" accentColor="#64748b" min={0} max={100} step={1} onChange={store.setDiademaPopulation} />
            <SliderRow label="Algae Growth Rate" value={store.algaeGrowthRate} unit="%" accentColor="#10b981" min={0} max={100} step={1} onChange={store.setAlgaeGrowthRate} />
            <SliderRow label="Coral Resilience" value={store.coralResilience} unit="%" accentColor="#f97316" min={0} max={100} step={1} onChange={store.setCoralResilience} />
            <SliderRow label="Parrotfish Pop." value={store.parrotfishPopulation} unit="%" accentColor="#8b5cf6" min={0} max={100} step={1} onChange={store.setParrotfishPopulation} />
            <SliderRow label="Grouper Pop." value={store.grouperPopulation} unit="%" accentColor="#475569" min={0} max={100} step={1} onChange={store.setGrouperPopulation} />
            <SliderRow label="Lionfish Presence" value={store.lionfishPresence} unit="%" accentColor="#dc2626" min={0} max={100} step={1} onChange={store.setLionfishPresence} />
          </div>
        </div>
      </div>

      {/* ── Bottom: Selected Creature ── */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
        <AnimatePresence mode="wait">
          {selectedNodeId && NODE_LABELS[selectedNodeId] ? (
            <motion.div
              key={selectedNodeId}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col gap-4"
            >
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: NODE_COLORS[selectedNodeId] }} />
                <h3 className="text-xs font-bold text-textMain uppercase tracking-widest opacity-70 truncate">
                  {NODE_LABELS[selectedNodeId]}
                </h3>
              </div>
              <CreatureDetail nodeId={selectedNodeId} />
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col items-center justify-center text-center gap-3 py-8"
            >
              <div className="w-12 h-12 rounded-full bg-bgHover flex items-center justify-center">
                <svg className="w-6 h-6 text-textMuted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-bold text-textMuted">No creature selected</p>
                <p className="text-[10px] text-textMuted/60 mt-1">Click any node in the mind map<br/>to view and edit its details.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Bottom: AI Discovery Button ── */}
      <AnimatePresence>
        {!areUnknownSpeciesDiscovered && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="flex-shrink-0 p-3 border-t border-border"
          >
            <button
              onClick={() => {
                setIsScanning(true);
                const { algaeCover } = getEcosystemMetrics();
                setTimeout(() => {
                  const newAlphaPred = Math.floor(Math.random() * 30) + (algaeCover > 40 ? 40 : 10);
                  const newAlphaComp = Math.floor(Math.random() * 20);
                  const newBetaDisease = Math.floor(Math.random() * 30) + (scltdOutbreakRisk > 20 ? 40 : 10);
                  const newBetaNutrient = Math.floor(Math.random() * 30) + (nitrogenLoading > 30 ? 40 : 10);
                  setUnknownSpeciesAlpha({ predationStrength: newAlphaPred, competitionWithCoral: newAlphaComp, populationEstimate: Math.floor(Math.random() * 40) + 20 });
                  setUnknownSpeciesBeta({ diseaseResistance: newBetaDisease, nutrientUptake: newBetaNutrient, populationEstimate: Math.floor(Math.random() * 40) + 20 });
                  setIsScanning(false);
                  setUnknownSpeciesDiscovered(true);
                }, 2000);
              }}
              disabled={isScanning}
              className="w-full py-2.5 bg-primary hover:bg-primaryHover disabled:opacity-60 disabled:cursor-not-allowed text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {isScanning ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Scanning Ecosystem...
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Find Best Fitting Species
                </>
              )}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
