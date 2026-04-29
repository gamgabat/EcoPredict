import Navbar from "@/components/layout/Navbar";
import SpeciesMindMap from "@/components/dashboard/SpeciesMindMap";
import SimulationViewMap from "@/components/dashboard/SimulationViewMap";
import ImpactSimulationChart from "@/components/dashboard/ImpactSimulationChart";
import DetailsSidebar from "@/components/dashboard/DetailsSidebar";
import { useEffect } from "react";
import { useSimulationStore } from "@/store/simulationStore";

export default function DashboardPage() {
  const { currentYear, setCurrentYear } = useSimulationStore();

  useEffect(() => {
    document.title = "Coral Reef EIA Simulator | EcoPredict";
  }, []);

  return (
    <div className="h-screen w-screen overflow-hidden bg-bg flex flex-col">
      <Navbar />
      
      <main className="flex-1 w-full flex flex-col lg:flex-row mt-16 p-4 gap-4 overflow-hidden">
        
        {/* Pane 1: Details Sidebar */}
        <div className="w-72 flex-shrink-0 bg-bgCard rounded-2xl border border-border shadow-lg overflow-hidden flex flex-col">
          <div className="p-4 border-b border-border bg-bg/50 backdrop-blur-sm flex-shrink-0">
            <h2 className="font-bold text-textMain text-sm uppercase tracking-wider">Details</h2>
            <p className="text-[10px] text-textMuted mt-0.5">Click a node to inspect it</p>
          </div>
          <div className="flex-1 overflow-hidden">
            <DetailsSidebar />
          </div>
        </div>

        {/* Pane 2: Node Map & Global Timeline */}
        <div className="flex-[1.5] flex flex-col bg-bgCard rounded-2xl border border-border overflow-hidden relative shadow-lg">
          {/* Header Row w/ Timeline */}
          <div className="p-4 border-b border-border bg-bg/50 backdrop-blur-sm z-10 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-textMain text-sm uppercase tracking-wider">
                Species Mind Map
              </h2>
              <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-md">Food Web</span>
            </div>
            
            <div className="flex items-center gap-4 bg-bgCard border border-border p-2 rounded-lg">
              <label className="text-xs font-bold text-textMuted uppercase whitespace-nowrap">Timeline Year: <span className="text-textMain">{currentYear}</span></label>
              <input 
                type="range" min="2024" max="2074" step="1" 
                value={currentYear} 
                onChange={(e) => setCurrentYear(parseInt(e.target.value))}
                className="w-full accent-primary cursor-pointer h-2 bg-textMuted rounded-lg appearance-none"
              />
            </div>
          </div>
          
          {/* Mind Map Area (Flex grow) */}
          <div className="flex-1 relative">
            <SpeciesMindMap />
          </div>
        </div>

        {/* Pane 3: Visualization Center */}
        <div className="flex-1 flex flex-col gap-4 overflow-hidden">
          {/* Top half: Geographic Simulation View */}
          <div className="flex-1 bg-bgCard rounded-2xl border border-border shadow-lg flex flex-col overflow-hidden relative">
            <div className="p-3 border-b border-border bg-bg/50 backdrop-blur-sm absolute w-full z-10">
              <h2 className="font-bold text-textMain text-sm uppercase tracking-wider">
                Spatial Simulation Map
              </h2>
            </div>
            <SimulationViewMap />
          </div>
          
          {/* Bottom half: Analytical Recharts */}
          <div className="h-64 bg-bgCard rounded-2xl border border-border shadow-lg p-3">
             <ImpactSimulationChart />
          </div>
        </div>

      </main>
    </div>
  );
}

