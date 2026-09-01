// src/services/hazardDetection.ts
import Groq from "groq-sdk";
import type { HazardAnalysis } from "../types/upload";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Vision-capable Groq model. Must support multimodal `content` arrays
// (text + image_url parts) — text-only/reasoning models like the gpt-oss
// family will reject that shape with "content must be a string".
// Check https://console.groq.com/docs/vision for current options before
// changing this.
const VISION_MODEL = "qwen/qwen3.6-27b";

export async function analyzeHazardImage(
  imageUrl: string,
  category: string
): Promise<HazardAnalysis> {
  const completion = await groq.chat.completions.create({
    model: VISION_MODEL,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `You are a municipal hazard-detection AI. Analyze this civic issue photo (reported category: "${category}"). Respond ONLY with strict JSON, no markdown, matching exactly this shape:
{"detectedProblem": string, "severity": "Low"|"Medium"|"High", "confidence": number (0-100), "reasoning": string, "estimatedRepairHours": number, "priorityScore": number (0-100), "estimatedBudgetINR": number}`,
          },
          { type: "image_url", image_url: { url: imageUrl } },
        ],
      },
    ],
    temperature: 0.3,
    max_tokens: 2000,
  });

  const raw = completion.choices[0]?.message?.content || "{}";

  // Strip <think>...</think> reasoning blocks (handles both closed and
  // unclosed tags — some reasoning models get cut off mid-thought if
  // max_tokens is hit before they reach the actual JSON answer).
  let cleaned = raw
    .replace(/<think>[\s\S]*?<\/think>/g, "")
    .replace(/<think>[\s\S]*/g, "")
    .replace(/```json|```/g, "")
    .trim();

  // Fallback safety net: if any stray text remains before/after the JSON
  // object, extract just the {...} portion.
  const jsonStart = cleaned.indexOf("{");
  const jsonEnd = cleaned.lastIndexOf("}");
  if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
    cleaned = cleaned.substring(jsonStart, jsonEnd + 1);
  }

  try {
    return JSON.parse(cleaned) as HazardAnalysis;
  } catch (parseErr) {
    console.error("Failed to parse Groq JSON response. Raw content:", raw);
    throw parseErr;
  }
}
