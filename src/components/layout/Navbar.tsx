import { Link } from 'react-router-dom';
import { Leaf } from 'lucide-react';
import { useSimulationStore } from '@/store/simulationStore';
import { BRAND } from '@/config/brand';

export default function Navbar() {
  const { activeScenario } = useSimulationStore();
  return (
    <nav className="fixed top-0 left-0 right-0 h-16 bg-bgCard/80 backdrop-blur-md border-b border-border z-50 flex items-center px-6">
      <Link
        to="/"
        className="flex items-center gap-2 text-primary hover:text-primaryHover transition-colors"
      >
        <Leaf className="w-6 h-6" />
        <span className="text-xl font-bold tracking-tight text-textMain">{BRAND.name}</span>
      </Link>
      <div className="ml-auto flex items-center gap-6">
        {activeScenario && (
          <span className="text-[10px] font-bold tracking-wider uppercase bg-error/10 text-error border border-error/20 px-2 py-0.5 rounded-full flex items-center gap-1">
            ⚠ {activeScenario.name} Active
          </span>
        )}
        <span className="text-sm font-medium text-textMain bg-bgHover px-3 py-1 rounded-sm border border-border">
          Simulation Dashboard
        </span>
        <Link
          to="https://github.com/gamgabat/EcoPredict"
          target="_blank"
          className="text-sm font-medium text-textMuted hover:text-textMain transition-colors"
        >
          GitHub
        </Link>
      </div>
    </nav>
  );
}
