// civicfrontend/src/types.ts

export interface AIAnalysis {
  classification: string;
  category: string;
  confidence: number;
  reasoning: string;
  severity: "Low" | "Medium" | "High" | "Critical";
  populationAffected: number;
  delayImpactScore: number;
  budgetRequired: number;
  timeToRepairHours: number;
  priorityScore: number;
  isDuplicate: boolean;
  duplicateGroup: string | null;
}

export interface ComplaintHistoryEntry {
  status: "Pending" | "Assigned" | "Accepted" | "In Progress" | "Resolved";
  updatedAt: string;
  comment: string;
  updatedBy: string;
}

export interface CompletionProof {
  photos: string[];
  completedAt: string;
  comments: string;
}

export interface Complaint {
  id: string;
  title: string;
  description: string;
  category: string;
  status: "Pending" | "Assigned" | "Accepted" | "In Progress" | "Resolved";
  latitude: number;
  longitude: number;
  address: string;
  reportedBy: string;
  reportedAt: string;
  images: string[];
  voiceTranscript: string | null;
  assignedWorkerId: string | null;
  /** Only set on some complaints (e.g. resolved ones). */
  assignedWorkerName?: string;
  completionProof: CompletionProof | null;
  history: ComplaintHistoryEntry[];
  aiAnalysis: AIAnalysis;
}

export interface FieldWorker {
  id: string;
  name: string;
  role: string;
  department: string;
  status: string;
  currentLat: number;
  currentLng: number;
  phone: string;
  avatar: string;
}

export interface Notification {
  id: string;
  role: string;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
}
