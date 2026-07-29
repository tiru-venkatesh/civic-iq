import { ChatMessage } from "../types/chat";

// In-memory store. Fine for a hackathon/demo; swap for Redis/Firestore later
// without touching any other file — just change the implementation here.
const sessions = new Map<string, ChatMessage[]>();

const MAX_HISTORY = 12; // keep last 12 messages (6 turns) per session

export function buildSessionKey(role: string, sessionId: string): string {
  return `${role}:${sessionId}`;
}

export function getHistory(key: string): ChatMessage[] {
  return sessions.get(key) || [];
}

export function appendTurn(key: string, userMessage: string, assistantReply: string): void {
  const history = getHistory(key);
  history.push({ role: "user", content: userMessage });
  history.push({ role: "assistant", content: assistantReply });

  if (history.length > MAX_HISTORY) {
    history.splice(0, history.length - MAX_HISTORY);
  }

  sessions.set(key, history);
}

export function clearSession(key: string): boolean {
  return sessions.delete(key);
}
