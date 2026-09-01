/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import {
  X,
  Sparkles,
  Camera,
  Bot,
  Truck,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
  Building2,
  HelpCircle
} from "lucide-react";
import { Language } from "../utils/translations";

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang?: Language;
}

export default function OnboardingModal({ isOpen, onClose, lang = "en" }: OnboardingModalProps) {
  const [step, setStep] = useState(1);

  if (!isOpen) return null;

  const totalSteps = 4;

  const stepsContent = [
    {
      step: 1,
      badge: lang === "hi" ? "स्वागत है" : "Welcome to CivicIQ",
      title: lang === "hi" ? "बीएमसी स्मार्ट सिटी शासन पोर्टल" : "Brihanmumbai Municipal Corporation (BMC)",
      subtitle: lang === "hi"
        ? "नागरिकों और नगर निगम अधिकारियों के लिए एआई-संचालित स्मार्ट शिकायत निवारण मंच।"
        : "AI-driven municipal issue triage, priority scoring, and field crew management across Mumbai Wards.",
      icon: Building2,
      highlights: [
        lang === "hi" ? "अंधेरी, बांद्रा, कुर्ला, दादर और पवई जैसे सभी मुंबई वार्डों के लिए काम करता है" : "Covers all Mumbai Wards (Andheri, Bandra, Kurla, Dadar, Powai & more)",
        lang === "hi" ? "हिंदी और अंग्रेजी में पूर्ण समर्थन" : "Full English and Hindi bilingual support",
        lang === "hi" ? "नागरिकों, बीएमसी अधिकारियों और फील्ड टीमों के लिए एकीकृत पोर्टल" : "Unified view for Citizens, BMC Officials, and Field Crew Technicians"
      ]
    },
    {
      step: 2,
      badge: lang === "hi" ? "चरण 1: शिकायत दर्ज करें" : "Step 1: Simple Citizen Reporting",
      title: lang === "hi" ? "फोटो या आवाज संदेश से रिपोर्ट करें" : "Report Issues in 30 Seconds",
      subtitle: lang === "hi"
        ? "सड़क के गड्ढे, पानी के रिसाव, या स्ट्रीट लाइट की समस्या की फोटो लें या आवाज में बताएं।"
        : "Capture potholes, broken water pipelines, or faulty streetlights via photo or voice recording.",
      icon: Camera,
      highlights: [
        lang === "hi" ? "ऑटोमैटिक जीपीएस लोकेशन डिटैक्शन" : "Automatic GPS location tagging on Mumbai Ward maps",
        lang === "hi" ? "आवाज संदेश को टेक्स्ट में बदलने के लिए AI वॉइस ट्राइएज" : "AI Voice Triage converts audio into actionable complaint reports",
        lang === "hi" ? "हिंदी, मराठी और अंग्रेजी में विवरण दर्ज करने की सुविधा" : "Support for voice inputs in Hindi, Marathi, or English"
      ]
    },
    {
      step: 3,
      badge: lang === "hi" ? "चरण 2: एआई विश्लेषण" : "Step 2: AI Priority & Duplicates",
      title: lang === "hi" ? "स्वचालित प्राथमिकता और डुप्लीकेट पहचान" : "Smart Priority & Budget Optimization",
      subtitle: lang === "hi"
        ? "हमारा एआई नुकसान की गंभीरता, यातायात प्रभाव और प्रभावित लोगों की संख्या के आधार पर स्कोर तय करता है।"
        : "CivicIQ AI calculates a 0-100 Priority Score based on severity, traffic impact, and affected residents.",
      icon: Bot,
      highlights: [
        lang === "hi" ? "50 मीटर के भीतर समान शिकायतों को एक साथ जोड़ता है" : "Auto-merges duplicate complaints within 50 meters",
        lang === "hi" ? "अनुमानित मरम्मत लागत (₹) और समय का सटीक अनुमान" : "Calculates repair cost estimates in Indian Rupees (₹)",
        lang === "hi" ? "बीएमसी बजट सिमुलेटर द्वारा धन आवंटन" : "Interactive BMC Ward Budget simulator for emergency funding"
      ]
    },
    {
      step: 4,
      badge: lang === "hi" ? "चरण 3: समाधान" : "Step 3: Field Crew Resolution",
      title: lang === "hi" ? "फील्ड टीमों की त्वरित तैनाती" : "Real-time Field Crew Dispatch",
      subtitle: lang === "hi"
        ? "निकटतम बीएमसी कर्मचारियों को ऑटो-असाइन किया जाता है, जो काम पूरा होने के बाद फोटो प्रूफ अपलोड करते हैं।"
        : "Nearest BMC field workers are dispatched. Technicians upload photo proof of completion when done.",
      icon: Truck,
      highlights: [
        lang === "hi" ? "लाइव जीपीएस ट्रैकिंग और ऑफलाइन नेविगेशन" : "Live GPS worker tracking and offline-ready field technician queues",
        lang === "hi" ? "काम पूरा होने का फोटो प्रूफ सत्यापन" : "Photo proof verification required for issue closeout",
        lang === "hi" ? "नागरिकों को एसएमएस और ऐप पर रीयल-टाइम सूचनाएं" : "Real-time notification updates to citizens when resolved"
      ]
    }
  ];

  const currentStep = stepsContent[step - 1];
  const StepIcon = currentStep.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in font-sans">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-xl w-full overflow-hidden flex flex-col" id="onboarding-modal-container">
        
        {/* Header Bar */}
        <div className="p-5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#1565C0] flex items-center justify-center text-white shrink-0">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-blue-400 block">
                {lang === "hi" ? "त्वरित गाइडेड टूर" : "Quick Guided Tour"}
              </span>
              <h3 className="text-sm font-display font-bold">
                {lang === "hi" ? "सिविक-एआई मुंबई पोर्टल कैसे काम करता है" : "How CivicIQ Mumbai Works"}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
            title="Close Walkthrough"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          {/* Badge & Step indicator */}
          <div className="flex items-center justify-between">
            <span className="px-2.5 py-1 bg-blue-50 text-[#1565C0] border border-blue-200 text-xs font-bold font-mono rounded-full uppercase">
              {currentStep.badge}
            </span>
            <span className="text-xs font-mono text-slate-400 font-bold">
              {step} / {totalSteps}
            </span>
          </div>

          {/* Title and Description */}
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-slate-100 text-[#1565C0] rounded-xl shrink-0">
                <StepIcon className="h-6 w-6" />
              </div>
              <h2 className="text-lg font-display font-bold text-slate-900 leading-tight">
                {currentStep.title}
              </h2>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed pl-1">
              {currentStep.subtitle}
            </p>
          </div>

          {/* Highlights List */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 space-y-2.5">
            <h4 className="text-[11px] font-mono uppercase font-bold text-slate-500 tracking-wider">
              {lang === "hi" ? "मुख्य विशेषताएं:" : "Key Features:"}
            </h4>
            <div className="space-y-2">
              {currentStep.highlights.map((item, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Step Progress Dots */}
          <div className="flex justify-center items-center gap-2 py-1">
            {stepsContent.map((s) => (
              <button
                key={s.step}
                onClick={() => setStep(s.step)}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  s.step === step ? "w-6 bg-[#1565C0]" : "w-2 bg-slate-200 hover:bg-slate-300"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Footer Controls */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={() => setStep(Math.max(1, step - 1))}
            disabled={step === 1}
            className={`px-4 py-2 rounded-xl text-xs font-bold font-mono flex items-center gap-2 cursor-pointer transition-all ${
              step === 1
                ? "text-slate-300 cursor-not-allowed"
                : "text-slate-700 hover:bg-slate-200 border border-slate-200"
            }`}
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>{lang === "hi" ? "पीछे" : "Back"}</span>
          </button>

          {step < totalSteps ? (
            <button
              onClick={() => setStep(step + 1)}
              className="px-5 py-2 bg-[#1565C0] hover:bg-blue-700 text-white rounded-xl text-xs font-bold font-mono flex items-center gap-2 cursor-pointer shadow-md hover:shadow-lg transition-all"
            >
              <span>{lang === "hi" ? "आगे बढ़ें" : "Next Step"}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          ) : (
            <button
              onClick={onClose}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold font-mono flex items-center gap-2 cursor-pointer shadow-md hover:shadow-lg transition-all"
            >
              <ShieldCheck className="h-4 w-4" />
              <span>{lang === "hi" ? "पोर्टल का प्रयोग शुरू करें" : "Start Exploring Portal"}</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
