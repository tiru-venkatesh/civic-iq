// Target path in your repo: src/components/maps/SmartMap.tsx
// (same folder as your existing types.ts)
//
// Setup:
// 1. No npm install needed — the Google Maps script is injected at runtime.
// 2. .env: VITE_GOOGLE_MAPS_API_KEY=... (or REACT_APP_GOOGLE_MAPS_API_KEY=... for CRA)
// 3. Optional but recommended for production: VITE_GOOGLE_MAPS_MAP_ID=... (create one
//    in Cloud Console → Map Management). Without it, markers fall back to DEMO_MAP_ID,
//    which works fine for testing but is not meant for production traffic.

import React, { useEffect, useMemo, useRef, useState } from "react";
import type { ComplaintMapItem, SmartMapProps, WorkerMapItem } from "./types";

declare global {
  interface Window {
    google?: any;
  }
  namespace JSX {
    interface IntrinsicElements {
      "gmp-map": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        center?: string;
        zoom?: string;
        "map-id"?: string;
      };
    }
  }
}

interface GmpMapElement extends HTMLElement {
  innerMap: any;
  // The `center`/`zoom` properties (as opposed to the HTML attributes) require
  // typed values, not strings — a LatLngLiteral object and a number respectively.
  center: { lat: number; lng: number } | null;
  zoom: number;
}

type MarkerEntry = { marker: any; pin: any };

const SEVERITY_COLORS: Record<ComplaintMapItem["severity"], string> = {
  Critical: "#EF4444",
  High: "#F97316",
  Medium: "#F59E0B",
  Resolved: "#10B981",
};

const WORKER_COLORS: Record<string, string> = {
  Available: "#10B981",
  "En Route": "#2563EB",
  "On Site": "#1565C0",
  Offline: "#94A3B8",
};

function readEnv(key: string): string | undefined {
  try {
    // Vite
    // @ts-ignore
    if (typeof import.meta !== "undefined" && import.meta.env && import.meta.env[key]) {
      // @ts-ignore
      return import.meta.env[key];
    }
  } catch {
    /* not a Vite build */
  }
  // CRA / webpack-based setups
  if (typeof process !== "undefined" && process.env && process.env[key]) {
    return process.env[key];
  }
  return undefined;
}

function getApiKey(): string {
  return readEnv("VITE_GOOGLE_MAPS_API_KEY") || readEnv("REACT_APP_GOOGLE_MAPS_API_KEY") || "";
}

function getMapId(darkMode?: boolean): string {
  if (darkMode) {
    const dark = readEnv("VITE_GOOGLE_MAPS_MAP_ID_DARK") || readEnv("REACT_APP_GOOGLE_MAPS_MAP_ID_DARK");
    if (dark) return dark;
  }
  return readEnv("VITE_GOOGLE_MAPS_MAP_ID") || readEnv("REACT_APP_GOOGLE_MAPS_MAP_ID") || "DEMO_MAP_ID";
}

// Module-level singleton so multiple SmartMap instances (or React StrictMode's
// double-invoke in dev) never inject the script twice.
let scriptLoadingPromise: Promise<void> | null = null;

