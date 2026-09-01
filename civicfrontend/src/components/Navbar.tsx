/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
**/ 
import React, { useState, useRef, useEffect } from "react";
import {
  Shield,
  FileText,
  Users,
  Bell,
  Home,
  Menu,
  X,
  MoreHorizontal,
  RotateCcw,
  Sparkles,
  ChevronDown,
  Layers,
  MapPin,
  Search,
  Navigation,
  Globe,
  Check
} from "lucide-react";
import { Notification } from "../types";
import { CITIES_DATA } from "../data/cityData";
import logo from "../assets/1.jpg";

interface NavbarProps {
  activeRole: string;
  setActiveRole: (role: string) => void;
  notifications: Notification[];
  showNotificationCenter: boolean;
  setShowNotificationCenter: (show: boolean) => void;
  markAllNotifsRead: () => void;
  setShowOnboarding: (show: boolean) => void;
  handleClearPersistence: () => void;
  selectedCityKey?: string;
  onSelectCity?: (key: string) => void;
  isGeoLocationActive?: boolean;
  locationNameLabel?: string;
  onTriggerGeoLocation?: () => void;
  geoDenied?: boolean;
}

export default function Navbar({
  activeRole,
  setActiveRole,
  notifications,
  showNotificationCenter,
  setShowNotificationCenter,
  markAllNotifsRead,
  setShowOnboarding,
  handleClearPersistence,
  selectedCityKey = "all_india",
  onSelectCity,
  isGeoLocationActive = false,
  locationNameLabel,
  onTriggerGeoLocation,
  geoDenied = false,
}: NavbarProps) {
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [citySearchQuery, setCitySearchQuery] = useState("");
  const [timeString, setTimeString] = useState("");

  const moreMenuRef = useRef<HTMLDivElement>(null);
  const notifMenuRef = useRef<HTMLDivElement>(null);
  const cityMenuRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const currentCityName = selectedCityKey === "all_india"
    ? "All India"
    : CITIES_DATA[selectedCityKey]?.cityName || "All India";

  // Filtered city list for search
  const availableCitiesList = [
    { key: "all_india", name: "All India", state: "National Overview", isNational: true },
    { key: "mumbai", name: "Mumbai", state: "Maharashtra" },
    { key: "delhi", name: "Delhi", state: "NCT" },
    { key: "bengaluru", name: "Bengaluru", state: "Karnataka" },
    { key: "hyderabad", name: "Hyderabad", state: "Telangana" },
    { key: "chennai", name: "Chennai", state: "Tamil Nadu" },
    { key: "pune", name: "Pune", state: "Maharashtra" },
    { key: "kolkata", name: "Kolkata", state: "West Bengal" },
    { key: "vijayawada", name: "Vijayawada", state: "Andhra Pradesh" },
  ].filter(
    (c) =>
      c.name.toLowerCase().includes(citySearchQuery.toLowerCase()) ||
      c.state.toLowerCase().includes(citySearchQuery.toLowerCase())
  );

  // Live Date & Time for India (IST) - Updates every minute, NO seconds
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const dateOptions: Intl.DateTimeFormatOptions = {
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: "Asia/Kolkata",
      };
      const timeOptions: Intl.DateTimeFormatOptions = {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
        timeZone: "Asia/Kolkata",
      };
      const datePart = now.toLocaleDateString("en-IN", dateOptions);
      const timePart = now.toLocaleTimeString("en-IN", timeOptions);
      setTimeString(`${datePart} • ${timePart}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  // Close menus on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        moreMenuRef.current &&
        !moreMenuRef.current.contains(event.target as Node)
      ) {
        setShowMoreMenu(false);
      }
      if (
        notifMenuRef.current &&
        !notifMenuRef.current.contains(event.target as Node)
      ) {
        setShowNotificationCenter(false);
      }
      if (
        cityMenuRef.current &&
        !cityMenuRef.current.contains(event.target as Node)
      ) {
        setShowCityDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [setShowNotificationCenter]);

  const navItems = [
    { id: "landing", label: "Home", icon: Home },
    { id: "admin", label: "Admin", icon: Shield },
    { id: "citizen", label: "Citizen", icon: FileText },
    { id: "worker", label: "Field Crew", icon: Users },
  ];

  return (
    <header className="bg-slate-950/95 backdrop-blur-md border-b border-slate-800/70 text-slate-100 sticky top-0 z-45 shrink-0 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        
        {/* BRAND LOGO */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => {
              setActiveRole("landing");
              setMobileMenuOpen(false);
            }}
            className="flex items-center gap-2.5 group cursor-pointer focus:outline-hidden"
            id="top-nav-logo-brand"
          >
            <img
              src={logo}
              alt="Civic-IQ Logo"
              className="w-7 h-7 rounded-lg object-cover border border-slate-700/80 group-hover:border-blue-400/80 transition-colors"
              referrerPolicy="no-referrer"
            />
            <div className="flex items-baseline gap-1.5">
              <span className="text-sm font-semibold tracking-tight text-white group-hover:text-blue-300 transition-colors">
                Civic-IQ
              </span>
              <span className="text-[10px] text-slate-400 font-mono hidden sm:inline-block">
                Operations
              </span>
            </div>
          </button>

          {/* DESKTOP / TABLET MAIN TABS */}
          <nav className="hidden md:flex items-center gap-1 font-sans text-xs">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeRole === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveRole(item.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-2 cursor-pointer ${
                    isActive
                      ? "bg-slate-800 text-white border border-slate-700/60 shadow-2xs font-semibold"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60"
                  }`}
                >
                  <Icon className={`h-3.5 w-3.5 ${isActive ? "text-blue-400" : "text-slate-400"}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* RIGHT UTILITIES */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* DYNAMIC CITY SELECTOR & LOCATION DETECTION - Google Maps Style */}
          <div className="relative" ref={cityMenuRef}>
            <button
              onClick={() => setShowCityDropdown(!showCityDropdown)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer border shadow-2xs ${
                selectedCityKey === "all_india"
                  ? "bg-amber-950/60 text-amber-300 border-amber-700/60 hover:bg-amber-900/80"
                  : isGeoLocationActive
                  ? "bg-emerald-950/70 text-emerald-300 border-emerald-700/60 hover:bg-emerald-900/80"
                  : "bg-slate-900/90 text-slate-200 border-slate-700/80 hover:bg-slate-800"
              }`}
              title="Click to search or switch city view"
              id="top-nav-city-picker-btn"
            >
              {selectedCityKey === "all_india" ? (
                <Globe className="h-3.5 w-3.5 text-amber-400 shrink-0" />
              ) : isGeoLocationActive ? (
                <Navigation className="h-3.5 w-3.5 text-emerald-400 shrink-0 animate-pulse" />
              ) : (
                <MapPin className="h-3.5 w-3.5 text-red-400 shrink-0" />
              )}

              <div className="flex items-center gap-1">
                <span className="font-bold tracking-wide">{currentCityName}</span>
                {isGeoLocationActive && (
                  <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1 rounded font-mono">
                    GPS
                  </span>
                )}
              </div>
              <ChevronDown className={`h-3.5 w-3.5 text-slate-400 transition-transform ${showCityDropdown ? "rotate-180" : ""}`} />
            </button>

            {/* CITY SELECTION DROPDOWN MENU */}
            {showCityDropdown && (
              <div
                className="absolute right-0 mt-2 w-72 sm:w-80 bg-white border border-slate-200 text-slate-800 rounded-xl shadow-2xl z-50 p-3 space-y-2.5 font-sans"
                id="city-picker-dropdown-menu"
              >
                {/* Search Bar */}
                <div className="relative">
                  <Search className="h-4 w-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={citySearchQuery}
                    onChange={(e) => setCitySearchQuery(e.target.value)}
                    placeholder="Search city (e.g. Mumbai, Delhi)..."
                    className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:border-gov-blue text-slate-800"
                  />
                  {citySearchQuery && (
                    <button
                      onClick={() => setCitySearchQuery("")}
                      className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 text-xs"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                {/* Detect Location Button */}
                {onTriggerGeoLocation && (
                  <button
                    onClick={() => {
                      onTriggerGeoLocation();
                      setShowCityDropdown(false);
                    }}
                    className="w-full py-2 px-3 bg-emerald-50 hover:bg-emerald-100/80 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-bold transition-colors flex items-center justify-between cursor-pointer group"
                  >
                    <div className="flex items-center gap-2">
                      <Navigation className="h-4 w-4 text-emerald-600 group-hover:scale-110 transition-transform" />
                      <span>📍 Use My Current Location</span>
                    </div>
                    <span className="text-[10px] text-emerald-700 bg-white/80 px-1.5 py-0.5 rounded font-mono border border-emerald-200">
                      Auto GPS
                    </span>
                  </button>
                )}

                {geoDenied && (
                  <div className="p-2 bg-amber-50 border border-amber-200 rounded-lg text-[11px] text-amber-800 font-medium leading-tight">
                    ⚠️ Browser location access is denied. Please select a city manually below.
                  </div>
                )}

                <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider px-1 pt-1 flex justify-between">
                  <span>Available Municipalities ({availableCitiesList.length})</span>
                  <span>State</span>
                </div>

                {/* City List */}
                <div className="max-h-56 overflow-y-auto space-y-1 pr-1">
                  {availableCitiesList.map((c) => {
                    const isSelected = selectedCityKey === c.key;
                    return (
                      <button
                        key={c.key}
                        onClick={() => {
                          if (onSelectCity) onSelectCity(c.key);
                          setShowCityDropdown(false);
                        }}
                        className={`w-full p-2 rounded-lg text-xs font-medium transition-all flex items-center justify-between cursor-pointer border ${
                          isSelected
                            ? c.key === "all_india"
                              ? "bg-amber-50 text-amber-900 border-amber-200 font-bold"
                              : "bg-blue-50 text-gov-blue border-blue-200 font-bold"
                            : "bg-white hover:bg-slate-50 text-slate-700 border-transparent hover:border-slate-200"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {c.key === "all_india" ? (
                            <Globe className="h-4 w-4 text-amber-600 shrink-0" />
                          ) : (
                            <MapPin className="h-4 w-4 text-slate-400 shrink-0" />
                          )}
                          <div className="text-left">
                            <span className="block leading-tight">{c.name}</span>
                            <span className="text-[10px] text-slate-400 font-normal block">{c.state}</span>
                          </div>
                        </div>
                        {isSelected && <Check className="h-4 w-4 text-gov-blue shrink-0" />}
                      </button>
                    );
                  })}
                </div>

                {/* Time Indicator Footer */}
                <div className="pt-2 border-t border-slate-100 text-[10.5px] text-slate-400 font-mono text-center">
                  IST Time: {timeString || "11:58 PM"}
                </div>
              </div>
            )}
          </div>

          {/* NOTIFICATION BELL */}
          <div className="relative" ref={notifMenuRef}>
            <button
              onClick={() => setShowNotificationCenter(!showNotificationCenter)}
              className="p-2 text-slate-300 hover:text-white bg-slate-900/80 hover:bg-slate-850 rounded-lg transition-colors border border-slate-800/80 cursor-pointer relative focus:outline-hidden"
              title="System Alerts"
              id="desktop-alerts-btn"
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full ring-2 ring-slate-950 animate-pulse"></span>
              )}
            </button>

            {/* NOTIFICATION CENTER DROPDOWN */}
            {showNotificationCenter && (
              <div
                className="absolute right-0 mt-2 w-72 sm:w-80 bg-white border border-slate-200 text-slate-800 rounded-xl shadow-xl z-50 p-4 space-y-3 font-sans"
                id="desktop-notifications-menu"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="font-semibold text-slate-900 text-xs font-mono uppercase tracking-wider">
                    System Alerts
                  </span>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllNotifsRead}
                      className="text-[11px] text-blue-600 font-medium hover:underline cursor-pointer"
                    >
                      Mark all read
                    </button>
                  )}
                </div>
                
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {notifications.length === 0 ? (
                    <p className="text-slate-400 text-xs text-center py-6 italic">
                      No active alert logs.
                    </p>
                  ) : (
                    notifications.slice(0, 6).map((n) => (
                      <div
                        key={n.id}
                        className={`p-2.5 rounded-lg text-xs space-y-1 border transition-colors ${
                          n.read
                            ? "bg-slate-50 border-slate-100"
                            : "bg-blue-50/50 border-blue-100"
                        }`}
                      >
                        <div className="flex justify-between font-mono text-[9px] text-slate-400">
                          <span className="font-semibold text-slate-600">{n.role.toUpperCase()}</span>
                          <span>{new Date(n.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                        </div>
                        <h5 className="font-semibold text-slate-800 truncate leading-tight">
                          {n.title}
                        </h5>
                        <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                          {n.message}
                        </p>
                      </div>
                    ))
                  )}
                </div>

                <button
                  onClick={() => setShowNotificationCenter(false)}
                  className="w-full py-1.5 text-center bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-lg text-xs font-medium border border-slate-200 transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            )}
          </div>

          {/* OVERFLOW / MORE OPTIONS DROPDOWN (DESKTOP) */}
          <div className="relative hidden sm:block" ref={moreMenuRef}>
            <button
              onClick={() => setShowMoreMenu(!showMoreMenu)}
              className="px-2.5 py-1.5 text-slate-300 hover:text-white bg-slate-900/80 hover:bg-slate-850 rounded-lg transition-colors border border-slate-800/80 text-xs font-medium flex items-center gap-1.5 cursor-pointer focus:outline-hidden"
              id="top-nav-more-btn"
            >
              <MoreHorizontal className="h-4 w-4 text-slate-400" />
              <ChevronDown className="h-3 w-3 text-slate-500" />
            </button>

            {showMoreMenu && (
              <div className="absolute right-0 mt-2 w-52 bg-slate-900 border border-slate-800 text-slate-200 rounded-xl shadow-xl z-50 py-1.5 font-sans text-xs">
                <button
                  onClick={() => {
                    setShowOnboarding(true);
                    setShowMoreMenu(false);
                  }}
                  className="w-full px-3.5 py-2 text-left hover:bg-slate-800 flex items-center gap-2.5 text-slate-300 hover:text-white transition-colors cursor-pointer"
                  id="desktop-take-tour-btn"
                >
                  <Sparkles className="h-3.5 w-3.5 text-blue-400" />
                  <span>Take Interactive Tour</span>
                </button>

                

                <div className="my-1 border-t border-slate-800"></div>

                <button
                  onClick={() => {
                    handleClearPersistence();
                    setShowMoreMenu(false);
                  }}
                  className="w-full px-3.5 py-2 text-left hover:bg-red-950/50 flex items-center gap-2.5 text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
                >
                  <RotateCcw className="h-3.5 w-3.5 text-red-400" />
                  <span>Reset Demo Data</span>
                </button>
              </div>
            )}
          </div>

          {/* MOBILE MENU TOGGLE BUTTON */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-300 hover:text-white bg-slate-900/80 hover:bg-slate-850 rounded-lg transition-colors border border-slate-800/80 cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>

        </div>
      </div>

      {/* MOBILE EXPANDED MENU DRAWER */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800/80 bg-slate-950 p-4 space-y-3 font-sans">
          {/* Live time badge on mobile drawer */}
          <div className="flex items-center justify-between bg-slate-900 p-2.5 rounded-lg border border-slate-800 text-xs">
            <span className="flex items-center gap-1.5 text-slate-200 font-semibold">
              <MapPin className="h-3.5 w-3.5 text-red-400" />
              <span>Mumbai</span>
            </span>
            <span className="text-slate-400 font-mono text-[11px]">
              {timeString || "23 July 2026 • 11:58 PM"}
            </span>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block px-2 mb-1">
              Main Viewports
            </span>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeRole === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveRole(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full px-3 py-2.5 rounded-lg text-xs font-medium transition-all flex items-center gap-3 cursor-pointer ${
                    isActive
                      ? "bg-slate-800 text-white border border-slate-700/60 font-semibold"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? "text-blue-400" : "text-slate-400"}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          <div className="pt-2 border-t border-slate-800/80 space-y-1">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block px-2 mb-1">
              Utilities & Demo Tools
            </span>
            <button
              onClick={() => {
                setShowOnboarding(true);
                setMobileMenuOpen(false);
              }}
              className="w-full px-3 py-2 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-900 flex items-center gap-3 cursor-pointer"
            >
              <Sparkles className="h-4 w-4 text-blue-400" />
              <span>Take Interactive Tour</span>
            </button>

            <button
              onClick={() => {
                setActiveRole("docs");
                setMobileMenuOpen(false);
              }}
              className="w-full px-3 py-2 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-900 flex items-center gap-3 cursor-pointer"
            >
              <Layers className="h-4 w-4 text-slate-400" />
              <span>Design System Docs</span>
            </button>

            <button
              onClick={() => {
                handleClearPersistence();
                setMobileMenuOpen(false);
              }}
              className="w-full px-3 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-red-400 hover:bg-slate-900 flex items-center gap-3 cursor-pointer"
            >
              <RotateCcw className="h-4 w-4 text-red-400" />
              <span>Reset Demo Data</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
