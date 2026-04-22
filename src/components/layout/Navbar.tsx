"use client";

import Link from "next/link";
import { Leaf } from "lucide-react";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith("/dashboard");

  return (
    <nav className="fixed top-0 left-0 right-0 h-16 bg-bgCard/80 backdrop-blur-md border-b border-border z-50 flex items-center px-6">
      <Link href="/" className="flex items-center gap-2 text-primary hover:text-primaryHover transition-colors">
        <Leaf className="w-6 h-6" />
        <span className="text-xl font-bold tracking-tight text-textMain">EcoPredict</span>
      </Link>
      <div className="ml-auto flex items-center gap-6">
        <Link 
          href="/dashboard" 
          className={`text-sm font-medium transition-colors ${isDashboard ? 'text-primary' : 'text-textMuted hover:text-textMain'}`}
        >
          Simulation Dashboard
        </Link>
        <Link 
          href="https://github.com/gamgabat/EcoPredict" 
          target="_blank"
          className="text-sm font-medium text-textMuted hover:text-textMain transition-colors"
        >
          GitHub
        </Link>
      </div>
    </nav>
  );
}
