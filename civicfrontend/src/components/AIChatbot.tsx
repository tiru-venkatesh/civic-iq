/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  MessageSquare,
  X,
  Send,
  Bot,
  ShieldAlert
} from "lucide-react";
import Markdown from "react-markdown";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  isError?: boolean;
}

interface AIChatbotProps {
  mode?: "embedded" | "floating";
  activeRole?: "landing" | "admin" | "citizen" | "worker" | "docs";
}

// Base URL of the civicbackend Express server (single Gemini backend, 7 role prompts).
// Set VITE_BACKEND_URL (Vite) or NEXT_PUBLIC_BACKEND_URL (Next.js) in your frontend .env
// to the deployed backend URL, e.g. https://civicbackend.onrender.com
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "https://civic-iq.onrender.com"; // Default to localhost for local dev

// Maps this component's UI-facing "activeRole" to the backend's AI role/prompt.
const ROLE_MAP: Record<NonNullable<AIChatbotProps["activeRole"]>, string> = {
  landing: "citizen",
  citizen: "citizen",
  admin: "commissioner",
  worker: "field",
  docs: "policy"
};

// Stable per-browser id so the backend can namespace chat history per role
// (e.g. "citizen-<id>", "field-<id>") without mixing conversations together.
function getClientId(): string {
  const key = "civicai_client_id";
  let id = window.localStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    window.localStorage.setItem(key, id);
  }
  return id;
}

