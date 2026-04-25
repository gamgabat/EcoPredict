import { useSimulationStore } from "@/store/simulationStore";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useMemo } from 'react';

export default function ImpactSimulationChart() {
  const { getEcosystemMetrics, temperature, salinity, phLevel, nitrogenLoading, scltdOutbreakRisk, currentYear } = useSimulationStore();

  const data = useMemo(() => {
    // We bind it to all state variables to trigger re-renders
    const { coralHealth } = getEcosystemMetrics();
    const result = [];
    
    for(let i=0; i<=50; i+=5) {
      const decay = i * 0.5 * (100 - coralHealth) / 100; // Worse base health = faster future decay
      const randomFluctuation = Math.random() * 4 - 2; 
      result.push({
        year: currentYear + i,
        stability: Math.max(0, Math.min(100, coralHealth - decay + randomFluctuation))
      });
    }
    return result;
  }, [getEcosystemMetrics, temperature, salinity, phLevel, nitrogenLoading, scltdOutbreakRisk, currentYear]);

  return (
    <div className="w-full h-full flex flex-col pt-2">
      <h2 className="text-sm font-bold text-textMain mb-2 uppercase tracking-wider relative z-10 px-2">50-Year Reef Stability Projection</h2>
      <div className="flex-1 w-full text-xs">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
            <defs>
              <linearGradient id="colorStability" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.6}/>
                <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
            <XAxis dataKey="year" stroke="var(--color-textMuted)" fontSize={11} tickLine={false} axisLine={false} />
            <YAxis stroke="var(--color-textMuted)" fontSize={11} tickLine={false} axisLine={false} domain={[0, 100]} />
            <Tooltip 
              contentStyle={{ backgroundColor: 'var(--color-bgHover)', borderColor: 'var(--color-border)', borderRadius: '8px' }}
              itemStyle={{ color: 'var(--color-primary)' }}
              labelStyle={{ color: 'var(--color-textMain)' }}
            />
            <Area type="monotone" dataKey="stability" stroke="var(--color-primary)" strokeWidth={2} fillOpacity={1} fill="url(#colorStability)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
