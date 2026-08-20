/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion, useReducedMotion } from "motion/react";
import {
  Shield,
  FileText,
  Users,
  ArrowRight,
  Cpu,
  Layers,
  Activity,
  Coins,
  CheckCircle,
  Bell,
  Sliders,
  TrendingUp,
  Flame,
  Search,
  Lock,
  Building,
  ExternalLink,
  ChevronRight,
  Workflow,
  Radio,
  MapPin,
  Clock
} from "lucide-react";
import AIChatbot from "./AIChatbot";
import logo from "../assets/1.jpg";

interface LandingPageProps {
  onSelectRole: (role: "admin" | "citizen" | "worker" | "docs") => void;
}

// ---------------------------------------------------------------------
// Static content — the live ledger ticker. Same case IDs referenced by
// the AI copilot's fallback answers (CIQ-2026-001 / CIQ-2026-006), so the
// "live feed" here matches what the chatbot will tell you if you ask it.
// ---------------------------------------------------------------------
type Tone = "critical" | "assigned" | "resolved" | "progress" | "pending";

const TONE_STYLES: Record<Tone, string> = {
  critical: "text-red-600 bg-red-50 border-red-200",
  assigned: "text-[#1565C0] bg-blue-50 border-blue-200",
  resolved: "text-emerald-600 bg-emerald-50 border-emerald-200",
  progress: "text-amber-600 bg-amber-50 border-amber-200",
  pending: "text-slate-500 bg-slate-100 border-slate-200"
};

const TICKER_ENTRIES: { id: string; category: string; location: string; status: string; tone: Tone }[] = [
  { id: "CIQ-2026-001", category: "Sinkhole Risk", location: "640 Broadway", status: "Critical", tone: "critical" },
  { id: "CIQ-2026-014", category: "Streetlight Outage", location: "Canal St & 5th", status: "Assigned", tone: "assigned" },
  { id: "CIQ-2026-006", category: "Duplicate Merged", location: "640 Broadway", status: "Resolved", tone: "resolved" },
  { id: "CIQ-2026-022", category: "Water Logging", location: "Sector 9 Underpass", status: "In Progress", tone: "progress" },
  { id: "CIQ-2026-031", category: "Pothole Cluster", location: "MG Road", status: "Pending Review", tone: "pending" },
  { id: "CIQ-2026-018", category: "Biohazard Cleared", location: "Union Square Alley", status: "Resolved", tone: "resolved" }
];

const STATS: { icon: React.ElementType; value: number; suffix: string; label: string }[] = [
  { icon: Workflow, value: 9, suffix: "", label: "AI Pipeline Stages" },
  { icon: Radio, value: 24, suffix: "/7", label: "Autonomous Monitoring" },
  { icon: Clock, value: 12, suffix: " min", label: "Avg. Dispatch Time" },
  { icon: Users, value: 3, suffix: "", label: "Role-Based Portals" }
];

// Scroll-progress positions the pulse dot travels through along the rail.
const RAIL_POSITIONS = ["5%", "16.25%", "27.5%", "38.75%", "50%", "61.25%", "72.5%", "83.75%", "95%"];

// ---------------------------------------------------------------------
// Small self-contained count-up used by the stats strip. Starts once its
// wrapping motion.span enters the viewport.
// ---------------------------------------------------------------------
function StatCounter({
  value,
  suffix,
  reduceMotion,
  className = ""
}: {
  value: number;
  suffix: string;
  reduceMotion: boolean;
  className?: string;
}) {
  const [display, setDisplay] = useState(reduceMotion ? value : 0);
  const [started, setStarted] = useState(reduceMotion);

  useEffect(() => {
    if (!started || reduceMotion) return;
    let raf: number;
    const duration = 1100;
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * value));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [started, value, reduceMotion]);

  return (
    <motion.span
      className={className}
      onViewportEnter={() => setStarted(true)}
      viewport={{ once: true, amount: 0.8 }}
    >
      {display}
      {suffix}
    </motion.span>
  );
}

