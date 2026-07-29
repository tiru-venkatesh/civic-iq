/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import {
  Shield,
  FileText,
  Users,
  Home,
  Bot,
  Phone,
  Globe,
  MapPin,
  CheckCircle2,
  ExternalLink,
  Building2,
  Heart
} from "lucide-react";
import logo from "../assets/1.jpg";
interface FooterProps {
  activeRole: string;
  setActiveRole: (role: string) => void;
}

export default function Footer({ activeRole, setActiveRole }: FooterProps) {
  const [selectedLanguage, setSelectedLanguage] = useState("English");

  const quickLinks = [
    { id: "landing", label: "Home", icon: Home },
    { id: "citizen", label: "Citizen Portal", icon: FileText },
    { id: "admin", label: "Admin Dashboard", icon: Shield },
    { id: "worker", label: "Field Crew", icon: Users },
  ];

  return (
    <footer className="bg-white border-t border-slate-200/80 text-slate-700 font-sans shrink-0 mt-auto shadow-xs">
      {/* MAIN FOOTER GRID */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* BRAND & DESCRIPTION COLUMN (Cols 1-4) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center gap-3">
               <img
  src={logo}
  alt="Civic-IQ Logo"
  className="w-9 h-9 rounded-xl object-cover border border-slate-200 shadow-2xs"
/>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-base font-bold text-slate-900 tracking-tight">
                    Civic-IQ
                  </span>
                  <span className="text-[10px] font-mono font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                    v2.0
                  </span>
                </div>
                <p className="text-xs font-medium text-slate-500">
                  AI Powered Smart City Platform
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed max-w-sm">
              Empowering municipal governance in Mumbai Metropolitan Region with real-time AI automated triage, automated field dispatch, and complete citizen transparency.
            </p>

            <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-500 font-mono">
              <Building2 className="h-3.5 w-3.5 text-slate-400" />
              <span>Brihanmumbai Municipal Corporation (BMC) Ward K-West</span>
            </div>
          </div>

          {/* QUICK LINKS COLUMN (Cols 5-7) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-mono border-b border-slate-100 pb-2">
              Quick Links
            </h4>
            <ul className="space-y-2 text-xs">
              {quickLinks.map((link) => {
                const Icon = link.icon;
                const isActive = activeRole === link.id;
                return (
                  <li key={link.id}>
                    <button
                      onClick={() => setActiveRole(link.id)}
                      className={`flex items-center gap-2 hover:text-blue-600 transition-colors cursor-pointer text-left ${
                        isActive ? "text-blue-700 font-semibold" : "text-slate-600"
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5 text-slate-400" />
                      <span>{link.label}</span>
                    </button>
                  </li>
                );
              })}
              <li>
                <button
                  onClick={() => setActiveRole("docs")}
                  className={`flex items-center gap-2 hover:text-blue-600 transition-colors cursor-pointer text-left ${
                    activeRole === "docs" ? "text-blue-700 font-semibold" : "text-slate-600"
                  }`}
                >
                  <Bot className="h-3.5 w-3.5 text-slate-400" />
                  <span>AI Assistant & System Docs</span>
                </button>
              </li>
            </ul>
          </div>

          {/* EMERGENCY CONTACTS COLUMN (Cols 8-10) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-mono border-b border-slate-100 pb-2">
              Emergency Contacts
            </h4>
            <ul className="space-y-2 text-xs text-slate-600">
              <li className="flex items-start gap-2">
                <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-medium text-slate-800 block">Municipal Control Room:</span>
                  <span className="font-mono text-slate-600">1916 / +91 22 2269 4725</span>
                </div>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                <span>Disaster Helpline: <strong className="font-mono text-slate-800">108</strong></span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                <span>Fire Brigade: <strong className="font-mono text-slate-800">101</strong></span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                <span>Police Control: <strong className="font-mono text-slate-800">112</strong></span>
              </li>
            </ul>
          </div>

          {/* REGIONAL SETTINGS & LOCATION (Cols 11-12) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-mono border-b border-slate-100 pb-2">
              Region & Language
            </h4>
            
            <div className="space-y-2.5">
              <div>
                <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">
                  Current City
                </label>
                <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-800">
                  <MapPin className="h-3.5 w-3.5 text-red-500 shrink-0" />
                  <span>Mumbai</span>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">
                  Portal Language
                </label>
                <div className="relative">
                  <select
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 cursor-pointer appearance-none pr-8"
                  >
                    <option value="English">English</option>
                    <option value="मराठी">मराठी (Marathi)</option>
                    <option value="हिंदी">हिंदी (Hindi)</option>
                  </select>
                  <Globe className="h-3.5 w-3.5 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* BOTTOM COPYRIGHT & METADATA BAR */}
        <div className="mt-8 pt-6 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span>© 2026 Civic-IQ. All rights reserved.</span>
            <span className="text-slate-300">•</span>
            <span className="font-medium text-slate-600">Built for Smart Cities</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] font-mono">
            <span className="flex items-center gap-1 text-emerald-600 font-medium">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              <span>Municipal Systems Online</span>
            </span>
            <span className="text-slate-300">|</span>
            <span className="text-slate-400">BMC Municipal Gateway</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
