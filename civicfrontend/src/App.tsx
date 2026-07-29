/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from "react";
import {
  Shield,
  FileText,
  Users,
  Bell,
  Clock,
  TrendingUp,
  Sliders,
  CheckCircle,
  HelpCircle,
  ChevronDown,
  Info,
  MapPin,
  X,
  Plus,
  Home,
  Lock,
  Key,
  Globe,
  Navigation
} from "lucide-react";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  doc,
  setDoc,
  updateDoc,
  arrayUnion,
  writeBatch,
  getDocs,
} from "firebase/firestore";
import { db } from "../firebase"; // adjust path to match your project structure
import { Complaint, FieldWorker, Notification, Rating } from "./types";
import {
  INITIAL_COMPLAINTS,
  INITIAL_WORKERS,
  INITIAL_NOTIFICATIONS
} from "./data/mockData";
import { CITIES_DATA, getNationalAggregateData, CityData } from "./data/cityData";
import CitizenApp from "./components/CitizenApp";
import AdminDashboard from "./components/AdminDashboard";
import FieldWorkerApp from "./components/FieldWorkerApp";
import DesignSystemDocs from "./components/DesignSystemDocs";
import LandingPage from "./components/LandingPage";
import AdminLogin from "./components/AdminLogin";
import AIChatbot from "./components/AIChatbot";
import AIAssistantStack from "./components/AIAssistantStack";
import OnboardingModal from "./components/OnboardingModal";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

// Firestore rejects `undefined` field values — this strips them out before every write.
function sanitize<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

// localStorage key used to persist the last-selected city across reloads/tab switches
const CITY_STORAGE_KEY = "ciq_selected_city";