function loadGoogleMaps(apiKey: string): Promise<void> {
  if (typeof window === "undefined") return Promise.reject(new Error("No window"));
  if (window.google?.maps?.marker) return Promise.resolve();
  if (scriptLoadingPromise) return scriptLoadingPromise;

  scriptLoadingPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector('script[data-smartmap-loader="true"]');
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("Failed to load Google Maps script")));
      return;
    }

    (window as any).__smartMapReady = () => resolve();

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=__smartMapReady&libraries=maps,marker&v=beta&loading=async`;
    script.async = true;
    script.defer = true;
    script.dataset.smartmapLoader = "true";
    script.onerror = () => reject(new Error("Failed to load Google Maps script"));
    document.head.appendChild(script);
  });

  return scriptLoadingPromise;
}

export function SmartMap({
  complaints = [],
  workers = [],
  selectedComplaintId = null,
  onSelectComplaint,
  onSelectWorker,
  heightClass = "h-[400px]",
  center,
  zoom = 12,
  darkMode = false,
  showLegend = true,
}: SmartMapProps) {
  const mapElRef = useRef<GmpMapElement | null>(null);
  const markersRef = useRef<Map<string, MarkerEntry>>(new Map());
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("");

  const apiKey = useMemo(() => getApiKey(), []);
  const mapId = useMemo(() => getMapId(darkMode), [darkMode]);

  const computedCenter = useMemo(() => {
    if (center) return { lat: center[0], lng: center[1] };
    if (complaints.length > 0) {
      const lat = complaints.reduce((s, c) => s + c.latitude, 0) / complaints.length;
      const lng = complaints.reduce((s, c) => s + c.longitude, 0) / complaints.length;
      return { lat, lng };
    }
    return { lat: 19.076, lng: 72.8777 }; // Mumbai fallback
  }, [center, complaints]);

  // Load the script once.
  useEffect(() => {
    if (!apiKey) {
      setStatus("error");
      setErrorMsg(
        "Missing Google Maps API key. Set VITE_GOOGLE_MAPS_API_KEY (Vite) or REACT_APP_GOOGLE_MAPS_API_KEY (CRA) in your .env file."
      );
      return;
    }
    let cancelled = false;
    loadGoogleMaps(apiKey)
      .then(() => customElements.whenDefined("gmp-map"))
      .then(() => {
        if (!cancelled) setStatus("ready");
      })
      .catch((err: Error) => {
        if (!cancelled) {
          setStatus("error");
          setErrorMsg(err.message || "Failed to load Google Maps.");
        }
      });
    return () => {
      cancelled = true;
    };
  }, [apiKey]);

  // Keep the map centered/zoomed when those inputs change after load.
  // NOTE: unlike the JSX attribute below (which takes a "lat,lng" string,
  // parsed once at parse-time), the live JS property requires a real
  // LatLngLiteral object / number — passing a string here throws
  // InvalidValueError at runtime.
  useEffect(() => {
    if (status !== "ready" || !mapElRef.current) return;
    mapElRef.current.center = { lat: computedCenter.lat, lng: computedCenter.lng };
    mapElRef.current.zoom = zoom;
  }, [status, computedCenter, zoom]);

  // Build/update markers whenever complaints, workers, or selection changes.
  useEffect(() => {
    if (status !== "ready" || !mapElRef.current) return;
    const g = window.google;
    if (!g?.maps?.marker) return;
    const innerMap = mapElRef.current.innerMap;
    if (!innerMap) return;

    const nextIds = new Set<string>([
      ...complaints.map((c) => `c-${c.id}`),
      ...workers.map((w) => `w-${w.id}`),
    ]);
    for (const [id, entry] of markersRef.current.entries()) {
      if (!nextIds.has(id)) {
        entry.marker.map = null;
        markersRef.current.delete(id);
      }
    }

    complaints.forEach((c: ComplaintMapItem) => {
      const id = `c-${c.id}`;
      const isSelected = selectedComplaintId === c.id;
      const color = SEVERITY_COLORS[c.severity] || "#64748B";
      let entry = markersRef.current.get(id);

      if (!entry) {
        const pin = new g.maps.marker.PinElement({
          background: color,
          borderColor: "#FFFFFF",
          glyphColor: "#FFFFFF",
        });
        const marker = new g.maps.marker.AdvancedMarkerElement({
          map: innerMap,
          position: { lat: c.latitude, lng: c.longitude },
          content: pin.element,
          title: `${c.id}: ${c.title}`,
        });
        marker.addListener("click", () => onSelectComplaint?.(c.id));
        entry = { marker, pin };
        markersRef.current.set(id, entry);
      } else {
        entry.marker.position = { lat: c.latitude, lng: c.longitude };
        entry.pin.background = color;
      }

      entry.pin.scale = isSelected ? 1.3 : 1;
      entry.pin.element.style.filter = isSelected ? `drop-shadow(0 0 6px ${color})` : "";
      entry.pin.element.style.zIndex = isSelected ? "10" : "1";
    });

    workers.forEach((w: WorkerMapItem) => {
      const id = `w-${w.id}`;
      const color = WORKER_COLORS[w.status] || "#64748B";
      let entry = markersRef.current.get(id);

      if (!entry) {
        const pin = new g.maps.marker.PinElement({
          background: color,
          borderColor: "#FFFFFF",
          glyphColor: "#FFFFFF",
          glyph: "🚚",
          scale: 0.9,
        });
        const marker = new g.maps.marker.AdvancedMarkerElement({
          map: innerMap,
          position: { lat: w.latitude, lng: w.longitude },
          content: pin.element,
          title: `${w.name} (${w.role})`,
        });
        marker.addListener("click", () => onSelectWorker?.(w.id));
        entry = { marker, pin };
        markersRef.current.set(id, entry);
      } else {
        entry.marker.position = { lat: w.latitude, lng: w.longitude };
        entry.pin.background = color;
      }
    });
  }, [status, complaints, workers, selectedComplaintId, onSelectComplaint, onSelectWorker]);

  // Clean up all markers on unmount.
  useEffect(() => {
    return () => {
      markersRef.current.forEach((entry) => {
        entry.marker.map = null;
      });
      markersRef.current.clear();
    };
  }, []);

  if (status === "error") {
    return (
      <div className={`w-full ${heightClass} flex items-center justify-center bg-slate-50 border border-red-200 rounded-2xl`}>
        <div className="text-center px-6">
          <p className="text-sm font-bold text-red-600">Map failed to load</p>
          <p className="text-xs text-slate-500 mt-1 max-w-xs">{errorMsg}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative w-full ${heightClass} rounded-2xl overflow-hidden border border-slate-200 bg-slate-50`}>
      {status === "loading" && (
        <div className="absolute inset-0 z-10 flex items-center justify-center">
          <p className="text-xs font-mono text-slate-400 animate-pulse">Loading map…</p>
        </div>
      )}

      {showLegend && status === "ready" && (
        <div className="absolute top-3 left-3 z-10 bg-white/95 backdrop-blur-md p-3 rounded-xl border border-slate-200 shadow-md text-xs space-y-1.5">
          {(Object.entries(SEVERITY_COLORS) as [ComplaintMapItem["severity"], string][]).map(([label, color]) => (
            <div key={label} className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: color }} />
              <span className="text-slate-600 font-medium">{label}</span>
            </div>
          ))}
        </div>
      )}

      <gmp-map
        ref={mapElRef as any}
        map-id={mapId}
        style={{ width: "100%", height: "100%", display: status === "ready" ? "block" : "none" }}
      />
    </div>
  );
}

export default SmartMap;