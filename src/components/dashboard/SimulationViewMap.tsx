import { useSimulationStore } from "@/store/simulationStore";
import { motion } from "framer-motion";
// No useMemo needed

// Pre-generate static positions for up to 80 corals so they don't jump around on re-renders
const CORAL_POSITIONS = Array.from({ length: 80 }).map(() => ({
  x: Math.random() * 90 + 5, // 5% to 95%
  y: Math.random() * 90 + 5,
}));

// Pre-generate starting positions for up to 80 algae
const ALGAE_POSITIONS = Array.from({ length: 80 }).map(() => ({
  x: Math.random() * 90 + 5,
  y: Math.random() * 90 + 5,
}));

export default function SimulationViewMap() {
  const { getEcosystemMetrics } = useSimulationStore();
  const { diademaHealth, algaeCover, coralHealth, bleachingRisk } = getEcosystemMetrics();

  // Map 0-100 metrics to visual agent counts (Max 200 total)
  const urchinCount = Math.floor((diademaHealth / 100) * 40);
  const coralCount = Math.floor((coralHealth / 100) * 80);
  const algaeCount = Math.floor((algaeCover / 100) * 80);

  // Background shifts based on heavy algae
  const bgColor = algaeCover > 60 ? "#1e293b" : "#0f172a"; 

  return (
    <div className="w-full h-full p-4 relative" style={{ backgroundColor: bgColor }}>
      <div className="w-full h-full relative overflow-hidden rounded-xl border border-border bg-[#0ea5e9]/10">
        
        {/* Render Corals (Static) */}
        {CORAL_POSITIONS.slice(0, coralCount).map((pos, i) => (
          <div
            key={`coral-${i}`}
            className="absolute rounded-full shadow-md transition-colors duration-1000"
            style={{
              left: `${pos.x}%`,
              top: `${pos.y}%`,
              width: "12px",
              height: "12px",
              backgroundColor: bleachingRisk > 30 ? "#f8fafc" : "#f97316", // White if bleached, Orange if healthy
              boxShadow: bleachingRisk > 30 ? "0 0 10px rgba(255,255,255,0.5)" : "0 0 10px rgba(249, 115, 22, 0.3)"
            }}
            title="Coral"
          />
        ))}

        {/* Render Algae (Static/Pulsing) */}
        {ALGAE_POSITIONS.slice(0, algaeCount).map((pos, i) => (
          <motion.div
            key={`algae-${i}`}
            className="absolute rounded-full bg-[#10b981]/70"
            style={{
              left: `${pos.x}%`,
              top: `${pos.y}%`,
              width: "18px",
              height: "18px",
              filter: "blur(2px)",
            }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.6, 0.8, 0.6]
            }}
            transition={{
              duration: 4 + Math.random() * 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            title="Macroalgae"
          />
        ))}

        {/* Render Urchins (Roaming) */}
        {Array.from({ length: urchinCount }).map((_, i) => (
          <motion.div
            key={`urchin-${i}`}
            className="absolute rounded-full bg-[#111827] shadow-[0_0_5px_rgba(0,0,0,0.8)] z-10"
            style={{ width: "8px", height: "8px" }}
            initial={{
              left: `${Math.random() * 90 + 5}%`,
              top: `${Math.random() * 90 + 5}%`,
            }}
            animate={{
              left: [`${Math.random() * 90 + 5}%`, `${Math.random() * 90 + 5}%`, `${Math.random() * 90 + 5}%`],
              top: [`${Math.random() * 90 + 5}%`, `${Math.random() * 90 + 5}%`, `${Math.random() * 90 + 5}%`],
            }}
            transition={{
              duration: 20 + Math.random() * 10, // Slow, natural movement
              repeat: Infinity,
              ease: "linear"
            }}
            title="Diadema antillarum"
          />
        ))}

      </div>

      {/* HUD Info */}
      <div className="absolute top-6 left-6 flex flex-col gap-2 p-3 bg-bgCard/80 rounded-lg border border-border backdrop-blur-md z-20">
        <span className="text-xs text-textMuted uppercase tracking-wider font-bold">Population Legend</span>
        <div className="flex items-center gap-2 text-xs text-textMain"><div className="w-3 h-3 rounded-full bg-[#f97316]"></div> Corals: {coralCount}</div>
        <div className="flex items-center gap-2 text-xs text-textMain"><div className="w-3 h-3 rounded-full bg-[#10b981]/70"></div> Algae: {algaeCount}</div>
        <div className="flex items-center gap-2 text-xs text-textMain"><div className="w-3 h-3 rounded-full bg-[#111827]"></div> Urchins: {urchinCount}</div>
      </div>
    </div>
  );
}
