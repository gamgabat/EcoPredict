import { useSimulationStore } from '@/store/simulationStore';
import { motion } from 'framer-motion';
import { useMemo, useState } from 'react';

// Top-down map configuration
function generatePoints(count: number) {
  return Array.from({ length: count }, () => ({
    x: Math.random() * 96 + 2, // 2% to 98%
    y: Math.random() * 96 + 2,
    dx: Math.random() * 96 + 2, // Destination X for moving entities
    dy: Math.random() * 96 + 2, // Destination Y
    spd: 15 + Math.random() * 20, // Movement speed
  }));
}

export default function SimulationViewMap() {
  const [isLegendOpen, setIsLegendOpen] = useState(true);
  const store = useSimulationStore();
  const metrics = store.getEcosystemMetrics();

  const {
    diademaHealth,
    algaeCover,
    coralHealth,
    bleachingRisk,
    parrotfishHealth,
    surgeonFishHealth,
    grouperHealth,
    lionfishDanger,
    damselFishActivity,
  } = metrics;

  const coralCount = Math.floor((coralHealth / 100) * 80);
  const algaeCount = Math.floor((algaeCover / 100) * 60);
  const urchinCount = Math.floor((diademaHealth / 100) * 40);
  const parrotCount = Math.floor((parrotfishHealth / 100) * 14);
  const surgeonCount = Math.floor((surgeonFishHealth / 100) * 14);
  const grouperCount = Math.floor((grouperHealth / 100) * 10);
  const lionfishCount = Math.floor((lionfishDanger / 100) * 8);
  const damselCount = Math.floor((damselFishActivity / 100) * 18);
  const isBleaching = bleachingRisk > 30;

  // Generate stable positions to prevent re-rendering positions on every frame
  const coralPos = useMemo(() => generatePoints(100), []);
  const algaePos = useMemo(() => generatePoints(100), []);
  const urchinPos = useMemo(() => generatePoints(100), []);
  const parrotPos = useMemo(() => generatePoints(50), []);
  const surgeonPos = useMemo(() => generatePoints(50), []);
  const grouperPos = useMemo(() => generatePoints(50), []);
  const lionfishPos = useMemo(() => generatePoints(50), []);
  const damselPos = useMemo(() => generatePoints(50), []);

  const coralColor = isBleaching ? '#f8fafc' : '#f97316';

  return (
    <div className="w-full h-full relative overflow-hidden bg-[#EAE8DF]">
      {/* ── Top-down Sandy Seabed ── */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_#F7F6F2_0%,_#EAE8DF_100%)] opacity-80" />

      {/* ── Corals (Static Blocks) ── */}
      {coralPos.slice(0, coralCount).map((p, i) => (
        <motion.div
          key={`coral-${i}`}
          className="absolute rounded-sm pointer-events-none"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: 14,
            height: 14,
            backgroundColor: coralColor,
            border: `1px solid ${isBleaching ? '#cbd5e1' : '#c2410c'}`,
          }}
          animate={isBleaching ? { opacity: [1, 0.5, 1] } : { opacity: 1 }}
          transition={isBleaching ? { duration: 2, repeat: Infinity } : {}}
        />
      ))}

      {/* ── Algae (Static Patches) ── */}
      {algaePos.slice(0, algaeCount).map((p, i) => (
        <div
          key={`algae-${i}`}
          className="absolute rounded-full pointer-events-none opacity-60 mix-blend-multiply filter blur-[2px]"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: 28,
            height: 28,
            backgroundColor: '#16a34a',
          }}
        />
      ))}

      {/* ── Urchins (Slow Moving Dots) ── */}
      {urchinPos.slice(0, urchinCount).map((p, i) => (
        <motion.div
          key={`urchin-${i}`}
          className="absolute rounded-full pointer-events-none border border-slate-900"
          style={{ width: 8, height: 8, backgroundColor: '#475569' }}
          initial={{ left: `${p.x}%`, top: `${p.y}%` }}
          animate={{
            left: [`${p.x}%`, `${p.dx}%`, `${p.x}%`],
            top: [`${p.y}%`, `${p.dy}%`, `${p.y}%`],
          }}
          transition={{ duration: p.spd * 2, repeat: Infinity, ease: 'linear' }}
        />
      ))}

      {/* ── Fish (Moving Dots) ── */}
      {parrotPos.slice(0, parrotCount).map((p, i) => (
        <motion.div
          key={`parrot-${i}`}
          className="absolute rounded-full pointer-events-none border border-white/20"
          style={{
            width: 10,
            height: 10,
            backgroundColor: '#7c3aed',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
          }}
          initial={{ left: `${p.x}%`, top: `${p.y}%` }}
          animate={{
            left: [`${p.x}%`, `${p.dx}%`, `${p.x}%`],
            top: [`${p.y}%`, `${p.dy}%`, `${p.y}%`],
          }}
          transition={{ duration: p.spd, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
      {surgeonPos.slice(0, surgeonCount).map((p, i) => (
        <motion.div
          key={`surgeon-${i}`}
          className="absolute rounded-full pointer-events-none border border-white/20"
          style={{
            width: 10,
            height: 10,
            backgroundColor: '#2563eb',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
          }}
          initial={{ left: `${p.x}%`, top: `${p.y}%` }}
          animate={{
            left: [`${p.x}%`, `${p.dx}%`, `${p.x}%`],
            top: [`${p.y}%`, `${p.dy}%`, `${p.y}%`],
          }}
          transition={{ duration: p.spd, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
      {grouperPos.slice(0, grouperCount).map((p, i) => (
        <motion.div
          key={`grouper-${i}`}
          className="absolute rounded-full pointer-events-none border border-white/20"
          style={{
            width: 12,
            height: 12,
            backgroundColor: '#92400e',
            boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
          }}
          initial={{ left: `${p.x}%`, top: `${p.y}%` }}
          animate={{
            left: [`${p.x}%`, `${p.dx}%`, `${p.x}%`],
            top: [`${p.y}%`, `${p.dy}%`, `${p.y}%`],
          }}
          transition={{ duration: p.spd * 1.5, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
      {lionfishPos.slice(0, lionfishCount).map((p, i) => (
        <motion.div
          key={`lion-${i}`}
          className="absolute rounded-full pointer-events-none border border-white/20"
          style={{
            width: 12,
            height: 12,
            backgroundColor: '#dc2626',
            boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
          }}
          initial={{ left: `${p.x}%`, top: `${p.y}%` }}
          animate={{
            left: [`${p.x}%`, `${p.dx}%`, `${p.x}%`],
            top: [`${p.y}%`, `${p.dy}%`, `${p.y}%`],
          }}
          transition={{ duration: p.spd * 0.8, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
      {damselPos.slice(0, damselCount).map((p, i) => (
        <motion.div
          key={`damsel-${i}`}
          className="absolute rounded-full pointer-events-none border border-white/20"
          style={{
            width: 8,
            height: 8,
            backgroundColor: '#f59e0b',
            boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
          }}
          initial={{ left: `${p.x}%`, top: `${p.y}%` }}
          animate={{
            left: [`${p.x}%`, `${p.dx}%`, `${p.x}%`],
            top: [`${p.y}%`, `${p.dy}%`, `${p.y}%`],
          }}
          transition={{ duration: p.spd * 1.2, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}

      {/* ── Bleaching warning overlay ── */}
      {isBleaching && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse at center, rgba(248,250,252,0.3) 0%, transparent 70%)',
          }}
          animate={{ opacity: [0.4, 0.9, 0.4] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}

      {/* ── Algae murk overlay ── */}
      {algaeCover > 40 && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `rgba(22,163,74,${Math.min(0.2, ((algaeCover - 40) / 100) * 0.3)})`,
          }}
        />
      )}

      {/* ── HUD Legend ── */}
      <div className="absolute top-3 left-3 flex flex-col p-3 rounded-sm z-20 bg-bgCard border border-border shadow-md min-w-[140px]">
        <div
          className="flex justify-between items-center cursor-pointer select-none"
          onClick={() => setIsLegendOpen(!isLegendOpen)}
        >
          <span className="text-[10px] font-bold uppercase tracking-widest text-textMuted">
            Population Map
          </span>
          <span className="text-[10px] text-textMuted ml-2">{isLegendOpen ? '▼' : '▶'}</span>
        </div>

        {isLegendOpen && (
          <div className="flex flex-col gap-1.5 mt-3">
            {[
              { label: 'Coral', count: coralCount, color: coralColor, shape: 'square' },
              { label: 'Algae', count: algaeCount, color: '#16a34a', shape: 'circle' },
              { label: 'Urchins', count: urchinCount, color: '#475569', shape: 'circle' },
              { label: 'Parrotfish', count: parrotCount, color: '#7c3aed', shape: 'circle' },
              { label: 'Surgeonfish', count: surgeonCount, color: '#2563eb', shape: 'circle' },
              { label: 'Grouper', count: grouperCount, color: '#92400e', shape: 'circle' },
              { label: 'Lionfish', count: lionfishCount, color: '#dc2626', shape: 'circle' },
              { label: 'Damselfish', count: damselCount, color: '#f59e0b', shape: 'circle' },
            ].map(({ label, count, color, shape }) => (
              <div key={label} className="flex items-center gap-2">
                <div
                  className={`flex-shrink-0 ${shape === 'circle' ? 'rounded-full' : 'rounded-sm'}`}
                  style={{
                    width: 10,
                    height: 10,
                    backgroundColor: color,
                    opacity: label === 'Algae' ? 0.6 : 1,
                  }}
                />
                <span className="text-[10px] font-mono text-textMain">
                  {label}: {count}
                </span>
              </div>
            ))}
            {isBleaching && (
              <div className="text-[9px] font-bold px-2 py-1 rounded-sm mt-1 text-center animate-pulse bg-error/10 text-error border border-error/30">
                ⚠ BLEACHING EVENT
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
