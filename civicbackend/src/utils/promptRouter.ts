import { SYSTEM_PROMPTS, SystemPromptRole } from "../prompts";

// Maps the frontend's older `chatbotType` values ("assistant" / "intelligence")
// onto the newer 7-role system, so existing frontend code keeps working
// while new code can send `role` directly.
const LEGACY_CHATBOT_TYPE_MAP: Record<string, SystemPromptRole> = {
  assistant: "citizen",
  intelligence: "commissioner",
};

export function getPrompt(role?: string, chatbotType?: string): string {
  if (role && role in SYSTEM_PROMPTS) {
    return SYSTEM_PROMPTS[role as SystemPromptRole];
  }

  if (chatbotType && LEGACY_CHATBOT_TYPE_MAP[chatbotType]) {
    return SYSTEM_PROMPTS[LEGACY_CHATBOT_TYPE_MAP[chatbotType]];
  }

  return SYSTEM_PROMPTS.citizen;
}
