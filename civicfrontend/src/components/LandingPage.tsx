/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
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
  Workflow
} from "lucide-react";
import AIChatbot from "./AIChatbot";
import logo from "../assets/1.jpg";
interface LandingPageProps {
  onSelectRole: (role: "admin" | "citizen" | "worker" | "docs") => void;
}

export default function LandingPage({ onSelectRole }: LandingPageProps) {
  const [activeTab, setActiveTab] = useState<string>("all");

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="bg-white min-h-screen text-slate-800 flex flex-col font-sans">
      
      {/* Sticky Navigation Bar */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm transition-all">
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
          
            <button
              onClick={() => scrollToSection("portals")}
              className="bg-[#1565C0] hover:bg-[#0D47A1] text-white px-4 py-2 rounded-lg text-sm font-bold transition-all shadow-sm flex items-center gap-2 hover:shadow-md focus:ring-4 focus:ring-[#1565C0]/20"
            >
              <span>Access Systems</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

        </div>
      </header>

      {/* Hero Section */}
      <section id="about" className="relative py-16 lg:py-24 bg-white overflow-hidden border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Hero Narrative Text Content */}
          <div className="lg:col-span-7 space-y-6 text-left">
            
            {/* Government Shield Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-100 rounded-full">
              <Shield className="h-4 w-4 text-[#1565C0]" />
              <span className="text-xs font-semibold text-[#1565C0] tracking-wide uppercase font-mono">
                Official Government Infrastructure
              </span>
            </div>

            <div className="space-y-3">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-extrabold text-slate-900 tracking-tight leading-none">
                CIVIC-<span className="text-[#1565C0]">AI</span>
              </h1>
              <p className="text-xl sm:text-2xl font-semibold text-slate-700 tracking-tight">
                AI Decision Intelligence Platform for Smart Governance
              </p>
            </div>

            <p className="text-base text-slate-500 leading-relaxed max-w-2xl">
              Transforming citizen complaints into intelligent, explainable decisions that help municipal and national governments prioritize critical resources, eradicate duplicates, improve transparency, and deliver 10x faster public utilities and repairs.
            </p>

            {/* Quick Action Anchor Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => scrollToSection("portals")}
                className="bg-[#1565C0] hover:bg-[#0D47A1] text-white px-6 py-3.5 rounded-xl text-base font-bold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 focus:ring-4 focus:ring-[#1565C0]/30"
              >
                <span>Select Your Portal</span>
                <ArrowRight className="h-5 w-5" />
              </button>
              <button
                onClick={() => scrollToSection("how-it-works")}
                className="bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 px-6 py-3.5 rounded-xl text-base font-bold transition-all flex items-center justify-center gap-2"
              >
                <span>Learn How It Works</span>
              </button>
            </div>


          </div>

          {/* Hero Premium Civic Map Visual Graphic replaced with Embedded Chatbot */}
          <div className="lg:col-span-5 w-full">
            <AIChatbot mode="embedded" />
          </div>

        </div>
      </section>

      {/* Portals and Role Selector Section */}
      <section id="portals" className="py-20 bg-[#F5F7FA] border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 space-y-12 text-center">
          
          <div className="space-y-3 max-w-3xl mx-auto">
            <span className="text-xs uppercase font-mono font-bold tracking-widest text-[#1565C0] block">Secure System Access</span>
            <h2 className="text-3xl font-display font-bold text-slate-900 tracking-tight">Select Your Access Portal</h2>
            <p className="text-sm text-slate-500 leading-relaxed">
              Log into your respective CivicIQ sector application. Data transit is encrypted under high-security municipal enterprise standards.
            </p>
          </div>

          {/* Role Cards Grid (3 Columns) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Card 1: Government Administrator */}
            <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group relative text-left">
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
                <button
                  onClick={() => onSelectRole("admin")}
                  className="w-full bg-[#1565C0] hover:bg-[#0D47A1] text-white py-3 px-4 rounded-lg text-sm font-bold transition-all shadow-xs hover:shadow-md flex items-center justify-center gap-2 focus:ring-4 focus:ring-[#1565C0]/20"
                >
                  <span>Enter Admin Portal</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Card 2: Citizen */}
            <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group relative text-left">
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
                <button
                  onClick={() => onSelectRole("citizen")}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 px-4 rounded-lg text-sm font-bold transition-all shadow-xs hover:shadow-md flex items-center justify-center gap-2 focus:ring-4 focus:ring-emerald-500/20"
                >
                  <span>Enter Citizen Portal</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Card 3: Field Crew */}
            <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group relative text-left">
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
                <button
                  onClick={() => onSelectRole("worker")}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-white py-3 px-4 rounded-lg text-sm font-bold transition-all shadow-xs hover:shadow-md flex items-center justify-center gap-2 focus:ring-4 focus:ring-amber-500/20"
                >
                  <span>Enter Field Portal</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* How It Works - Horizontal process timeline */}
      <section id="how-it-works" className="py-20 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 space-y-12">
          
          <div className="space-y-3 max-w-3xl mx-auto text-center">
            <span className="text-xs uppercase font-mono font-bold tracking-widest text-[#1565C0] block">Operational Pipeline</span>
            <h2 className="text-3xl font-display font-bold text-slate-900 tracking-tight">How CivicIQ Works</h2>
            <p className="text-sm text-slate-500 leading-relaxed">
              Under the hood, our smart decision system automates every step of a city repair workorder, maximizing transparency and minimizing municipal overhead.
            </p>
          </div>

          {/* Timeline steps wrapper */}
          <div className="relative pt-4">
            
            {/* Desktop horizontal track line */}
            <div className="absolute top-[3.25rem] left-[5%] right-[5%] h-0.5 bg-slate-200 hidden lg:block z-0"></div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-9 gap-8 relative z-10 text-center">
              
              {/* Step 1: Citizen Report */}
              <div className="space-y-3.5 flex flex-col items-center">
                <div className="w-14 h-14 bg-blue-50 border border-blue-100 text-[#1565C0] rounded-full flex items-center justify-center font-bold text-sm shadow-xs">
                  <FileText className="h-6 w-6" />
                </div>
                <div>
                  <span className="text-xs font-mono font-bold text-slate-400 block uppercase">Step 01</span>
                  <h4 className="font-bold text-slate-800 text-sm mt-0.5">Citizen Report</h4>
                </div>
              </div>

              {/* Step 2: AI Classification */}
              <div className="space-y-3.5 flex flex-col items-center">
                <div className="w-14 h-14 bg-blue-50 border border-blue-100 text-[#1565C0] rounded-full flex items-center justify-center font-bold text-sm shadow-xs">
                  <Cpu className="h-6 w-6" />
                </div>
                <div>
                  <span className="text-xs font-mono font-bold text-slate-400 block uppercase">Step 02</span>
                  <h4 className="font-bold text-slate-800 text-sm mt-0.5">AI Classification</h4>
                </div>
              </div>

              {/* Step 3: Duplicate Detection */}
              <div className="space-y-3.5 flex flex-col items-center">
                <div className="w-14 h-14 bg-blue-50 border border-blue-100 text-[#1565C0] rounded-full flex items-center justify-center font-bold text-sm shadow-xs">
                  <Layers className="h-6 w-6" />
                </div>
                <div>
                  <span className="text-xs font-mono font-bold text-slate-400 block uppercase">Step 03</span>
                  <h4 className="font-bold text-slate-800 text-sm mt-0.5">Duplicate Detection</h4>
                </div>
              </div>

              {/* Step 4: Severity Analysis */}
              <div className="space-y-3.5 flex flex-col items-center">
                <div className="w-14 h-14 bg-blue-50 border border-blue-100 text-[#1565C0] rounded-full flex items-center justify-center font-bold text-sm shadow-xs">
                  <Activity className="h-6 w-6" />
                </div>
                <div>
                  <span className="text-xs font-mono font-bold text-slate-400 block uppercase">Step 04</span>
                  <h4 className="font-bold text-slate-800 text-sm mt-0.5">Severity Analysis</h4>
                </div>
              </div>

              {/* Step 5: Priority Ranking */}
              <div className="space-y-3.5 flex flex-col items-center">
                <div className="w-14 h-14 bg-blue-50 border border-blue-100 text-[#1565C0] rounded-full flex items-center justify-center font-bold text-sm shadow-xs">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <div>
                  <span className="text-xs font-mono font-bold text-slate-400 block uppercase">Step 05</span>
                  <h4 className="font-bold text-slate-800 text-sm mt-0.5">Priority Ranking</h4>
                </div>
              </div>

              {/* Step 6: Budget Optimization */}
              <div className="space-y-3.5 flex flex-col items-center">
                <div className="w-14 h-14 bg-blue-50 border border-blue-100 text-[#1565C0] rounded-full flex items-center justify-center font-bold text-sm shadow-xs">
                  <Coins className="h-6 w-6" />
                </div>
                <div>
                  <span className="text-xs font-mono font-bold text-slate-400 block uppercase">Step 06</span>
                  <h4 className="font-bold text-slate-800 text-sm mt-0.5">Budget Optimization</h4>
                </div>
              </div>

              {/* Step 7: Field Assignment */}
              <div className="space-y-3.5 flex flex-col items-center">
                <div className="w-14 h-14 bg-blue-50 border border-blue-100 text-[#1565C0] rounded-full flex items-center justify-center font-bold text-sm shadow-xs">
                  <Users className="h-6 w-6" />
                </div>
                <div>
                  <span className="text-xs font-mono font-bold text-slate-400 block uppercase">Step 07</span>
                  <h4 className="font-bold text-slate-800 text-sm mt-0.5">Field Assignment</h4>
                </div>
              </div>

              {/* Step 8: Resolution */}
              <div className="space-y-3.5 flex flex-col items-center">
                <div className="w-14 h-14 bg-blue-50 border border-blue-100 text-[#1565C0] rounded-full flex items-center justify-center font-bold text-sm shadow-xs">
                  <CheckCircle className="h-6 w-6" />
                </div>
                <div>
                  <span className="text-xs font-mono font-bold text-slate-400 block uppercase">Step 08</span>
                  <h4 className="font-bold text-slate-800 text-sm mt-0.5">Resolution</h4>
                </div>
              </div>

              {/* Step 9: Citizen Notification */}
              <div className="space-y-3.5 flex flex-col items-center">
                <div className="w-14 h-14 bg-blue-50 border border-blue-100 text-[#1565C0] rounded-full flex items-center justify-center font-bold text-sm shadow-xs">
                  <Bell className="h-6 w-6" />
                </div>
                <div>
                  <span className="text-xs font-mono font-bold text-slate-400 block uppercase">Step 09</span>
                  <h4 className="font-bold text-slate-800 text-sm mt-0.5">Citizen Notification</h4>
                </div>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* Why CivicIQ Feature Cards Section */}
      
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
