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
  SlidersHorizontal,
  DollarSign,
  UserCheck,
  ChevronRight,
  Info,
  Layers2,
  Navigation,
  X,
  Globe,
  LayoutDashboard,
  BarChart3,
  HardHat,
  Quote,
  ArrowRight,
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

// ---------------------------------------------------------------------------
// Signature element: a small ring gauge, reused everywhere a score/percentage
// needs to be read at a glance (queue rows, detail header, worker cards, the
// simulator). One visual language instead of badges + boxes + bars scattered
// across four different tabs.
// ---------------------------------------------------------------------------
function GaugeRing({
  value,
  max = 100,
  size = 54,
  stroke = 4,
  suffix = "",
  tone,
}: {
  value: number;
  max?: number;
  size?: number;
  stroke?: number;
  suffix?: string;
  tone?: string;
}) {
  const radius = (size - stroke * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  const offset = circumference - (pct / 100) * circumference;
  const color =
    tone ||
    (pct >= 80 ? "#dc2626" : pct >= 60 ? "#ea580c" : pct >= 35 ? "#2563eb" : "#64748b");

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#e2e8f0" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.5s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-[12px] font-bold font-mono" style={{ color }}>
          {value}
          {suffix}
        </span>
      </div>
    </div>
  );
}

const NAV_ITEMS = [
  { key: "overview" as const, label: "Command", icon: LayoutDashboard },
  { key: "reports" as const, label: "Analytics", icon: BarChart3 },
  { key: "workers" as const, label: "Field Crew", icon: HardHat },
  { key: "simulator" as const, label: "Simulator", icon: SlidersHorizontal },
];

const WEEKLY_INTAKE = [
  { day: "Mon", intake: 42, resolved: 30 },
  { day: "Tue", intake: 51, resolved: 36 },
  { day: "Wed", intake: 68, resolved: 55 },
  { day: "Thu", intake: 77, resolved: 63 },
  { day: "Fri", intake: 58, resolved: 48 },
];

