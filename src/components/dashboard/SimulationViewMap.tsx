import { useSimulationStore } from "@/store/simulationStore";
import { motion } from "framer-motion";

// ── Stable module-level seeds (Math.random runs once, positions never jump) ───
const CORAL_POS = Array.from({ length: 80 }, () => ({
  x: Math.random() * 86 + 2,
  y: Math.random() * 20 + 66,
  scale: 0.55 + Math.random() * 0.75,
  variant: Math.floor(Math.random() * 3), // 0=branching 1=mound 2=fan
}));
const ALGAE_POS = Array.from({ length: 60 }, () => ({
  x: Math.random() * 88 + 2,
  h: 26 + Math.random() * 30,
  delay: Math.random() * 2,
  dur: 2.5 + Math.random() * 2,
}));
const URCHIN_POS = Array.from({ length: 40 }, () => ({
  sx: Math.random() * 80 + 5, sy: 83 + Math.random() * 8,
  dx: Math.random() * 80 + 5, dy: 84 + Math.random() * 7,
  spd: 22 + Math.random() * 16,
}));
const FISH = {
  parrot:  Array.from({ length: 20 }, () => ({ y: 24+Math.random()*34, sx: Math.random()*72+4, dx: Math.random()*72+4, spd: 12+Math.random()*10, flip: Math.random()>0.5 })),
  surgeon: Array.from({ length: 20 }, () => ({ y: 16+Math.random()*28, sx: Math.random()*76+4, dx: Math.random()*76+4, spd: 10+Math.random()*8,  flip: Math.random()>0.5 })),
  grouper: Array.from({ length: 15 }, () => ({ y: 42+Math.random()*20, sx: Math.random()*66+4, dx: Math.random()*66+4, spd: 17+Math.random()*12, flip: Math.random()>0.5 })),
  lion:    Array.from({ length: 10 }, () => ({ y: 50+Math.random()*18, sx: Math.random()*75+4, dx: Math.random()*75+4, spd: 22+Math.random()*10, flip: Math.random()>0.5 })),
  damsel:  Array.from({ length: 25 }, () => ({ y: 28+Math.random()*36, sx: Math.random()*80+4, dx: Math.random()*80+4, spd: 8+Math.random()*6,   flip: Math.random()>0.5 })),
};
const BUBBLE_POS = Array.from({ length: 30 }, () => ({
  x: Math.random() * 95 + 2,
  delay: Math.random() * 6,
  dur: 5 + Math.random() * 6,
  size: 3 + Math.random() * 5,
}));

// ── Coral SVG ─────────────────────────────────────────────────────────────────
function CoralSVG({ variant, color, size }: { variant: number; color: string; size: number }) {
  const c = color;
  const d = color === "#f8fafc" ? "#e2e8f0" : "#fb923c";
  if (variant === 0) return ( // branching
    <svg width={size} height={size*1.3} viewBox="0 0 44 56" fill="none">
      <line x1="22" y1="56" x2="22" y2="32" stroke={c} strokeWidth="3.5" strokeLinecap="round"/>
      <line x1="22" y1="42" x2="10" y2="24" stroke={c} strokeWidth="3" strokeLinecap="round"/>
      <line x1="22" y1="38" x2="34" y2="20" stroke={c} strokeWidth="3" strokeLinecap="round"/>
      <line x1="22" y1="32" x2="15" y2="14" stroke={c} strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="22" y1="32" x2="29" y2="12" stroke={c} strokeWidth="2.5" strokeLinecap="round"/>
      <circle cx="10" cy="22" r="4" fill={c}/><circle cx="34" cy="18" r="4" fill={c}/>
      <circle cx="15" cy="11" r="3.5" fill={c}/><circle cx="29" cy="9" r="3.5" fill={c}/>
      <circle cx="22" cy="7" r="3" fill={d}/>
    </svg>
  );
  if (variant === 1) return ( // mound
    <svg width={size*1.2} height={size*0.75} viewBox="0 0 54 40" fill="none">
      <ellipse cx="27" cy="40" rx="24" ry="8" fill={c} opacity="0.3"/>
      <path d="M4 36 Q10 16 20 12 Q27 7 34 12 Q44 16 50 36 Z" fill={c}/>
      <path d="M8 33 Q16 20 27 18 Q38 20 46 33" stroke={d} strokeWidth="1.5" fill="none" opacity="0.7"/>
      <path d="M12 29 Q20 22 27 21 Q34 22 42 29" stroke={d} strokeWidth="1" fill="none" opacity="0.5"/>
    </svg>
  );
  return ( // fan coral
    <svg width={size*1.1} height={size*1.2} viewBox="0 0 48 52" fill="none">
      <line x1="24" y1="52" x2="24" y2="34" stroke={c} strokeWidth="3" strokeLinecap="round"/>
      {[0,15,30,45,60,75,90,105,120,135,150,165,180].map((deg,i)=>{
        const r=(deg-90)*Math.PI/180; const l=18+Math.abs(Math.sin(r))*4;
        return <line key={i} x1={24} y1={34} x2={24+Math.cos(r)*l} y2={34+Math.sin(r)*l} stroke={c} strokeWidth="1.5" strokeLinecap="round" opacity="0.85"/>;
      })}
      <ellipse cx="24" cy="34" rx="18" ry="18" stroke={c} strokeWidth="1" fill="none" opacity="0.2"/>
    </svg>
  );
}

