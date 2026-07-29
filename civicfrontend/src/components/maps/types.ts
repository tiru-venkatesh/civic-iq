// src/components/smart-map/types.ts

export type ComplaintSeverity = "Critical" | "High" | "Medium" | "Resolved";

export interface ComplaintMapItem {
  id: string;
  title: string;
  category: string;
  severity: ComplaintSeverity;
  priorityScore: number; // 0-100
  latitude: number;
  longitude: number;
  address: string;
  department: string;
  etaMinutes?: number | null;
  status: string;
  image?: string | null;
}

export interface WorkerMapItem {
  id: string;
  name: string;
  role: string;
  latitude: number;
  longitude: number;
  status: "Available" | "En Route" | "On Site" | "Offline";
  assignedComplaintId?: string | null;
}

export interface SmartMapProps {
  complaints: ComplaintMapItem[];
  workers?: WorkerMapItem[];
  selectedComplaintId?: string | null;
  onSelectComplaint?: (id: string) => void;
  onSelectWorker?: (id: string) => void;
  heightClass?: string;
  center?: [number, number];
  zoom?: number;
  darkMode?: boolean;
  showLegend?: boolean;
}
