// src/components/maps/WorkerMarkers.tsx
import React, { useEffect, useRef } from "react";
import { createRoot, type Root } from "react-dom/client";
import type { WorkerMapItem } from "./types";
import { WORKER_COLORS } from "./constants";
import { WorkerPopupCard } from "./PopupCard";

interface WorkerMarkersProps {
  map: any;
  infoWindow: any;
  workers: WorkerMapItem[];
  onSelectWorker?: (id: string) => void;
}

type Entry = {
  marker: any;
  pin: any;
  root: Root | null;
  container: HTMLDivElement | null;
  data: WorkerMapItem;
};

export default function WorkerMarkers({ map, infoWindow, workers, onSelectWorker }: WorkerMarkersProps) {
  const markersRef = useRef<Map<string, Entry>>(new Map());

  useEffect(() => {
    if (!map) return;
    const g = (window as any).google;
    if (!g?.maps?.marker) return;

    const nextIds = new Set(workers.map((w) => w.id));
    for (const [id, entry] of markersRef.current.entries()) {
      if (!nextIds.has(id)) {
        entry.marker.map = null;
        entry.root?.unmount();
        markersRef.current.delete(id);
      }
    }

    workers.forEach((w) => {
      const color = WORKER_COLORS[w.status] || "#64748B";
      let entry = markersRef.current.get(w.id);

      if (!entry) {
        const pin = new g.maps.marker.PinElement({
          background: color,
          borderColor: "#FFFFFF",
          glyphColor: "#FFFFFF",
          glyph: "🚚",
          scale: 0.9,
        });
        const marker = new g.maps.marker.AdvancedMarkerElement({
          map,
          position: { lat: w.latitude, lng: w.longitude },
          content: pin.element,
          title: `${w.name} (${w.role})`,
        });

        entry = { marker, pin, root: null, container: null, data: w };
        markersRef.current.set(w.id, entry);

        marker.addEventListener("gmp-click", () => {
          onSelectWorker?.(w.id);
          if (!infoWindow) return;
          if (!entry!.container) {
            entry!.container = document.createElement("div");
            entry!.root = createRoot(entry!.container);
          }
          entry!.root!.render(<WorkerPopupCard worker={entry!.data} />);
          infoWindow.setContent(entry!.container);
          infoWindow.open({ map, anchor: marker });
        });
      } else {
        entry.marker.position = { lat: w.latitude, lng: w.longitude };
        entry.pin.background = color;
        entry.data = w;
        if (entry.root) entry.root.render(<WorkerPopupCard worker={w} />);
      }
    });
  }, [map, infoWindow, workers, onSelectWorker]);

  useEffect(() => {
    return () => {
      markersRef.current.forEach((entry) => {
        entry.marker.map = null;
        entry.root?.unmount();
      });
      markersRef.current.clear();
    };
  }, []);

  return null;
}