// ── Seaweed SVG ───────────────────────────────────────────────────────────────
function SeaweedSVG({ h, delay, dur }: { h: number; delay: number; dur: number }) {
  return (
    <motion.svg width={14} height={h} viewBox={`0 0 14 ${h}`} fill="none" style={{ originX:"50%", originY:"100%", display:"block" }}
      animate={{ rotate: [-6, 6, -6] }} transition={{ duration: dur, repeat: Infinity, ease:"easeInOut", delay }}>
      <path d={`M7 ${h} Q3 ${h*.72} 6 ${h*.5} Q10 ${h*.28} 7 0`} stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round"/>
      <ellipse cx="7" cy={h*.1} rx="4.5" ry="2.5" fill="#15803d" opacity="0.8"/>
    </motion.svg>
  );
}

// ── Urchin SVG ────────────────────────────────────────────────────────────────
function UrchinSVG() {
  return (
    <svg width="18" height="18" viewBox="0 0 100 100">
      {Array.from({length:14},(_,i)=>{const a=(i/14)*360*Math.PI/180;const ix=50+Math.cos(a)*26;const iy=50+Math.sin(a)*26;const ox=50+Math.cos(a)*48;const oy=50+Math.sin(a)*48;return <line key={i} x1={ix} y1={iy} x2={ox} y2={oy} stroke="#64748b" strokeWidth="2.5" strokeLinecap="round"/>;
      })}
      <circle cx="50" cy="50" r="24" fill="#1e293b" stroke="#475569" strokeWidth="2.5"/>
      <circle cx="50" cy="50" r="9" fill="#334155"/>
    </svg>
  );
}

