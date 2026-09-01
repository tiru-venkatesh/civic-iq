// src/components/maps/constants.ts
import type { ComplaintMapItem } from "./types";

export const SEVERITY_COLORS: Record<ComplaintMapItem["severity"], string> = {
  Critical: "#EF4444",
  High: "#F97316",
  Medium: "#F59E0B",
  Resolved: "#10B981",
};

export const WORKER_COLORS: Record<string, string> = {
  Available: "#10B981",
  "En Route": "#2563EB",
  "On Site": "#1565C0",
  Offline: "#94A3B8",
};