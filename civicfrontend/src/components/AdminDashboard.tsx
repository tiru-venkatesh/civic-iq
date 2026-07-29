/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import InfoTooltip from "./InfoTooltip";
import AnimatedCounter from "./AnimatedCounter";
import {
  MapPin,
  AlertTriangle,
  Users,
  CheckCircle,
  FileText,
  Clock,
  Download,
  Flame,
  Search,
  Filter,
  Layers,
  Sparkles,
  TrendingUp,
  Sliders,
  DollarSign,
  UserCheck,
  ChevronRight,
  Info,
  Layers2,
  Navigation,
  X,
  Globe
} from "lucide-react";
import { Complaint, FieldWorker, SmartCityBudget } from "../types";
import { CityData } from "../data/cityData";
import { SmartMap } from "./maps";
   // leda path ni project structure prakaram adjust chెయ్యి

interface AdminDashboardProps {
  complaints: Complaint[];
  workers: FieldWorker[];
  onAssignWorker: (complaintId: string, workerId: string) => void;
  onUpdateStatus: (complaintId: string, status: "In Progress" | "Resolved", comment: string, photo: string | null) => void;
  cityName?: string;
  selectedCityKey?: string;
  cityData?: CityData;
}

export default function AdminDashboard({
  complaints,
  workers,
  onAssignWorker,
  onUpdateStatus,
  cityName = "Mumbai",
  selectedCityKey = "mumbai",
  cityData,
}: AdminDashboardProps) {
  // Navigation tabs for Admin Workspace
  // "overview" | "reports" | "workers" | "simulator"
  const [adminTab, setAdminTab] = useState<"overview" | "reports" | "workers" | "simulator">("overview");

  // Selected complaint in the list for detail view & explainability drawer
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(complaints[0]?.id || null);

  // Filter criteria states
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [severityFilter, setSeverityFilter] = useState("All");

  // Budget Simulation Multiplier State
  const [budgetMultiplier, setBudgetMultiplier] = useState(1.0); // 1.0x to 2.5x

  // Map layer toggle states
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [showClusters, setShowClusters] = useState(true);
  const [showWorkers, setShowWorkers] = useState(true);
  const [showTraffic, setShowTraffic] = useState(true);
  const [showPriorityZones, setShowPriorityZones] = useState(true);

  // Assignment Modal/State helper
  const [assigningIncidentId, setAssigningIncidentId] = useState<string | null>(null);

  // PDF Download simulation state
  const [downloadingPDF, setDownloadingPDF] = useState(false);

  // Base complaint list (weather monitor removed, so this is just the raw list —
  // kept as its own variable so downstream calculations don't need renaming)
  const adjustedComplaints = complaints;

  // Weather Impact Monitor was removed, so there is no live weather escalation
  // signal anymore. Kept at 0 so any complaint.weatherAdjusted data set upstream
  // (e.g. from the AI analysis pipeline) still renders correctly in the table
  // and detail panel without this dashboard trying to compute its own delta.
  const weatherImpact = 0;

  // Currently selected incident for the Explainable AI side panel
  const selectedIncident = complaints.find((c) => c.id === selectedIncidentId) || null;

  // Filtered + priority-sorted list for the main table
  const filteredComplaints = adjustedComplaints
    .filter((c) => {
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        q === "" ||
        c.title.toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q);
      const matchesCategory = categoryFilter === "All" || c.category === categoryFilter;
      const matchesSeverity = severityFilter === "All" || c.aiAnalysis.severity === severityFilter;
      return matchesSearch && matchesCategory && matchesSeverity;
    })
    .sort((a, b) => b.aiAnalysis.priorityScore - a.aiAnalysis.priorityScore);

  // KPI Calculations
  const totalReports = adjustedComplaints.length;
  const resolvedCount = adjustedComplaints.filter((c) => c.status === "Resolved").length;
  const pendingCount = adjustedComplaints.filter((c) => c.status === "Pending").length;
  const inProgressCount = adjustedComplaints.filter((c) => c.status === "In Progress" || c.status === "Assigned").length;

  const totalAllocatedBudget = 450000;
  const spentBudget = adjustedComplaints.reduce((sum, c) => sum + (c.status === "Resolved" ? c.aiAnalysis.budgetRequired : 0), 0) + 124000;
  const activeBudgetRequired = adjustedComplaints.reduce((sum, c) => sum + (c.status !== "Resolved" ? c.aiAnalysis.budgetRequired : 0), 0);

  // Summary Metrics calculations for Weather Monitor
  const openAdjustedComplaints = adjustedComplaints.filter(c => c.status !== "Resolved");
  const affectedIncidentsCount = weatherImpact > 0 ? openAdjustedComplaints.length : 0;
  const avgPriorityIncrease = weatherImpact;
  
  const highestAdjustedIncidentRaw = weatherImpact > 0 && openAdjustedComplaints.length > 0
    ? [...openAdjustedComplaints].sort((a, b) => b.aiAnalysis.priorityScore - a.aiAnalysis.priorityScore)[0]
    : null;

  const highestAdjustedIncident = highestAdjustedIncidentRaw 
    ? {
        id: highestAdjustedIncidentRaw.id,
        title: highestAdjustedIncidentRaw.title,
        priority: highestAdjustedIncidentRaw.aiAnalysis.priorityScore
      }
    : null;

  // Simulation Calculations based on multiplier slider
  const simulatedSpeedupPercentage = Math.round((budgetMultiplier - 1.0) * 140);
  const simulatedWaitTimeCompression = Math.round((1 - (1 / budgetMultiplier)) * 100);
  const simulatedTechnicianEfficiency = Math.round((budgetMultiplier - 1.0) * 45 + 100);

  const handleDownloadPDF = () => {
    setDownloadingPDF(true);
    setTimeout(() => {
      setDownloadingPDF(false);
      alert("CivicIQ Report PDF compiled. Downloading Official Security Digest.");
    }, 1500);
  };

  return (
    <div className="space-y-6">
      
      {/* Upper Navigation & Tabs */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gov-blue text-white flex items-center justify-center font-bold text-lg shadow-sm">
            {selectedCityKey === "all_india" ? "🇮🇳" : "IQ"}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-display font-bold text-slate-900 leading-none">
                {selectedCityKey === "all_india"
                  ? "All India Overview"
                  : `${cityName} Operations Dashboard`}
              </h1>
              <span className="text-[9px] uppercase font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full inline-block animate-pulse"></span>
                <span>{selectedCityKey === "all_india" ? "National Aggregate Data" : `Live ${cityName} Node`}</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {selectedCityKey === "all_india"
                ? "Aggregated municipal intelligence, complaint totals, and budget metrics across India."
                : `Manage citizen complaints, dispatch field workers, and track ward repairs in ${cityName}.`}
            </p>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg border border-slate-200 self-start xl:self-center font-mono text-xs">
          <button
            onClick={() => setAdminTab("overview")}
            className={`px-4 py-2 rounded-md font-semibold transition-colors ${
              adminTab === "overview" ? "bg-white text-gov-blue shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            1. Active Complaints
          </button>
          <button
            onClick={() => setAdminTab("reports")}
            className={`px-4 py-2 rounded-md font-semibold transition-colors ${
              adminTab === "reports" ? "bg-white text-gov-blue shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            2. Ward Analytics
          </button>
          <button
            onClick={() => setAdminTab("workers")}
            className={`px-4 py-2 rounded-md font-semibold transition-colors ${
              adminTab === "workers" ? "bg-white text-gov-blue shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            3. Field Crew ({workers.length})
          </button>
          <button
            onClick={() => setAdminTab("simulator")}
            className={`px-4 py-2 rounded-md font-semibold transition-colors ${
              adminTab === "simulator" ? "bg-white text-gov-blue shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            4. Budget Simulator
          </button>
        </div>
      </div>

      {/* ADMIN SCREEN: CORE LIVE OPERATIONS OVERVIEW */}
      {adminTab === "overview" && (
        <div className="space-y-6 animate-fade-in">
          
          {/* KPI Dashboard Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <div className="text-slate-500 text-xs font-bold uppercase tracking-wider font-mono flex items-center gap-1.5">
                <span>Total Complaints</span>
                <InfoTooltip text={`Total number of issues reported by citizens in ${selectedCityKey === "all_india" ? "all Indian cities" : cityName}.`} title="Total Complaints" />
              </div>
              <div className="text-3xl font-bold mt-1 text-slate-900 font-mono">
                <AnimatedCounter value={totalReports} />
              </div>
              <div className="text-slate-500 text-[10px] font-bold font-mono mt-2 flex items-center gap-1">
                <FileText className="h-3 w-3 text-gov-blue" />
                All citizen portals linked
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <div className="text-slate-500 text-xs font-bold uppercase tracking-wider font-mono flex items-center gap-1.5">
                <span>Active Pending</span>
                <InfoTooltip text="Reports currently undergoing AI priority calculation or awaiting worker dispatch." title="Active Pending" />
              </div>
              <div className="text-3xl font-bold mt-1 text-slate-900 font-mono">
                <AnimatedCounter value={pendingCount} />
              </div>
              <div className="text-red-600 text-[10px] font-bold font-mono mt-2 flex items-center gap-1">
                <AlertTriangle className="h-3 w-3 animate-pulse" />
                Requires triage
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <div className="text-slate-500 text-xs font-bold uppercase tracking-wider font-mono flex items-center gap-1.5">
                <span>Resolved Total</span>
                <InfoTooltip text="Complaints fixed by field workers with verified photo proof." title="Resolved Complaints" />
              </div>
              <div className="text-3xl font-bold mt-1 text-slate-900 font-mono">
                <AnimatedCounter value={resolvedCount} />
              </div>
              <div className="text-emerald-600 text-[10px] font-bold font-mono mt-2 flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                {totalReports > 0 ? Math.round((resolvedCount / totalReports) * 100) : 0}% clearance rate
              </div>
            </div>

            {/* Solid primary color card as in Geometric Balance theme */}
            <div className="bg-gov-blue p-5 rounded-xl shadow-md text-white border border-gov-blue">
              <div className="opacity-80 text-xs font-bold uppercase tracking-wider font-mono font-semibold flex items-center gap-1.5">
                <span>Allocated Budget</span>
                <InfoTooltip text="Current municipal budget spent on resolved and assigned repair work orders." title="Municipal Budget" />
              </div>
              <div className="text-3xl font-bold mt-1 font-mono">
                <AnimatedCounter prefix="₹" value={spentBudget} />
              </div>
              <div className="text-white/90 text-[10px] font-bold font-mono mt-2 flex items-center gap-1 uppercase tracking-wide">
                <DollarSign className="h-3 w-3" />
                Max limit: ₹{(cityData?.budget?.allocated || 450000).toLocaleString()}
              </div>
            </div>
          </div>
{/* NEW Leaflet-based Smart Map */}
<div className="mt-4">
  <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">New Leaflet Command Map</h4>
  <SmartMap
    complaints={adjustedComplaints.map((c) => ({
      id: c.id,
      title: c.title,
      category: c.category,
      severity: c.aiAnalysis.severity as any,
      priorityScore: c.aiAnalysis.priorityScore,
      latitude: c.latitude,
      longitude: c.longitude,
      address: c.address,
      department: c.aiAnalysis.department || "BMC",
      etaMinutes: null,
      status: c.status,
    }))}
    workers={workers.map((w) => ({
      id: w.id,
      name: w.name,
      role: w.role,
      latitude: w.currentLat,
      longitude: w.currentLng,
      status: w.status as any,
      assignedComplaintId: null,
    }))}
    selectedComplaintId={selectedIncidentId}
    onSelectComplaint={(id) => setSelectedIncidentId(id)}
    heightClass="h-[380px]"
  />
</div>
          
          {/* Table & Detailed Explainability Drawer split layout */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
            
            {/* Table side (7 columns on XL) */}
            <div className="xl:col-span-7 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/70">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4.5 w-4.5 text-gov-blue" />
                  <h3 className="font-display font-semibold text-slate-800 text-sm">AI-Prioritized Resolution Queue</h3>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="p-1.5 bg-white border border-slate-200 rounded-md text-xs font-mono"
                  >
                    <option value="All">All Categories</option>
                    <option value="Pothole & Road Damage">Road Damage</option>
                    <option value="Water Leakage & Flooding">Water Mains</option>
                    <option value="Streetlight Failure">Streetlights</option>
                    <option value="Traffic Light Malfunction">Signals</option>
                    <option value="Waste & Sanitation">Sanitation</option>
                  </select>
                </div>
              </div>

              {/* Table Element */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 font-mono text-slate-600">
                      <th className="p-4 font-semibold">Incident ID</th>
                      <th className="p-4 font-semibold">Primary Title</th>
                      <th className="p-4 font-semibold text-center">Priority</th>
                      <th className="p-4 font-semibold">Status</th>
                      <th className="p-4 font-semibold">Severity</th>
                      <th className="p-4 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono text-slate-700">
                    {filteredComplaints.map((c) => {
                      const isSelected = selectedIncidentId === c.id;
                      let badge = "bg-amber-50 text-amber-700 border-amber-200";
                      if (c.status === "Resolved") badge = "bg-emerald-50 text-emerald-700 border-emerald-200";
                      else if (c.status === "In Progress") badge = "bg-blue-50 text-blue-700 border-blue-200";

                      let severityBadge = "bg-slate-100 text-slate-700";
                      if (c.aiAnalysis.severity === "Critical") severityBadge = "bg-red-100 text-red-700 font-bold";
                      else if (c.aiAnalysis.severity === "High") severityBadge = "bg-orange-100 text-orange-700";

                      return (
                        <tr
                          key={c.id}
                          onClick={() => setSelectedIncidentId(c.id)}
                          className={`hover:bg-slate-50 cursor-pointer transition-colors ${
                            isSelected ? "bg-gov-blue-light/40 font-semibold" : ""
                          }`}
                        >
                          <td className="p-4 font-bold text-slate-900">{c.id}</td>
                          <td className="p-4 font-sans font-medium text-slate-800 truncate max-w-[180px]">
                            {c.title}
                          </td>
                          <td className="p-4 text-center">
                            <div className="flex flex-col items-center justify-center gap-1">
                              <span className="font-bold text-gov-blue bg-gov-blue-light px-2 py-0.5 rounded">
                                {c.aiAnalysis.priorityScore}
                              </span>
                              {c.weatherAdjusted && c.weatherAdjusted.hasChanged && (
                                <span className="text-[8px] text-amber-700 bg-amber-50 border border-amber-200 px-1.5 rounded font-bold uppercase tracking-tight scale-90 whitespace-nowrap">
                                  Weather +{c.weatherAdjusted.impact}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="p-4">
                            <span className={`text-[9px] px-2 py-0.5 border rounded-full uppercase font-bold ${badge}`}>
                              {c.status}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className={`text-[9px] px-2 py-0.5 rounded uppercase font-bold ${severityBadge}`}>
                              {c.aiAnalysis.severity}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setAssigningIncidentId(c.id);
                              }}
                              className="px-2.5 py-1.5 bg-white border border-slate-200 rounded hover:border-gov-blue text-[10px] font-bold text-gov-blue"
                            >
                              Dispatch
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Explainable AI Side Panel (5 columns on XL) */}
            <div className="xl:col-span-5 bg-white border border-slate-200 border-l-4 border-l-gov-blue rounded-xl shadow-sm p-6 space-y-5">
              {selectedIncident ? (
                <>
                  {/* Header Title */}
                  <div className="border-b border-slate-100 pb-4 flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-mono text-slate-400 block uppercase">
                        Ticket Details: {selectedIncident.id}
                      </span>
                      <h4 className="font-display font-semibold text-slate-800 text-sm mt-1">
                        AI Priority Breakdown
                      </h4>
                      <div className="inline-block mt-1.5 bg-gov-blue/10 text-gov-blue px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider italic">
                        AI Insights
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                      <span className="text-xs font-mono font-bold text-gov-blue bg-gov-blue-light px-2.5 py-1 rounded">
                        Score: {selectedIncident.aiAnalysis.priorityScore}/100
                      </span>
                      {selectedIncident.weatherAdjusted && selectedIncident.weatherAdjusted.hasChanged && (
                        <span className="text-[8px] font-mono font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded uppercase tracking-wider animate-pulse whitespace-nowrap">
                          Weather Adjusted (+{selectedIncident.weatherAdjusted.impact})
                        </span>
                      )}
                    </div>
                  </div>

                  
                  {/* Explanations Grid */}
                  <div className="space-y-4 text-xs">
                    <div className="grid grid-cols-2 gap-4 font-mono text-[10px]">
                      <div className="border border-slate-100 p-3 rounded-lg bg-white">
                        <span className="text-slate-400 block uppercase">Severity Level:</span>
                        <span className="text-slate-900 font-bold block mt-1">{selectedIncident.aiAnalysis.severity}</span>
                      </div>
                      <div className="border border-slate-100 p-3 rounded-lg bg-white">
                        <span className="text-slate-400 block uppercase">People Impacted:</span>
                        <span className="text-slate-900 font-bold block mt-1">
                          {selectedIncident.aiAnalysis.populationAffected.toLocaleString()} citizens
                        </span>
                      </div>
                      <div className="border border-slate-100 p-3 rounded-lg bg-white">
                        <span className="text-slate-400 block uppercase">Estimated Budget:</span>
                        <span className="text-slate-900 font-bold block mt-1">
                          ₹{selectedIncident.aiAnalysis.budgetRequired.toLocaleString()}
                        </span>
                      </div>
                      <div className="border border-slate-100 p-3 rounded-lg bg-white">
                        <span className="text-slate-400 block uppercase">AI Accuracy:</span>
                        <span className="text-emerald-600 font-bold block mt-1">
                          {Math.round(selectedIncident.aiAnalysis.confidence * 100)}%
                        </span>
                      </div>
                    </div>

                    {selectedIncident.weatherAdjusted && selectedIncident.weatherAdjusted.hasChanged && (
                      <div className="border border-amber-200 border-l-4 border-l-amber-500 p-4 rounded-lg bg-amber-50/50 space-y-2.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] uppercase font-mono font-bold text-amber-800 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></span>
                            AI Weather Adjustment Active
                          </span>
                          <span className="text-[10px] font-mono font-bold text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded">
                            +{selectedIncident.weatherAdjusted.impact} Priority escalation
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 font-mono text-[9px] text-center bg-white/70 p-3 rounded-md border border-amber-100">
                          <div>
                            <span className="text-slate-400 block">Original</span>
                            <span className="text-slate-700 font-bold text-xs">{selectedIncident.weatherAdjusted.originalPriority}</span>
                          </div>
                          <div className="border-x border-slate-100">
                            <span className="text-slate-400 block">Impact</span>
                            <span className="text-amber-600 font-bold text-xs">+{selectedIncident.weatherAdjusted.impact}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block">Final Score</span>
                            <span className="text-slate-900 font-bold text-xs">{selectedIncident.weatherAdjusted.finalPriority}</span>
                          </div>
                        </div>
                        <p className="text-[10px] text-amber-800 font-sans leading-relaxed italic">
                          "{selectedIncident.weatherAdjusted.reasoning}"
                        </p>
                      </div>
                    )}

                    <div className="border border-slate-100 border-l-4 border-l-gov-blue p-4 rounded-lg bg-slate-50/50 space-y-1.5">
                      <span className="text-[10px] uppercase font-mono font-bold text-gov-blue block">
                        AI Assessment & Reason:
                      </span>
                      <p className="text-xs text-slate-700 font-sans italic leading-relaxed">
                        "{selectedIncident.aiAnalysis.reasoning}"
                      </p>
                    </div>

                    {/* Timeline History Tracker */}
                    <div className="space-y-3 border-t border-slate-100 pt-4">
                      <span className="text-[10px] uppercase font-mono font-bold text-slate-400 block">
                        Ticket Timeline
                      </span>
                      <div className="space-y-4 font-mono text-[10px] text-slate-600 pl-1">
                        {selectedIncident.history.map((h, idx) => (
                          <div key={idx} className="relative pl-5 border-l border-slate-200 pb-2">
                            <span className="absolute -left-1.5 top-1 w-3 h-3 rounded-full bg-slate-300 border-2 border-white inline-block"></span>
                            <div className="flex items-center justify-between text-slate-800 gap-2">
                              <span className="font-bold uppercase text-[9px]">{h.status}</span>
                              <span className="text-[8px] text-slate-400 whitespace-nowrap">{new Date(h.updatedAt).toLocaleTimeString()}</span>
                            </div>
                            <p className="text-[10px] text-slate-500 font-sans mt-1 leading-tight">{h.comment}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Live Assignment Dispatch */}
                    <div className="border-t border-slate-100 pt-4 flex gap-3">
                      <button
                        onClick={() => setAssigningIncidentId(selectedIncident.id)}
                        className="flex-1 py-2.5 bg-gov-blue hover:bg-gov-blue-hover text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                      >
                        <UserCheck className="h-4 w-4" />
                        <span>Reassign Crew</span>
                      </button>
                      <button
                        onClick={() => handleDownloadPDF()}
                        className="py-2.5 px-3 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 text-xs"
                        title="Export Ticket PDF"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-12 text-slate-400 font-sans">
                  <Info className="h-8 w-8 mx-auto text-slate-300 mb-2" />
                  <p className="text-xs">Select an incident from the ranked priority list to load explains.</p>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* ADMIN SCREEN: DETAILED STATS REPORTS & CHARTS */}
      {adminTab === "reports" && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-display font-semibold text-slate-800 text-base">Performance Metrics</h3>
                <p className="text-xs text-slate-500 mt-0.5">Key performance metrics for BMC municipal wards.</p>
              </div>
              <button
                onClick={() => handleDownloadPDF()}
                className="px-4 py-2 bg-gov-blue hover:bg-gov-blue-hover text-white rounded-lg text-xs font-bold font-mono flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                <span>Download PDF Report</span>
              </button>
            </div>

            {/* Custom high-fidelity CSS charts representation */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              
              {/* Performance by Department */}
              <div className="border border-slate-200 rounded-xl p-4 space-y-4 bg-slate-50/50">
                <h4 className="text-xs font-mono font-bold uppercase text-slate-500">Department SLA Performance</h4>
                <div className="space-y-3 font-mono text-[11px] text-slate-600">
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span>Transportation (Road/Pothole)</span>
                      <span className="font-bold">94% (Within 6h Target)</span>
                    </div>
                    <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                      <div className="bg-gov-blue h-full rounded-full" style={{ width: "94%" }}></div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span>Water Resources (Leakage/Flood)</span>
                      <span className="font-bold">89% (Within 8h Target)</span>
                    </div>
                    <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                      <div className="bg-blue-500 h-full rounded-full" style={{ width: "89%" }}></div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span>Public Works (Streetlights)</span>
                      <span className="font-bold">78% (Within 12h Target)</span>
                    </div>
                    <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                      <div className="bg-amber-500 h-full rounded-full" style={{ width: "78%" }}></div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span>Sanitation Services (Hazmat/Trash)</span>
                      <span className="font-bold">96% (Within 3h Target)</span>
                    </div>
                    <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full rounded-full" style={{ width: "96%" }}></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Resolution volume over time (Weekly) */}
              <div className="border border-slate-200 rounded-xl p-4 space-y-4 bg-slate-50/50">
                <h4 className="text-xs font-mono font-bold uppercase text-slate-500">Weekly Incident Intake & Resolution</h4>
                
                {/* Styled Vector Line Chart representation */}
                <div className="h-36 relative flex items-end justify-between font-mono text-[9px] text-slate-400">
                  <div className="absolute inset-0 flex flex-col justify-between pointer-events-none border-b border-slate-200">
                    <div className="border-b border-slate-100 h-0 w-full"></div>
                    <div className="border-b border-slate-100 h-0 w-full"></div>
                    <div className="border-b border-slate-100 h-0 w-full"></div>
                  </div>

                  {/* Draw simple visual bars / heights */}
                  <div className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-8 bg-blue-100 rounded-t h-16 relative">
                      <div className="w-8 bg-gov-blue rounded-t h-12 absolute bottom-0"></div>
                    </div>
                    <span>Mon</span>
                  </div>

                  <div className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-8 bg-blue-100 rounded-t h-20 relative">
                      <div className="w-8 bg-gov-blue rounded-t h-14 absolute bottom-0"></div>
                    </div>
                    <span>Tue</span>
                  </div>

                  <div className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-8 bg-blue-100 rounded-t h-28 relative">
                      <div className="w-8 bg-gov-blue rounded-t h-22 absolute bottom-0"></div>
                    </div>
                    <span>Wed</span>
                  </div>

                  <div className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-8 bg-blue-100 rounded-t h-32 relative">
                      <div className="w-8 bg-gov-blue rounded-t h-26 absolute bottom-0"></div>
                    </div>
                    <span>Thu</span>
                  </div>

                  <div className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-8 bg-blue-100 rounded-t h-24 relative">
                      <div className="w-8 bg-gov-blue rounded-t h-20 absolute bottom-0"></div>
                    </div>
                    <span>Fri</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 justify-center text-[10px] font-mono text-slate-500 pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-1.5 bg-blue-100 rounded"></span>
                    <span>Intake Volume</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-1.5 bg-gov-blue rounded"></span>
                    <span>Resolved Volume</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ADMIN SCREEN: FIELD WORKER MANAGEMENT LIST */}
      {adminTab === "workers" && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <div>
              <h3 className="font-display font-semibold text-slate-800 text-base">Field Crew Roster</h3>
              <p className="text-xs text-slate-500 mt-0.5">Live status and location tracking of assigned field technicians.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {workers.map((w) => {
                let statusColor = "bg-slate-100 text-slate-600 border-slate-200";
                if (w.status === "Available") statusColor = "bg-emerald-50 text-emerald-700 border-emerald-200";
                else if (w.status === "On Mission") statusColor = "bg-blue-50 text-blue-700 border-blue-200";

                const assignedIncident = complaints.find(c => c.assignedWorkerId === w.id && c.status !== "Resolved");

                return (
                  <div key={w.id} className="border border-slate-200 rounded-xl p-4 bg-white hover:border-gov-blue transition-colors flex flex-col justify-between gap-4 shadow-sm">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-full overflow-hidden border border-slate-200 shrink-0">
                          <img src={w.avatar} alt={w.name} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-800 leading-tight">{w.name}</h4>
                          <span className="text-[10px] text-slate-400 font-mono block mt-0.5">{w.role}</span>
                        </div>
                      </div>
                      <span className={`text-[9px] px-2 py-0.5 border rounded-full uppercase font-mono font-bold ${statusColor}`}>
                        {w.status}
                      </span>
                    </div>

                    <div className="text-[10px] font-mono text-slate-600 space-y-1 border-t border-slate-100 pt-3">
                      <div className="flex justify-between">
                        <span>DEPARTMENT:</span>
                        <span className="text-slate-800 font-semibold">{w.department}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>PHONE CONTACT:</span>
                        <span className="text-slate-800">{w.phone}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>LIVE SECTOR:</span>
                        <span className="text-slate-800">{w.currentLat.toFixed(4)}°N, {w.currentLng.toFixed(4)}°W</span>
                      </div>
                    </div>

                    <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-xs">
                      {assignedIncident ? (
                        <div>
                          <span className="text-[9px] uppercase font-mono font-bold text-slate-400 block">Assigned Work Order:</span>
                          <span className="text-slate-800 font-semibold block truncate mt-0.5">{assignedIncident.title}</span>
                          <span className="text-[9px] font-mono text-gov-blue font-bold block uppercase mt-0.5">{assignedIncident.id}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 font-mono text-[10px] uppercase block">No active assignment</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ADMIN SCREEN: "WHAT-IF" SIMULATION PLAYGROUND */}
      {adminTab === "simulator" && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <div>
              <h3 className="font-display font-semibold text-slate-800 text-base">"What-If" Budget & Dispatch Simulator</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Model smart-city resolution performance. Adjust the funding multipliers below to simulate technician compression speeds and predictive SLA compaction.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              
              {/* Slider side (5 cols) */}
              <div className="lg:col-span-5 border border-slate-200 rounded-xl p-5 space-y-4 bg-slate-50/50">
                <div className="flex justify-between font-mono text-xs text-slate-600">
                  <span className="font-bold text-slate-800">EXPAND BUDGET MULTIPLIER:</span>
                  <span className="text-gov-blue font-bold text-sm bg-gov-blue-light px-2.5 py-0.5 rounded">
                    {budgetMultiplier.toFixed(1)}x Funding
                  </span>
                </div>

                {/* Slider input */}
                <input
                  type="range"
                  min="1.0"
                  max="2.5"
                  step="0.1"
                  value={budgetMultiplier}
                  onChange={(e) => setBudgetMultiplier(parseFloat(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-gov-blue"
                />

                <div className="flex justify-between font-mono text-[9px] text-slate-400 uppercase font-bold">
                  <span>Standard ($1.0x)</span>
                  <span>1.7x</span>
                  <span>Max Out ($2.5x)</span>
                </div>

                <div className="text-xs text-slate-500 font-sans leading-relaxed pt-2 border-t border-slate-100">
                  <span className="font-bold text-slate-800 block mb-0.5">Under the hood simulation:</span>
                  Increasing budget allocates auxiliary contractor trucks, activates localized repair crews, and automates micro-routing queues via predictive CivicIQ vectors.
                </div>
              </div>

              {/* Numerical predictive metrics outputs (7 cols) */}
              <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-4">
                
                <div className="border border-slate-200 rounded-xl p-4 bg-white shadow-sm space-y-1">
                  <span className="text-[10px] text-slate-400 block font-mono uppercase">Resolution Speedup</span>
                  <h4 className="text-3xl font-mono font-bold text-emerald-600">+{simulatedSpeedupPercentage}%</h4>
                  <p className="text-[10px] text-slate-500 font-medium">Faster repair completions</p>
                </div>

                <div className="border border-slate-200 rounded-xl p-4 bg-white shadow-sm space-y-1">
                  <span className="text-[10px] text-slate-400 block font-mono uppercase">Wait Time Compression</span>
                  <h4 className="text-3xl font-mono font-bold text-gov-blue">-{simulatedWaitTimeCompression}%</h4>
                  <p className="text-[10px] text-slate-500 font-medium">Reduced citizen SLA delay</p>
                </div>

                <div className="border border-slate-200 rounded-xl p-4 bg-white shadow-sm space-y-1">
                  <span className="text-[10px] text-slate-400 block font-mono uppercase">Dispatched Crew Efficiency</span>
                  <h4 className="text-3xl font-mono font-bold text-indigo-600">{simulatedTechnicianEfficiency}%</h4>
                  <p className="text-[10px] text-slate-500 font-medium">Adaptive route loading index</p>
                </div>

              </div>

            </div>
          </div>
        </div>
      )}

      {/* DISPATCH/ASSIGN WORKER MODAL (Absolute Overlay backdrop) */}
      {assigningIncidentId && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 rounded-xl shadow-2xl p-6 w-full max-w-md space-y-5 animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-mono text-slate-400 block uppercase">Manual override dispatch</span>
                <h4 className="font-display font-semibold text-slate-900 text-sm">Assign Crew: {assigningIncidentId}</h4>
              </div>
              <button
                onClick={() => setAssigningIncidentId(null)}
                className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-1.5 text-xs text-slate-600 leading-relaxed font-sans">
              <p>
                Select an available engineer below. CivicIQ recommends technicians specialized in the matching infrastructure field.
              </p>
            </div>

            {/* Crew options list */}
            <div className="space-y-2 max-h-56 overflow-y-auto">
              {workers.map((w) => (
                <button
                  key={w.id}
                  onClick={() => {
                    onAssignWorker(assigningIncidentId, w.id);
                    setAssigningIncidentId(null); 
                  }}
                  className="w-full text-left p-3 border border-slate-200 rounded-lg hover:border-gov-blue hover:bg-slate-50 transition-all flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2.5">
                    <img src={w.avatar} alt={w.name} className="w-8 h-8 rounded-full object-cover border border-slate-200" />
                    <div className="text-xs">
                      <span className="font-bold text-slate-800 block leading-tight">{w.name}</span>
                      <span className="text-[10px] font-mono text-slate-400">{w.role} ({w.department})</span>
                    </div>
                  </div>
                  <span className={`text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded border ${
                    w.status === "Available" ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-slate-100 text-slate-500 border-slate-200"
                  }`}>
                    {w.status}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
