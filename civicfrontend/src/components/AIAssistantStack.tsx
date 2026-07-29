/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Send,
  Bot,
  Brain,
  Trash2,
  Copy,
  Check,
  X,
  Mic,
  Volume2,
  VolumeX
} from "lucide-react";
import Markdown from "react-markdown";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  isError?: boolean;
}

export type ChatMode = "assistant" | "advisor";
export default function AIAssistantStack() {
  const [activeMode, setActiveMode] = useState<ChatMode>("assistant");
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isSpeechEnabled, setIsSpeechEnabled] = useState(false);
  const [isListening, setIsListening] = useState(false);

  // Assistant Mode Chat State
  const [assistMessages, setAssistMessages] = useState<Message[]>([
    {
      id: "welcome-1",
      role: "assistant",
      content: "Hello! I'm your **Civic Assistant**. How can I help you report an issue, track a ticket, or navigate the portal today?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [assistInput, setAssistInput] = useState("");
  const [assistLoading, setAssistLoading] = useState(false);
  const rawBackendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:3001";
  const API_BASE_URL = rawBackendUrl.startsWith("http") ? rawBackendUrl : `http://${rawBackendUrl}`;
  // AI Advisor Mode Chat State
  const [advisorMessages, setAdvisorMessages] = useState<Message[]>([
    {
      id: "welcome-2",
      role: "assistant",
      content: "Hello Officer! I'm here to help you understand ticket priority scores, weather risk alerts, duplicate report merging, and crew dispatches. How can I assist you?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [advisorInput, setAdvisorInput] = useState("");
  const [advisorLoading, setAdvisorLoading] = useState(false);

  // Copied text tooltip state
  const [copiedId, setCopiedId] = useState<string | null>(null);


  // Voice Output (Text-to-Speech)
  const speakText = (text: string) => {
    if (!isSpeechEnabled || !("speechSynthesis" in window)) return;
    try {
      window.speechSynthesis.cancel();
      const cleanText = text.replace(/[*_#`~•-]/g, " ").trim();
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 1.0;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn("Speech synthesis error:", e);
    }
  };

  // Voice Input (Speech Dictation)
  const handleVoiceDictation = () => {
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      if (isListening) {
        setIsListening(false);
      } else {
        setIsListening(true);
        setTimeout(() => {
          const simulatedSpeech = activeMode === "assistant"
            ? "How do I submit a new complaint on this platform?"
            : "Why is the Broadway sinkhole marked as critical?";
          if (activeMode === "assistant") setAssistInput(simulatedSpeech);
          else setAdvisorInput(simulatedSpeech);
          setIsListening(false);
        }, 1800);
      }
      return;
    }

    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = "en-IN";
      recognition.interimResults = false;

      if (isListening) {
        setIsListening(false);
        return;
      }

      setIsListening(true);
      recognition.start();

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (activeMode === "assistant") setAssistInput(transcript);
        else setAdvisorInput(transcript);
        setIsListening(false);
      };

      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
    } catch (e) {
      setIsListening(false);
    }
  };

  // Handle Assistant Send (Groq-backed via /api/chat, chatbotType: "assistant")
  const handleSendAssist = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    const userMessage: Message = {
      id: `assist-usr-${Date.now()}`,
      role: "user",
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setAssistMessages((prev) => [...prev, userMessage]);
    setAssistInput("");
    setAssistLoading(true);

    try {
      const history = assistMessages
        .slice(-4)
        .filter((m) => !m.id.startsWith("welcome") && !m.isError)
        .map((m) => ({ role: m.role, content: m.content }));

      const response = await fetch(`${API_BASE_URL}/api/copilot/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend,
          history,
          chatbotType: "assistant"
        })
      });

      if (!response.ok) throw new Error("Server error");
      const data = await response.json();

      setAssistMessages((prev) => [
        ...prev,
        {
          id: `assist-ai-${Date.now()}`,
          role: "assistant",
          content: data.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      speakText(data.reply);
    } catch (err) {
      console.warn("Groq request failed, using fallback response.", err);

      let fallbackText = "I'm running in backup mode right now, but here's general guidance:\n\n";
      const q = textToSend.toLowerCase();

      if (q.includes("submit") || q.includes("complaint") || q.includes("report")) {
        fallbackText += "• **Submitting a Complaint**: Go to the **Citizen Portal** tab, upload a photo or record a voice note, describe the issue, pin the location on the map, and submit.";
      } else if (q.includes("track") || q.includes("status")) {
        fallbackText += "• **Tracking Status**: Check **Your Reported Issues** on the Citizen Portal — each ticket shows live status: *Pending*, *In Progress*, or *Resolved*.";
      } else if (q.includes("language") || q.includes("hindi")) {
        fallbackText += "• **Language Switcher**: Use the **Language** toggle in the top navigation bar to switch between English and Hindi.";
      } else if (q.includes("contact") || q.includes("support") || q.includes("helpline")) {
        fallbackText += "• **BMC Helpline**: For emergencies call **1916** (Civic Control Room) or **112** (Emergency Services).";
      } else {
        fallbackText += "• **Civic-IQ Help**: Ask me how to report issues, track tickets, switch languages, or understand priority rankings.";
      }

      setAssistMessages((prev) => [
        ...prev,
        {
          id: `assist-fb-${Date.now()}`,
          role: "assistant",
          content: fallbackText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      speakText(fallbackText);
    } finally {
      setAssistLoading(false);
    }
  };

  // Handle Advisor Send (Groq-backed via /api/chat, chatbotType: "intelligence")
  const handleSendAdvisor = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    const userMessage: Message = {
      id: `advisor-usr-${Date.now()}`,
      role: "user",
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setAdvisorMessages((prev) => [...prev, userMessage]);
    setAdvisorInput("");
    setAdvisorLoading(true);

    try {
      const history = advisorMessages
        .slice(-4)
        .filter((m) => !m.id.startsWith("welcome") && !m.isError)
        .map((m) => ({ role: m.role, content: m.content }));

      const response = await fetch(`${API_BASE_URL}/api/copilot/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend,
          history,
          chatbotType: "intelligence"
        })
      });

      if (!response.ok) throw new Error("Server error");
      const data = await response.json();

      setAdvisorMessages((prev) => [
        ...prev,
        {
          id: `advisor-ai-${Date.now()}`,
          role: "assistant",
          content: data.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      speakText(data.reply);
    } catch (err) {
      console.warn("Groq request failed, using fallback response.", err);

      let fallbackText = "Running in backup mode, but here's what municipal records show:\n\n";
      const q = textToSend.toLowerCase();

      if (q.includes("priority") || q.includes("score") || q.includes("critical") || q.includes("broadway")) {
        fallbackText += "• **Priority Formula**: `(Severity × 0.40) + (Population Affected × 0.25) + (Delay Impact × 0.20) + (Weather Risk × 0.15)`. Critical tickets like the Broadway sinkhole (96/100) rank highest due to structural collapse risk.";
      } else if (q.includes("duplicate") || q.includes("merge")) {
        fallbackText += "• **Duplicate Detection**: Reports within 20 meters and matching category are merged into a single master ticket.";
      } else if (q.includes("weather") || q.includes("rain") || q.includes("flood")) {
        fallbackText += "• **Weather Escalation**: Active severe-weather alerts add up to **+40 points** to drainage and road-collapse complaints.";
      } else if (q.includes("worker") || q.includes("assign")) {
        fallbackText += "• **Worker Assignment**: The system weighs technician skill tags, proximity, and current workload to pick the best crew member.";
      } else {
        fallbackText += "• **AI Advisor**: Ask about triage scoring, duplicate clustering, weather escalation, or crew assignment logic.";
      }

      setAdvisorMessages((prev) => [
        ...prev,
        {
          id: `advisor-fb-${Date.now()}`,
          role: "assistant",
          content: fallbackText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      speakText(fallbackText);
    } finally {
      setAdvisorLoading(false);
    }
  };

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handleClearHistory = () => {
    if (activeMode === "assistant") {
      setAssistMessages([
        {
          id: "welcome-1",
          role: "assistant",
          content: "Hello! I am your **Civic Assistant**. How can I help you navigate the portal or file a complaint today?",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } else {
      setAdvisorMessages([
        {
          id: "welcome-2",
          role: "assistant",
          content: "Hello Officer! I am your **Civic AI Advisor**. Ask me for priority breakdowns, risk forecasts, duplicate detection audits, or worker assignment logic.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
  };

  const currentMessages = activeMode === "assistant" ? assistMessages : advisorMessages;
  const currentLoading = activeMode === "assistant" ? assistLoading : advisorLoading;
  const currentInput = activeMode === "assistant" ? assistInput : advisorInput;

  // Main UI Chat Window Content
  const renderChatContent = () => (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden font-sans">

      {/* 1. Header & Mode Segmented Switch */}
      <div className="bg-slate-50/80 p-3.5 border-b border-slate-200/80 space-y-3 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gov-blue/10 text-gov-blue flex items-center justify-center border border-gov-blue/20">
              <Bot className="h-4.5 w-4.5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-bold text-slate-900 tracking-tight font-display">
                  Civic AI
                </h3>
                <span className="text-[9px] font-mono uppercase bg-emerald-50 text-emerald-700 font-bold px-1.5 py-0.5 rounded border border-emerald-200/60 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                  <span>Online</span>
                </span>
              </div>
              <p className="text-[10px] text-slate-500">
                {activeMode === "assistant" ? "Citizen & Portal Assistant" : "Officer AI Governance Advisor"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => {
                const nextState = !isSpeechEnabled;
                setIsSpeechEnabled(nextState);
                if (!nextState && "speechSynthesis" in window) {
                  window.speechSynthesis.cancel();
                }
              }}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                isSpeechEnabled
                  ? "bg-gov-blue/10 text-gov-blue font-bold border border-gov-blue/20"
                  : "text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              }`}
              title={isSpeechEnabled ? "Voice output enabled" : "Enable voice output"}
            >
              {isSpeechEnabled ? <Volume2 className="h-3.5 w-3.5 text-gov-blue" /> : <VolumeX className="h-3.5 w-3.5" />}
            </button>
            <button
              onClick={handleClearHistory}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              title="Clear chat history"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
            {isMobileOpen && (
              <button
                onClick={() => setIsMobileOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer md:hidden"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Segmented Control Tabs */}
        <div className="grid grid-cols-2 p-1 bg-slate-200/60 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setActiveMode("assistant")}
            className={`py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeMode === "assistant"
                ? "bg-white text-gov-blue shadow-xs font-bold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Bot className="h-3.5 w-3.5" />
            <span>Assistant</span>
          </button>
          <button
            onClick={() => setActiveMode("advisor")}
            className={`py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeMode === "advisor"
                ? "bg-white text-amber-700 shadow-xs font-bold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Brain className="h-3.5 w-3.5" />
            <span>AI Advisor</span>
          </button>
        </div>
      </div>

      {/* 2. Chat Messages Viewport */}
        <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5 bg-slate-50/30 min-h-[320px] max-h-[460px]">        {currentMessages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-fade-in`}
          >
            <div className={`max-w-[88%] flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}>
              <div
                className={`px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed group relative shadow-2xs ${
                  msg.role === "user"
                    ? "bg-gov-blue text-white rounded-tr-xs font-medium"
                    : "bg-white text-slate-800 border border-slate-200/80 rounded-tl-xs"
                }`}
              >
                {msg.role === "assistant" ? (
                  <div className="markdown-body text-slate-800">
                    <Markdown>{msg.content}</Markdown>
                  </div>
                ) : (
                  <p className="whitespace-pre-line">{msg.content}</p>
                )}

                {msg.role === "assistant" && (
                  <button
                    onClick={() => handleCopyText(msg.content, msg.id)}
                    className="absolute bottom-1.5 right-1.5 opacity-0 group-hover:opacity-100 p-1 bg-slate-100/90 rounded border border-slate-200 text-slate-500 hover:text-slate-800 transition-opacity cursor-pointer shrink-0"
                    title="Copy response"
                  >
                    {copiedId === msg.id ? (
                      <Check className="h-3 w-3 text-emerald-600" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </button>
                )}
              </div>
              <span className="text-[9px] text-slate-400 mt-1 font-mono px-1">
                {msg.timestamp}
              </span>
            </div>
          </div>
        ))}

        {currentLoading && (
          <div className="flex justify-start">
            <div className="bg-white border border-slate-200/80 px-3.5 py-2.5 rounded-2xl rounded-tl-xs flex items-center gap-1.5 shadow-2xs">
              <span className="w-1.5 h-1.5 bg-gov-blue rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
              <span className="w-1.5 h-1.5 bg-gov-blue rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
              <span className="w-1.5 h-1.5 bg-gov-blue rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
            </div>
          </div>
        )}
      </div>

      {/* 3. Input Bar */}
      <div className="p-2.5 bg-white border-t border-slate-200/80 shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (activeMode === "assistant") handleSendAssist(assistInput);
            else handleSendAdvisor(advisorInput);
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            value={currentInput}
            onChange={(e) => activeMode === "assistant" ? setAssistInput(e.target.value) : setAdvisorInput(e.target.value)}
            placeholder={
              isListening
                ? "Listening... speak now"
                : activeMode === "assistant"
                ? "Ask how to report or track an issue..."
                : "Ask about priority scores or worker assignments..."
            }
            className={`flex-1 border rounded-xl px-3 py-2 text-xs transition-all placeholder:text-slate-400 focus:outline-none ${
              isListening
                ? "bg-red-50 border-red-300 text-red-900 animate-pulse font-medium"
                : "bg-slate-50 border-slate-200 text-slate-800 focus:border-gov-blue focus:bg-white"
            }`}
            disabled={currentLoading}
          />
          <button
            type="button"
            onClick={handleVoiceDictation}
            className={`p-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center shrink-0 border ${
              isListening
                ? "bg-red-500 text-white border-red-500 animate-pulse shadow-md"
                : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200"
            }`}
            title={isListening ? "Listening... click to stop" : "Voice input (Speech to text)"}
          >
            <Mic className="h-3.5 w-3.5" />
          </button>
          <button
            type="submit"
            disabled={!currentInput.trim() || currentLoading}
            className="bg-gov-blue hover:bg-gov-blue-hover text-white p-2.5 rounded-xl transition-all disabled:opacity-40 cursor-pointer flex items-center justify-center shrink-0 shadow-2xs"
          >
            <Send className="h-3.5 w-3.5" />
          </button>
        </form>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop View: Embedded in Sidebar */}
      <div className="hidden lg:block h-full" id="unified-civic-ai-panel-desktop">
        {renderChatContent()}
      </div>

      {/* Mobile Floating Trigger & Slide-Up Modal Drawer */}
      <div className="lg:hidden">
        <button
          onClick={() => setIsMobileOpen(true)}
          className="fixed bottom-5 right-5 z-40 bg-gov-blue hover:bg-gov-blue-hover text-white px-4 py-3 rounded-full shadow-2xl flex items-center gap-2 font-bold text-xs cursor-pointer border border-white/20 transition-transform active:scale-95"
          aria-label="Open AI Assistant"
        >
          <Bot className="h-4.5 w-4.5" />
          <span>AI</span>
        </button>

        <AnimatePresence>
          {isMobileOpen && (
            <div
              className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4"
              onClick={() => setIsMobileOpen(false)}
            >
              <motion.div
                initial={{ opacity: 0, y: "100%" }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: "100%" }}
                transition={{ type: "spring", damping: 28, stiffness: 300 }}
                className="w-full max-w-lg h-[88vh] sm:h-[620px] p-1.5 bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                {renderChatContent()}
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}