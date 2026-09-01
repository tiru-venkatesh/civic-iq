// src/types/complaint.ts
// Backend-side mirror of civicfrontend's Complaint type
// (civicfrontend/src/types.ts) — only the fields the backend needs,
// plus `embedding`, which the backend adds for similarity search.
// Keep in sync manually if the frontend shape changes.

export interface AIAnalysis {
  classification: string;
  category: string;
  severity: "Low" | "Medium" | "High" | "Critical";
  priorityScore: number;
  isDuplicate: boolean;
  duplicateGroup: string | null;
}

export interface StoredComplaint {
  id: string;
  title: string;
  description: string;
  category: string;
  status: "Pending" | "Assigned" | "Accepted" | "In Progress" | "Resolved";
  latitude: number;
  longitude: number;
  address: string;
  aiAnalysis?: AIAnalysis;
  /** Set by storeComplaintEmbedding(); absent until then. */
  embedding?: number[];
}

export interface SimilarComplaintMatch {
  complaint: StoredComplaint;
  /** Cosine similarity, 0–1. */
  similarity: number;
}