// ── Fish SVGs ─────────────────────────────────────────────────────────────────
function ParrotfishSVG({ size }: { size: number }) {
  return (
    <svg width={size*1.8} height={size} viewBox="0 0 56 30" fill="none">
      <path d="M6 15 L0 5 L0 25 Z" fill="#6d28d9"/>
      <ellipse cx="28" cy="15" rx="22" ry="11" fill="#7c3aed"/>
      <ellipse cx="46" cy="14" rx="10" ry="9" fill="#8b5cf6"/>
      <path d="M52 11 L58 8 L58 20 L52 18 Z" fill="#6d28d9"/>
      <path d="M22 4 Q29 0 36 5" stroke="#a78bfa" strokeWidth="2" fill="none" strokeLinecap="round"/>
      <path d="M28 24 Q34 28 38 24" stroke="#a78bfa" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      <circle cx="48" cy="11" r="2.5" fill="white"/><circle cx="48" cy="11" r="1.2" fill="#1e1b4b"/>
      <path d="M20 8 Q14 15 20 22" stroke="#5b21b6" strokeWidth="1.5" fill="none" opacity="0.5"/>
    </svg>
  );
}
function SurgeonfishSVG({ size }: { size: number }) {
  return (
    <svg width={size*1.7} height={size} viewBox="0 0 52 28" fill="none">
      <path d="M5 14 L0 4 L0 24 Z" fill="#1d4ed8"/>
      <ellipse cx="26" cy="14" rx="21" ry="10" fill="#2563eb"/>
      <ellipse cx="44" cy="13" rx="9" ry="8" fill="#3b82f6"/>
      <path d="M49 10 L55 7 L55 19 L49 17 Z" fill="#fbbf24"/>
      <line x1="38" y1="5" x2="38" y2="23" stroke="#fbbf24" strokeWidth="2"/>
      <path d="M20 4 Q26 1 32 4" stroke="#60a5fa" strokeWidth="2" fill="none" strokeLinecap="round"/>
      <circle cx="46" cy="10" r="2.5" fill="white"/><circle cx="46" cy="10" r="1.2" fill="#1e3a8a"/>
      <path d="M48 18 Q50 22 50 22" stroke="#1d4ed8" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
    </svg>
  );
}
function GrouperSVG({ size }: { size: number }) {
  return (
    <svg width={size*2} height={size} viewBox="0 0 62 30" fill="none">
      <path d="M6 15 L0 4 L2 26 Z" fill="#78350f"/>
      <ellipse cx="31" cy="15" rx="25" ry="12" fill="#92400e"/>
      <ellipse cx="50" cy="14" rx="12" ry="11" fill="#a16207"/>
      <path d="M58 10 L64 6 L64 22 L58 18 Z" fill="#78350f"/>
      {[{cx:18,cy:10},{cx:28,cy:8},{cx:38,cy:9},{cx:22,cy:18},{cx:34,cy:20}].map((p,i)=><ellipse key={i} cx={p.cx} cy={p.cy} rx="3" ry="2.5" fill="#451a03" opacity="0.45"/>)}
      <path d="M26 3 Q34 0 42 4" stroke="#d97706" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      <circle cx="53" cy="10" r="3" fill="white"/><circle cx="53" cy="10" r="1.5" fill="#1c1917"/>
      <path d="M56 19 Q60 23 60 24" stroke="#92400e" strokeWidth="2" fill="none"/>
    </svg>
  );
}
function LionfishSVG({ size }: { size: number }) {
  return (
    <svg width={size*1.9} height={size*1.1} viewBox="0 0 58 34" fill="none">
      {[12,18,24,30,36,42].map((x,i)=><line key={i} x1={x} y1={14} x2={x+(i%2===0?-3:3)} y2={2} stroke="#dc2626" strokeWidth="2" strokeLinecap="round"/>)}
      <path d="M5 17 L0 6 L0 28 Z" fill="#991b1b"/>
      <ellipse cx="28" cy="20" rx="23" ry="10" fill="#dc2626"/>
      <ellipse cx="46" cy="19" rx="11" ry="9" fill="#ef4444"/>
      <path d="M53 14 L60 10 L60 26 L53 24 Z" fill="#b91c1c"/>
      {[0,1,2,3].map(i=><line key={i} x1={8+i*6} y1={26} x2={10+i*6} y2={34} stroke="#fca5a5" strokeWidth="1.5" strokeLinecap="round"/>)}
      {[0,1,2,3,4].map(i=><line key={i} x1={28+i*5} y1={26} x2={29+i*5} y2={33} stroke="#fca5a5" strokeWidth="1.5" strokeLinecap="round"/>)}
      <line x1="14" y1="12" x2="14" y2="26" stroke="#fecaca" strokeWidth="1" opacity="0.4"/>
      <line x1="28" y1="12" x2="28" y2="26" stroke="#fecaca" strokeWidth="1" opacity="0.4"/>
      <line x1="42" y1="12" x2="42" y2="26" stroke="#fecaca" strokeWidth="1" opacity="0.4"/>
      <circle cx="48" cy="15" r="2.5" fill="white"/><circle cx="48" cy="15" r="1.2" fill="#450a0a"/>
    </svg>
  );
}
function DamselfishSVG({ size }: { size: number }) {
  return (
    <svg width={size*1.5} height={size} viewBox="0 0 42 26" fill="none">
      <path d="M5 13 L0 4 L0 22 Z" fill="#b45309"/>
      <ellipse cx="22" cy="13" rx="17" ry="9" fill="#f59e0b"/>
      <ellipse cx="36" cy="12" rx="8" ry="7.5" fill="#fbbf24"/>
      <path d="M41 9 L46 6 L46 19 L41 17 Z" fill="#d97706"/>
      <line x1="29" y1="4" x2="29" y2="22" stroke="white" strokeWidth="2.5"/>
      <path d="M16 4 Q22 1 28 4" stroke="#fcd34d" strokeWidth="2" fill="none" strokeLinecap="round"/>
      <circle cx="38" cy="9" r="2" fill="white"/><circle cx="38" cy="9" r="1" fill="#1c1917"/>
    </svg>
  );
}

