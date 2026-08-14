import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { BRAND } from '@/config/brand';

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    document.title = `${BRAND.name} — ${BRAND.tagline}`;

    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-bg text-textMain font-sans overflow-x-hidden selection:bg-emerald-500/30">
      {/* 1. NAVBAR */}
      <nav
        className={`fixed top-0 left-0 right-0 h-16 z-50 flex items-center px-6 transition-colors duration-300 ${scrolled ? 'bg-bgCard border-b border-border' : 'bg-transparent'}`}
      >
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-secondary"></div>
          <span className="text-xl font-bold tracking-tight text-textMain">{BRAND.name}</span>
        </div>

        <div className="hidden md:flex ml-10 items-center gap-6 text-sm font-medium text-textMuted">
          <a href="#problem" className="hover:text-textMain transition-colors">
            The Problem
          </a>
          <a href="#features" className="hover:text-textMain transition-colors">
            Features
          </a>
          <a href="#how-it-works" className="hover:text-textMain transition-colors">
            How it Works
          </a>
          <a href="#pricing" className="hover:text-textMain transition-colors">
            Pricing
          </a>
        </div>

        <div className="ml-auto flex items-center gap-4">
          <Link
            to="/dashboard"
            className="text-sm font-bold bg-primary text-bg px-4 py-2 rounded hover:bg-primaryHover transition-colors flex items-center gap-2"
          >
            Launch Workspace <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </nav>

      {/* 2. HERO */}
      <section className="relative min-h-screen flex flex-col justify-center px-6 md:px-12 lg:px-24 pt-20">
        <div className="max-w-4xl z-10">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tighter leading-[1.1] mb-6"
          >
            Find the interaction pathways an EIA may have missed.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg md:text-xl text-textMuted max-w-2xl leading-relaxed mb-10"
          >
            {BRAND.shortDescription}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-16"
          >
            <Link
              to="/dashboard"
              className="px-8 py-4 bg-secondary hover:bg-accent text-bg font-bold rounded flex items-center gap-2 transition-colors text-lg"
            >
              Launch Workspace <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="flex flex-wrap gap-4"
          >
            <div className="px-3 py-1.5 border border-border bg-bgCard rounded-full text-xs font-bold text-textMuted uppercase tracking-wider flex items-center gap-2">
              <CheckCircle2 className="w-3 h-3 text-secondary" /> Observed species only
            </div>
            <div className="px-3 py-1.5 border border-border bg-bgCard rounded-full text-xs font-bold text-textMuted uppercase tracking-wider flex items-center gap-2">
              <CheckCircle2 className="w-3 h-3 text-secondary" /> A/B/C evidence classes
            </div>
            <div className="px-3 py-1.5 border border-border bg-bgCard rounded-full text-xs font-bold text-textMuted uppercase tracking-wider flex items-center gap-2">
              <CheckCircle2 className="w-3 h-3 text-secondary" /> Human review required
            </div>
          </motion.div>
        </div>
      </section>

      {/* 3. PROBLEM SECTION */}
      <section id="problem" className="py-32 px-6 md:px-12 lg:px-24 bg-bg border-t border-border">
        <div className="max-w-4xl">
          <span className="text-xs font-bold tracking-widest text-textMuted uppercase mb-4 block">
            The Problem
          </span>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-8">
            EIA Baselines Document Species — Not the Interactions Between Them
          </h2>
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <p className="text-textMuted text-lg leading-relaxed">
                Traditional EIA baselines record observed species, functional roles and stressors
                individually. The relationships between them — which pathways compound, which
                assumptions carry the evidence, which thresholds matter — are often implicit rather
                than tested. A plausible, decision-relevant interaction can be omitted from the
                evidence, the scope, the taxonomic resolution, or the time horizon without anyone
                flagging it.
              </p>
            </div>
            <div>
              <div className="p-6 border border-border bg-bgCard rounded-sm">
                <p className="text-base font-medium text-textMain leading-relaxed">
                  {BRAND.boundaryStatement}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. FEATURES */}
      <section
        id="features"
        className="py-32 px-6 md:px-12 lg:px-24 bg-bgCard border-t border-border"
      >
        <div className="max-w-7xl mx-auto">
          <div className="mb-16">
            <span className="text-xs font-bold tracking-widest text-textMuted uppercase mb-4 block">
              Core Features
            </span>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight max-w-2xl">
              Everything Needed to Screen the Full Interaction Picture
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: 'Candidate Interaction Screening',
                desc: 'Stress-tests evidence-linked interactions among observed species, functional roles and local stressors.',
              },
              {
                title: 'Candidate Interaction Engine',
                desc: 'Rule-based screening of the baseline for plausible interactions an EIA may have omitted — never a new organism.',
              },
              {
                title: 'Screening Report Export',
                desc: 'Exportable screening summaries for expert review and EIA workflow integration.',
              },
              {
                title: 'Interactive Interaction Network',
                desc: 'Drag-and-drop network of observed species, functional roles and stressors, with real-time variable adjustment.',
              },
              {
                title: 'Environmental Parameter Control',
                desc: 'Adjust temperature, salinity, pH, nitrogen loading, and disease context.',
              },
              {
                title: 'Scenario Response Analytics',
                desc: 'Time-series visualization of how scenario changes ripple through modelled indicators.',
              },
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-bgCard border border-border p-8 rounded-sm hover:border-textMuted transition-colors"
              >
                <h3 className="text-xl font-bold text-textMain mb-3">{feature.title}</h3>
                <p className="text-textMuted leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. HOW IT WORKS */}
      <section
        id="how-it-works"
        className="py-32 px-6 md:px-12 lg:px-24 bg-bg border-t border-border"
      >
        <div className="max-w-7xl mx-auto">
          <div className="mb-20 text-center">
            <span className="text-xs font-bold tracking-widest text-textMuted uppercase mb-4 block">
              How it Works
            </span>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
              From Baseline to Ranked Pathways
            </h2>
          </div>

          <div className="relative">
            {/* Connecting line for desktop */}
            <div className="hidden md:block absolute top-8 left-0 right-0 h-[1px] bg-border z-0"></div>

            <div className="grid md:grid-cols-3 gap-12 relative z-10">
              {[
                {
                  step: '01',
                  text: 'Input your site parameters, observed species inventory and functional roles.',
                },
                {
                  step: '02',
                  text: 'Surfaces candidate pathways and tests their sensitivity under alternative scenarios.',
                },
                {
                  step: '03',
                  text: 'Review flagged pathways and export a screening summary once each is review-ready.',
                },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.2 }}
                  className="flex flex-col items-center text-center"
                >
                  <div className="w-16 h-16 rounded-full bg-bgCard border border-border flex items-center justify-center text-2xl font-black mb-6">
                    {item.step}
                  </div>
                  <p className="text-lg text-textMuted font-medium max-w-sm">{item.text}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 6. PRICING */}
      <section
        id="pricing"
        className="py-32 px-6 md:px-12 lg:px-24 bg-bgCard border-t border-border"
      >
        <div className="max-w-5xl mx-auto">
          <div className="mb-6 text-center">
            <span className="text-xs font-bold tracking-widest text-textMuted uppercase mb-4 block">
              Pricing
            </span>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
              Two Segments. One Platform.
            </h2>
          </div>
          <p className="text-sm text-textMuted text-center max-w-2xl mx-auto mb-16">
            Figures below are a pricing hypothesis for pilot validation, not a fixed rate card —
            they are not wired to a billing or signup flow.
          </p>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Card A - Dev */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-bgCard border border-secondary p-10 rounded-sm relative flex flex-col"
            >
              <div className="absolute top-0 right-0 bg-secondary text-bg text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-bl-sm">
                Pilot
              </div>
              <h3 className="text-2xl font-bold mb-2">Development Companies</h3>
              <p className="text-textMuted mb-6 h-12">
                Energy, infrastructure, and marine development firms.
              </p>
              <div className="text-4xl font-black mb-8">
                $3,000–$10,000 <span className="text-lg text-textMuted font-medium">/ project</span>
              </div>

              <ul className="flex flex-col gap-4 mb-10 flex-1">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-secondary shrink-0" />{' '}
                  <span className="text-textMuted">Full workspace access</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-secondary shrink-0" />{' '}
                  <span className="text-textMuted">Candidate interaction screening</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-secondary shrink-0" />{' '}
                  <span className="text-textMuted">Screening report export</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-secondary shrink-0" />{' '}
                  <span className="text-textMuted">A/B/C evidence classes on every pathway</span>
                </li>
              </ul>

              <p className="text-xs text-textMuted text-center border-t border-border pt-4">
                Pricing hypothesis — not yet available for signup.
              </p>
            </motion.div>

            {/* Card B - NGOs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-bgCard border border-border p-10 rounded-sm flex flex-col"
            >
              <h3 className="text-2xl font-bold mb-2">Environmental NGOs</h3>
              <p className="text-textMuted mb-6 h-12">
                Advocacy organizations and environmental campaigns.
              </p>
              <div className="text-4xl font-black mb-8">
                $50–$200 <span className="text-lg text-textMuted font-medium">/ month</span>
              </div>

              <ul className="flex flex-col gap-4 mb-10 flex-1">
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-secondary mt-2 shrink-0"></div>{' '}
                  <span className="text-textMuted">Ongoing workspace access</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-secondary mt-2 shrink-0"></div>{' '}
                  <span className="text-textMuted">Pathway priority tracking</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-secondary mt-2 shrink-0"></div>{' '}
                  <span className="text-textMuted">Evidence-classed screening</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-secondary mt-2 shrink-0"></div>{' '}
                  <span className="text-textMuted">Campaign-ready data exports</span>
                </li>
              </ul>

              <p className="text-xs text-textMuted text-center border-t border-border pt-4">
                Pricing hypothesis — not yet available for signup.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 7. FINAL CTA BANNER */}
      <section className="py-32 px-6 md:px-12 lg:px-24 bg-bgCard text-textMain text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-5xl md:text-6xl font-black tracking-tight mb-6">
            See What an EIA Baseline Might Be Missing.
          </h2>
          <p className="text-xl text-textMuted mb-12 leading-relaxed">
            Explore the demo workspace to see how candidate pathways are surfaced, prioritised and
            routed to expert review.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="/dashboard"
              className="px-8 py-4 bg-primary hover:bg-primaryHover text-bg font-bold rounded-sm transition-colors text-lg inline-flex items-center justify-center gap-2"
            >
              Launch Workspace <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* 8. FOOTER */}
      <footer className="bg-bg py-12 px-6 md:px-12 lg:px-24 border-t border-border">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-secondary"></div>
            <span className="text-lg font-bold tracking-tight text-textMain">{BRAND.name}</span>
          </div>

          <div className="flex flex-wrap justify-center gap-6 text-sm text-textMuted">
            <a href="#problem" className="hover:text-textMain transition-colors">
              The Problem
            </a>
            <a href="#features" className="hover:text-textMain transition-colors">
              Features
            </a>
            <a href="#pricing" className="hover:text-textMain transition-colors">
              Pricing
            </a>
            <Link to="/dashboard" className="hover:text-textMain transition-colors">
              Dashboard
            </Link>
          </div>

          <div className="text-sm text-textMuted">
            © {new Date().getFullYear()} {BRAND.name}. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
