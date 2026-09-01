export type ChatRole = "system" | "user" | "assistant";

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

export type CopilotRole =
  | "citizen"
  | "mayor"
  | "commissioner"
  | "field"
  | "analytics"
  | "policy"
  | "emergency";

export interface ChatRequestBody {
  role?: CopilotRole;
  message: string;
  sessionId?: string;
  context?: Record<string, unknown>;
  // legacy field some frontend code still sends — treated the same as `role`
  chatbotType?: string;
}
