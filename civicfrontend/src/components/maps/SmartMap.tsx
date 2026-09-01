// src/components/maps/SmartMap.tsx
//
// Setup:
// 1. No npm install needed for Maps itself — the script is injected at runtime.
// 2. .env: GOOGLE_MAPS_API_KEY=... (or REACT_APP_GOOGLE_MAPS_API_KEY=... for CRA)
// 3. Optional but recommended for production: VITE_GOOGLE_MAPS_MAP_ID=... (create one
//    in Cloud Console → Map Management). Without it, markers fall back to DEMO_MAP_ID,
//    which works fine for testing but is not meant for production traffic.

import React, { useEffect, useMemo, useRef, useState } from "react";
import type { SmartMapProps } from "./types";
import { getApiKey, getMapId, loadGoogleMaps } from "./utils";
import ComplaintMarkers from "./ComplaintMarkers";
import WorkerMarkers from "./WorkerMarkers";
import Legend from "./Legend";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "gmp-map": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        "map-id"?: string;
      };
    }
  }
}

interface GmpMapElement extends HTMLElement {
  innerMap: any;
  // The `center`/`zoom` *properties* (as opposed to the HTML attributes) need
  // typed values, not strings — a LatLngLiteral object and a number.
  center: { lat: number; lng: number } | null;
  zoom: number;
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
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("");
  // Populated once <gmp-map> has upgraded and exposes its real google.maps.Map
  // instance + a shared InfoWindow — the two marker components below wait on
  // both before they ever touch the map.
  const [innerMap, setInnerMap] = useState<any>(null);
  const [infoWindow, setInfoWindow] = useState<any>(null);

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
        "Missing Google Maps API key. Set GOOGLE_MAPS_API_KEY (Vite) or REACT_APP_GOOGLE_MAPS_API_KEY (CRA) in your .env file."
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

  // Keep the map centered/zoomed when those inputs change after load, and
  // pick up the element's real Map instance once it exists.
  //
  // IMPORTANT: center/zoom are only ever set here, imperatively, after the
  // element is confirmed upgraded — never as JSX attributes on <gmp-map>
  // below. Passing them as JSX props (center={...} / zoom={...}) crashes once
  // the element upgrades: React switches from setAttribute to a direct
  // property assignment, and the real setter only accepts a typed
  // {lat, lng} object / number, not the attribute string.
  useEffect(() => {
    if (status !== "ready" || !mapElRef.current) return;
    mapElRef.current.center = { lat: computedCenter.lat, lng: computedCenter.lng };
    mapElRef.current.zoom = zoom;
    setInnerMap(mapElRef.current.innerMap || null);
  }, [status, computedCenter, zoom]);

  // Create the single shared InfoWindow once the real Map instance exists.
  useEffect(() => {
    if (!innerMap) return;
    const g = (window as any).google;
    if (!g?.maps) return;
    setInfoWindow(new g.maps.InfoWindow());
  }, [innerMap]);

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

      {showLegend && status === "ready" && <Legend />}

      <gmp-map
        ref={mapElRef as any}
        map-id={mapId}
        style={{ width: "100%", height: "100%", display: status === "ready" ? "block" : "none" }}
      />

      {innerMap && infoWindow && (
        <>
          <ComplaintMarkers
            map={innerMap}
            infoWindow={infoWindow}
            complaints={complaints}
            selectedComplaintId={selectedComplaintId}
            onSelectComplaint={onSelectComplaint}
          />
          <WorkerMarkers map={innerMap} infoWindow={infoWindow} workers={workers} onSelectWorker={onSelectWorker} />
        </>
      )}
    </div>
  );
}

export default SmartMap;
