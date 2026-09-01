// src/components/maps/PopupCard.tsx
import React from "react";
import type { ComplaintMapItem, WorkerMapItem } from "./types";
import { SEVERITY_COLORS, WORKER_COLORS } from "./constants";

// Rendered as the content of a google.maps.InfoWindow, so this stays a plain,
// self-contained card. Tailwind utility classes handle everything static;
// dynamic colors use inline `style`, since Tailwind's arbitrary-value classes
// need literal strings at build time, not runtime hex values.

interface ComplaintPopupCardProps {
  complaint: ComplaintMapItem;
}

export function ComplaintPopupCard({ complaint }: ComplaintPopupCardProps) {
  const color = SEVERITY_COLORS[complaint.severity] || "#64748B";
  return (
    <div className="min-w-[200px] max-w-[240px] p-0.5 font-sans">
      <div className="flex items-center gap-1.5 mb-1">
        <span className="w-2 h-2 rounded-full inline-block" style={{ background: color }} />
        <span className="text-[10px] font-mono font-bold uppercase text-slate-400">{complaint.id}</span>
      </div>
      <p className="text-[13px] font-semibold text-slate-800 leading-snug mb-1">{complaint.title}</p>
      <div className="text-[11px] text-slate-500 leading-relaxed">
        <div className="truncate">{complaint.address}</div>
        <div className="flex items-center gap-1.5 mt-1">
          <span className="font-bold" style={{ color }}>
            {complaint.severity}
          </span>
          <span>·</span>
          <span>{complaint.department}</span>
        </div>
        {complaint.etaMinutes != null && <div className="mt-0.5">ETA: {complaint.etaMinutes} min</div>}
      </div>
    </div>
  );
}

interface WorkerPopupCardProps {
  worker: WorkerMapItem;
}

export function WorkerPopupCard({ worker }: WorkerPopupCardProps) {
  const color = WORKER_COLORS[worker.status] || "#64748B";
  return (
    <div className="min-w-[180px] p-0.5 font-sans">
      <p className="text-[13px] font-semibold text-slate-800 leading-snug">{worker.name}</p>
      <div className="text-[11px] text-slate-500">{worker.role}</div>
      <span
        className="inline-block mt-1.5 text-[10px] font-bold uppercase text-white px-1.5 py-0.5 rounded"
        style={{ background: color }}
      >
        {worker.status}
      </span>
    </div>
  );
}