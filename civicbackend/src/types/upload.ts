// src/types/upload.ts

export type Severity = "Low" | "Medium" | "High";

export interface HazardAnalysis {
  detectedProblem: string;
  severity: Severity;
  confidence: number; // 0-100
  reasoning: string;
  estimatedRepairHours: number;
  priorityScore: number; // 0-100
  estimatedBudgetINR: number;
}

export interface UploadedImageMeta {
  url: string;
  publicId: string;
  width: number;
  height: number;
  sizeBytes: number;
  fileName: string;
}

export interface UploadAnalysisResponse {
  success: boolean;
  complaintId: string;
  image: UploadedImageMeta;
  analysis: HazardAnalysis;
}