export default function LandingPage({ onSelectRole }: LandingPageProps) {
  const prefersReducedMotion = useReducedMotion();
  const [scrolled, setScrolled] = useState(false);
  const [railInView, setRailInView] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  const heroContainer = {
    hidden: {},
    show: { transition: { staggerChildren: 0.12, delayChildren: 0.08 } }
  };
  const heroItem = {
    hidden: { opacity: 0, y: 18 },
    show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const } }
  };

  return (
    <div className="bg-white min-h-screen text-slate-800 flex flex-col font-sans">

      {/* Sticky Navigation Bar */}
      <header
        className={`sticky top-0 z-50 backdrop-blur-md border-b transition-all duration-300 ${
          scrolled ? "bg-white/95 border-slate-200 shadow-sm" : "bg-white/70 border-transparent shadow-none"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">

          {/* Logo & Platform Name */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
            <img
              src={logo}
              alt="CIVIC-AI Logo"
              className="w-9 h-9 rounded-full object-cover border border-slate-200 shrink-0"
              referrerPolicy="no-referrer"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-display font-bold text-[#1565C0] tracking-tight">CIVIC-AI</span>
                <span className="text-[9px] uppercase font-mono font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                  National Portal
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium">Federal Decision Intelligence</p>
            </div>
          </div>

          {/* Navigation Anchors */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <button
              onClick={() => scrollToSection("about")}
              className="hover:text-[#1565C0] transition-colors focus:outline-none focus:ring-2 focus:ring-[#1565C0]/20 rounded-md px-2 py-1"
            >
              About
            </button>
            <button
              onClick={() => scrollToSection("portals")}
              className="hover:text-[#1565C0] transition-colors focus:outline-none focus:ring-2 focus:ring-[#1565C0]/20 rounded-md px-2 py-1"
            >
              System Portals
            </button>
            <button
              onClick={() => scrollToSection("how-it-works")}
              className="hover:text-[#1565C0] transition-colors focus:outline-none focus:ring-2 focus:ring-[#1565C0]/20 rounded-md px-2 py-1"
            >
              How It Works
            </button>
            <button
              onClick={() => scrollToSection("features")}
              className="hover:text-[#1565C0] transition-colors focus:outline-none focus:ring-2 focus:ring-[#1565C0]/20 rounded-md px-2 py-1"
            >
              Why CIVIC-AI
            </button>
          </nav>

          {/* Call To Action Buttons */}
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => scrollToSection("portals")}
              className="bg-[#1565C0] hover:bg-[#0D47A1] text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors shadow-sm flex items-center gap-2 hover:shadow-md focus:ring-4 focus:ring-[#1565C0]/20"
            >
              <span>Access Systems</span>
              <ArrowRight className="h-4 w-4" />
            </motion.button>
          </div>

        </div>
      </header>

      {/* Hero Section */}
      <section id="about" className="relative py-16 lg:py-24 bg-white overflow-hidden border-b border-slate-100">
        {/* Ambient blueprint-grid backdrop */}
        <div
          className="absolute inset-0 opacity-[0.035] pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(#0B1220 1px, transparent 1px), linear-gradient(90deg, #0B1220 1px, transparent 1px)",
            backgroundSize: "42px 42px"
          }}
        />

        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative">

          {/* Hero Narrative Text Content */}
          <motion.div
            className="lg:col-span-7 space-y-6 text-left"
            variants={heroContainer}
            initial="hidden"
            animate="show"
          >
            {/* Government Shield Badge */}
            <motion.div variants={heroItem} className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-100 rounded-full">
              <Shield className="h-4 w-4 text-[#1565C0]" />
              <span className="text-xs font-semibold text-[#1565C0] tracking-wide uppercase font-mono">
                Official Government Infrastructure
              </span>
            </motion.div>

            <div className="space-y-3">
              <motion.h1 variants={heroItem} className="text-4xl sm:text-5xl lg:text-6xl font-display font-extrabold text-slate-900 tracking-tight leading-none">
                CIVIC-<span className="text-[#1565C0]">AI</span>
              </motion.h1>
              <motion.p variants={heroItem} className="text-xl sm:text-2xl font-semibold text-slate-700 tracking-tight">
                AI Decision Intelligence Platform for Smart Governance
              </motion.p>
            </div>

            <motion.p variants={heroItem} className="text-base text-slate-500 leading-relaxed max-w-2xl">
              Transforming citizen complaints into intelligent, explainable decisions that help municipal and national governments prioritize critical resources, eradicate duplicates, improve transparency, and deliver 10x faster public utilities and repairs.
            </motion.p>

            {/* Quick Action Anchor Buttons */}
            <motion.div variants={heroItem} className="pt-2 flex flex-col sm:flex-row gap-4">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => scrollToSection("portals")}
                className="bg-[#1565C0] hover:bg-[#0D47A1] text-white px-6 py-3.5 rounded-xl text-base font-bold transition-colors shadow-md hover:shadow-lg flex items-center justify-center gap-2 focus:ring-4 focus:ring-[#1565C0]/30"
              >
                <span>Select Your Portal</span>
                <ArrowRight className="h-5 w-5" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => scrollToSection("how-it-works")}
                className="bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 px-6 py-3.5 rounded-xl text-base font-bold transition-colors flex items-center justify-center gap-2"
              >
                <span>Learn How It Works</span>
              </motion.button>
            </motion.div>

            {/* SIGNATURE ELEMENT: Live case ledger ticker */}
            <motion.div variants={heroItem} className="pt-4 max-w-2xl">
              <div className="flex items-center gap-2 mb-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1">
                  <Radio className="h-3 w-3" />
                  Live Case Ledger
                </span>
              </div>
              <div className="relative overflow-hidden rounded-lg border border-slate-200 bg-slate-50/60 py-2.5">
                <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-slate-50 to-transparent z-10 pointer-events-none" />
                <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-slate-50 to-transparent z-10 pointer-events-none" />
                <motion.div
                  className="flex gap-3 w-max px-3"
                  animate={prefersReducedMotion ? undefined : { x: ["0%", "-50%"] }}
                  transition={prefersReducedMotion ? undefined : { duration: 26, repeat: Infinity, ease: "linear" }}
                >
                  {[...TICKER_ENTRIES, ...TICKER_ENTRIES].map((entry, idx) => (
                    <div
                      key={`${entry.id}-${idx}`}
                      className="shrink-0 flex items-center gap-2 bg-white border border-slate-200 rounded-md px-3 py-1.5 shadow-xs"
                    >
                      <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
                      <span className="font-mono text-[10px] font-bold text-slate-700">{entry.id}</span>
                      <span className="text-[10px] text-slate-400">·</span>
                      <span className="text-[10px] text-slate-600">{entry.category}</span>
                      <span className={`text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded border ${TONE_STYLES[entry.tone]}`}>
                        {entry.status}
                      </span>
                    </div>
                  ))}
                </motion.div>
              </div>
            </motion.div>
          </motion.div>

          {/* Hero Right: Embedded Chatbot in a dossier-styled frame */}
          <motion.div
            className="lg:col-span-5 w-full relative"
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Rotating dashed authorization ring, decorative only */}
            {!prefersReducedMotion && (
              <motion.div
                className="hidden lg:block absolute -top-6 -right-6 w-24 h-24 rounded-full border border-dashed border-blue-200 pointer-events-none"
                animate={{ rotate: 360 }}
                transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
              />
            )}
            {/* Corner brackets, like a stamped case file */}
            <div className="absolute -top-2 -left-2 w-6 h-6 border-t-2 border-l-2 border-[#1565C0]/40 rounded-tl-lg pointer-events-none" />
            <div className="absolute -bottom-2 -right-2 w-6 h-6 border-b-2 border-r-2 border-[#1565C0]/40 rounded-br-lg pointer-events-none" />

            <div className="flex items-center gap-2 mb-2 px-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400">Live Copilot Preview</span>
            </div>
            <AIChatbot mode="embedded" />
          </motion.div>

        </div>
      </section>

      {/* Stats strip */}
      <section className="bg-[#071A34] py-8 border-b border-slate-900/10">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 lg:grid-cols-4 gap-6">
          {STATS.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.6 }}
              transition={{ duration: 0.45, delay: i * 0.08 }}
              className="flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                <stat.icon className="h-5 w-5 text-blue-300" />
              </div>
              <div>
                <StatCounter
                  value={stat.value}
                  suffix={stat.suffix}
                  reduceMotion={!!prefersReducedMotion}
                  className="text-3xl font-display font-extrabold text-white tabular-nums block"
                />
                <p className="text-[11px] text-blue-200/70 font-mono uppercase tracking-wide font-bold">{stat.label}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Portals and Role Selector Section */}
      <section id="portals" className="py-20 bg-[#F5F7FA] border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 space-y-12 text-center">

          <motion.div
            className="space-y-3 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.5 }}
          >
            <span className="text-xs uppercase font-mono font-bold tracking-widest text-[#1565C0] block">Secure System Access</span>
            <h2 className="text-3xl font-display font-bold text-slate-900 tracking-tight">Select Your Access Portal</h2>
            <p className="text-sm text-slate-500 leading-relaxed">
              Log into your respective CivicIQ sector application. Data transit is encrypted under high-security municipal enterprise standards.
            </p>
          </motion.div>

          {/* Role Cards Grid (3 Columns) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

            {/* Card 1: Government Administrator */}
            <motion.div
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, delay: 0 }}
              whileHover={{ y: -4 }}
            >
              <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm hover:shadow-xl transition-shadow duration-300 flex flex-col justify-between group relative text-left h-full">
                <div className="space-y-6">

                  {/* Top Badge Decorator */}
                  <div className="w-14 h-14 bg-blue-50 text-[#1565C0] rounded-xl flex items-center justify-center transition-all group-hover:scale-110 group-hover:bg-[#1565C0] group-hover:text-white shadow-xs">
                    <Shield className="h-7 w-7" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-bold text-slate-900">Government Administrator</h3>
                    </div>
                    <p className="text-xs text-slate-500 uppercase font-bold tracking-wider font-mono">Operations Command Center</p>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    Monitor city-wide complaints, understand AI-generated priorities, allocate budgets, manage field operations, and make data-driven governance decisions.
                  </p>

                  {/* Simple Highlights Bullet List */}
                  <div className="space-y-2.5 pt-4 border-t border-slate-100">
                    <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-slate-400 block">Core Capabilities</span>
                    <ul className="space-y-2 text-xs text-slate-700">
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-[#1565C0] rounded-full"></span>
                        <span>Real-time GIS Triage Map</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-[#1565C0] rounded-full"></span>
                        <span>Explainable AI Reasoning (XAI)</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-[#1565C0] rounded-full"></span>
                        <span>Live Budget Simulation</span>
                      </li>
                    </ul>
                  </div>

                </div>

                <div className="pt-8">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onSelectRole("admin")}
                    className="w-full bg-[#1565C0] hover:bg-[#0D47A1] text-white py-3 px-4 rounded-lg text-sm font-bold transition-colors shadow-xs hover:shadow-md flex items-center justify-center gap-2 focus:ring-4 focus:ring-[#1565C0]/20"
                  >
                    <span>Enter Admin Portal</span>
                    <ArrowRight className="h-4 w-4" />
                  </motion.button>
                </div>
              </div>
            </motion.div>

            {/* Card 2: Citizen */}
            <motion.div
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              whileHover={{ y: -4 }}
            >
              <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm hover:shadow-xl transition-shadow duration-300 flex flex-col justify-between group relative text-left h-full">
                <div className="space-y-6">

                  {/* Top Badge Decorator */}
                  <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center transition-all group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white shadow-xs">
                    <FileText className="h-7 w-7" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-bold text-slate-900">Citizen</h3>
                    </div>
                    <p className="text-xs text-slate-500 uppercase font-bold tracking-wider font-mono">Public Portal Terminal</p>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    Submit complaints using text, voice, or images, track progress in real time, and receive transparent updates on every stage of resolution.
                  </p>

                  {/* Simple Highlights Bullet List */}
                  <div className="space-y-2.5 pt-4 border-t border-slate-100">
                    <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-slate-400 block">Core Capabilities</span>
                    <ul className="space-y-2 text-xs text-slate-700">
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                        <span>Voice Memo & Image Uploads</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                        <span>Automated Prioritization Preview</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                        <span>Instant GPS Location Anchor</span>
                      </li>
                    </ul>
                  </div>

                </div>

                <div className="pt-8">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onSelectRole("citizen")}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 px-4 rounded-lg text-sm font-bold transition-colors shadow-xs hover:shadow-md flex items-center justify-center gap-2 focus:ring-4 focus:ring-emerald-500/20"
                  >
                    <span>Enter Citizen Portal</span>
                    <ArrowRight className="h-4 w-4" />
                  </motion.button>
                </div>
              </div>
            </motion.div>

            {/* Card 3: Field Crew */}
            <motion.div
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              whileHover={{ y: -4 }}
            >
              <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm hover:shadow-xl transition-shadow duration-300 flex flex-col justify-between group relative text-left h-full">
                <div className="space-y-6">

                  {/* Top Badge Decorator */}
                  <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center transition-all group-hover:scale-110 group-hover:bg-amber-500 group-hover:text-white shadow-xs">
                    <Users className="h-7 w-7" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-bold text-slate-900">Field Crew</h3>
                    </div>
                    <p className="text-xs text-slate-500 uppercase font-bold tracking-wider font-mono">Technician Dispatch App</p>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    Receive assigned tasks, navigate to incidents, upload proof of completion, and update work status directly from the field.
                  </p>

                  {/* Simple Highlights Bullet List */}
                  <div className="space-y-2.5 pt-4 border-t border-slate-100">
                    <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-slate-400 block">Core Capabilities</span>
                    <ul className="space-y-2 text-xs text-slate-700">
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
                        <span>Interactive Work Orders Queue</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
                        <span>Simulated Offline Verification</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
                        <span>Live Before/After Visual Proof</span>
                      </li>
                    </ul>
                  </div>

                </div>

                <div className="pt-8">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onSelectRole("worker")}
                    className="w-full bg-amber-500 hover:bg-amber-600 text-white py-3 px-4 rounded-lg text-sm font-bold transition-colors shadow-xs hover:shadow-md flex items-center justify-center gap-2 focus:ring-4 focus:ring-amber-500/20"
                  >
                    <span>Enter Field Portal</span>
                    <ArrowRight className="h-4 w-4" />
                  </motion.button>
                </div>
              </div>
            </motion.div>

          </div>

        </div>
      </section>

      {/* How It Works - Horizontal process timeline with a traveling signal pulse */}
      <section id="how-it-works" className="py-20 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 space-y-12">

          <motion.div
            className="space-y-3 max-w-3xl mx-auto text-center"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.5 }}
          >
            <span className="text-xs uppercase font-mono font-bold tracking-widest text-[#1565C0] block">Operational Pipeline</span>
            <h2 className="text-3xl font-display font-bold text-slate-900 tracking-tight">How CivicIQ Works</h2>
            <p className="text-sm text-slate-500 leading-relaxed">
              Under the hood, our smart decision system automates every step of a city repair workorder, maximizing transparency and minimizing municipal overhead.
            </p>
          </motion.div>

          {/* Timeline steps wrapper */}
          <motion.div
            className="relative pt-4"
            onViewportEnter={() => setRailInView(true)}
            viewport={{ once: true, amount: 0.4 }}
          >

            {/* Desktop horizontal track line, draws itself in on scroll */}
            <motion.div
              className="absolute top-[3.25rem] left-[5%] right-[5%] h-0.5 bg-slate-200 hidden lg:block z-0 origin-left"
              initial={{ scaleX: 0 }}
              animate={railInView ? { scaleX: 1 } : {}}
              transition={{ duration: 1.1, ease: "easeInOut" }}
            />

            {/* Traveling signal pulse — visualizes a complaint moving through the pipeline */}
            {!prefersReducedMotion && (
              <motion.div
                className="hidden lg:block absolute w-3 h-3 rounded-full bg-amber-400 z-0"
                style={{ top: "calc(3.25rem - 5px)", boxShadow: "0 0 12px 3px rgba(245,165,36,0.75)" }}
                initial={{ left: "5%", opacity: 0 }}
                animate={
                  railInView
                    ? { left: RAIL_POSITIONS, opacity: [0, 1, 1, 1, 1, 1, 1, 1, 0] }
                    : {}
                }
                transition={{ duration: 2.4, delay: 1.0, ease: "linear" }}
              />
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-9 gap-8 relative z-10 text-center">

              {/* Step 1: Citizen Report */}
              <motion.div
                className="space-y-3.5 flex flex-col items-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.45, delay: 0 * 0.07 }}
              >
                <div className="w-14 h-14 bg-blue-50 border border-blue-100 text-[#1565C0] rounded-full flex items-center justify-center font-bold text-sm shadow-xs">
                  <FileText className="h-6 w-6" />
                </div>
                <div>
                  <span className="text-xs font-mono font-bold text-slate-400 block uppercase">Step 01</span>
                  <h4 className="font-bold text-slate-800 text-sm mt-0.5">Citizen Report</h4>
                </div>
              </motion.div>

              {/* Step 2: AI Classification */}
              <motion.div
                className="space-y-3.5 flex flex-col items-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.45, delay: 1 * 0.07 }}
              >
                <div className="w-14 h-14 bg-blue-50 border border-blue-100 text-[#1565C0] rounded-full flex items-center justify-center font-bold text-sm shadow-xs">
                  <Cpu className="h-6 w-6" />
                </div>
                <div>
                  <span className="text-xs font-mono font-bold text-slate-400 block uppercase">Step 02</span>
                  <h4 className="font-bold text-slate-800 text-sm mt-0.5">AI Classification</h4>
                </div>
              </motion.div>

              {/* Step 3: Duplicate Detection */}
              <motion.div
                className="space-y-3.5 flex flex-col items-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.45, delay: 2 * 0.07 }}
              >
                <div className="w-14 h-14 bg-blue-50 border border-blue-100 text-[#1565C0] rounded-full flex items-center justify-center font-bold text-sm shadow-xs">
                  <Layers className="h-6 w-6" />
                </div>
                <div>
                  <span className="text-xs font-mono font-bold text-slate-400 block uppercase">Step 03</span>
                  <h4 className="font-bold text-slate-800 text-sm mt-0.5">Duplicate Detection</h4>
                </div>
              </motion.div>

              {/* Step 4: Severity Analysis */}
              <motion.div
                className="space-y-3.5 flex flex-col items-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.45, delay: 3 * 0.07 }}
              >
                <div className="w-14 h-14 bg-blue-50 border border-blue-100 text-[#1565C0] rounded-full flex items-center justify-center font-bold text-sm shadow-xs">
                  <Activity className="h-6 w-6" />
                </div>
                <div>
                  <span className="text-xs font-mono font-bold text-slate-400 block uppercase">Step 04</span>
                  <h4 className="font-bold text-slate-800 text-sm mt-0.5">Severity Analysis</h4>
                </div>
              </motion.div>

              {/* Step 5: Priority Ranking */}
              <motion.div
                className="space-y-3.5 flex flex-col items-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.45, delay: 4 * 0.07 }}
              >
                <div className="w-14 h-14 bg-blue-50 border border-blue-100 text-[#1565C0] rounded-full flex items-center justify-center font-bold text-sm shadow-xs">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <div>
                  <span className="text-xs font-mono font-bold text-slate-400 block uppercase">Step 05</span>
                  <h4 className="font-bold text-slate-800 text-sm mt-0.5">Priority Ranking</h4>
                </div>
              </motion.div>

              {/* Step 6: Budget Optimization */}
              <motion.div
                className="space-y-3.5 flex flex-col items-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.45, delay: 5 * 0.07 }}
              >
                <div className="w-14 h-14 bg-blue-50 border border-blue-100 text-[#1565C0] rounded-full flex items-center justify-center font-bold text-sm shadow-xs">
                  <Coins className="h-6 w-6" />
                </div>
                <div>
                  <span className="text-xs font-mono font-bold text-slate-400 block uppercase">Step 06</span>
                  <h4 className="font-bold text-slate-800 text-sm mt-0.5">Budget Optimization</h4>
                </div>
              </motion.div>

              {/* Step 7: Field Assignment */}
              <motion.div
                className="space-y-3.5 flex flex-col items-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.45, delay: 6 * 0.07 }}
              >
                <div className="w-14 h-14 bg-blue-50 border border-blue-100 text-[#1565C0] rounded-full flex items-center justify-center font-bold text-sm shadow-xs">
                  <Users className="h-6 w-6" />
                </div>
                <div>
                  <span className="text-xs font-mono font-bold text-slate-400 block uppercase">Step 07</span>
                  <h4 className="font-bold text-slate-800 text-sm mt-0.5">Field Assignment</h4>
                </div>
              </motion.div>

              {/* Step 8: Resolution */}
              <motion.div
                className="space-y-3.5 flex flex-col items-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.45, delay: 7 * 0.07 }}
              >
                <div className="w-14 h-14 bg-blue-50 border border-blue-100 text-[#1565C0] rounded-full flex items-center justify-center font-bold text-sm shadow-xs">
                  <CheckCircle className="h-6 w-6" />
                </div>
                <div>
                  <span className="text-xs font-mono font-bold text-slate-400 block uppercase">Step 08</span>
                  <h4 className="font-bold text-slate-800 text-sm mt-0.5">Resolution</h4>
                </div>
              </motion.div>

              {/* Step 9: Citizen Notification */}
              <motion.div
                className="space-y-3.5 flex flex-col items-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.45, delay: 8 * 0.07 }}
              >
                <div className="w-14 h-14 bg-blue-50 border border-blue-100 text-[#1565C0] rounded-full flex items-center justify-center font-bold text-sm shadow-xs">
                  <Bell className="h-6 w-6" />
                </div>
                <div>
                  <span className="text-xs font-mono font-bold text-slate-400 block uppercase">Step 09</span>
                  <h4 className="font-bold text-slate-800 text-sm mt-0.5">Citizen Notification</h4>
                </div>
              </motion.div>

            </div>

          </motion.div>

        </div>
      </section>

      {/* Why CivicIQ Feature Cards Section */}
      <section id="features" className="py-20 bg-[#F5F7FA] border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 space-y-12">

          <motion.div
            className="space-y-3 max-w-3xl mx-auto text-center"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.5 }}
          >
            <span className="text-xs uppercase font-mono font-bold tracking-widest text-[#1565C0] block">Platform Guarantees</span>
            <h2 className="text-3xl font-display font-bold text-slate-900 tracking-tight">Why Agencies Choose CIVIC-AI</h2>
            <p className="text-sm text-slate-500 leading-relaxed">
              Every decision the system makes is traceable, adjustable, and accountable to the residents it serves.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

            {/* Feature 1: Explainable AI Reasoning */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.45, delay: 0 * 0.06 }}
              whileHover={{ y: -3 }}
              className="bg-white border border-slate-200 rounded-xl p-7 shadow-sm hover:shadow-lg transition-shadow duration-300 group text-left"
            >
              <div className="w-12 h-12 bg-blue-50 text-[#1565C0] rounded-lg flex items-center justify-center mb-5 transition-all group-hover:bg-[#1565C0] group-hover:text-white">
                <Search className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Explainable AI Reasoning</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Every priority score is broken down into the specific factors that produced it, so administrators can audit and justify each decision line by line.
              </p>
            </motion.div>

            {/* Feature 2: Adaptive Priority Weighting */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.45, delay: 1 * 0.06 }}
              whileHover={{ y: -3 }}
              className="bg-white border border-slate-200 rounded-xl p-7 shadow-sm hover:shadow-lg transition-shadow duration-300 group text-left"
            >
              <div className="w-12 h-12 bg-blue-50 text-[#1565C0] rounded-lg flex items-center justify-center mb-5 transition-all group-hover:bg-[#1565C0] group-hover:text-white">
                <Sliders className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Adaptive Priority Weighting</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Adjust how urgency, population impact, and budget constraints are balanced, without waiting on a development cycle to change the model.
              </p>
            </motion.div>

            {/* Feature 3: Real-Time Severity Signals */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.45, delay: 2 * 0.06 }}
              whileHover={{ y: -3 }}
              className="bg-white border border-slate-200 rounded-xl p-7 shadow-sm hover:shadow-lg transition-shadow duration-300 group text-left"
            >
              <div className="w-12 h-12 bg-blue-50 text-[#1565C0] rounded-lg flex items-center justify-center mb-5 transition-all group-hover:bg-[#1565C0] group-hover:text-white">
                <Flame className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Real-Time Severity Signals</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Reports involving immediate safety risk are surfaced and escalated automatically, ahead of routine maintenance requests.
              </p>
            </motion.div>

            {/* Feature 4: Encrypted Data Custody */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.45, delay: 3 * 0.06 }}
              whileHover={{ y: -3 }}
              className="bg-white border border-slate-200 rounded-xl p-7 shadow-sm hover:shadow-lg transition-shadow duration-300 group text-left"
            >
              <div className="w-12 h-12 bg-blue-50 text-[#1565C0] rounded-lg flex items-center justify-center mb-5 transition-all group-hover:bg-[#1565C0] group-hover:text-white">
                <Lock className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Encrypted Data Custody</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Resident submissions are encrypted at rest and in transit, meeting municipal and federal data-handling requirements.
              </p>
            </motion.div>

            {/* Feature 5: Cross-Agency Routing */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.45, delay: 4 * 0.06 }}
              whileHover={{ y: -3 }}
              className="bg-white border border-slate-200 rounded-xl p-7 shadow-sm hover:shadow-lg transition-shadow duration-300 group text-left"
            >
              <div className="w-12 h-12 bg-blue-50 text-[#1565C0] rounded-lg flex items-center justify-center mb-5 transition-all group-hover:bg-[#1565C0] group-hover:text-white">
                <Building className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Cross-Agency Routing</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Complaints spanning multiple departments or jurisdictions are routed to the correct desk automatically, cutting handoff delays.
              </p>
            </motion.div>

            {/* Feature 6: Open Records Export */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.45, delay: 5 * 0.06 }}
              whileHover={{ y: -3 }}
              className="bg-white border border-slate-200 rounded-xl p-7 shadow-sm hover:shadow-lg transition-shadow duration-300 group text-left"
            >
              <div className="w-12 h-12 bg-blue-50 text-[#1565C0] rounded-lg flex items-center justify-center mb-5 transition-all group-hover:bg-[#1565C0] group-hover:text-white">
                <ExternalLink className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Open Records Export</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Resolution history and case data export directly to public transparency portals and records-request systems.
              </p>
              <button
                onClick={() => onSelectRole("docs")}
                className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-[#1565C0] hover:text-[#0D47A1] transition-colors"
              >
                <span>View data specs</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </motion.div>

          </div>

        </div>
      </section>

      {/* Official Gov Footer */}
      <footer className="bg-white border-t border-slate-200 pt-16 pb-8 px-6 font-sans">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10 border-b border-slate-100 pb-12">

          {/* Logo Brand Block */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img
                src={logo}
                alt="CivicIQ Logo"
                className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0"
                referrerPolicy="no-referrer"
              />
              <div>
                <span className="text-base font-bold text-[#1565C0] tracking-tight block">CivicIQ</span>
                <span className="text-[9px] uppercase font-mono font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                  v1.4 Enterprise
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              The national-level AI decision intelligence ecosystem for smart city administrations, public safety, and infrastructure allocation.
            </p>
          </div>

          {/* Quick System Portals Links */}
          <div className="space-y-3 text-xs">
            <h5 className="font-mono font-bold text-slate-400 uppercase tracking-widest text-[10px]">Secure Systems</h5>
            <ul className="space-y-2 font-medium">
              <li>
                <button onClick={() => onSelectRole("admin")} className="text-slate-600 hover:text-[#1565C0] transition-colors flex items-center gap-1.5">
                  <Shield className="h-3.5 w-3.5 text-slate-400" />
                  <span>Administrative Command</span>
                </button>
              </li>
              <li>
                <button onClick={() => onSelectRole("citizen")} className="text-slate-600 hover:text-[#1565C0] transition-colors flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5 text-slate-400" />
                  <span>Citizen Complaints Mobile</span>
                </button>
              </li>
              <li>
                <button onClick={() => onSelectRole("worker")} className="text-slate-600 hover:text-[#1565C0] transition-colors flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5 text-slate-400" />
                  <span>Field Crew Technician</span>
                </button>
              </li>
              <li>
                <button onClick={() => onSelectRole("docs")} className="text-slate-600 hover:text-[#1565C0] transition-colors flex items-center gap-1.5">
                  <Workflow className="h-3.5 w-3.5 text-slate-400" />
                  <span>Design Token Specs</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Documentation Links */}
          <div className="space-y-3 text-xs">
            <h5 className="font-mono font-bold text-slate-400 uppercase tracking-widest text-[10px]">Information Desk</h5>
            <ul className="space-y-2 font-medium text-slate-600">
              <li><a href="#about" onClick={(e) => { e.preventDefault(); scrollToSection("about"); }} className="hover:text-[#1565C0]">Governance Model</a></li>
              <li><a href="#how-it-works" onClick={(e) => { e.preventDefault(); scrollToSection("how-it-works"); }} className="hover:text-[#1565C0]">Security & Encryption Protocol</a></li>
              <li><a href="#features" onClick={(e) => { e.preventDefault(); scrollToSection("features"); }} className="hover:text-[#1565C0]">ISO-37120 Smart Indicators</a></li>
              <li><a href="#about" onClick={(e) => { e.preventDefault(); scrollToSection("about"); }} className="hover:text-[#1565C0]">Federal Support API</a></li>
            </ul>
          </div>

          {/* Support and System Status */}
          <div className="space-y-3 text-xs">
            <h5 className="font-mono font-bold text-slate-400 uppercase tracking-widest text-[10px]">Command Contact</h5>
            <ul className="space-y-2 font-medium text-slate-600">
              <li><span>Emergency Dispatch: <strong>911 / 311</strong></span></li>
              <li><span>Secure Admin Desk: <strong>admin@ciq.gov</strong></span></li>
              <li><span>System Status: <span className="text-emerald-600 font-bold font-mono">ALL SYSTEMS NOMINAL</span></span></li>
            </ul>
          </div>

        </div>

        {/* Legal Disclaimer Sub-footer */}
        <div className="max-w-7xl mx-auto pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] font-mono text-slate-400 uppercase font-bold tracking-wider">
          <div>MUNICIPALITY OF METRO SECTOR • NATIONAL SMART CITY ALLIANCE</div>
          <div className="text-center sm:text-right space-y-1">
            <div>This system complies with US Federal (WDS), EU DSM, and ISO certification laws.</div>
            <div className="font-normal text-slate-400/80">© {new Date().getFullYear()} CIVIC-AI. All government rights reserved.</div>
          </div>
        </div>

      </footer>

    </div>
  );
}