export default function AIChatbot({ mode = "floating", activeRole = "landing" }: AIChatbotProps) {
  const [isOpen, setIsOpen] = useState(mode === "embedded");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hello! I am the CIVIC-AI Support Assistant. Ask me anything about our smart city triage map, duplicate checking, active dispatch work orders, or how to report an incident.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Keep open if embedded
  useEffect(() => {
    if (mode === "embedded") {
      setIsOpen(true);
    }
  }, [mode]);

  // Handle scroll tracking for floating launcher trigger and embedded hiding on landing page
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    const userMsgId = `msg-user-${Date.now()}`;
    const newUserMessage: Message = {
      id: userMsgId,
      role: "user",
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, newUserMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      const backendRole = ROLE_MAP[activeRole] ?? "citizen";
      const clientId = getClientId();

      // Calls the civicbackend Express server directly. The backend keeps its
      // own per-role, per-client conversation history server-side (namespaced
      // as `${role}-${clientId}`), so we don't need to resend chat history here.
      const response = await fetch(`${BACKEND_URL}/api/copilot/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          role: backendRole,
          message: textToSend,
          sessionId: clientId
        })
      });

      if (!response.ok) {
        throw new Error(`Server returned HTTP status ${response.status}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Backend returned an error");
      }

      const assistantMessage: Message = {
        id: `msg-ai-${Date.now()}`,
        role: "assistant",
        content: data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error: any) {
      console.warn("Could not retrieve live Gemini response. Switching to rule-based fallback assistant.", error);

      let fallbackText = "I'm currently running in emergency backup mode due to network status, but I can help you with system guidelines:\n\n";
      const query = textToSend.toLowerCase();

      if (query.includes("duplicate") || query.includes("ciq-2026-006")) {
        fallbackText += "• **Duplicate Resolution**: If two reports are within 20 meters and have matching categories, the system automatically flags the second as a duplicate (like *CIQ-2026-006* merged under *CIQ-2026-001*). This ensures we do not double-book crews or waste budget assets.";
      } else if (query.includes("sinkhole") || query.includes("ciq-2026-001") || query.includes("broadway")) {
        fallbackText += "• **Active Sinkhole (CIQ-2026-001)**: This is a **Critical** severity report located at 640 Broadway. It has a priority score of **96/100** and has been assigned to Senior Civil Engineer **Marcus Vance** (Department of Transportation).";
      } else if (query.includes("crew") || query.includes("worker") || query.includes("roster") || query.includes("marcus")) {
        fallbackText += "• **Technician Roster**:\n  - **Marcus Vance** (Senior Civil Engineer, DOT): Currently active on Broadway repairing the sinkhole risk.\n  - **Elena Rostova** (Hydrological Technician): Available for dispatch.\n  - **Darnell Jackson** (Electrical Inspector): Active at Canal St repairing dead traffic lights.\n  - **Siddharth Mehta** (Sanitation Expert): Available (recently cleared a biohazard alleyway at Union Square).";
      } else if (query.includes("govllm") || query.includes("model") || query.includes("triage")) {
        fallbackText += "• **GovLLM Triage Engine**: This model parses citizen transcripts, text descriptions, and photos to automatically categorize issues, estimate budget/repair hours, and generate a final Priority score based on population affected and public safety hazard variables.";
      } else {
        fallbackText += "• **General Inquiries**: CIVIC-AI is a secure decision platform linking Citizens, Administrators, and Field Crews together. You can log complaints via the **Citizen App**, monitor dispatches from the **Admin Dashboard**, and perform repairs in the **Field Crew App**.";
      }

      fallbackText += "\n\n*Note: To enable live AI responses, please verify the backend is running and reachable, and that Gemini_API_KEY is configured on the server.*";

      const fallbackMsg: Message = {
        id: `msg-fallback-${Date.now()}`,
        role: "assistant",
        content: fallbackText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isError: true
      };

      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  // Render logic depending on Embedded or Floating Mode
  if (mode === "embedded") {
    if (scrollY > 500) {
      return (
        <div className="w-full h-[520px] bg-slate-50 border border-slate-200/50 rounded-2xl flex flex-col items-center justify-center p-6 text-center text-slate-400 font-sans shadow-inner transition-all duration-500 opacity-50 scale-95" id="civic-chatbot-embedded-hidden">
          <Bot className="h-10 w-10 text-slate-300 mb-2 animate-pulse" />
          <p className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">Copilot Docked</p>
          <p className="text-[11px] text-slate-400 mt-1 max-w-xs">Use the "Ask CIVIC-AI" floating launcher in the bottom right corner of the screen.</p>
        </div>
      );
    }

    return (
      <div className="w-full h-[520px] bg-white rounded-2xl border border-slate-200/80 shadow-xl flex flex-col overflow-hidden" id="civic-chatbot-embedded">
        {/* Header with clear Status Indicator */}
        <div className="bg-[#1565C0] bg-gradient-to-r from-[#1565C0] to-[#0D47A1] p-4 text-white flex items-center justify-between shadow-sm shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-white/15 rounded-lg flex items-center justify-center border border-white/10 shrink-0">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-display font-bold tracking-tight block">CIVIC-AI Copilot</h4>
                
              </div>
              <p className="text-[10px] text-blue-100 font-mono font-medium mt-0.5">Gemini Llama Model Active</p>
            </div>
          </div>
        </div>

        {/* Message List */}
        <div className="flex-1 overflow-y-auto p-4 bg-slate-50 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div className={`max-w-[85%] flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}>
                <div
                  className={`px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed ${
                    msg.role === "user"
                      ? "bg-[#1565C0] text-white rounded-br-none"
                      : msg.isError
                      ? "bg-amber-50 text-slate-800 border border-amber-200/80 rounded-bl-none"
                      : "bg-white text-slate-800 border border-slate-200/60 shadow-xs rounded-bl-none"
                  }`}
                >
                  {msg.isError && (
                    <div className="flex items-center gap-1.5 text-amber-700 font-bold mb-1.5 font-mono text-[10px]">
                      <ShieldAlert className="h-3.5 w-3.5 shrink-0" />
                      <span>MUNICIPAL BACKUP MODE</span>
                    </div>
                  )}
                  {msg.role === "assistant" ? (
                    <div className="markdown-body text-xs">
                      <Markdown>{msg.content}</Markdown>
                    </div>
                  ) : (
                    <p className="whitespace-pre-line">{msg.content}</p>
                  )}
                </div>
                <span className="text-[9px] text-slate-400 mt-1 font-mono tracking-tight block">
                  {msg.timestamp}
                </span>
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white border border-slate-200/60 shadow-xs px-3.5 py-2.5 rounded-2xl rounded-bl-none flex items-center gap-1.5">
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage(inputValue);
          }}
          className="p-3 bg-white border-t border-slate-200 flex gap-2 shrink-0 animate-fade-in"
        >
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask about active dispatches, duplicate checks..."
            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#1565C0]/30 focus:bg-white text-slate-800 transition-all"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            className="bg-[#1565C0] hover:bg-[#0D47A1] text-white p-2.5 rounded-xl transition-all shadow-xs flex items-center justify-center disabled:opacity-40 disabled:hover:bg-[#1565C0] focus:ring-4 focus:ring-blue-500/20 cursor-pointer"
            id="send-chatbot-msg-btn-embedded"
          >
            <Send className="h-3.5 w-3.5" />
          </button>
        </form>
      </div>
    );
  }

  // FLOATING MODE
  // Only render launcher if scrolled > 500 on landing page, or always if inside secondary views (admin, citizen, worker)
  const shouldDisplayFloating = activeRole !== "landing" || scrollY > 500;

  if (!shouldDisplayFloating) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans" id="civic-chatbot-floating-wrapper">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="mb-4 w-[380px] sm:w-[420px] h-[550px] bg-white rounded-2xl border border-slate-200 shadow-2xl flex flex-col overflow-hidden"
            id="civic-chatbot-panel"
          >
            {/* Header */}
            <div className="bg-[#1565C0] bg-gradient-to-r from-[#1565C0] to-[#0D47A1] p-4 text-white flex items-center justify-between shadow-sm shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 bg-white/15 rounded-lg flex items-center justify-center border border-white/10 shrink-0">
                  <Bot className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-sm font-display font-bold tracking-tight block">CIVIC-AI Copilot</h4>
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
                  </div>
                  <p className="text-[10px] text-blue-100 font-mono font-medium">Gemini Llama Model Active</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/15 transition-colors focus:outline-none focus:ring-2 focus:ring-white/30"
                id="close-chatbot-btn"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Message List */}
            <div className="flex-1 overflow-y-auto p-4 bg-slate-50 space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div className={`max-w-[85%] flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}>
                    <div
                      className={`px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed ${
                        msg.role === "user"
                          ? "bg-[#1565C0] text-white rounded-br-none"
                          : msg.isError
                          ? "bg-amber-50 text-slate-800 border border-amber-200/80 rounded-bl-none"
                          : "bg-white text-slate-800 border border-slate-200/60 shadow-xs rounded-bl-none"
                      }`}
                    >
                      {msg.isError && (
                        <div className="flex items-center gap-1.5 text-amber-700 font-bold mb-1.5 font-mono text-[10px]">
                          <ShieldAlert className="h-3.5 w-3.5 shrink-0" />
                          <span>MUNICIPAL BACKUP MODE</span>
                        </div>
                      )}
                      {msg.role === "assistant" ? (
                        <div className="markdown-body text-xs">
                          <Markdown>{msg.content}</Markdown>
                        </div>
                      ) : (
                        <p className="whitespace-pre-line">{msg.content}</p>
                      )}
                    </div>
                    <span className="text-[9px] text-slate-400 mt-1 font-mono tracking-tight block">
                      {msg.timestamp}
                    </span>
                  </div>
                </div>
              ))}

              {/* Typing Indicator */}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-slate-200/60 shadow-xs px-3.5 py-2.5 rounded-2xl rounded-bl-none flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage(inputValue);
              }}
              className="p-3 bg-white border-t border-slate-200 flex gap-2 shrink-0"
            >
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask about active dispatches, duplicate checks..."
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#1565C0]/30 focus:bg-white text-slate-800 transition-all"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || isLoading}
                className="bg-[#1565C0] hover:bg-[#0D47A1] text-white p-2.5 rounded-xl transition-all shadow-xs flex items-center justify-center disabled:opacity-40 disabled:hover:bg-[#1565C0] focus:ring-4 focus:ring-blue-500/20 cursor-pointer"
                id="send-chatbot-msg-btn-floating"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Button (Launcher) */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="bg-gradient-to-r from-[#1565C0] to-[#0D47A1] hover:from-[#1976D2] hover:to-[#1565C0] text-white px-4 py-3 rounded-full shadow-2xl flex items-center gap-2.5 border border-white/10 group focus:outline-none focus:ring-4 focus:ring-blue-500/40 relative"
        id="toggle-chatbot-btn"
      >
        {/* Pulsing visual alert for chatbot availability */}
        <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full">
          <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping"></span>
        </span>

        {isOpen ? (
          <>
            <X className="h-5 w-5 rotate-0" />
            <span className="text-xs font-display font-bold">Close Copilot</span>
          </>
        ) : (
          <>
            <div className="relative">
              <MessageSquare className="h-5 w-5 shrink-0 block group-hover:scale-110 transition-transform" />
            </div>
            <span className="text-xs font-display font-bold tracking-tight">Ask CIVIC-AI</span>
          </>
        )}
      </motion.button>
    </div>
  );
}
