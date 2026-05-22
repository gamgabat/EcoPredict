import { useSimulationStore } from '@/store/simulationStore';
import { disruptionScenarios } from '@/data/disruptionScenarios';

export default function DisruptionPanel() {
  const { activeScenario, applyDisruption, clearDisruption } = useSimulationStore();

  return (
    <div className="bg-bgHover border-b border-border p-4">
      <h2 className="text-sm font-bold text-textMain mb-2 uppercase tracking-wider">Disruption Scenario</h2>
      
      {!activeScenario ? (
        <select 
          className="w-full bg-bg border border-border rounded px-3 py-2 text-sm text-textMain focus:outline-none focus:border-primary"
          onChange={(e) => {
            const scenario = disruptionScenarios.find(s => s.id === e.target.value);
            if (scenario) applyDisruption(scenario);
          }}
          defaultValue=""
        >
          <option value="" disabled>Select a scenario to model...</option>
          {disruptionScenarios.map(scenario => (
            <option key={scenario.id} value={scenario.id}>
              {scenario.name} ({scenario.category})
            </option>
          ))}
        </select>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-textMain text-sm">{activeScenario.name}</span>
              <span className="text-[10px] uppercase tracking-wider bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                {activeScenario.category}
              </span>
            </div>
            <button 
              onClick={clearDisruption}
              className="text-xs text-textMuted hover:text-textMain underline"
            >
              Clear Scenario
            </button>
          </div>
          
          <div className="bg-bg rounded p-2 text-xs">
            <ul className="text-textMuted space-y-1">
              {Object.entries(activeScenario.parameterDeltas).map(([param, value]) => {
                const sign = value > 0 ? '+' : '';
                return (
                  <li key={param}>
                    <span className="text-textMain">{param}:</span> {sign}{value}
                  </li>
                );
              })}
            </ul>
          </div>
          
          <p className="text-xs text-textMuted italic border-l-2 border-primary pl-2">
            {activeScenario.legalContext}
          </p>
        </div>
      )}
    </div>
  );
}