export default function App() {
  // City and Location States
  // Restored from localStorage on first load so the citizen/worker/admin views
  // stay pinned to the same city across page refreshes instead of resetting to All India.
  const [selectedCityKey, setSelectedCityKey] = useState<string>(() => {
    return localStorage.getItem(CITY_STORAGE_KEY) || "all_india";
  });
  const [isGeoLocationActive, setIsGeoLocationActive] = useState<boolean>(false);
  const [geoDenied, setGeoDenied] = useState<boolean>(false);
  const [locationNameLabel, setLocationNameLabel] = useState<string>(() => {
    const savedKey = localStorage.getItem(CITY_STORAGE_KEY);
    if (savedKey && savedKey !== "all_india" && CITIES_DATA[savedKey]) {
      return `📍 ${CITIES_DATA[savedKey].cityName}, ${CITIES_DATA[savedKey].stateName || ""}`;
    }
    return "All India Overview";
  });

  // Persist city selection whenever it changes, so a refresh or tab switch
  // doesn't silently fall back to the "All India" static mock aggregate.
  useEffect(() => {
    localStorage.setItem(CITY_STORAGE_KEY, selectedCityKey);
  }, [selectedCityKey]);

  // Derive current city dataset (used for seeding Firestore on first run, and for all_india mock aggregate)
  const activeCityData: CityData = useMemo(() => {
    if (selectedCityKey === "all_india") {
      return getNationalAggregateData();
    }
    return CITIES_DATA[selectedCityKey] || getNationalAggregateData();
  }, [selectedCityKey]);

  // Global States — now backed by Firestore real-time listeners instead of localStorage
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [workers, setWorkers] = useState<FieldWorker[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isSyncing, setIsSyncing] = useState<boolean>(true);

  // ---------------------------------------------------------------------
  // FIRESTORE REAL-TIME SYNC — re-subscribes whenever the selected city changes
  // Collections are namespaced per city: complaints_{cityKey}, workers_{cityKey}, notifications_{cityKey}
  // ---------------------------------------------------------------------
  useEffect(() => {
    // "All India" is a computed aggregate across all cities — kept as read-only mock data for now.
    // Wiring this to a live cross-city Firestore aggregate would need a Cloud Function / scheduled rollup.
    if (selectedCityKey === "all_india") {
      const agg = getNationalAggregateData();
      setComplaints(agg.complaints);
      setWorkers(agg.workers);
      setNotifications(agg.notifications);
      setIsSyncing(false);
      return;
    }

    setIsSyncing(true);
    const cityKey = selectedCityKey;
    const complaintsColName = `complaints_${cityKey}`;
    const workersColName = `workers_${cityKey}`;
    const notifsColName = `notifications_${cityKey}`;

    let complaintsSeeded = false;
    let workersSeeded = false;
    let notifsSeeded = false;

    const seedIfEmpty = async (
      colName: string,
      seedData: any[],
      alreadySeededFlag: () => boolean,
      markSeeded: () => void
    ) => {
      if (alreadySeededFlag()) return;
      markSeeded();
      const existing = await getDocs(collection(db, colName));
      if (existing.empty && seedData.length > 0) {
        const batch = writeBatch(db);
        seedData.forEach((item) => {
          batch.set(doc(db, colName, item.id), sanitize(item));
        });
        await batch.commit();
      }
    };

    // Seed collections with mock starter data on first-ever load for this city
    seedIfEmpty(
      complaintsColName,
      activeCityData.complaints,
      () => complaintsSeeded,
      () => (complaintsSeeded = true)
    );
    seedIfEmpty(
      workersColName,
      activeCityData.workers,
      () => workersSeeded,
      () => (workersSeeded = true)
    );
    seedIfEmpty(
      notifsColName,
      activeCityData.notifications,
      () => notifsSeeded,
      () => (notifsSeeded = true)
    );

    // Live listeners
    const unsubComplaints = onSnapshot(
      query(collection(db, complaintsColName), orderBy("reportedAt", "desc")),
      (snap) => {
        setComplaints(snap.docs.map((d) => d.data() as Complaint));
        setIsSyncing(false);
      },
      (err) => {
        console.error("Firestore complaints listener error:", err);
        setIsSyncing(false);
      }
    );

    const unsubWorkers = onSnapshot(
      collection(db, workersColName),
      (snap) => {
        setWorkers(snap.docs.map((d) => d.data() as FieldWorker));
      },
      (err) => console.error("Firestore workers listener error:", err)
    );

    const unsubNotifs = onSnapshot(
      query(collection(db, notifsColName), orderBy("createdAt", "desc")),
      (snap) => {
        setNotifications(snap.docs.map((d) => d.data() as Notification));
      },
      (err) => console.error("Firestore notifications listener error:", err)
    );

    return () => {
      unsubComplaints();
      unsubWorkers();
      unsubNotifs();
    };
  }, [selectedCityKey, activeCityData]);

  // Helper: current per-city collection names for write operations
  const complaintsCol = () => `complaints_${selectedCityKey}`;
  const workersCol = () => `workers_${selectedCityKey}`;
  const notifsCol = () => `notifications_${selectedCityKey}`;

  // Handle automatic geolocation trigger
  const handleTriggerGeoLocation = () => {
    if (!navigator.geolocation) {
      setGeoDenied(true);
      setIsGeoLocationActive(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        let closestKey = "mumbai";
        let minDistance = Infinity;

        Object.entries(CITIES_DATA).forEach(([key, data]) => {
          const dLat = data.centerLat - lat;
          const dLng = data.centerLng - lng;
          const dist = Math.sqrt(dLat * dLat + dLng * dLng);
          if (dist < minDistance) {
            minDistance = dist;
            closestKey = key;
          }
        });

        setSelectedCityKey(closestKey);
        setIsGeoLocationActive(true);
        setGeoDenied(false);
        setLocationNameLabel(`📍 Near You (${CITIES_DATA[closestKey].cityName})`);
      },
      (err) => {
        console.warn("Geolocation permission error or denied:", err);
        setGeoDenied(true);
        setIsGeoLocationActive(false);
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  const handleSelectCity = (key: string) => {
    setSelectedCityKey(key);
    setIsGeoLocationActive(false);
    if (key === "all_india") {
      setLocationNameLabel("All India Overview");
    } else {
      setLocationNameLabel(`📍 ${CITIES_DATA[key]?.cityName || key}, ${CITIES_DATA[key]?.stateName || ""}`);
    }
  };

  // Current active viewport workspace
  const [activeRole, setActiveRole] = useState<"landing" | "admin" | "citizen" | "worker" | "docs">("landing");

  // Localized clock state
  const [currentTime, setCurrentTime] = useState("");

  // Notification center visible flag
  const [showNotificationCenter, setShowNotificationCenter] = useState(false);

  // First-time Onboarding Modal state
  const [showOnboarding, setShowOnboarding] = useState<boolean>(() => {
    return !localStorage.getItem("ciq_onboarding_seen");
  });

  const handleCloseOnboarding = () => {
    localStorage.setItem("ciq_onboarding_seen", "true");
    setShowOnboarding(false);
  };

  // Selected complaint ID for the global detail sidebar overlay
  const [inspectIncidentId, setInspectIncidentId] = useState<string | null>(null);

  // Admin authentication state (kept in sessionStorage — this is just a UI-level auth
  // guard flag, actual Firebase Auth token state is handled separately in AdminLogin.tsx)
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem("ciq_admin_auth") === "true";
  });

  useEffect(() => {
    sessionStorage.setItem("ciq_admin_auth", String(isAdminAuthenticated));
  }, [isAdminAuthenticated]);

  // Clock ticks
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now.toISOString().replace("T", " ").substring(0, 19) + " UTC");
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // -----------------------------------------------------------------------
  // GLOBAL INCIDENT UPDATE FUNCTIONS — now write to Firestore.
  // No manual setComplaints/setWorkers/setNotifications needed after writes —
  // the onSnapshot listeners above pick up every change automatically in real time,
  // which means Admin, Citizen, and Field Crew views all stay in sync instantly.
  // -----------------------------------------------------------------------

  const handleAddNewComplaint = async (newComplaint: Complaint) => {
    try {
      await setDoc(doc(db, complaintsCol(), newComplaint.id), sanitize(newComplaint));

      const newNotif: Notification = {
        id: `N-CT-${Date.now()}`,
        role: "Admin",
        title: "New Citizen Incident Logged",
        message: `${newComplaint.id}: '${newComplaint.title}' pre-classified at Priority ${newComplaint.aiAnalysis.priorityScore}.`,
        createdAt: new Date().toISOString(),
        read: false,
      };
      await setDoc(doc(db, notifsCol(), newNotif.id), sanitize(newNotif));
    } catch (err) {
      console.error("Failed to submit complaint:", err);
      alert("Could not submit your complaint. Please check your connection and try again.");
    }
  };

  const handleAssignWorker = async (complaintId: string, workerId: string) => {
    const targetWorker = workers.find((w) => w.id === workerId);
    if (!targetWorker) return;

    try {
      await updateDoc(doc(db, complaintsCol(), complaintId), {
        status: "Assigned",
        assignedWorkerId: workerId,
        history: arrayUnion({
          status: "Assigned",
          updatedAt: new Date().toISOString(),
          comment: `Admin manually assigned work order to ${targetWorker.name} (${targetWorker.role}).`,
          updatedBy: "Command Center Dispatcher"
        })
      });

      await updateDoc(doc(db, workersCol(), workerId), { status: "On Mission" });

      const newNotifs: Notification[] = [
        {
          id: `N-AW-${Date.now()}-1`,
          role: "Worker",
          title: "New Dispatch Order",
          message: `You have been assigned to investigate and repair incident ${complaintId}.`,
          createdAt: new Date().toISOString(),
          read: false
        },
        {
          id: `N-AW-${Date.now()}-2`,
          role: "Admin",
          title: "Crew Assigned to Work order",
          message: `Technician ${targetWorker.name} has been dispatched to ${complaintId}.`,
          createdAt: new Date().toISOString(),
          read: false
        }
      ];
      await Promise.all(newNotifs.map((n) => setDoc(doc(db, notifsCol(), n.id), sanitize(n))));
    } catch (err) {
      console.error("Failed to assign worker:", err);
      alert("Could not assign worker. Please try again.");
    }
  };

  const handleAcceptJob = async (complaintId: string, workerId: string, workerName: string) => {
    const targetWorker = workers.find((w) => w.id === workerId) || { name: workerName || "Rahul Patil" };

    try {
      await updateDoc(doc(db, complaintsCol(), complaintId), {
        status: "Accepted",
        assignedWorkerId: workerId,
        assignedWorkerName: targetWorker.name,
        etaMinutes: 12,
        history: arrayUnion({
          status: "Accepted",
          updatedAt: new Date().toISOString(),
          comment: `${targetWorker.name} accepted the work order and is en route.`,
          updatedBy: targetWorker.name
        })
      });

      await updateDoc(doc(db, workersCol(), workerId), { status: "On Mission" });

      const newNotifs: Notification[] = [
        {
          id: `N-ACC-${Date.now()}-1`,
          role: "Citizen",
          title: "Complaint Accepted!",
          message: `${targetWorker.name} has accepted your complaint #${complaintId}. Technician crew is en route (ETA ~12 mins).`,
          createdAt: new Date().toISOString(),
          read: false
        },
        {
          id: `N-ACC-${Date.now()}-2`,
          role: "Admin",
          title: "Work Order Accepted",
          message: `${targetWorker.name} accepted job #${complaintId} directly from Field App queue.`,
          createdAt: new Date().toISOString(),
          read: false
        }
      ];
      await Promise.all(newNotifs.map((n) => setDoc(doc(db, notifsCol(), n.id), sanitize(n))));
    } catch (err) {
      console.error("Failed to accept job:", err);
      alert("Could not accept the job. Please try again.");
    }
  };

  const handleWorkerUpdateStatus = async (
    complaintId: string,
    status: "Accepted" | "In Progress" | "Resolved",
    comment: string,
    photo: string | null,
    completionDetails?: { beforePhoto?: string; afterPhoto?: string; voiceNote?: string }
  ) => {
    const currentComplaint = complaints.find((c) => c.id === complaintId);

    const finalHistoryEvent = {
      status,
      updatedAt: new Date().toISOString(),
      comment,
      updatedBy: currentComplaint?.assignedWorkerName || "Field Crew Dispatch"
    };

    const beforeP = completionDetails?.beforePhoto || currentComplaint?.images?.[0] || null;
    const afterP =
      completionDetails?.afterPhoto ||
      photo ||
      "https://images.unsplash.com/photo-1515162305285-0293e4767cc2?w=600&auto=format&fit=crop&q=80";

    try {
      const updatePayload: any = {
        status,
        history: arrayUnion(finalHistoryEvent)
      };

      if (status === "Resolved") {
        updatePayload.completionProof = sanitize({
          photos: [afterP],
          beforePhoto: beforeP,
          afterPhoto: afterP,
          completedAt: new Date().toISOString(),
          comments: comment,
          voiceNote: completionDetails?.voiceNote
        });
      }

      await updateDoc(doc(db, complaintsCol(), complaintId), updatePayload);

      if (status === "Resolved" && currentComplaint?.assignedWorkerId) {
        await updateDoc(doc(db, workersCol(), currentComplaint.assignedWorkerId), {
          status: "Available"
        });
      }

      const newNotifs: Notification[] = [
        {
          id: `N-WU-${Date.now()}`,
          role: "Admin",
          title: status === "Resolved" ? "Work Order Completed" : "Repair Work Initiated",
          message: `Incident ${complaintId} has been updated to ${status}. Proof of work archived in logs.`,
          createdAt: new Date().toISOString(),
          read: false
        }
      ];

      if (status === "Resolved") {
        newNotifs.push({
          id: `N-RES-${Date.now()}`,
          role: "Citizen",
          title: "Work Completed!",
          message: `Work on your complaint #${complaintId} is finished. Please rate your experience!`,
          createdAt: new Date().toISOString(),
          read: false
        });
      }

      await Promise.all(newNotifs.map((n) => setDoc(doc(db, notifsCol(), n.id), sanitize(n))));
    } catch (err) {
      console.error("Failed to update work status:", err);
      alert("Could not update the work order status. Please try again.");
    }
  };

  const handleRateComplaint = async (complaintId: string, rating: Rating) => {
    try {
      await updateDoc(doc(db, complaintsCol(), complaintId), {
        rating: sanitize(rating),
        history: arrayUnion({
          status: complaints.find((c) => c.id === complaintId)?.status || "Resolved",
          updatedAt: new Date().toISOString(),
          comment: `Citizen rated response: ${rating.stars} Stars. Feedback: "${rating.comment || rating.tags?.join(", ") || "Great service"}"`,
          updatedBy: "Citizen Portal"
        })
      });

      const newNotif: Notification = {
        id: `N-RAT-${Date.now()}`,
        role: "Admin",
        title: "Citizen Feedback Received",
        message: `Complaint #${complaintId} received a ${rating.stars}-Star rating from citizen.`,
        createdAt: new Date().toISOString(),
        read: false
      };
      await setDoc(doc(db, notifsCol(), newNotif.id), sanitize(newNotif));
    } catch (err) {
      console.error("Failed to save rating:", err);
      alert("Could not save your rating. Please try again.");
    }
  };

  const markAllNotifsRead = async () => {
    try {
      await Promise.all(
        notifications
          .filter((n) => !n.read)
          .map((n) => updateDoc(doc(db, notifsCol(), n.id), { read: true }))
      );
    } catch (err) {
      console.error("Failed to mark notifications read:", err);
    }
  };

  const handleClearPersistence = async () => {
    if (
      !window.confirm(
        "Restore platform to default GovTech mock dataset for this city? All custom submissions will be permanently deleted from Firestore."
      )
    ) {
      return;
    }

    try {
      const batch = writeBatch(db);

      const existingComplaints = await getDocs(collection(db, complaintsCol()));
      existingComplaints.forEach((d) => batch.delete(d.ref));

      const existingWorkers = await getDocs(collection(db, workersCol()));
      existingWorkers.forEach((d) => batch.delete(d.ref));

      const existingNotifs = await getDocs(collection(db, notifsCol()));
      existingNotifs.forEach((d) => batch.delete(d.ref));

      activeCityData.complaints.forEach((c) => batch.set(doc(db, complaintsCol(), c.id), sanitize(c)));
      activeCityData.workers.forEach((w) => batch.set(doc(db, workersCol(), w.id), sanitize(w)));
      activeCityData.notifications.forEach((n) => batch.set(doc(db, notifsCol(), n.id), sanitize(n)));

      await batch.commit();
    } catch (err) {
      console.error("Failed to reset dataset:", err);
      alert("Could not reset the dataset. Please try again.");
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;
  const inspectedComplaint = complaints.find((c) => c.id === inspectIncidentId);

  if (activeRole === "landing") {
    return <LandingPage onSelectRole={setActiveRole} />;
  }

  const showSidebar = activeRole !== "admin" || isAdminAuthenticated;

  return (
    <div className="min-h-screen bg-[#F5F7FA] text-slate-800 antialiased font-sans flex flex-col">
      
      {/* CLEAN MODERN NAVIGATION BAR */}
      <Navbar
        activeRole={activeRole}
        setActiveRole={(role) => setActiveRole(role as any)}
        notifications={notifications}
        showNotificationCenter={showNotificationCenter}
        setShowNotificationCenter={setShowNotificationCenter}
        markAllNotifsRead={markAllNotifsRead}
        setShowOnboarding={setShowOnboarding}
        handleClearPersistence={handleClearPersistence}
        selectedCityKey={selectedCityKey}
        onSelectCity={handleSelectCity}
        isGeoLocationActive={isGeoLocationActive}
        locationNameLabel={locationNameLabel}
        onTriggerGeoLocation={handleTriggerGeoLocation}
        geoDenied={geoDenied}
      />

      {/* SPLIT SCREEN VIEW - LEFT (75%) & RIGHT (25%) */}
      <div className="flex-1 max-w-[1920px] w-full mx-auto px-4 lg:px-6 py-6" id="dashboard-split-screen-grid-wrapper">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start h-full">
          
          {/* LEFT COLUMN: Main Administrative Command Workspace (75% or 9 cols, dynamic 100% if no sidebar) */}
          <div className={showSidebar ? "lg:col-span-9 space-y-6 min-w-0" : "lg:col-span-12 space-y-6 min-w-0"} id="left-workspace-content-pane">
            
            {/* Role Helper Banner */}
            <div className="bg-white border border-slate-200 p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
              <div className="flex items-start gap-3.5 text-xs text-slate-600 leading-relaxed max-w-3xl">
                <div className="p-2 bg-gov-blue-light text-[#1565C0] rounded-lg shrink-0 mt-0.5">
                  <Info className="h-4.5 w-4.5" />
                </div>
                <div>
                  <span className="font-bold text-slate-900 block text-xs">
                    {activeRole === "admin" && (isAdminAuthenticated ? "Admin Dashboard" : "Admin Login")}
                    {activeRole === "citizen" && "Citizen Portal"}
                    {activeRole === "worker" && "Field Crew Dashboard"}
                    {activeRole === "docs" && "Design System"}
                  </span>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {activeRole === "admin" && (isAdminAuthenticated ? "Manage citizen complaints, dispatch field workers, and view ward repair estimates." : "Please enter your official employee ID and password to access the admin portal.")}
                    {activeRole === "citizen" && "Report issues via photo or voice, drop your location on the map, and get real-time AI updates."}
                    {activeRole === "worker" && "Track assigned work orders, navigate to repair sites, upload completion photos, and update ticket statuses."}
                    {activeRole === "docs" && "View design standards, color palettes, typography guidelines, and accessibility benchmarks."}
                  </p>
                </div>
              </div>

              {activeRole === "admin" && isAdminAuthenticated && (
                <button
                  onClick={() => setIsAdminAuthenticated(false)}
                  className="px-3.5 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 border border-red-200 hover:border-red-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs shrink-0 self-end md:self-center cursor-pointer"
                >
                  <Lock className="h-3.5 w-3.5" />
                  <span>Log Out</span>
                </button>
              )}
            </div>

            {/* WORKSPACE RENDER BLOCK */}
            <div className="min-h-[500px]" id="workspace-sub-render-block">
              {activeRole === "admin" && (
                isAdminAuthenticated ? (
                  <AdminDashboard
                    complaints={complaints}
                    workers={workers}
                    onAssignWorker={handleAssignWorker}
                    onUpdateStatus={handleWorkerUpdateStatus}
                    cityName={activeCityData.cityName}
                    selectedCityKey={selectedCityKey}
                    cityData={activeCityData}
                  />
                ) : (
                  <AdminLogin
                    onLoginSuccess={() => setIsAdminAuthenticated(true)}
                    onBackToHome={() => setActiveRole("landing")}
                  />
                )
              )}

              {activeRole === "citizen" && (
                <CitizenApp
                  complaints={complaints}
                  onSubmitComplaint={handleAddNewComplaint}
                  onViewComplaintDetails={(id) => {
                    setInspectIncidentId(id);
                  }}
                  onRateComplaint={handleRateComplaint}
                />
              )}

              {activeRole === "worker" && (
                <FieldWorkerApp
                  complaints={complaints}
                  worker={workers[0] || INITIAL_WORKERS[0]} // Defaults to Rahul Patil
                  onAcceptJob={(complaintId) => {
                    const activeWorker = workers[0] || INITIAL_WORKERS[0];
                    handleAcceptJob(complaintId, activeWorker.id, activeWorker.name);
                  }}
                  onUpdateComplaintStatus={handleWorkerUpdateStatus}
                />
              )}

              {activeRole === "docs" && (
                <DesignSystemDocs />
              )}
            </div>

            {/* Civic Footer inside Left Column */}
            <footer className="bg-white border border-slate-200 rounded-xl py-6 px-6 text-center space-y-2 font-mono text-[10px] text-slate-400 uppercase font-bold tracking-wider shadow-xs">
              <div>MUNICIPALITY OF METRO SECTOR • NATIONAL SMART CITY ALLIANCE</div>
              <div className="font-normal text-slate-300">
                This system complies fully with US Federal (WDS), EU Digital Single Market, and ISO-37120 standards.
              </div>
            </footer>

          </div>

          {/* RIGHT COLUMN: AI Assistant Stack Sticky Sidebar (25% or 3 cols) */}
          {showSidebar && (
            <div className="lg:col-span-3 lg:sticky lg:top-24 space-y-4 self-start" id="right-ai-sidebar-container">
              <AIAssistantStack />
            </div>
          )}

        </div>
      </div>

        {/* GLOBAL INCIDENT DETAILS INSPECTOR MODAL/DRAWER OVERLAY */}
        {inspectIncidentId && inspectedComplaint && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-end z-50">
            <div className="bg-white border-l border-slate-200 h-full w-full max-w-lg shadow-2xl p-6 overflow-y-auto space-y-6 flex flex-col justify-between">
              <div className="space-y-5">
                
                {/* Header Title bar */}
                <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                  <div>
                    <span className="text-[10px] font-mono text-slate-400 block uppercase">
                      Incident Audit Ledger: {inspectedComplaint.id}
                    </span>
                    <h4 className="font-display font-semibold text-slate-900 text-base mt-1">
                      {inspectedComplaint.title}
                    </h4>
                  </div>
                  <button
                    onClick={() => setInspectIncidentId(null)}
                    className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Status Badge rows */}
                <div className="flex flex-wrap items-center gap-2 font-mono text-[10px]">
                  <span className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full uppercase font-bold">
                    {inspectedComplaint.category}
                  </span>
                  <span className={`px-2.5 py-1 rounded-full uppercase font-bold border ${
                    inspectedComplaint.status === "Resolved"
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : "bg-amber-50 text-amber-700 border-amber-200"
                  }`}>
                    {inspectedComplaint.status}
                  </span>
                  <span className="text-gov-blue bg-gov-blue-light px-2.5 py-1 rounded font-bold">
                    Priority: {inspectedComplaint.aiAnalysis.priorityScore}/100
                  </span>
                </div>

                {/* Citizen Description narrative */}
                <div className="space-y-1 text-xs">
                  <span className="text-slate-400 font-mono text-[10px] uppercase block">Citizen Narrative description:</span>
                  <p className="text-slate-700 leading-relaxed font-sans bg-slate-50/50 p-3 rounded-lg border border-slate-100">
                    {inspectedComplaint.description}
                  </p>
                </div>

                {/* Image Attachments */}
                {inspectedComplaint.images.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-slate-400 font-mono text-[10px] uppercase block">Media uploads:</span>
                    <div className="border border-slate-200 rounded-xl overflow-hidden max-h-44">
                      <img
                        src={inspectedComplaint.images[0]}
                        alt="Attachment proof"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                )}

                {/* AI Agent diagnostics panel */}
                <div className="bg-slate-900 text-white rounded-xl p-4 space-y-3 shadow-lg border border-slate-800">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="font-mono text-[11px] uppercase tracking-wider font-bold text-blue-400 flex items-center gap-1.5">
                      <Shield className="h-4 w-4" />
                      <span>AI Reasoning & Explanation</span>
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400">
                      Confidence: {Math.round(inspectedComplaint.aiAnalysis.confidence * 100)}%
                    </span>
                  </div>

                  <div className="space-y-3 font-mono text-xs text-slate-300">
                    <div className="grid grid-cols-2 gap-2 text-[10px] border-b border-slate-800 pb-2">
                      <div>
                        <span className="text-slate-500 block uppercase">Affected Population:</span>
                        <span className="text-white font-bold">{inspectedComplaint.aiAnalysis.populationAffected} citizens</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block uppercase">Threat Severity:</span>
                        <span className="text-white font-bold">{inspectedComplaint.aiAnalysis.severity}</span>
                      </div>
                    </div>

                    <div className="text-[11px] leading-relaxed">
                      <span className="text-slate-500 block uppercase text-[9px] mb-0.5 font-bold">Reasoning Chain logic:</span>
                      <p className="text-slate-300 font-sans italic">"{inspectedComplaint.aiAnalysis.reasoning}"</p>
                    </div>

                    {/* Future risk graph simulation */}
                    <div className="border-t border-slate-800 pt-2 text-[10px]">
                      <span className="text-slate-500 block uppercase text-[9px] mb-1 font-bold">Predictive future risk index (If unrepaired):</span>
                      
                      {/* Tiny visual SVG sparkline indicating exponential threat growth */}
                      <div className="h-10 bg-slate-950 rounded border border-slate-800 flex items-center justify-between px-3 relative overflow-hidden">
                        <span className="absolute left-2 top-1 text-[8px] text-slate-500">24h Delay Risk Curve</span>
                        <svg className="w-full h-full" viewBox="0 0 300 40">
                          {/* Exponential line */}
                          <path d="M 0,35 Q 100,32 180,24 T 300,5" fill="none" stroke="#EF4444" strokeWidth="2" />
                          <circle cx="300" cy="5" r="3" fill="#EF4444" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Audit timelines */}
                <div className="space-y-2 border-t border-slate-100 pt-3">
                  <span className="text-slate-400 font-mono text-[10px] uppercase block">Audit Lifecycle Trail:</span>
                  <div className="space-y-3 font-mono text-[10px] text-slate-600 pl-1">
                    {inspectedComplaint.history.map((h, idx) => (
                      <div key={idx} className="relative pl-4 border-l border-slate-200 pb-1">
                        <span className="absolute -left-1.5 top-1 w-3 h-3 rounded-full bg-slate-300 border-2 border-white inline-block"></span>
                        <div className="flex items-center justify-between text-slate-800">
                          <span className="font-bold uppercase text-[9px]">{h.status}</span>
                          <span className="text-[8px] text-slate-400">{new Date(h.updatedAt).toLocaleTimeString()}</span>
                        </div>
                        <p className="text-[10px] text-slate-500 font-sans mt-0.5 leading-tight">{h.comment}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Completion logs if resolved */}
                {inspectedComplaint.completionProof && (
                  <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 space-y-2.5">
                    <div className="font-mono text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                      <CheckCircle className="h-4.5 w-4.5" />
                      <span>Completion Proof Verified</span>
                    </div>
                    <p className="text-xs text-slate-600 font-sans italic leading-relaxed">
                      "{inspectedComplaint.completionProof.comments}"
                    </p>
                    <span className="text-[10px] font-mono text-slate-400 block">
                      Completed At: {new Date(inspectedComplaint.completionProof.completedAt).toLocaleDateString()} 
                    </span>
                  </div>
                )}

              </div>

              <button
                onClick={() => setInspectIncidentId(null)}
                className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors font-mono uppercase mt-4"
              >
                Exit Inspector Ledger
              </button>
            </div>
          </div>
        )}

        {/* ONBOARDING GUIDED TOUR MODAL */}
        <OnboardingModal isOpen={showOnboarding} onClose={handleCloseOnboarding} />

        {/* GOVERNMENT-STYLE FOOTER */}
        <Footer activeRole={activeRole} setActiveRole={(role) => setActiveRole(role as any)} />
    </div>
  );
}