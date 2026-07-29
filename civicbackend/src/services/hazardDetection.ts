// src/services/hazardDetection.ts
// NOTE: If services/groq.ts already exports a configured Groq client (e.g. `export const groq = new Groq(...)`),
// delete the client setup below and instead do: import { groq } from "./groq";

import Groq from "groq-sdk";
import { HazardAnalysis } from "../types/upload";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const SYSTEM_PROMPT = `You are a civic hazard detection AI for a municipal reporting system.
Analyze the image and respond ONLY with valid JSON, no markdown, no preamble, in this exact shape:
{
  "detectedProblem": string,       // e.g. "Pothole & Road Damage", "Garbage Overflow", "Broken Streetlight"
  "severity": "Low" | "Medium" | "High",
  "confidence": number,            // 0-100
  "reasoning": string,             // 1-2 sentences, why AI picked this
  "estimatedRepairHours": number,
  "priorityScore": number,         // 0-100
  "estimatedBudgetINR": number
}`;

export async function analyzeHazardImage(imageUrl: string): Promise<HazardAnalysis> {
  const completion = await groq.chat.completions.create({
    model: "qwen/qwen3.6-27b", // current Groq vision model (preview). llama-4-scout deprecated June 2026.
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: [
          { type: "text", text: "Analyze this civic issue photo and return the JSON." },
          { type: "image_url", image_url: { url: imageUrl } },
        ],
      },
    ] as any, // groq-sdk types lag behind vision message shape; cast keeps build green
    temperature: 0.2,
    max_tokens: 500,
  });

  const raw = completion.choices[0]?.message?.content?.trim() ?? "";
  const cleaned = raw.replace(/```json|```/g, "").trim();

  try {
    return JSON.parse(cleaned) as HazardAnalysis;
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]) as HazardAnalysis;
    throw new Error("AI response was not valid JSON: " + raw);
  }
}