// ── Swimming fish wrapper ──────────────────────────────────────────────────────
function SwimmingFish({ x, y, dx, spd, flip, children }: {
  x: number; y: number; dx: number; spd: number; flip: boolean; children: React.ReactNode;
}) {
  const goRight = dx > x;
  const mirrored = flip ? !goRight : goRight;
  return (
    <motion.div
      className="absolute"
      style={{ left: `${x}%`, top: `${y}%`, transform: `scaleX(${mirrored ? -1 : 1})` }}
      animate={{ left: [`${x}%`, `${dx}%`, `${x}%`] }}
      transition={{ duration: spd, repeat: Infinity, ease: "easeInOut" }}
    >
      {children}
    </motion.div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function SimulationViewMap() {
  const store = useSimulationStore();
  const metrics = store.getEcosystemMetrics();
  const { diademaHealth, algaeCover, coralHealth, bleachingRisk,
          parrotfishHealth, surgeonFishHealth, grouperHealth,
          lionfishDanger, damselFishActivity } = metrics;

  const coralCount   = Math.floor((coralHealth / 100) * 80);
  const algaeCount   = Math.floor((algaeCover / 100) * 60);
  const urchinCount  = Math.floor((diademaHealth / 100) * 40);
  const parrotCount  = Math.floor((parrotfishHealth / 100) * 14);
  const surgeonCount = Math.floor((surgeonFishHealth / 100) * 14);
  const grouperCount = Math.floor((grouperHealth / 100) * 10);
  const lionfishCount= Math.floor((lionfishDanger / 100) * 8);
  const damselCount  = Math.floor((damselFishActivity / 100) * 18);
  const isBleaching  = bleachingRisk > 30;

  const coralColor = isBleaching ? "#f8fafc" : "#f97316";
  const coralGlow  = isBleaching ? "0 0 12px rgba(248,250,252,0.6)" : "0 0 8px rgba(249,115,22,0.4)";
  const algaeOpacity = Math.min(1, 0.3 + (algaeCover / 100) * 0.5);

  return (
    <div className="w-full h-full relative overflow-hidden" style={{
      background: "linear-gradient(to bottom, #020c1b 0%, #041422 20%, #051c30 45%, #072540 70%, #0a2e4a 85%, #1a3a28 100%)"
    }}>
      {/* ── Caustic light rays ── */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none">
        {[0,1,2,3,4,5,6,7].map(i => (
          <motion.line key={i}
            x1={`${10 + i*12}%`} y1="0%" x2={`${5 + i*12}%`} y2="60%"
            stroke="rgba(147,210,255,0.07)" strokeWidth={6 + i % 3 * 4}
            animate={{ opacity: [0.4, 0.9, 0.4], x1: [`${10+i*12}%`, `${12+i*12}%`, `${10+i*12}%`] }}
            transition={{ duration: 3 + i * 0.7, repeat: Infinity, ease: "easeInOut", delay: i * 0.4 }}
          />
        ))}
      </svg>

      {/* ── Bubbles ── */}
      {BUBBLE_POS.map((b, i) => (
        <motion.div key={i} className="absolute rounded-full pointer-events-none"
          style={{ left: `${b.x}%`, bottom: "5%", width: b.size, height: b.size,
                   border: "1px solid rgba(147,210,255,0.35)", backgroundColor: "rgba(147,210,255,0.07)" }}
          animate={{ y: [0, -(Math.random() * 200 + 300)], opacity: [0, 0.7, 0] }}
          transition={{ duration: b.dur, repeat: Infinity, ease: "easeOut", delay: b.delay }}
        />
      ))}

      {/* ── Swimming fish (mid-water) ── */}
      {FISH.surgeon.slice(0, surgeonCount).map((f, i) => (
        <SwimmingFish key={`sur-${i}`} x={f.sx} y={f.y} dx={f.dx} spd={f.spd} flip={f.flip}>
          <SurgeonfishSVG size={18} />
        </SwimmingFish>
      ))}
      {FISH.parrot.slice(0, parrotCount).map((f, i) => (
        <SwimmingFish key={`par-${i}`} x={f.sx} y={f.y} dx={f.dx} spd={f.spd} flip={f.flip}>
          <ParrotfishSVG size={20} />
        </SwimmingFish>
      ))}
      {FISH.grouper.slice(0, grouperCount).map((f, i) => (
        <SwimmingFish key={`grp-${i}`} x={f.sx} y={f.y} dx={f.dx} spd={f.spd} flip={f.flip}>
          <GrouperSVG size={22} />
        </SwimmingFish>
      ))}
      {FISH.damsel.slice(0, damselCount).map((f, i) => (
        <SwimmingFish key={`dam-${i}`} x={f.sx} y={f.y} dx={f.dx} spd={f.spd} flip={f.flip}>
          <DamselfishSVG size={14} />
        </SwimmingFish>
      ))}
      {FISH.lion.slice(0, lionfishCount).map((f, i) => (
        <SwimmingFish key={`lion-${i}`} x={f.sx} y={f.y} dx={f.dx} spd={f.spd} flip={f.flip}>
          <LionfishSVG size={18} />
        </SwimmingFish>
      ))}

      {/* ── Sandy seabed ── */}
      <div className="absolute bottom-0 left-0 right-0" style={{ height: "18%",
        background: "linear-gradient(to top, #1a3520 0%, #1e3d28 40%, transparent 100%)" }}
      />
      {/* Seabed texture strip */}
      <div className="absolute bottom-0 left-0 right-0" style={{ height: "6%",
        background: "linear-gradient(to top, #2d4a1e 0%, #1e3a18 60%, transparent 100%)" }}
      />

      {/* ── Seaweed / Algae (seabed) ── */}
      <div className="absolute bottom-0 left-0 right-0 pointer-events-none" style={{ opacity: algaeOpacity }}>
        {ALGAE_POS.slice(0, algaeCount).map((a, i) => (
          <div key={i} className="absolute" style={{ left: `${a.x}%`, bottom: "4%" }}>
            <SeaweedSVG h={a.h} delay={a.delay} dur={a.dur} />
          </div>
        ))}
      </div>

      {/* ── Corals (seabed) ── */}
      {CORAL_POS.slice(0, coralCount).map((c, i) => (
        <motion.div key={i} className="absolute pointer-events-none"
          style={{ left: `${c.x}%`, top: `${c.y}%`, filter: `drop-shadow(${coralGlow})`,
                   transform: `scale(${c.scale})`, transformOrigin: "bottom center" }}
          animate={isBleaching ? { opacity: [1, 0.6, 1] } : { opacity: 1 }}
          transition={isBleaching ? { duration: 2, repeat: Infinity } : {}}
        >
          <CoralSVG variant={c.variant} color={coralColor} size={28} />
        </motion.div>
      ))}

      {/* ── Urchins (roaming on seabed) ── */}
      {URCHIN_POS.slice(0, urchinCount).map((u, i) => (
        <motion.div key={i} className="absolute pointer-events-none"
          style={{ left: `${u.sx}%`, top: `${u.sy}%` }}
          animate={{ left: [`${u.sx}%`, `${u.dx}%`, `${u.sx}%`], top: [`${u.sy}%`, `${u.dy}%`, `${u.sy}%`] }}
          transition={{ duration: u.spd, repeat: Infinity, ease: "linear" }}
        >
          <UrchinSVG />
        </motion.div>
      ))}

      {/* ── Bleaching warning overlay ── */}
      {isBleaching && (
        <motion.div className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse at center, rgba(248,250,252,0.06) 0%, transparent 70%)" }}
          animate={{ opacity: [0.4, 0.9, 0.4] }} transition={{ duration: 2, repeat: Infinity }}
        />
      )}

      {/* ── Algae murk overlay ── */}
      {algaeCover > 40 && (
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: `rgba(22,163,74,${Math.min(0.12, (algaeCover - 40) / 100 * 0.2)})` }}
        />
      )}

      {/* ── HUD Legend ── */}
      <div className="absolute top-3 left-3 flex flex-col gap-1.5 p-2.5 rounded-xl z-20"
        style={{ backgroundColor: "rgba(15,23,42,0.75)", backdropFilter: "blur(8px)", border: "1px solid rgba(51,65,85,0.6)" }}>
        <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: "#94a3b8" }}>Population</span>
        {[
          { label: "Coral", count: coralCount, color: coralColor },
          { label: "Algae", count: algaeCount, color: "#16a34a" },
          { label: "Urchins", count: urchinCount, color: "#475569" },
          { label: "Parrotfish", count: parrotCount, color: "#7c3aed" },
          { label: "Surgeonfish", count: surgeonCount, color: "#2563eb" },
          { label: "Grouper", count: grouperCount, color: "#92400e" },
          { label: "Lionfish", count: lionfishCount, color: "#dc2626" },
          { label: "Damselfish", count: damselCount, color: "#f59e0b" },
        ].map(({ label, count, color }) => (
          <div key={label} className="flex items-center gap-1.5">
            <div className="rounded-full flex-shrink-0" style={{ width: 7, height: 7, backgroundColor: color }} />
            <span className="text-[9px] font-mono" style={{ color: "#f8fafc" }}>{label}: {count}</span>
          </div>
        ))}
        {isBleaching && (
          <div className="text-[8px] font-bold px-1.5 py-0.5 rounded mt-0.5 text-center animate-pulse"
            style={{ backgroundColor: "rgba(239,68,68,0.2)", color: "#f87171", border: "1px solid rgba(239,68,68,0.4)" }}>
            ⚠ BLEACHING EVENT
          </div>
        )}
      </div>
    </div>
  );
}
