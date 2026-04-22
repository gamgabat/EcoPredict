import { useSimulationStore } from "@/store/simulationStore";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useMemo } from 'react';

export default function ImpactSimulationChart() {
  const { temperature, phLevel } = useSimulationStore();

  const data = useMemo(() => {
    // Generate mock data over 50 years based on sliders
    const result = [];
    let baseStability = 100;
    
    // Simple penalty logic for prototype visuals
    const tempPenalty = Math.abs(temperature - 24) * 0.5;
    const phPenalty = Math.abs(phLevel - 7.2) * 5;
    baseStability -= (tempPenalty + phPenalty);

    for(let i=0; i<=50; i+=5) {
      const randomFluctuation = Math.random() * 5 - 2.5; 
      const decay = i * 0.3;
      result.push({
        year: 2024 + i,
        stability: Math.max(0, Math.min(100, baseStability - decay + randomFluctuation))
      })
    }
    return result;
  }, [temperature, phLevel]);

  return (
    <div className="bg-bgCard border border-border p-5 rounded-xl shadow-lg h-[350px] flex flex-col">
      <h2 className="text-lg font-bold text-textMain mb-4">Ecosystem Stability Forecast</h2>
      <div className="flex-1 w-full text-sm">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorStability" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.6}/>
                <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
            <XAxis dataKey="year" stroke="var(--color-textMuted)" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="var(--color-textMuted)" fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} />
            <Tooltip 
              contentStyle={{ backgroundColor: 'var(--color-bgHover)', borderColor: 'var(--color-border)', borderRadius: '8px' }}
              itemStyle={{ color: 'var(--color-primary)' }}
              labelStyle={{ color: 'var(--color-textMain)' }}
            />
            <Area type="monotone" dataKey="stability" stroke="var(--color-primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorStability)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
