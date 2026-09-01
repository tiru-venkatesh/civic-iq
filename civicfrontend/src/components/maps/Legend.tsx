// src/components/maps/Legend.tsx
import React from "react";
import type { ComplaintMapItem } from "./types";
import { SEVERITY_COLORS } from "./constants";

export default function Legend() {
  return (
    <div className="absolute top-3 left-3 z-10 bg-white/95 backdrop-blur-md p-3 rounded-xl border border-slate-200 shadow-md text-xs space-y-1.5">
      {(Object.entries(SEVERITY_COLORS) as [ComplaintMapItem["severity"], string][]).map(([label, color]) => (
        <div key={label} className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: color }} />
          <span className="text-slate-600 font-medium">{label}</span>
        </div>
      ))}
    </div>
  );
}