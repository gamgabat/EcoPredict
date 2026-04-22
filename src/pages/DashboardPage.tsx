import Navbar from "@/components/layout/Navbar";
import EnvironmentalControls from "@/components/dashboard/EnvironmentalControls";
import SpeciesMindMap from "@/components/dashboard/SpeciesMindMap";
import ImpactSimulationChart from "@/components/dashboard/ImpactSimulationChart";
import { useEffect } from "react";

export default function DashboardPage() {
  useEffect(() => {
    document.title = "Dashboard | EcoPredict Simulation";
  }, []);

  return (
    <div className="min-h-screen bg-bg">
      <Navbar />
      
      <main className="pt-24 pb-12 px-6 max-w-7xl mx-auto flex flex-col gap-8">
        <header className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-textMain tracking-tight w-fit flex items-center gap-3">
            Ecosystem Impact Simulator
            <span className="px-3 py-1 bg-primary/20 text-primary text-sm rounded-full font-medium border border-primary/30">
              Live Prototype
            </span>
          </h1>
          <p className="text-textMuted max-w-2xl">
            Manipulate environmental parameters in real-time to observe hypothetical ecosystem stability 
            and predict relationships of undiscovered species via AI mapping logic.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Controls Sidebar */}
          <aside className="lg:col-span-1">
            <EnvironmentalControls />
          </aside>

          {/* Main Visualizations */}
          <div className="lg:col-span-3 flex flex-col gap-6">
            <SpeciesMindMap />
            <ImpactSimulationChart />
          </div>
        </div>
      </main>
    </div>
  );
}
