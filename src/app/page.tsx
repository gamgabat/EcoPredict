"use client";

import Navbar from "@/components/layout/Navbar";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Activity, Search, Shield } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-bg selection:bg-primary/30">
      <Navbar />
      
      <main className="pt-32 pb-16 px-6 max-w-7xl mx-auto flex flex-col items-center text-center overflow-x-hidden">
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-4xl flex flex-col items-center gap-6"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary font-medium text-sm">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            AI-Powered Ecosystem Prediction
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold text-textMain tracking-tight leading-tight">
            Anticipate the Unknown <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
              Protect the Future
            </span>
          </h1>
          
          <p className="text-xl text-textMuted max-w-2xl leading-relaxed">
            Predict the ecological impact of Earth's undiscovered biodiversity. 
            Empowering NGOs with data-driven simulation forecasting to support evidence-based environmental protection.
          </p>
          
          <div className="flex items-center gap-4 mt-8">
            <Link 
              href="/dashboard"
              className="flex items-center gap-2 bg-primary hover:bg-primaryHover text-bg font-bold px-8 py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] transform hover:-translate-y-1"
            >
              Launch Platform Prototype
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </motion.div>

        {/* Features List */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-32 max-w-6xl w-full text-left">
          <FeatureCard 
            icon={<Search />}
            title="Discovery AI Engine"
            description="Leveraging vast biodiversity datasets to forecast traits and functional roles of unclassified species."
            delay={0.2}
          />
          <FeatureCard 
            icon={<Activity />}
            title="Real-time Ecosystem Maps"
            description="Dynamically generate interaction networks integrating theoretical species against known environmental baselines."
            delay={0.4}
          />
          <FeatureCard 
            icon={<Shield />}
            title="Policy Protection Risk"
            description="Automated holistic impact assessment algorithms empowering consulting agencies visually."
            delay={0.6}
          />
        </div>
      </main>
    </div>
  );
}

function FeatureCard({ icon, title, description, delay }: { icon: React.ReactNode, title: string, description: string, delay: number }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      className="flex flex-col gap-4 p-8 rounded-2xl bg-bgCard border border-border hover:border-primary/50 transition-colors"
    >
      <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-textMain">{title}</h3>
      <p className="text-textMuted leading-relaxed">{description}</p>
    </motion.div>
  );
}
