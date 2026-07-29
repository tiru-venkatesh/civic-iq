/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Language = "en" | "hi";

export interface TranslationDictionary {
  [key: string]: {
    en: string;
    hi: string;
  };
}

export const TRANSLATIONS: Record<string, { en: string; hi: string }> = {
  // Brand & Header
  appTitle: { en: "CIVIC-AI MUMBAI", hi: "सिविक-एआई मुंबई" },
  appSubtitle: { en: "BMC Smart City Governance Portal", hi: "बीएमसी स्मार्ट सिटी शासन पोर्टल" },
  navHome: { en: "Portal Home", hi: "मुख्य पृष्ठ" },
  navAdmin: { en: "1. Admin Dashboard", hi: "1. एडमिन डैशबोर्ड" },
  navCitizen: { en: "2. Citizen Portal", hi: "2. नागरिक पोर्टल" },
  navWorker: { en: "3. Field Crew", hi: "3. फील्ड टीम" },
  navDocs: { en: "4. Design System", hi: "4. डिज़ाइन गाइड" },
  guidedTour: { en: "Guided Tour", hi: "गाइडेड टूर" },
  alerts: { en: "System Alerts", hi: "सिस्टम अलर्ट" },
  resetData: { en: "Reset Data", hi: "डेटा रीसेट" },
  language: { en: "Language", hi: "भाषा" },

  // Role Helper Banners
  adminTitle: { en: "Admin Dashboard", hi: "प्रशासनिक डैशबोर्ड" },
  adminDesc: { en: "Manage citizen complaints, dispatch BMC field workers, and optimize ward budgets.", hi: "नागरिक शिकायतों का प्रबंधन करें, बीएमसी कर्मचारियों को तैनात करें और वार्ड बजट का अनुकूलन करें।" },
  citizenTitle: { en: "Citizen Portal", hi: "नागरिक पोर्टल" },
  citizenDesc: { en: "Report civic issues via photo or voice message in Marathi, Hindi, or English. Get instant AI updates.", hi: "फोटो या आवाज संदेश के माध्यम से शिकायत दर्ज करें। तुरंत एआई अपडेट प्राप्त करें।" },
  workerTitle: { en: "Field Crew Dashboard", hi: "फील्ड टीम डैशबोर्ड" },
  workerDesc: { en: "Track assigned work orders, upload repair completion photos, and sync logs with the central office.", hi: "कार्य आदेशों को ट्रैक करें, मरम्मत की फोटो अपलोड करें और मुख्य कार्यालय के साथ समन्वय करें।" },

  // Helper & Tooltips
  priorityScore: { en: "Priority Score", hi: "प्राथमिकता स्कोर" },
  priorityTooltip: {
    en: "AI score (0-100) calculated from damage severity, traffic impact, weather threat, and population affected.",
    hi: "नुकसान की गंभीरता, ट्रैफिक प्रभाव, मौसम के खतरे और प्रभावित आबादी के आधार पर एआई स्कोर (0-100)।"
  },
  aiAccuracy: { en: "AI Accuracy", hi: "एआई सटीकता" },
  aiAccuracyTooltip: {
    en: "Confidence rating of computer vision and text analysis models.",
    hi: "कंप्यूटर विजन और टेक्स्ट विश्लेषण मॉडल की सटीकता रेटिंग।"
  },
  riskLevel: { en: "Risk Level", hi: "जोखिम स्तर" },
  riskLevelTooltip: {
    en: "Infrastructure risk rating for citizens (Low, Medium, High, Critical).",
    hi: "नागरिकों के लिए बुनियादी ढांचे का जोखिम स्तर (कम, मध्यम, उच्च, गंभीर)।"
  },
  peopleAffected: { en: "People Affected", hi: "प्रभावित लोग" },
  peopleAffectedTooltip: {
    en: "Estimated number of local residents and daily commuters impacted.",
    hi: "प्रभावित स्थानीय निवासियों और दैनिक यात्रियों की अनुमानित संख्या।"
  },
  repairCost: { en: "Repair Cost (₹)", hi: "मरम्मत लागत (₹)" },
  repairCostTooltip: {
    en: "Estimated budget in Indian Rupees required for repair.",
    hi: "मरम्मत के लिए आवश्यक अनुमानित बजट (भारतीय रुपये में)।"
  },
  duplicateDetection: { en: "Duplicate Detection", hi: "डुप्लीकेट पहचान" },
  duplicateTooltip: {
    en: "Smart grouping that merges identical reports within 50 meters to prevent duplicate work.",
    hi: "काम के दोहरीकरण को रोकने के लिए 50 मीटर के भीतर समान शिकायतों को एक साथ जोड़ना।"
  },

  // Categories
  catRoads: { en: "Potholes & Road Repairs", hi: "गड्ढे एवं सड़क मरम्मत" },
  catWater: { en: "Water Leakage & Pipeline Burst", hi: "पानी का रिसाव और पाइपलाइन फटना" },
  catTraffic: { en: "Traffic Signal Failure", hi: "ट्रैफिक सिग्नल की खराबी" },
  catLighting: { en: "Public Lighting & Exposed Wires", hi: "स्ट्रीट लाइट और खुले तार" },
  catWaste: { en: "Garbage & Waste Clearance", hi: "कचरा एवं सफाई" },

  // Statuses
  statusPending: { en: "Pending", hi: "लंबित" },
  statusAssigned: { en: "Assigned", hi: "आबंटित" },
  statusInProgress: { en: "In Progress", hi: "प्रगति पर" },
  statusResolved: { en: "Resolved", hi: "समाधान हुआ" },

  // Severities
  sevLow: { en: "Low", hi: "कम" },
  sevMedium: { en: "Medium", hi: "मध्यम" },
  sevHigh: { en: "High", hi: "उच्च" },
  sevCritical: { en: "Critical", hi: "गंभीर" },

  // Actions
  submitComplaint: { en: "Submit Complaint", hi: "शिकायत दर्ज करें" },
  dispatchWorker: { en: "Dispatch Worker", hi: "कर्मचारी तैनात करें" },
  viewDetails: { en: "View Details", hi: "विवरण देखें" },
  closeWindow: { en: "Close", hi: "बंद करें" },
  lockConsole: { en: "Lock Console", hi: "कंसोल लॉक करें" },
  askChatbot: { en: "Ask CIVIC-AI Assistant", hi: "सिविक-एआई सहायक से पूछें" },
};

export function t(key: string, lang: Language): string {
  if (TRANSLATIONS[key]) {
    return TRANSLATIONS[key][lang] || TRANSLATIONS[key]["en"];
  }
  return key;
}
