// src/components/maps/ComplaintMarkers.tsx
import React, { useEffect, useRef } from "react";
import { createRoot, type Root } from "react-dom/client";
import type { ComplaintMapItem } from "./types";
import { SEVERITY_COLORS } from "./constants";
import { ComplaintPopupCard } from "./PopupCard";

interface ComplaintMarkersProps {
  /** The underlying google.maps.Map instance — <gmp-map>'s `.innerMap`. */
  map: any;
  /** Shared InfoWindow instance from the parent, so only one popup (of
   *  either marker type) is ever open across the map at once. */
  infoWindow: any;
  complaints: ComplaintMapItem[];
  selectedComplaintId?: string | null;
  onSelectComplaint?: (id: string) => void;
}

type Entry = {
  marker: any;
  pin: any;
  root: Root | null;
  container: HTMLDivElement | null;
  data: ComplaintMapItem;
};

export default function ComplaintMarkers({
  map,
  infoWindow,
  complaints,
  selectedComplaintId = null,
  onSelectComplaint,
}: ComplaintMarkersProps) {
  const markersRef = useRef<Map<string, Entry>>(new Map());

  useEffect(() => {
    if (!map) return;
    const g = (window as any).google;
    if (!g?.maps?.marker) return;

    const nextIds = new Set(complaints.map((c) => c.id));
    for (const [id, entry] of markersRef.current.entries()) {
      if (!nextIds.has(id)) {
        entry.marker.map = null;
        entry.root?.unmount();
        markersRef.current.delete(id);
      }
    }

    complaints.forEach((c) => {
      const isSelected = selectedComplaintId === c.id;
      const color = SEVERITY_COLORS[c.severity] || "#64748B";
      let entry = markersRef.current.get(c.id);

      if (!entry) {
        const pin = new g.maps.marker.PinElement({
          background: color,
          borderColor: "#FFFFFF",
          glyphColor: "#FFFFFF",
        });
        const marker = new g.maps.marker.AdvancedMarkerElement({
          map,
          position: { lat: c.latitude, lng: c.longitude },
          content: pin.element,
          title: `${c.id}: ${c.title}`,
        });

        entry = { marker, pin, root: null, container: null, data: c };
        markersRef.current.set(c.id, entry);

        // The popup's React root is created lazily on first click, not up
        // front — most markers on a busy map never get clicked in a session.
        marker.addEventListener("gmp-click", () => {
          onSelectComplaint?.(c.id);
          if (!infoWindow) return;
          if (!entry!.container) {
            entry!.container = document.createElement("div");
            entry!.root = createRoot(entry!.container);
          }
          entry!.root!.render(<ComplaintPopupCard complaint={entry!.data} />);
          infoWindow.setContent(entry!.container);
          infoWindow.open({ map, anchor: marker });
        });
      } else {
        entry.marker.position = { lat: c.latitude, lng: c.longitude };
        entry.pin.background = color;
        entry.data = c;
        // If this marker's popup is already open, keep its content current
        // (e.g. status or ETA changed while the InfoWindow was showing).
        if (entry.root) entry.root.render(<ComplaintPopupCard complaint={c} />);
      }

      entry.pin.scale = isSelected ? 1.3 : 1;
      entry.pin.element.style.filter = isSelected ? `drop-shadow(0 0 6px ${color})` : "";
      entry.pin.element.style.zIndex = isSelected ? "10" : "1";
    });
  }, [map, infoWindow, complaints, selectedComplaintId, onSelectComplaint]);

  // Clean up all markers + popup roots on unmount.
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