const SLA_RANKING = [
  { dept: "Sanitation Services (Hazmat/Trash)", pct: 96, target: "3h Target" },
  { dept: "Transportation (Road/Pothole)", pct: 94, target: "6h Target" },
  { dept: "Water Resources (Leakage/Flood)", pct: 89, target: "8h Target" },
  { dept: "Public Works (Streetlights)", pct: 78, target: "12h Target" },
];

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

  // Assignment slide-over state
  const [assigningIncidentId, setAssigningIncidentId] = useState<string | null>(null);

  // PDF Download simulation state
  const [downloadingPDF, setDownloadingPDF] = useState(false);

  // Real, editable budget pool. This is no longer a read-only reference figure —
  // admin sets the total, and every dispatch actually draws down against it.
  const [totalBudget, setTotalBudget] = useState<number>(cityData?.budget?.allocated || 450000);
  const [editingBudget, setEditingBudget] = useState(false);
  const [budgetDraft, setBudgetDraft] = useState("");
  // If a dispatch would exceed the remaining pool, we hold it here and ask the
  // admin to explicitly confirm the overrun before it goes through.
  const [pendingOverBudgetWorkerId, setPendingOverBudgetWorkerId] = useState<string | null>(null);

  // Admin-entered budget per ticket. The AI figure (complaint.aiAnalysis.budgetRequired)
  // is shown only as a reference — this map holds what the admin actually typed in
  // and chose to allocate, and that's what the pool math uses once it's set.
  const [customBudgetAllocations, setCustomBudgetAllocations] = useState<Record<string, number>>({});
  const [allocationDraft, setAllocationDraft] = useState("");

  // Base complaint list (weather monitor removed, so this is just the raw list —
  // kept as its own variable so downstream calculations don't need renaming)
  const adjustedComplaints = complaints;

  // Weather Impact Monitor was removed, so there is no live weather escalation
  // signal anymore. Kept at 0 so any complaint.weatherAdjusted data set upstream
  // still renders correctly in the row and detail panel without this dashboard
  // trying to compute its own delta.
  const weatherImpact = 0;

  // Currently selected incident for the Explainable AI side panel
  const selectedIncident = complaints.find((c) => c.id === selectedIncidentId) || null;

  // The number actually used for money: admin's own allocation if they've set
  // one for this ticket, otherwise falls back to the AI-suggested figure.
  const getAllocatedBudget = (c: Complaint) => customBudgetAllocations[c.id] ?? c.aiAnalysis.budgetRequired;

  // Filtered + priority-sorted list for the queue
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
  const assignedCount = adjustedComplaints.filter((c) => c.status === "Assigned").length;
  const inProgressCount = adjustedComplaints.filter((c) => c.status === "In Progress").length;

  const spentBudget =
    adjustedComplaints.reduce((sum, c) => sum + (c.status === "Resolved" ? getAllocatedBudget(c) : 0), 0) + 124000;
  // Money already committed to open work orders — i.e. handed to a crew but not
  // yet closed out. This used to be computed and thrown away; now it's the
  // "Committed" slice of the budget pool that admins actually see and manage.
  const activeBudgetRequired = adjustedComplaints.reduce(
    (sum, c) => sum + (c.status !== "Resolved" ? getAllocatedBudget(c) : 0),
    0
  );
  const remainingBudget = totalBudget - spentBudget - activeBudgetRequired;

  // Budget currently riding on each crew member's open work order(s), so the
  // roster shows real money-in-the-field per technician, not just a status pill.
  const workerCommittedBudget = workers.reduce<Record<string, number>>((acc, w) => {
    acc[w.id] = adjustedComplaints
      .filter((c) => c.assignedWorkerId === w.id && c.status !== "Resolved")
      .reduce((sum, c) => sum + getAllocatedBudget(c), 0);
    return acc;
  }, {});

  const openAdjustedComplaints = adjustedComplaints.filter((c) => c.status !== "Resolved");
  const affectedIncidentsCount = weatherImpact > 0 ? openAdjustedComplaints.length : 0;
  const avgPriorityIncrease = weatherImpact;

  const highestAdjustedIncidentRaw =
    weatherImpact > 0 && openAdjustedComplaints.length > 0
      ? [...openAdjustedComplaints].sort((a, b) => b.aiAnalysis.priorityScore - a.aiAnalysis.priorityScore)[0]
      : null;

  const highestAdjustedIncident = highestAdjustedIncidentRaw
    ? {
        id: highestAdjustedIncidentRaw.id,
        title: highestAdjustedIncidentRaw.title,
        priority: highestAdjustedIncidentRaw.aiAnalysis.priorityScore,
      }
    : null;

  // Simulation Calculations based on multiplier slider
  const simulatedSpeedupPercentage = Math.round((budgetMultiplier - 1.0) * 140);
  const simulatedWaitTimeCompression = Math.round((1 - 1 / budgetMultiplier) * 100);
  const simulatedTechnicianEfficiency = Math.round((budgetMultiplier - 1.0) * 45 + 100);

  const handleDownloadPDF = () => {
    setDownloadingPDF(true);
    setTimeout(() => {
      setDownloadingPDF(false);
      alert("CivicIQ Report PDF compiled. Downloading Official Security Digest.");
    }, 1500);
  };

  const assigningIncident = assigningIncidentId
    ? complaints.find((c) => c.id === assigningIncidentId) || null
    : null;
  const aiSuggestedCost = assigningIncident?.aiAnalysis.budgetRequired || 0;
  // What the admin actually typed into the allocation field — this is the number
  // that gets committed, not the AI figure above (that stays a reference only).
  const assigningCost = (() => {
    const parsed = parseInt(allocationDraft, 10);
    return isNaN(parsed) || parsed < 0 ? 0 : parsed;
  })();
  const remainingAfterDispatch = remainingBudget - assigningCost;

  // Opens the dispatch panel for a ticket and seeds the allocation field with
  // whatever the admin already set for it, or the AI suggestion as a starting point.
  const openDispatch = (id: string) => {
    setAssigningIncidentId(id);
    const c = complaints.find((x) => x.id === id);
    setAllocationDraft(String(customBudgetAllocations[id] ?? c?.aiAnalysis.budgetRequired ?? 0));
  };

  // Runs when the admin taps a crew member in the dispatch panel. If the pool
  // can't cover the admin's own allocated amount, this stops short and asks for
  // an explicit override instead of silently overspending.
  const handleAssignClick = (workerId: string) => {
    if (!assigningIncidentId) return;
    if (assigningCost > remainingBudget) {
      setPendingOverBudgetWorkerId(workerId);
      return;
    }
    setCustomBudgetAllocations((prev) => ({ ...prev, [assigningIncidentId]: assigningCost }));
    onAssignWorker(assigningIncidentId, workerId);
    setAssigningIncidentId(null);
  };

  const confirmOverBudgetAssign = () => {
    if (!assigningIncidentId || !pendingOverBudgetWorkerId) return;
    setCustomBudgetAllocations((prev) => ({ ...prev, [assigningIncidentId]: assigningCost }));
    onAssignWorker(assigningIncidentId, pendingOverBudgetWorkerId);
    setPendingOverBudgetWorkerId(null);
    setAssigningIncidentId(null);
  };

  const maxWeekly = Math.max(...WEEKLY_INTAKE.map((d) => d.intake));

  return (
    <div className="grid grid-cols-1 md:grid-cols-[76px_1fr] gap-5 items-start">
      {/* -------------------------------------------------------------- */}
      {/* LEFT RAIL — persistent icon navigation replaces the top tab bar */}
      {/* -------------------------------------------------------------- */}
      <nav className="hidden md:flex flex-col items-center gap-1 bg-slate-900 rounded-2xl border border-slate-800 py-4 sticky top-4 self-start">
        <div className="w-9 h-9 rounded-lg bg-white/10 text-white flex items-center justify-center font-bold text-xs mb-3">
          {selectedCityKey === "all_india" ? "IN" : "IQ"}
        </div>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = adminTab === item.key;
          return (
            <button
              key={item.key}
              onClick={() => setAdminTab(item.key)}
              title={item.label}
              className={`w-14 py-2.5 flex flex-col items-center gap-1 rounded-xl transition-colors relative ${
                active ? "bg-white text-gov-blue" : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Icon className="h-4.5 w-4.5" />
              <span className="text-[8px] font-mono font-bold uppercase tracking-tight leading-none">
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Mobile fallback: horizontal scroll strip instead of the rail */}
      <div className="md:hidden flex items-center gap-1.5 bg-slate-900 p-1.5 rounded-xl overflow-x-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = adminTab === item.key;
          return (
            <button
              key={item.key}
              onClick={() => setAdminTab(item.key)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-[10px] font-mono font-bold uppercase shrink-0 ${
                active ? "bg-white text-gov-blue" : "text-slate-400"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {item.label}
            </button>
          );
        })}
      </div>

      {/* -------------------------------------------------------------- */}
      {/* MAIN COLUMN */}
      {/* -------------------------------------------------------------- */}
      <div className="space-y-5 min-w-0">
        {/* Slim header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-display font-bold text-slate-900 leading-none">
                {selectedCityKey === "all_india" ? "All India Overview" : `${cityName} Operations`}
              </h1>
              <span className="text-[9px] uppercase font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full inline-block animate-pulse"></span>
                <span>{selectedCityKey === "all_india" ? "National Aggregate" : "Live Node"}</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {selectedCityKey === "all_india"
                ? "Aggregated municipal intelligence, complaint totals, and budget metrics across India."
                : `Manage citizen complaints, dispatch field workers, and track ward repairs in ${cityName}.`}
            </p>
          </div>
        </div>

        {/* KPI ticker — one continuous strip instead of a card grid */}
        {adminTab === "overview" && (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-wrap divide-x divide-slate-100">
            {[
              { label: "Total Complaints", value: totalReports, tooltip: `Total number of issues reported by citizens in ${selectedCityKey === "all_india" ? "all Indian cities" : cityName}.`, note: "All portals linked", noteColor: "text-slate-500" },
              { label: "Active Pending", value: pendingCount, tooltip: "Reports currently undergoing AI priority calculation or awaiting worker dispatch.", note: "Requires triage", noteColor: "text-red-600" },
              { label: "Dispatched", value: assignedCount, tooltip: "Work orders sent to a field worker who has not yet accepted the job.", note: "Awaiting acceptance", noteColor: "text-indigo-600" },
              { label: "Resolved Total", value: resolvedCount, tooltip: "Complaints fixed by field workers with verified photo proof.", note: `${totalReports > 0 ? Math.round((resolvedCount / totalReports) * 100) : 0}% clearance`, noteColor: "text-emerald-600" },
            ].map((k) => (
              <div key={k.label} className="flex-1 min-w-[150px] p-4">
                <div className="text-slate-500 text-[10px] font-bold uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <span>{k.label}</span>
                  <InfoTooltip text={k.tooltip} title={k.label} />
                </div>
                <div className="text-2xl font-bold mt-1 text-slate-900 font-mono">
                  <AnimatedCounter value={k.value} />
                </div>
                <div className={`text-[10px] font-bold font-mono mt-1 ${k.noteColor}`}>{k.note}</div>
              </div>
            ))}
            <div className="flex-1 min-w-[220px] p-4 bg-gov-blue rounded-r-2xl text-white">
              <div className="flex items-center justify-between gap-2">
                <div className="opacity-80 text-[10px] font-bold uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <span>Budget Pool</span>
                  <InfoTooltip text="The real municipal pool. Admin sets the total; every dispatch draws down against it." title="Budget Pool" />
                </div>
                {!editingBudget && (
                  <button
                    onClick={() => {
                      setBudgetDraft(String(totalBudget));
                      setEditingBudget(true);
                    }}
                    className="text-[9px] font-mono font-bold uppercase bg-white/15 hover:bg-white/25 px-2 py-0.5 rounded"
                  >
                    Edit
                  </button>
                )}
              </div>

              {editingBudget ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const parsed = parseInt(budgetDraft, 10);
                    if (!isNaN(parsed) && parsed >= 0) setTotalBudget(parsed);
                    setEditingBudget(false);
                  }}
                  className="mt-1.5 flex items-center gap-1.5"
                >
                  <span className="font-mono text-sm">₹</span>
                  <input
                    autoFocus
                    value={budgetDraft}
                    onChange={(e) => setBudgetDraft(e.target.value.replace(/[^0-9]/g, ""))}
                    className="w-28 bg-white/15 border border-white/30 rounded px-2 py-1 text-sm font-mono font-bold text-white placeholder-white/50 outline-none"
                  />
                  <button type="submit" className="text-[9px] font-mono font-bold uppercase bg-white text-gov-blue px-2 py-1 rounded">
                    Save
                  </button>
                </form>
              ) : (
                <div className="text-2xl font-bold mt-1 font-mono">
                  <AnimatedCounter prefix="₹" value={totalBudget} />
                </div>
              )}

              {/* Spent / Committed / Available breakdown, stacked */}
              <div className="w-full h-1.5 rounded-full bg-white/15 overflow-hidden flex mt-2.5">
                <div className="h-full bg-white/90" style={{ width: `${Math.min(100, (spentBudget / totalBudget) * 100)}%` }}></div>
                <div className="h-full bg-amber-300" style={{ width: `${Math.min(100, (activeBudgetRequired / totalBudget) * 100)}%` }}></div>
              </div>
              <div className="flex items-center justify-between text-[9px] font-mono mt-1.5 text-white/85">
                <span>Spent ₹{spentBudget.toLocaleString()}</span>
                <span>Committed ₹{activeBudgetRequired.toLocaleString()}</span>
                <span className={remainingBudget < 0 ? "text-red-200 font-bold" : ""}>
                  {remainingBudget < 0 ? "Over by" : "Available"} ₹{Math.abs(remainingBudget).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ============================= OVERVIEW ============================= */}
        {adminTab === "overview" && (
          <div className="space-y-5 animate-fade-in">
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4">
              <h4 className="text-xs font-bold text-slate-500 uppercase mb-2 flex items-center gap-1.5">
                <Navigation className="h-3.5 w-3.5" /> Live Operations Map
              </h4>
              <SmartMap
                key={selectedCityKey}
                center={
                  cityData
                    ? [cityData.centerLat, cityData.centerLng]
                    : undefined
                }
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
                heightClass="h-[340px]"
              />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
              {/* QUEUE — a scannable row list instead of a <table> */}
              <div className="xl:col-span-7 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/70">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-gov-blue" />
                    <h3 className="font-display font-semibold text-slate-800 text-sm">Resolution Queue</h3>
                    <span className="text-[10px] font-mono text-slate-400">{filteredComplaints.length} incidents</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="h-3.5 w-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                      <input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search ID or title"
                        className="pl-8 pr-2 py-1.5 bg-white border border-slate-200 rounded-md text-xs font-mono w-40"
                      />
                    </div>
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

                <div className="divide-y divide-slate-100 max-h-[560px] overflow-y-auto">
                  {filteredComplaints.map((c) => {
                    const isSelected = selectedIncidentId === c.id;
                    let badge = "bg-amber-50 text-amber-700 border-amber-200";
                    if (c.status === "Resolved") badge = "bg-emerald-50 text-emerald-700 border-emerald-200";
                    else if (c.status === "In Progress") badge = "bg-blue-50 text-blue-700 border-blue-200";
                    else if (c.status === "Assigned") badge = "bg-indigo-50 text-indigo-700 border-indigo-200";

                    let severityBadge = "bg-slate-100 text-slate-700";
                    if (c.aiAnalysis.severity === "Critical") severityBadge = "bg-red-100 text-red-700 font-bold";
                    else if (c.aiAnalysis.severity === "High") severityBadge = "bg-orange-100 text-orange-700";

                    return (
                      <div
                        key={c.id}
                        onClick={() => setSelectedIncidentId(c.id)}
                        className={`flex items-center gap-3 p-3.5 cursor-pointer transition-colors border-l-4 ${
                          isSelected ? "bg-gov-blue-light/40 border-l-gov-blue" : "border-l-transparent hover:bg-slate-50"
                        }`}
                      >
                        <GaugeRing value={c.aiAnalysis.priorityScore} size={44} stroke={3.5} />

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-[11px] text-slate-900">{c.id}</span>
                            {c.weatherAdjusted && c.weatherAdjusted.hasChanged && (
                              <span className="text-[8px] text-amber-700 bg-amber-50 border border-amber-200 px-1.5 rounded font-bold uppercase">
                                Weather +{c.weatherAdjusted.impact}
                              </span>
                            )}
                          </div>
                          <p className="font-sans font-medium text-slate-800 text-xs truncate">{c.title}</p>
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className={`text-[8px] px-1.5 py-0.5 border rounded-full uppercase font-bold ${badge}`}>
                              {c.status}
                            </span>
                            <span className={`text-[8px] px-1.5 py-0.5 rounded uppercase font-bold ${severityBadge}`}>
                              {c.aiAnalysis.severity}
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openDispatch(c.id);
                          }}
                          className="shrink-0 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg hover:border-gov-blue text-[10px] font-bold text-gov-blue flex items-center gap-1"
                        >
                          Dispatch <ArrowRight className="h-3 w-3" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* DETAIL PANEL — restructured with a horizontal stepper timeline */}
              <div className="xl:col-span-5 bg-white border border-slate-200 border-t-4 border-t-gov-blue rounded-2xl shadow-sm p-6 space-y-5">
                {selectedIncident ? (
                  <>
                    <div className="flex items-start gap-4 pb-4 border-b border-slate-100">
                      <GaugeRing value={selectedIncident.aiAnalysis.priorityScore} size={64} stroke={5} />
                      <div className="min-w-0 flex-1">
                        <span className="text-[10px] font-mono text-slate-400 block uppercase">
                          Ticket {selectedIncident.id}
                        </span>
                        <h4 className="font-display font-semibold text-slate-800 text-sm mt-0.5 truncate">
                          {selectedIncident.title}
                        </h4>
                        <div className="inline-flex items-center gap-1 mt-1.5 bg-gov-blue/10 text-gov-blue px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider">
                          <Sparkles className="h-2.5 w-2.5" /> AI Priority Breakdown
                        </div>
                        {selectedIncident.weatherAdjusted && selectedIncident.weatherAdjusted.hasChanged && (
                          <span className="block mt-1.5 text-[8px] font-mono font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded uppercase w-fit">
                            Weather Adjusted (+{selectedIncident.weatherAdjusted.impact})
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Stat rows instead of a boxed 2x2 grid */}
                    <div className="grid grid-cols-2 gap-x-4 gap-y-3 font-mono text-[10px]">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-3.5 w-3.5 text-slate-300 shrink-0" />
                        <div>
                          <span className="text-slate-400 block uppercase leading-none">Severity</span>
                          <span className="text-slate-900 font-bold">{selectedIncident.aiAnalysis.severity}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-3.5 w-3.5 text-slate-300 shrink-0" />
                        <div>
                          <span className="text-slate-400 block uppercase leading-none">Impacted</span>
                          <span className="text-slate-900 font-bold">
                            {selectedIncident.aiAnalysis.populationAffected.toLocaleString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-3.5 w-3.5 text-slate-300 shrink-0" />
                        <div>
                          <span className="text-slate-400 block uppercase leading-none">Allocated Budget</span>
                          <span className="text-slate-900 font-bold">
                            ₹{getAllocatedBudget(selectedIncident).toLocaleString()}
                          </span>
                          {customBudgetAllocations[selectedIncident.id] !== undefined &&
                            customBudgetAllocations[selectedIncident.id] !== selectedIncident.aiAnalysis.budgetRequired && (
                              <span className="text-slate-400 block text-[9px] normal-case">
                                AI suggested ₹{selectedIncident.aiAnalysis.budgetRequired.toLocaleString()}
                              </span>
                            )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-3.5 w-3.5 text-slate-300 shrink-0" />
                        <div>
                          <span className="text-slate-400 block uppercase leading-none">AI Accuracy</span>
                          <span className="text-emerald-600 font-bold">
                            {Math.round(selectedIncident.aiAnalysis.confidence * 100)}%
                          </span>
                        </div>
                      </div>
                    </div>

                    {selectedIncident.weatherAdjusted && selectedIncident.weatherAdjusted.hasChanged && (
                      <div className="border border-amber-200 border-l-4 border-l-amber-500 p-4 rounded-lg bg-amber-50/50 space-y-2.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] uppercase font-mono font-bold text-amber-800 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></span>
                            Weather Adjustment Active
                          </span>
                          <span className="text-[10px] font-mono font-bold text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded">
                            +{selectedIncident.weatherAdjusted.impact}
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
                            <span className="text-slate-400 block">Final</span>
                            <span className="text-slate-900 font-bold text-xs">{selectedIncident.weatherAdjusted.finalPriority}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2.5 bg-slate-50/50 border border-slate-100 rounded-lg p-3.5">
                      <Quote className="h-3.5 w-3.5 text-gov-blue shrink-0 mt-0.5" />
                      <p className="text-xs text-slate-700 font-sans leading-relaxed">
                        {selectedIncident.aiAnalysis.reasoning}
                      </p>
                    </div>

                    {/* Horizontal stepper — a different shape than a vertical dotted list */}
                    <div className="space-y-2.5 border-t border-slate-100 pt-4">
                      <span className="text-[10px] uppercase font-mono font-bold text-slate-400 block">
                        Ticket Timeline
                      </span>
                      <div className="flex items-start gap-0 overflow-x-auto pb-1">
                        {selectedIncident.history.map((h, idx) => (
                          <div key={idx} className="flex items-start shrink-0">
                            <div className="flex flex-col items-center w-24">
                              <span className="w-2.5 h-2.5 rounded-full bg-gov-blue border-2 border-white ring-2 ring-gov-blue-light"></span>
                              <span className="text-[8px] font-mono font-bold uppercase text-slate-800 mt-1.5 text-center leading-tight">
                                {h.status}
                              </span>
                              <span className="text-[7px] text-slate-400 font-mono">
                                {new Date(h.updatedAt).toLocaleTimeString()}
                              </span>
                              <p className="text-[8px] text-slate-500 font-sans mt-0.5 text-center leading-tight px-1">
                                {h.comment}
                              </p>
                            </div>
                            {idx < selectedIncident.history.length - 1 && (
                              <div className="w-6 h-px bg-slate-200 mt-1.5"></div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="border-t border-slate-100 pt-4 flex gap-3">
                      <button
                        onClick={() => openDispatch(selectedIncident.id)}
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
                  </>
                ) : (
                  <div className="text-center py-12 text-slate-400 font-sans">
                    <Info className="h-8 w-8 mx-auto text-slate-300 mb-2" />
                    <p className="text-xs">Select an incident from the queue to load its breakdown.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ============================= ANALYTICS ============================= */}
        {adminTab === "reports" && (
          <div className="space-y-5 animate-fade-in">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-5">
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

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* SLA ranking — order is meaningful here, so a rank column earns its place */}
                <div className="border border-slate-200 rounded-2xl p-4 space-y-1 bg-slate-50/50">
                  <h4 className="text-xs font-mono font-bold uppercase text-slate-500 mb-2">
                    Department SLA — Ranked
                  </h4>
                  {[...SLA_RANKING]
                    .sort((a, b) => b.pct - a.pct)
                    .map((d, idx) => (
                      <div key={d.dept} className="flex items-center gap-3 py-2.5 border-t border-slate-100 first:border-t-0">
                        <span className="w-5 h-5 rounded-full bg-white border border-slate-200 text-[9px] font-mono font-bold text-slate-500 flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between text-[10px] font-mono text-slate-600 mb-1">
                            <span className="truncate">{d.dept}</span>
                            <span className="font-bold text-slate-800 shrink-0 ml-2">{d.pct}%</span>
                          </div>
                          <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                d.pct >= 90 ? "bg-emerald-500" : d.pct >= 80 ? "bg-gov-blue" : "bg-amber-500"
                              }`}
                              style={{ width: `${d.pct}%` }}
                            ></div>
                          </div>
                          <span className="text-[8px] text-slate-400 font-mono">{d.target}</span>
                        </div>
                      </div>
                    ))}
                </div>

                {/* Weekly intake — computed bar chart instead of hard-coded div heights */}
                <div className="border border-slate-200 rounded-2xl p-4 space-y-4 bg-slate-50/50">
                  <h4 className="text-xs font-mono font-bold uppercase text-slate-500">
                    Weekly Incident Intake &amp; Resolution
                  </h4>
                  <div className="h-36 flex items-end justify-between gap-3 border-b border-slate-200">
                    {WEEKLY_INTAKE.map((d) => (
                      <div key={d.day} className="flex-1 flex flex-col items-center gap-1.5">
                        <div className="w-full flex items-end justify-center gap-1 h-28">
                          <div
                            className="w-3 bg-blue-100 rounded-t"
                            style={{ height: `${(d.intake / maxWeekly) * 100}%` }}
                            title={`Intake: ${d.intake}`}
                          ></div>
                          <div
                            className="w-3 bg-gov-blue rounded-t"
                            style={{ height: `${(d.resolved / maxWeekly) * 100}%` }}
                            title={`Resolved: ${d.resolved}`}
                          ></div>
                        </div>
                        <span className="text-[9px] font-mono text-slate-400">{d.day}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-3 justify-center text-[10px] font-mono text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-1.5 bg-blue-100 rounded"></span>
                      <span>Intake</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-1.5 bg-gov-blue rounded"></span>
                      <span>Resolved</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================= FIELD CREW ============================= */}
        {adminTab === "workers" && (
          <div className="space-y-5 animate-fade-in">
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-100">
                <h3 className="font-display font-semibold text-slate-800 text-base">Field Crew Roster</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Live status and location tracking of assigned field technicians.
                </p>
              </div>

              {/* Row list instead of a card grid */}
              <div className="divide-y divide-slate-100">
                {workers.map((w) => {
                  let statusColor = "bg-slate-100 text-slate-600 border-slate-200";
                  if (w.status === "Available") statusColor = "bg-emerald-50 text-emerald-700 border-emerald-200";
                  else if (w.status === "On Mission") statusColor = "bg-blue-50 text-blue-700 border-blue-200";

                  const assignedIncident = complaints.find((c) => c.assignedWorkerId === w.id && c.status !== "Resolved");

                  return (
                    <div key={w.id} className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 hover:bg-slate-50/70 transition-colors">
                      <div className="flex items-center gap-3 sm:w-56 shrink-0">
                        <img src={w.avatar} alt={w.name} className="w-11 h-11 rounded-full object-cover border border-slate-200 shrink-0" />
                        <div className="min-w-0">
                          <h4 className="text-sm font-bold text-slate-800 leading-tight truncate">{w.name}</h4>
                          <span className="text-[10px] text-slate-400 font-mono block">{w.role} · {w.department}</span>
                        </div>
                      </div>

                      <div className="flex-1 grid grid-cols-2 gap-2 font-mono text-[10px] text-slate-600 sm:max-w-xs">
                        <div>
                          <span className="text-slate-400 block uppercase leading-none">Contact</span>
                          <span className="text-slate-800">{w.phone}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block uppercase leading-none">Sector</span>
                          <span className="text-slate-800">{w.currentLat.toFixed(3)}°, {w.currentLng.toFixed(3)}°</span>
                        </div>
                      </div>

                      <div className="flex-1 flex items-center gap-3">
                        <span className={`text-[9px] px-2 py-0.5 border rounded-full uppercase font-mono font-bold shrink-0 ${statusColor}`}>
                          {w.status}
                        </span>
                        {assignedIncident ? (
                          <div className="min-w-0 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs flex-1 flex items-center justify-between gap-2">
                            <div className="min-w-0">
                              <span className="text-slate-800 font-semibold block truncate">{assignedIncident.title}</span>
                              <span className="text-[9px] font-mono text-gov-blue font-bold uppercase">{assignedIncident.id}</span>
                            </div>
                            <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded shrink-0">
                              ₹{(workerCommittedBudget[w.id] || 0).toLocaleString()}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400 font-mono text-[10px] uppercase">No active assignment</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ============================= SIMULATOR ============================= */}
        {adminTab === "simulator" && (
          <div className="space-y-5 animate-fade-in">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
              <div>
                <h3 className="font-display font-semibold text-slate-800 text-base">"What-If" Budget &amp; Dispatch Simulator</h3>
                <p className="text-xs text-slate-500 mt-0.5 max-w-2xl">
                  Model smart-city resolution performance. Adjust the funding multiplier to simulate technician
                  compression speeds and predictive SLA compaction.
                </p>
              </div>

              <div className="flex items-center justify-between font-mono text-xs text-slate-600">
                <span className="font-bold text-slate-800">EXPAND BUDGET MULTIPLIER</span>
                <span className="text-gov-blue font-bold text-sm bg-gov-blue-light px-2.5 py-0.5 rounded">
                  {budgetMultiplier.toFixed(1)}x Funding
                </span>
              </div>
              <input
                type="range"
                min="1.0"
                max="2.5"
                step="0.1"
                value={budgetMultiplier}
                onChange={(e) => setBudgetMultiplier(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-gov-blue"
              />
              <div className="flex justify-between font-mono text-[9px] text-slate-400 uppercase font-bold -mt-3">
                <span>Standard (1.0x)</span>
                <span>1.7x</span>
                <span>Max Out (2.5x)</span>
              </div>

              {/* Outputs as a gauge row — same ring language as the queue, tying the tab to the rest of the app */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-100">
                <div className="flex items-center gap-3 border border-slate-200 rounded-2xl p-4 bg-white shadow-sm">
                  <GaugeRing value={Math.max(0, simulatedSpeedupPercentage)} max={210} size={56} tone="#059669" suffix="%" />
                  <div>
                    <span className="text-[10px] text-slate-400 block font-mono uppercase">Resolution Speedup</span>
                    <p className="text-[10px] text-slate-500 font-medium">Faster repair completions</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 border border-slate-200 rounded-2xl p-4 bg-white shadow-sm">
                  <GaugeRing value={Math.max(0, simulatedWaitTimeCompression)} max={100} size={56} tone="#2563eb" suffix="%" />
                  <div>
                    <span className="text-[10px] text-slate-400 block font-mono uppercase">Wait Compression</span>
                    <p className="text-[10px] text-slate-500 font-medium">Reduced citizen SLA delay</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 border border-slate-200 rounded-2xl p-4 bg-white shadow-sm">
                  <GaugeRing value={Math.min(200, simulatedTechnicianEfficiency)} max={200} size={56} tone="#4f46e5" suffix="%" />
                  <div>
                    <span className="text-[10px] text-slate-400 block font-mono uppercase">Crew Efficiency</span>
                    <p className="text-[10px] text-slate-500 font-medium">Adaptive route loading index</p>
                  </div>
                </div>
              </div>

              <div className="text-xs text-slate-500 font-sans leading-relaxed pt-3 border-t border-slate-100">
                <span className="font-bold text-slate-800 block mb-0.5">Under the hood:</span>
                Increasing budget allocates auxiliary contractor trucks, activates localized repair crews, and
                automates micro-routing queues via predictive CivicIQ vectors.
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ---------------------------------------------------------------- */}
      {/* DISPATCH SLIDE-OVER — replaces the centered modal with a side panel */}
      {/* ---------------------------------------------------------------- */}
      {assigningIncidentId && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
            onClick={() => setAssigningIncidentId(null)}
          ></div>
          <div className="absolute inset-y-0 right-0 w-full max-w-sm bg-white shadow-2xl flex flex-col animate-fade-in">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-slate-400 block uppercase">Manual override dispatch</span>
                <h4 className="font-display font-semibold text-slate-900 text-sm">Assign Crew: {assigningIncidentId}</h4>
                {assigningIncident && (
                  <p className="text-[11px] text-slate-500 mt-1 truncate">{assigningIncident.title}</p>
                )}
              </div>
              <button
                onClick={() => setAssigningIncidentId(null)}
                className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700 shrink-0"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Budget allocation — AI figure is shown only as a reference; the admin
                types the real number that gets committed to this job. */}
            <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/70 space-y-3">
              <div className="flex items-center justify-between text-[10px] font-mono">
                <span className="text-slate-400 uppercase flex items-center gap-1">
                  <Sparkles className="h-3 w-3" /> AI Required Budget (reference)
                </span>
                <span className="font-bold text-slate-500">₹{aiSuggestedCost.toLocaleString()}</span>
              </div>

              <div>
                <label className="text-[10px] font-mono font-bold uppercase text-slate-600 block mb-1">
                  Your allocated budget
                </label>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-sm text-slate-500">₹</span>
                  <input
                    value={allocationDraft}
                    onChange={(e) => setAllocationDraft(e.target.value.replace(/[^0-9]/g, ""))}
                    placeholder="Enter amount"
                    className="flex-1 bg-white border border-slate-300 rounded-md px-2.5 py-1.5 text-sm font-mono font-bold text-slate-900 outline-none focus:border-gov-blue"
                  />
                  <button
                    type="button"
                    onClick={() => setAllocationDraft(String(aiSuggestedCost))}
                    className="text-[9px] font-mono font-bold uppercase text-gov-blue bg-gov-blue-light px-2 py-1.5 rounded shrink-0"
                  >
                    Use AI figure
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs font-mono pt-1.5 border-t border-slate-200">
                <span className="text-slate-500">Pool available now</span>
                <span className="font-bold text-slate-800">₹{Math.max(0, remainingBudget).toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-500">Remaining after dispatch</span>
                <span className={`font-bold ${remainingAfterDispatch < 0 ? "text-red-600" : "text-emerald-600"}`}>
                  ₹{remainingAfterDispatch.toLocaleString()}
                </span>
              </div>
              {remainingAfterDispatch < 0 && (
                <p className="text-[10px] text-red-600 font-sans">
                  This exceeds the remaining pool. You'll be asked to confirm the overrun.
                </p>
              )}
            </div>

            <div className="px-5 pt-3 text-xs text-slate-600 leading-relaxed font-sans">
              Select an available engineer below. CivicIQ recommends technicians specialized in the matching
              infrastructure field.
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-2">
              {workers.map((w) => (
                <button
                  key={w.id}
                  onClick={() => handleAssignClick(w.id)}
                  className="w-full text-left p-3 border border-slate-200 rounded-xl hover:border-gov-blue hover:bg-slate-50 transition-all flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img src={w.avatar} alt={w.name} className="w-9 h-9 rounded-full object-cover border border-slate-200 shrink-0" />
                    <div className="text-xs min-w-0">
                      <span className="font-bold text-slate-800 block leading-tight truncate">{w.name}</span>
                      <span className="text-[10px] font-mono text-slate-400">{w.role} ({w.department})</span>
                    </div>
                  </div>
                  <span
                    className={`text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded border shrink-0 ${
                      w.status === "Available"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                        : "bg-slate-100 text-slate-500 border-slate-200"
                    }`}
                  >
                    {w.status}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Over-budget confirmation — a real gate, not a silent pass-through */}
      {pendingOverBudgetWorkerId && assigningIncident && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60" onClick={() => setPendingOverBudgetWorkerId(null)}></div>
          <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm space-y-4">
            <div className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              <h4 className="font-display font-bold text-sm">Dispatch exceeds budget pool</h4>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed font-sans">
              Your allocation of <span className="font-bold">₹{assigningCost.toLocaleString()}</span> for{" "}
              <span className="font-bold">{assigningIncident.id}</span> exceeds the{" "}
              <span className="font-bold">₹{Math.max(0, remainingBudget).toLocaleString()}</span> left in the pool.
              Confirming will push the pool ₹{Math.abs(remainingAfterDispatch).toLocaleString()} into deficit.
            </p>
            <div className="flex gap-3 pt-1">
              <button
                onClick={() => setPendingOverBudgetWorkerId(null)}
                className="flex-1 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmOverBudgetAssign}
                className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold"
              >
                Dispatch Anyway
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
