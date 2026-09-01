/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useRef, useEffect, useMemo } from "react";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc, updateDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { storage, auth, db } from "../../firebase"; // adjust path to match your project structure
import {
  MapPin,
  Mic,
  Camera,
  CheckCircle,
  User,
  Settings as SettingsIcon,
  Clock,
  ChevronRight,
  ArrowLeft,
  X,
  UploadCloud,
  Sparkles,
  PhoneCall,
  Check,
  RefreshCw,
  Home,
  Maximize2,
  ZoomIn,
  Globe,
  Map as MapIcon,
} from "lucide-react";
import { Complaint, AIAnalysis } from "../types";
import SmartCityMap from "./SmartCityMap";
import logo from "../assets/1.jpg";

// ---------------------------------------------------------------------------
// SpeechRecognition isn't in the default TS DOM lib — declare it so the
// browser-native Web Speech API calls below type-check cleanly.
// ---------------------------------------------------------------------------
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://civic-iq.onrender.com"; // Backend API base URL (set in .env)

// Predefined categories with friendly icons and descriptions
const ISSUE_CATEGORIES = [
  {
    id: "pothole",
    name: "Road Damage",
    category: "Pothole & Road Damage",
    icon: "🕳️",
    desc: "Potholes, broken asphalt, or dangerous cracks",
    color: "bg-amber-50 text-amber-800 border-amber-200 hover:border-amber-400"
  },
  {
    id: "water",
    name: "Water Leak",
    category: "Water Leakage & Flooding",
    icon: "🚰",
    desc: "Pipe bursts, clean water wastage, or main leaks",
    color: "bg-blue-50 text-blue-800 border-blue-200 hover:border-blue-400"
  },
  {
    id: "light",
    name: "Street Light",
    category: "Streetlight Failure",
    icon: "💡",
    desc: "Dark streetlights, exposed wires, or pole fault",
    color: "bg-yellow-50 text-yellow-800 border-yellow-200 hover:border-yellow-400"
  },
  {
    id: "garbage",
    name: "Garbage & Waste",
    category: "Waste & Sanitation Overflow",
    icon: "🚮",
    desc: "Overflowing bins, uncollected trash, or debris",
    color: "bg-emerald-50 text-emerald-800 border-emerald-200 hover:border-emerald-400"
  },
  {
    id: "flood",
    name: "Drain & Flooding",
    category: "Water Leakage & Flooding",
    icon: "🌧️",
    desc: "Clogged storm drains, waterlogging, monsoon flood",
    color: "bg-cyan-50 text-cyan-800 border-cyan-200 hover:border-cyan-400"
  },
  {
    id: "traffic",
    name: "Traffic Signal",
    category: "Traffic Light Malfunction",
    icon: "🚦",
    desc: "Broken traffic lights, missing signs, or hazards",
    color: "bg-red-50 text-red-800 border-red-200 hover:border-red-400"
  },
  {
    id: "tree",
    name: "Fallen Tree",
    category: "Pothole & Road Damage",
    icon: "🌳",
    desc: "Fallen branches blocking roads or power lines",
    color: "bg-lime-50 text-lime-800 border-lime-200 hover:border-lime-400"
  },
  {
    id: "other",
    name: "Other Issue",
    category: "Waste & Sanitation Overflow",
    icon: "🏗️",
    desc: "Nuisance, illegal dumping, or general civic issue",
    color: "bg-slate-50 text-slate-800 border-slate-200 hover:border-slate-400"
  }
];

// Predefined photo templates for quick click-to-upload simulation
const SAMPLE_PHOTOS = [
  {
    name: "Deep Pothole on Main Road",
    url: "https://images.unsplash.com/photo-1515162305285-0293e4767cc2?w=600&auto=format&fit=crop&q=80",
    category: "Pothole & Road Damage",
    severity: "Critical",
    classification: "Road Surface Breakdown & Deep Pothole",
    confidence: 0.97,
    reasoning: "AI detected a 15cm deep asphalt cavity in active driving lane. Poses high risk to two-wheelers.",
    budget: 3200,
    hours: 4,
    priority: 94,
    dept: "BMC Roads & Traffic Department"
  },
  {
    name: "Burst Water Main Leak",
    url: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&auto=format&fit=crop&q=80",
    category: "Water Leakage & Flooding",
    severity: "High",
    classification: "Pressurized Pipe Main Leakage",
    confidence: 0.93,
    reasoning: "AI detected pressurized water discharge overflowing onto sidewalk. Immediate water loss hazard.",
    budget: 7400,
    hours: 8,
    priority: 89,
    dept: "Hydraulic Engineer Department (Water Works)"
  },
  {
    name: "Damaged Street Light Pole",
    url: "https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=600&auto=format&fit=crop&q=80",
    category: "Streetlight Failure",
    severity: "High",
    classification: "Streetlight Power Fault & Dark Zone",
    confidence: 0.91,
    reasoning: "AI detected non-functional streetlight junction box near pedestrian crossing.",
    budget: 750,
    hours: 2,
    priority: 85,
    dept: "BMC Electrical & Mechanical Dept"
  }
];

// Emergency Helpline Contacts
const EMERGENCY_HELPLINES = [
  { name: "BMC Central Monsoon Helpline", phone: "1916", desc: "Waterlogging, fallen trees & general civic emergencies", icon: "🚨", color: "text-red-600 bg-red-50 border-red-200" },
  { name: "Disaster Management Cell", phone: "108", desc: "Flood evacuation, building collapse & rescue", icon: "🚑", color: "text-amber-600 bg-amber-50 border-amber-200" },
  { name: "Fire Department Control", phone: "101", desc: "Fire outbreak & electrical short circuits", icon: "🚒", color: "text-orange-600 bg-orange-50 border-orange-200" },
  { name: "Police Control Room", phone: "100", desc: "Traffic jams, road blockades & public safety", icon: "🚔", color: "text-blue-600 bg-blue-50 border-blue-200" },
  { name: "Water Leakage Hotline", phone: "1800-22-3030", desc: "24/7 main pipeline burst & water pollution", icon: "🚰", color: "text-cyan-600 bg-cyan-50 border-cyan-200" }
];

// Local Ward Updates & Alerts
const LOCAL_UPDATES = [
  {
    id: "1",
    title: "🌧 Monsoon Pre-Drain Cleanliness Drive",
    ward: "Ward K-West (Andheri West)",
    time: "2 hours ago",
    content: "BMC sanitation teams are cleaning major storm drains along SV Road today. Minor traffic slow-downs expected."
  },
  {
    id: "2",
    title: "⚡ Scheduled Pipeline Maintenance",
    ward: "Ward H-East (Bandra East)",
    time: "Yesterday",
    content: "Water pressure will be low on Thursday morning between 8 AM - 12 PM for main valve replacement."
  }
];

type ScreenName =
  | "splash" | "login" | "home" | "submit" | "confirm" | "history" | "tracking" | "emergency" | "updates" | "profile" | "settings";

// Screens reachable from the bottom tab bar, in visual left-to-right order.
// Used to animate a sliding active-pill indicator under the icons.
const NAV_SCREENS: { screen: ScreenName; label: string; icon: React.ReactNode }[] = [
  { screen: "home", label: "Home", icon: <Home className="h-5 w-5" /> },
  { screen: "history", label: "Tracking", icon: <Clock className="h-5 w-5" /> },
  { screen: "emergency", label: "Helpline", icon: <PhoneCall className="h-5 w-5" /> },
  { screen: "profile", label: "Profile", icon: <User className="h-5 w-5" /> },
];

interface CitizenAppProps {
  complaints: Complaint[];
  onSubmitComplaint: (newComplaint: Complaint) => void | Promise<void>;
  onViewComplaintDetails: (id: string) => void;
  onRateComplaint?: (complaintId: string, rating: any) => void;
}

export default function CitizenApp({
  complaints,
  onSubmitComplaint,
  onViewComplaintDetails,
  onRateComplaint,
}: CitizenAppProps) {
  // Mobile app screens navigation
  const [screen, setScreen] = useState<ScreenName>("splash");
  // Tracks the previously active screen so we can pick a sensible transition
  // direction (forward vs back) for the screen-change animation.
  const [prevScreen, setPrevScreen] = useState<ScreenName>("splash");

  const navigate = (next: ScreenName) => {
    setPrevScreen(screen);
    setScreen(next);
  };

  // Multi-step submission wizard: Step 1 (Category), Step 2 (Photo & AI), Step 3 (Voice & Text), Step 4 (Map), Step 5 (Review)
  const [submitStep, setSubmitStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [stepDirection, setStepDirection] = useState<"forward" | "back">("forward");

  const goToStep = (next: 1 | 2 | 3 | 4 | 5) => {
    setStepDirection(next > submitStep ? "forward" : "back");
    setSubmitStep(next);
  };

  // Ref for the internal scrollable screen container (see useEffect below).
  const screenContainerRef = useRef<HTMLDivElement>(null);

  // Scroll to top on every screen change for a crisp, native-feeling transition.
  useEffect(() => {
    screenContainerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [screen]);

  // ===== REAL FIREBASE AUTH STATE =====
  // user holds the live Firebase Auth user (+ Firestore profile fields merged in)
  const [user, setUser] = useState<{ uid: string; name: string; email: string; photoURL: string | null } | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  // Login/signup form state
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [authName, setAuthName] = useState("");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  // Profile photo upload state
  const [isUploadingProfilePhoto, setIsUploadingProfilePhoto] = useState(false);
  const profilePhotoInputRef = useRef<HTMLInputElement>(null);

  // Listen for Firebase Auth state on mount. If already logged in, skip splash/login.
  useEffect(() => {
    let unsubscribe: () => void;

    const init = async () => {
      // Always start from a signed-out state so the login screen reliably
      // appears on a fresh app load, regardless of any cached Firebase session.
      try {
        await signOut(auth);
      } catch {
        // No signed-in user to sign out of — safe no-op.
      }

      unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
        if (fbUser) {
          let photoURL = fbUser.photoURL || null;
          let name = fbUser.displayName || "Citizen";
          try {
            const userDocSnap = await getDoc(doc(db, "users", fbUser.uid));
            if (userDocSnap.exists()) {
              const data = userDocSnap.data();
              photoURL = data.photoURL ?? photoURL;
              name = data.name ?? name;
            }
          } catch (err) {
            console.error("Failed to load user profile doc:", err);
          }
          setUser({ uid: fbUser.uid, name, email: fbUser.email || "", photoURL });
          setScreen((prev) => (prev === "splash" || prev === "login" ? "home" : prev));
        } else {
          setUser(null);
        }
        setAuthChecked(true);
      });
    };

    init();
    return () => unsubscribe?.();
  }, []);

  const resetAuthForm = () => {
    setAuthError(null);
    setAuthName("");
    setAuthEmail("");
    setAuthPassword("");
  };

  const mapAuthError = (code?: string): string => {
    switch (code) {
      case "auth/email-already-in-use":
        return "This email is already registered. Try logging in instead.";
      case "auth/invalid-email":
        return "Please enter a valid email address.";
      case "auth/weak-password":
        return "Password is too weak (min 6 characters).";
      case "auth/user-not-found":
      case "auth/wrong-password":
      case "auth/invalid-credential":
        return "Invalid email or password.";
      case "auth/too-many-requests":
        return "Too many attempts. Please try again later.";
      default:
        return "Something went wrong. Please try again.";
    }
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    if (authMode === "signup" && !authName.trim()) {
      setAuthError("Please enter your name.");
      return;
    }
    if (authPassword.length < 6) {
      setAuthError("Password must be at least 6 characters.");
      return;
    }

    setAuthLoading(true);
    try {
      if (authMode === "signup") {
        const cred = await createUserWithEmailAndPassword(auth, authEmail, authPassword);
        await updateProfile(cred.user, { displayName: authName });
        await setDoc(doc(db, "users", cred.user.uid), {
          uid: cred.user.uid,
          name: authName,
          email: authEmail,
          role: "citizen",
          photoURL: null,
          createdAt: serverTimestamp(),
        });
        setUser({ uid: cred.user.uid, name: authName, email: authEmail, photoURL: null });
      } else {
        const cred = await signInWithEmailAndPassword(auth, authEmail, authPassword);
        let photoURL: string | null = cred.user.photoURL || null;
        let name = cred.user.displayName || "Citizen";
        const userDocSnap = await getDoc(doc(db, "users", cred.user.uid));
        if (userDocSnap.exists()) {
          const data = userDocSnap.data();
          photoURL = data.photoURL ?? photoURL;
          name = data.name ?? name;
        }
        setUser({ uid: cred.user.uid, name, email: cred.user.email || "", photoURL });
      }
      resetAuthForm();
      navigate("home");
    } catch (err: any) {
      setAuthError(mapAuthError(err?.code));
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error("Sign out failed:", err);
    } finally {
      setUser(null);
      resetAuthForm();
      navigate("login");
    }
  };

  // Profile photo upload -> Firebase Storage, then Firestore users/{uid}.photoURL + Auth profile update
  const handleProfilePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("Image must be smaller than 5MB.");
      return;
    }

    // Instant local preview
    const localPreviewUrl = URL.createObjectURL(file);
    setUser((prev) => (prev ? { ...prev, photoURL: localPreviewUrl } : prev));

    setIsUploadingProfilePhoto(true);
    try {
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const storagePath = `profile_photos/${user.uid}/${Date.now()}_${safeName}`;
      const storageRef = ref(storage, storagePath);
      const uploadTask = uploadBytesResumable(storageRef, file);

      await new Promise<void>((resolve, reject) => {
        uploadTask.on("state_changed", undefined, reject, () => resolve());
      });

      const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

      await updateDoc(doc(db, "users", user.uid), { photoURL: downloadURL });
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, { photoURL: downloadURL });
      }

      setUser((prev) => (prev ? { ...prev, photoURL: downloadURL } : prev));
    } catch (err) {
      console.error("Profile photo upload failed:", err);
      alert("Profile photo upload failed. Please try again.");
      setUser((prev) => (prev ? { ...prev, photoURL: prev.photoURL } : prev));
    } finally {
      setIsUploadingProfilePhoto(false);
      if (profilePhotoInputRef.current) profilePhotoInputRef.current.value = "";
    }
  };

  // Voice recording state
  const [isRecording, setIsRecording] = useState(false);
  const [voiceWave, setVoiceWave] = useState<number[]>([28, 40, 22, 55, 30]);
  const waveTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const recognitionRef = useRef<any>(null);

  // Animate the mic waveform bars while actively recording; stop cleanly on unmount.
  useEffect(() => {
    if (isRecording) {
      waveTimerRef.current = setInterval(() => {
        setVoiceWave(Array.from({ length: 5 }, () => 18 + Math.floor(Math.random() * 70)));
      }, 160);
    } else if (waveTimerRef.current) {
      clearInterval(waveTimerRef.current);
      waveTimerRef.current = null;
    }
    return () => {
      if (waveTimerRef.current) clearInterval(waveTimerRef.current);
    };
  }, [isRecording]);

  // New report state
  const [selectedCategoryObj, setSelectedCategoryObj] = useState<typeof ISSUE_CATEGORIES[0]>(ISSUE_CATEGORIES[0]);
  const [reportTitle, setReportTitle] = useState("");
  const [reportDesc, setReportDesc] = useState("");
  const [selectedPhoto, setSelectedPhoto] = useState<typeof SAMPLE_PHOTOS[0] | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isPhotoLightboxOpen, setIsPhotoLightboxOpen] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(100);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState<boolean>(false);
  const [gpsLocation, setGpsLocation] = useState<{ lat: number; lng: number } | null>({ lat: 19.1136, lng: 72.8697 });
  const [wizardMapMode, setWizardMapMode] = useState<"street" | "satellite">("street");
  const [addressText, setAddressText] = useState("SV Road, near Andheri West Station, Mumbai, MH 400053");
  const [customPhotoUrl, setCustomPhotoUrl] = useState("");
  const [voiceTranscript, setVoiceTranscript] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Simulated Circular Upload Progress Engine — only used for the sample-photo quick-pick flow
  const startPhotoUploadSimulation = () => {
    setIsUploadingPhoto(true);
    setUploadProgress(0);
    let current = 0;
    const interval = setInterval(() => {
      current += Math.floor(Math.random() * 16) + 12;
      if (current >= 100) {
        current = 100;
        setUploadProgress(100);
        setIsUploadingPhoto(false);
        clearInterval(interval);
      } else {
        setUploadProgress(current);
      }
    }, 90);
  };

  // Real custom file upload — uploads directly to backend (/api/reports/upload), which
  // stores the image on Cloudinary and runs Groq AI analysis in a single call. Firebase
  // Storage is no longer used (Spark plan doesn't support it without a Blaze billing upgrade).
  const handleCustomFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show local preview immediately (instant feedback) while the real upload runs in the background
    const localPreviewUrl = URL.createObjectURL(file);
    const draftPhoto = {
      name: file.name,
      url: localPreviewUrl,
      category: selectedCategoryObj.category,
      severity: "High",
      classification: `${selectedCategoryObj.name} Hazard`,
      confidence: 0.96,
      reasoning: `Uploaded high-resolution image (${(file.size / (1024 * 1024)).toFixed(1)} MB). Awaiting AI analysis...`,
      budget: 2800,
      hours: 5,
      priority: 85,
      dept: "BMC Municipal Infrastructure"
    };

    setSelectedPhoto(draftPhoto);
    setReportTitle(`${selectedCategoryObj.name} - ${file.name.substring(0, 18)}`);
    setReportDesc(`Citizen uploaded high-res photo (${file.name}). Location tag: SV Road corridor. Immediate inspection requested.`);

    setIsUploadingPhoto(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append("image", file);
    formData.append("category", selectedCategoryObj.category);

    // XMLHttpRequest instead of fetch, so we get real upload-progress events
    // (fetch has no native upload-progress API — this replaces Firebase's
    // uploadTask.on("state_changed", ...) progress callback).
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${API_BASE_URL}/api/reports/upload`);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const pct = Math.round((event.loaded / event.total) * 100);
        setUploadProgress(pct);
      }
    };

    xhr.onload = () => {
      setIsUploadingPhoto(false);

      if (xhr.status < 200 || xhr.status >= 300) {
        console.error("Photo upload failed:", xhr.status, xhr.responseText);
        alert("Photo upload failed. Please check your connection and try again.");
        return;
      }

      let data: any;
      try {
        data = JSON.parse(xhr.responseText);
      } catch (err) {
        console.error("Failed to parse upload response:", err);
        alert("Upload succeeded but the server response was invalid. Please try again.");
        return;
      }

      const uploadedUrl: string = data.image?.url;
      const a = data.analysis;

      setUploadProgress(100);
      setSelectedPhoto((prev) => (prev ? { ...prev, url: uploadedUrl || prev.url } : prev));

      if (!a) {
        // Upload succeeded but no analysis came back — citizen can still submit manually.
        return;
      }

      setAiAnalysisPreview({
        classification: a.detectedProblem,
        category: a.detectedProblem,
        confidence: a.confidence / 100,
        reasoning: a.reasoning,
        severity: a.severity,
        populationAffected: 0,
        delayImpactScore: 0,
        budgetRequired: a.estimatedBudgetINR,
        timeToRepairHours: a.estimatedRepairHours,
        priorityScore: a.priorityScore,
        isDuplicate: false,
        duplicateGroup: null,
      });

      setSelectedPhoto((prev) =>
        prev
          ? {
              ...prev,
              url: uploadedUrl || prev.url,
              category: a.detectedProblem,
              severity: a.severity,
              classification: a.detectedProblem,
              confidence: a.confidence / 100,
              reasoning: a.reasoning,
              budget: a.estimatedBudgetINR,
              hours: a.estimatedRepairHours,
              priority: a.priorityScore,
            }
          : prev
      );
    };

    xhr.onerror = () => {
      console.error("Photo upload failed: network error");
      setIsUploadingPhoto(false);
      alert("Photo upload failed. Please check your connection and try again.");
    };

    xhr.send(formData);
  };

  // AI evaluation state
  const [isAIAnalyzing, setIsAIAnalyzing] = useState(false);
  const [aiAnalysisPreview, setAiAnalysisPreview] = useState<AIAnalysis | null>(null);

  // Receipt & Selected Tracking
  const [lastSubmittedComplaint, setLastSubmittedComplaint] = useState<Complaint | null>(null);
  const [selectedTrackingComplaint, setSelectedTrackingComplaint] = useState<Complaint | null>(null);
  const [citizenRating, setCitizenRating] = useState<number | null>(null);

  // Auto-fill defaults when category changes
  const handleSelectCategory = (catObj: typeof ISSUE_CATEGORIES[0]) => {
    setSelectedCategoryObj(catObj);
    if (!reportTitle) {
      setReportTitle(`${catObj.name} near my area`);
    }
  };

  // Simulated GPS auto-fetch
  const handleAutoGPS = () => {
    setIsAIAnalyzing(true);
    setTimeout(() => {
      setGpsLocation({ lat: 19.1136, lng: 72.8697 });
      setAddressText("SV Road, near Andheri West Station, Ward K-West, Mumbai 400053");
      setIsAIAnalyzing(false);
    }, 600);
  };

  const handleManualMapClick = (lat: number, lng: number) => {
    setGpsLocation({ lat, lng });
    const mockAddress = `Sector ${Math.floor(lat * 100) % 10}, Ward K-West, Mumbai (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
    setAddressText(mockAddress);
  };

  // Toggle Voice Dictation
  const handleToggleVoice = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice recognition not supported in this browser. Try Chrome.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-IN"; // or "hi-IN" for Hindi
    recognition.interimResults = true;
    recognition.continuous = false;

    recognition.onresult = (event: any) => {
      let transcript = "";
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      setVoiceTranscript(transcript);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);
  };

  // Instant friendly AI Evaluation
  const triggerAIEvaluation = (
    title: string,
    desc: string,
    photo: typeof SAMPLE_PHOTOS[0] | null
  ) => {
    setIsAIAnalyzing(true);
    setTimeout(() => {
      if (photo) {
        setAiAnalysisPreview({
          classification: photo.classification,
          category: photo.category,
          confidence: photo.confidence,
          reasoning: photo.reasoning,
          severity: photo.severity as any,
          populationAffected: 650,
          delayImpactScore: 78,
          budgetRequired: photo.budget,
          timeToRepairHours: photo.hours,
          priorityScore: photo.priority,
          isDuplicate: false,
          duplicateGroup: null
        });
      } else {
        const cat = selectedCategoryObj.category;
        setAiAnalysisPreview({
          classification: `${selectedCategoryObj.name} Incident`,
          category: cat,
          confidence: 0.94,
          reasoning: `AI identified visual/text attributes matching '${selectedCategoryObj.name}'. Coordinates fall into Ward K-West high-density transit sector.`,
          severity: "High",
          populationAffected: 420,
          delayImpactScore: 65,
          budgetRequired: 2500,
          timeToRepairHours: 4,
          priorityScore: 82,
          isDuplicate: false,
          duplicateGroup: null
        });
      }
      setIsAIAnalyzing(false);
    }, 450);
  };

  const handleSelectSamplePhoto = (p: typeof SAMPLE_PHOTOS[0]) => {
    setSelectedPhoto(p);
    setReportTitle(p.name);
    setReportDesc(`${p.name} reported near main street corridor. Urgent repair requested.`);
    startPhotoUploadSimulation();
    triggerAIEvaluation(p.name, `${p.name} reported`, p);
  };

  // Submit complete complaint — writes go through onSubmitComplaint (Firestore-backed in App.tsx)
  const handleFormSubmit = async () => {
    if (isSubmitting) return; // guard against double-tap while a Firestore write is in flight
    setIsSubmitting(true);

    try {
      const finalLat = gpsLocation?.lat || 19.1136;
      const finalLng = gpsLocation?.lng || 72.8697;
      const finalAddress = addressText || "SV Road, Ward K-West, Mumbai 400053";

      const finalAnalysis: AIAnalysis = aiAnalysisPreview || {
        classification: `${selectedCategoryObj.name} Incident`,
        category: selectedCategoryObj.category,
        confidence: 0.92,
        reasoning: "AI prioritized report based on citizen photo analysis and ward traffic metrics.",
        severity: "High",
        populationAffected: 500,
        delayImpactScore: 60,
        budgetRequired: 2200,
        timeToRepairHours: 4,
        priorityScore: 80,
        isDuplicate: false,
        duplicateGroup: null
      };

      const newTicketId = `CIQ-2026-${Math.floor(Math.random() * 9000) + 1000}`;

      const newComplaint: Complaint = {
        id: newTicketId,
        title: reportTitle || `${selectedCategoryObj.name} Report`,
        description: reportDesc || "Citizen reported issue via mobile assistant.",
        category: selectedCategoryObj.category,
        status: "Pending",
        latitude: finalLat,
        longitude: finalLng,
        address: finalAddress,
        reportedBy: user?.name || "Citizen",
        reportedAt: new Date().toISOString(),
        images: selectedPhoto
          ? [selectedPhoto.url]
          : [customPhotoUrl || "https://images.unsplash.com/photo-1515162305285-0293e4767cc2?w=600&auto=format&fit=crop&q=80"],
        voiceTranscript,
        aiAnalysis: finalAnalysis,
        assignedWorkerId: null,
        history: [
          {
            status: "Pending",
            updatedAt: new Date().toISOString(),
            comment: "Complaint submitted successfully. AI assigned initial Priority Score.",
            updatedBy: "System"
          }
        ],
        completionProof: null
      };

      await onSubmitComplaint(newComplaint);
      setLastSubmittedComplaint(newComplaint);
      navigate("confirm");

      // Reset wizard
      setSubmitStep(1);
      setReportTitle("");
      setReportDesc("");
      setSelectedPhoto(null);
      setCustomPhotoUrl("");
      setVoiceTranscript(null);
      setAiAnalysisPreview(null);
    } catch (err) {
      console.error("Complaint submission failed:", err);
      alert("Something went wrong submitting your report. Please check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open complaint tracking timeline view
  const handleOpenTracking = (complaint: Complaint) => {
    setSelectedTrackingComplaint(complaint);
    navigate("tracking");
  };

  // Helper: citizen's initials for avatar fallback
  const userInitials = (user?.name || "Citizen")
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  // Index of the active bottom-nav tab, used to slide the active pill indicator.
  const activeNavIndex = useMemo(
    () => NAV_SCREENS.findIndex((n) => n.screen === screen || (n.screen === "history" && screen === "tracking")),
    [screen]
  );

  return (
    <div className="w-full bg-slate-100 rounded-2xl border border-slate-200 shadow-lg overflow-hidden flex flex-col font-sans min-h-[720px] max-w-md lg:max-w-6xl mx-auto">
      {/* Local keyframes for micro-interactions that Tailwind's default theme doesn't ship. */}
      <style>{`
        @keyframes civiciq-shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .civiciq-shimmer {
          background: linear-gradient(90deg, rgba(148,163,184,0.12) 25%, rgba(148,163,184,0.28) 37%, rgba(148,163,184,0.12) 63%);
          background-size: 400% 100%;
          animation: civiciq-shimmer 1.4s ease-in-out infinite;
        }
        @keyframes civiciq-pop {
          0% { transform: scale(0.85); opacity: 0; }
          60% { transform: scale(1.05); opacity: 1; }
          100% { transform: scale(1); }
        }
        .civiciq-pop { animation: civiciq-pop 0.45s cubic-bezier(0.16, 1, 0.3, 1) both; }
        @keyframes civiciq-ring {
          0% { box-shadow: 0 0 0 0 rgba(16,185,129,0.35); }
          100% { box-shadow: 0 0 0 16px rgba(16,185,129,0); }
        }
        .civiciq-ring { animation: civiciq-ring 1.6s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
        @keyframes civiciq-rise {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .civiciq-rise { animation: civiciq-rise 0.4s cubic-bezier(0.16, 1, 0.3, 1) both; }
      `}</style>

      {/* Container Body */}
      <div ref={screenContainerRef} className="flex-1 overflow-y-auto bg-slate-50 relative flex flex-col scroll-smooth">

          {/* ==================== SCREEN 1: SPLASH ==================== */}
          {screen === "splash" && (
            <div className="flex-1 flex flex-col items-center justify-between p-8 bg-gradient-to-b from-blue-900 via-gov-blue to-blue-950 text-white text-center relative overflow-hidden animate-in fade-in duration-500">
              <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent pointer-events-none"></div>
              <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-blue-400/10 blur-3xl pointer-events-none" />
              <div className="absolute -bottom-32 -left-16 w-72 h-72 rounded-full bg-indigo-400/10 blur-3xl pointer-events-none" />

              <div></div>
              <div className="flex flex-col items-center relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="p-3 bg-white/10 backdrop-blur-md rounded-full border border-white/20 shadow-2xl mb-4 civiciq-ring">
                  <img
  src={logo}
  alt="CivicIQ Seal"
  className="w-20 h-20 rounded-full object-cover border-2 border-white shadow-md"
  referrerPolicy="no-referrer"
/>
                </div>
                <h1 className="text-3xl font-display font-extrabold tracking-tight text-white">Civic-IQ</h1>
                <p className="text-xs text-blue-200 font-medium mt-1">Brihanmumbai Municipal Corporation</p>
                <div className="px-3 py-1 bg-white/15 backdrop-blur-sm rounded-full text-[10px] font-bold text-amber-300 border border-amber-300/30 mt-3 flex items-center gap-1.5">
                  <Sparkles className="h-3 w-3" />
                  <span>Smart Citizen Portal</span>
                </div>
              </div>

              <div className="w-full space-y-3 relative z-10 animate-in fade-in slide-in-from-bottom-2 duration-700 delay-150">
                <p className="text-xs text-blue-100 font-medium max-w-xs mx-auto">
                  Report potholes, water leaks, or garbage in 30 seconds.
                </p>
                <button
                  onClick={() => navigate(user ? "home" : "login")}
                  className="w-full py-3.5 bg-white hover:bg-slate-50 text-gov-blue text-sm font-bold rounded-2xl transition-all duration-200 shadow-xl hover:shadow-2xl hover:-translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                >
                  <span>Start Reporting</span>
                  <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </button>
                <div className="text-[10px] text-blue-200/80 font-mono">
                  Official BMC Citizen Care App
                </div>
              </div>
            </div>
          )}

          {/* ==================== SCREEN 2: LOGIN / SIGNUP (Real Firebase Auth) ==================== */}
          {screen === "login" && (
            <div className="flex-1 flex flex-col p-6 justify-between bg-white animate-in fade-in slide-in-from-right-6 duration-300">
              <div className="space-y-6">
                <button onClick={() => navigate("splash")} className="p-2 text-slate-500 hover:text-slate-800 rounded-full bg-slate-100 hover:bg-slate-200 inline-block self-start cursor-pointer transition-colors active:scale-90">
                  <ArrowLeft className="h-5 w-5" />
                </button>

                <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                  <h2 className="text-2xl font-display font-bold text-slate-900">
                    {authMode === "login" ? "Sign In to Civic-IQ" : "Create your Civic-IQ account"}
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    {authMode === "login"
                      ? "Sign in to report and track issues in your neighborhood."
                      : "Sign up to start reporting issues in your neighborhood."}
                  </p>
                </div>

                <form className="space-y-4 text-xs" onSubmit={handleAuthSubmit}>
                  {authMode === "signup" && (
                    <div className="space-y-1.5 civiciq-rise">
                      <label className="font-semibold text-slate-700 block">Full Name</label>
                      <input
                        type="text"
                        value={authName}
                        onChange={(e) => setAuthName(e.target.value)}
                        className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl font-medium transition-all focus:border-gov-blue focus:bg-white focus:ring-4 focus:ring-gov-blue/10 text-sm"
                        placeholder="Your name"
                        required
                      />
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className="font-semibold text-slate-700 block">Email</label>
                    <input
                      type="email"
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                      className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl font-medium transition-all focus:border-gov-blue focus:bg-white focus:ring-4 focus:ring-gov-blue/10 text-sm"
                      placeholder="you@example.com"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-semibold text-slate-700 block">Password</label>
                    <input
                      type="password"
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                      className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl font-medium transition-all focus:border-gov-blue focus:bg-white focus:ring-4 focus:ring-gov-blue/10 text-sm"
                      placeholder="••••••••"
                      required
                      minLength={6}
                    />
                  </div>

                  {authError && (
                    <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2 animate-in fade-in slide-in-from-top-1 duration-200">
                      {authError}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={authLoading}
                    className="w-full py-3.5 bg-gov-blue hover:bg-gov-blue-hover disabled:opacity-60 text-white font-bold text-sm rounded-xl transition-all duration-200 shadow-md hover:shadow-lg cursor-pointer flex items-center justify-center gap-2 active:scale-97"
                  >
                    {authLoading && (
                      <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    )}
                    <span>{authMode === "login" ? "Sign In" : "Sign Up"}</span>
                  </button>
                </form>

                <button
                  onClick={() => {
                    setAuthMode(authMode === "login" ? "signup" : "login");
                    setAuthError(null);
                  }}
                  className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs cursor-pointer transition-colors"
                >
                  {authMode === "login" ? "New here? Create an account" : "Already have an account? Sign in"}
                </button>
              </div>
            </div>
          )}

          {/* ==================== SCREEN 3: HOME SCREEN ==================== */}
          {screen === "home" && (
            <div className="flex-1 flex flex-col bg-slate-50 animate-in fade-in duration-300">
              {/* Home Header */}
              <div className="bg-white p-4 border-b border-slate-200 sticky top-0 z-20 flex items-center justify-between shadow-2xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gov-blue text-white font-bold flex items-center justify-center text-sm shadow-sm border border-blue-200 overflow-hidden ring-2 ring-transparent hover:ring-gov-blue/20 transition-all">
                    {user?.photoURL ? (
                      <img src={user.photoURL} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      userInitials
                    )}
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 font-medium flex items-center gap-1">
                      <span>👋 Welcome</span>
                    </div>
                    <span className="text-sm font-bold text-slate-900 leading-tight block">{user?.name || "Citizen"}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => navigate("emergency")} className="p-2 bg-red-50 text-red-600 rounded-full hover:bg-red-100 transition-all cursor-pointer active:scale-90" title="Emergency Helplines">
                    <PhoneCall className="h-4.5 w-4.5" />
                  </button>
                  <button onClick={() => navigate("settings")} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full cursor-pointer transition-all active:scale-90">
                    <SettingsIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Main Content */}
              <div className="flex-1 p-4 space-y-4">

                {/* Hero Card: How can we help? */}
                <div className="bg-gradient-to-r from-gov-blue via-blue-700 to-indigo-800 text-white rounded-2xl p-5 shadow-md space-y-3 relative overflow-hidden civiciq-rise">
                  <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/5 blur-2xl pointer-events-none" />
                  <div className="relative z-10">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-blue-200 bg-white/10 px-2 py-0.5 rounded-full inline-block mb-1">
                      BMC Municipal Portal
                    </span>
                    <h3 className="font-display font-bold text-xl text-white">How can we help you today?</h3>
                    <p className="text-xs text-blue-100 mt-1 leading-relaxed">
                      Report civic issues in your street or check status on ongoing repairs.
                    </p>
                  </div>
                  <div className="pt-1 relative z-10">
                    <button
                      onClick={() => { goToStep(1); navigate("submit"); }}
                      className="w-full py-3.5 bg-white hover:bg-slate-50 text-gov-blue font-bold text-sm rounded-xl shadow-lg transition-all duration-200 hover:shadow-xl active:scale-97 flex items-center justify-center gap-2 cursor-pointer group"
                    >
                      <Camera className="h-5 w-5 text-gov-blue transition-transform group-hover:rotate-6" />
                      <span>📸 Report an Issue Now</span>
                    </button>
                  </div>
                </div>

                {/* 4 Big Consumer Action Cards */}
                <div className="grid grid-cols-2 gap-2.5">
                  {[
                    { onClick: () => { goToStep(1); navigate("submit"); }, emoji: "📸", bg: "bg-blue-50", text: "text-gov-blue", hoverBorder: "hover:border-gov-blue", title: "Report Issue", sub: "Potholes, leaks, trash", delay: "delay-0" },
                    { onClick: () => navigate("history"), emoji: "📍", bg: "bg-amber-50", text: "text-amber-700", hoverBorder: "hover:border-gov-blue", title: "Track Reports", sub: `${complaints.length} active tickets`, delay: "delay-75" },
                    { onClick: () => navigate("emergency"), emoji: "☎️", bg: "bg-red-50", text: "text-red-600", hoverBorder: "hover:border-red-400", title: "Emergency 1916", sub: "Helplines & Disaster", delay: "delay-100" },
                    { onClick: () => navigate("updates"), emoji: "📰", bg: "bg-emerald-50", text: "text-emerald-700", hoverBorder: "hover:border-emerald-400", title: "Ward Updates", sub: "Rain & maintenance", delay: "delay-150" },
                  ].map((card, i) => (
                    <button
                      key={i}
                      onClick={card.onClick}
                      className={`p-3.5 bg-white border border-slate-200 ${card.hoverBorder} rounded-2xl text-left space-y-2 transition-all duration-200 shadow-2xs hover:shadow-md hover:-translate-y-0.5 cursor-pointer group civiciq-rise ${card.delay}`}
                    >
                      <div className={`w-10 h-10 rounded-xl ${card.bg} ${card.text} flex items-center justify-center font-bold text-xl group-hover:scale-110 transition-transform duration-200`}>
                        {card.emoji}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 group-hover:text-gov-blue transition-colors">{card.title}</h4>
                        <p className="text-[10px] text-slate-500 leading-tight">{card.sub}</p>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Recent Complaints Section */}
                <div className="space-y-2.5 pt-1">
                  <div className="flex items-center justify-between px-1">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">Your Recent Reports</h4>
                    <button onClick={() => navigate("history")} className="text-xs text-gov-blue font-bold flex items-center gap-0.5 cursor-pointer hover:gap-1.5 transition-all">
                      <span>View All ({complaints.length})</span>
                      <ChevronRight className="h-3 w-3" />
                    </button>
                  </div>

                  {complaints.length === 0 ? (
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 text-center text-slate-400 space-y-2">
                      <CheckCircle className="h-8 w-8 mx-auto text-emerald-500/60" />
                      <p className="text-xs font-medium text-slate-600">No reported issues right now!</p>
                      <p className="text-[10px] text-slate-400">Notice something broken on your street? Click "Report an Issue" above.</p>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {complaints.slice(0, 3).map((c, i) => {
                        let statusColor = "bg-amber-100 text-amber-800 border-amber-300";
                        if (c.status === "Resolved") statusColor = "bg-emerald-100 text-emerald-800 border-emerald-300";
                        else if (c.status === "In Progress") statusColor = "bg-blue-100 text-blue-800 border-blue-300";

                        return (
                          <div
                            key={c.id}
                            onClick={() => handleOpenTracking(c)}
                            style={{ animationDelay: `${i * 60}ms` }}
                            className="bg-white border border-slate-200/80 rounded-2xl p-3.5 hover:border-gov-blue cursor-pointer transition-all duration-200 shadow-2xs hover:shadow-md hover:-translate-y-0.5 space-y-2 civiciq-rise"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <span className="text-[10px] font-mono text-slate-400 font-bold block">{c.id}</span>
                                <h5 className="text-xs font-bold text-slate-900 line-clamp-1">{c.title}</h5>
                              </div>
                              <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border ${statusColor}`}>
                                {c.status}
                              </span>
                            </div>

                            <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                              {c.description}
                            </p>

                            <div className="flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-100 pt-2 font-mono">
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3 text-slate-400" />
                                <span className="line-clamp-1 max-w-[150px]">{c.address}</span>
                              </span>
                              <span className="text-gov-blue font-bold flex items-center gap-0.5 group-hover:gap-1.5">
                                <span>Track Timeline</span>
                                <ChevronRight className="h-3 w-3" />
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

              </div>

              {/* Bottom Nav Bar with animated sliding active-pill indicator */}
              <div className="bg-white border-t border-slate-200 py-2.5 px-6 relative flex items-center justify-around sticky bottom-0 z-20 shadow-lg">
                <div
                  className="absolute top-1.5 h-[calc(100%-0.75rem)] w-[calc(25%-0.5rem)] bg-blue-50 rounded-2xl transition-all duration-300 ease-out"
                  style={{ left: `calc(${activeNavIndex * 25}% + 0.5rem)` }}
                  aria-hidden="true"
                />
                {NAV_SCREENS.map((n) => {
                  const isActive = activeNavIndex === NAV_SCREENS.indexOf(n);
                  return (
                    <button
                      key={n.screen}
                      onClick={() => navigate(n.screen)}
                      className={`relative z-10 flex flex-col items-center gap-0.5 cursor-pointer transition-all duration-200 ${
                        isActive ? "text-gov-blue font-bold -translate-y-0.5" : "text-slate-400 hover:text-slate-700"
                      }`}
                    >
                      {n.icon}
                      <span className="text-[10px]">{n.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ==================== SCREEN 4: GUIDED STEP-BY-STEP COMPLAINT WIZARD ==================== */}
          {screen === "submit" && (
            <div className="flex-1 flex flex-col bg-slate-50 animate-in fade-in slide-in-from-right-6 duration-300">
              {/* Header */}
              <div className="bg-white p-4 border-b border-slate-200 sticky top-0 z-20 flex items-center justify-between shadow-2xs">
                <div className="flex items-center gap-2">
                  <button onClick={() => navigate("home")} className="p-1.5 text-slate-500 hover:text-slate-800 rounded-full hover:bg-slate-100 cursor-pointer transition-all active:scale-90">
                    <ArrowLeft className="h-5 w-5" />
                  </button>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Report an Issue</h3>
                    <p className="text-[10px] text-slate-400 font-medium">Step {submitStep} of 5</p>
                  </div>
                </div>

                {/* Step indicator bar */}
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <span
                      key={s}
                      className={`h-2 rounded-full transition-all duration-300 ${
                        s === submitStep ? "w-5 bg-gov-blue" : s < submitStep ? "w-2 bg-gov-blue/50" : "w-2 bg-slate-200"
                      }`}
                    ></span>
                  ))}
                </div>
              </div>

              {/* Wizard Step Body — re-keyed per step so each step slides/fades in fresh */}
              <div
                key={submitStep}
                className={`flex-1 p-4 space-y-4 animate-in fade-in duration-300 ${
                  stepDirection === "forward" ? "slide-in-from-right-4" : "slide-in-from-left-4"
                }`}
              >

                {/* ---------- STEP 1: CHOOSE ISSUE CATEGORY ---------- */}
                {submitStep === 1 && (
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <h4 className="text-lg font-bold text-slate-900">1. What type of issue is it?</h4>
                      <p className="text-xs text-slate-500">Tap the category that best matches the problem.</p>
                    </div>

                    <div className="grid sm:grid-cols-4 grid-cols-2 gap-2.5">
                      {ISSUE_CATEGORIES.map((cat, i) => (
                        <button
                          key={cat.id}
                          type="button"
                          style={{ animationDelay: `${i * 40}ms` }}
                          onClick={() => {
                            handleSelectCategory(cat);
                            goToStep(2);
                          }}
                          className={`p-3.5 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between h-28 civiciq-rise hover:-translate-y-0.5 hover:shadow-md active:scale-97 ${
                            selectedCategoryObj.id === cat.id
                              ? "bg-gov-blue text-white border-gov-blue shadow-md ring-2 ring-gov-blue/30"
                              : `${cat.color}`
                          }`}
                        >
                          <div className="text-2xl">{cat.icon}</div>
                          <div>
                            <h5 className="font-bold text-xs leading-tight">{cat.name}</h5>
                            <p className={`text-[10px] mt-0.5 line-clamp-1 ${selectedCategoryObj.id === cat.id ? "text-blue-100" : "opacity-80"}`}>
                              {cat.desc}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* ---------- STEP 2: TAKE PHOTO & LIVE AI ANALYSIS ---------- */}
                {submitStep === 2 && (
                  <div className="space-y-4">
                    {/* Hidden file input for native camera/gallery upload */}
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      className="hidden"
                      onChange={handleCustomFileUpload}
                    />

                    <div className="space-y-1 flex items-center justify-between">
                      <div>
                        <h4 className="text-lg font-bold text-slate-900">2. Take or upload a photo</h4>
                        <p className="text-xs text-slate-500">AI automatically detects the hazard, severity, and department.</p>
                      </div>
                      <span className="text-[10px] font-bold text-gov-blue bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-full shrink-0">
                        HD High-Res Scan
                      </span>
                    </div>

                    {/* Camera / High-Res Photo Upload Container */}
                    {selectedPhoto ? (
                      <div className="space-y-3">
                        {/* Large High-Resolution Image Preview Frame */}
                        <div className="relative w-full rounded-2xl overflow-hidden bg-slate-900 border border-slate-300 shadow-lg group civiciq-pop">
                          <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full overflow-hidden bg-slate-950 flex items-center justify-center">
                            <img
                              src={selectedPhoto.url}
                              alt={selectedPhoto.name}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 cursor-pointer"
                              onClick={() => setIsPhotoLightboxOpen(true)}
                            />

                            {/* Top Left Overlay Badge */}
                            <div className="absolute top-3 left-3 flex items-center gap-2 z-10">
                              <span className="bg-slate-900/85 text-white backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-bold border border-white/20 flex items-center gap-1.5 shadow-md">
                                <Camera className="h-3.5 w-3.5 text-gov-blue-light" />
                                <span>High-Res Photo Preview</span>
                              </span>
                              <span className="hidden sm:inline-flex bg-emerald-500/90 text-white backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase border border-white/20">
                                Full HD • 1080p
                              </span>
                            </div>

                            {/* Top Right Zoom & Circular Upload Badge Overlay */}
                            <div className="absolute top-3 right-3 flex items-center gap-2 z-10">
                              {/* Circular Progress Badge (100% Complete State) */}
                              {uploadProgress === 100 && !isUploadingPhoto && (
                                <div className="bg-slate-900/90 text-white backdrop-blur-md px-3 py-1 rounded-full border border-emerald-400/40 flex items-center gap-2 shadow-md civiciq-pop">
                                  <div className="relative flex items-center justify-center w-5 h-5">
                                    <svg className="w-5 h-5 transform -rotate-90">
                                      <circle cx="10" cy="10" r="7.5" stroke="rgba(255,255,255,0.2)" strokeWidth="2.5" fill="transparent" />
                                      <circle
                                        cx="10"
                                        cy="10"
                                        r="7.5"
                                        stroke="#10b981"
                                        strokeWidth="2.5"
                                        fill="transparent"
                                        strokeDasharray={47.12}
                                        strokeDashoffset={0}
                                        strokeLinecap="round"
                                      />
                                    </svg>
                                    <Check className="absolute h-2.5 w-2.5 text-emerald-400" />
                                  </div>
                                  <span className="text-[10px] font-extrabold text-emerald-400 tracking-wide">100% Uploaded</span>
                                </div>
                              )}

                              <button
                                type="button"
                                onClick={() => setIsPhotoLightboxOpen(true)}
                                className="p-2 bg-slate-900/80 hover:bg-slate-900 text-white backdrop-blur-md rounded-full border border-white/20 shadow-md transition-all cursor-pointer hover:scale-110 active:scale-95"
                                title="View Fullscreen High-Res Photo"
                              >
                                <Maximize2 className="h-3.5 w-3.5" />
                              </button>
                            </div>

                            {/* CIRCULAR PROGRESS BAR OVERLAY (ACTIVE UPLOADING) */}
                            {isUploadingPhoto && (
                              <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md z-30 flex flex-col items-center justify-center p-4 animate-in fade-in duration-200">
                                <div className="relative flex items-center justify-center w-20 h-20 mb-2">
                                  {/* Circular SVG Progress Bar */}
                                  <svg className="w-20 h-20 transform -rotate-90">
                                    <circle
                                      cx="40"
                                      cy="40"
                                      r="32"
                                      stroke="rgba(255, 255, 255, 0.15)"
                                      strokeWidth="6"
                                      fill="transparent"
                                    />
                                    <circle
                                      cx="40"
                                      cy="40"
                                      r="32"
                                      stroke="#3b82f6"
                                      strokeWidth="6"
                                      fill="transparent"
                                      strokeDasharray={201.06}
                                      strokeDashoffset={201.06 - (uploadProgress / 100) * 201.06}
                                      strokeLinecap="round"
                                      className="transition-all duration-100 ease-out"
                                    />
                                  </svg>
                                  <div className="absolute flex flex-col items-center justify-center text-white">
                                    <span className="text-sm font-extrabold font-mono tracking-tight">{uploadProgress}%</span>
                                  </div>
                                </div>
                                <p className="text-xs font-bold text-white tracking-wide flex items-center gap-1.5">
                                  <UploadCloud className="h-3.5 w-3.5 text-gov-blue-light animate-bounce" />
                                  <span>Uploading HD Image Stream...</span>
                                </p>
                                <p className="text-[10px] text-blue-200 font-mono mt-1 bg-blue-950/80 px-2.5 py-0.5 rounded-full border border-blue-400/30">
                                  SHA-256 Verified • High-Res Scan
                                </p>
                              </div>
                            )}

                            {/* Center hover indicator */}
                            <div
                              onClick={() => setIsPhotoLightboxOpen(true)}
                              className="absolute inset-0 bg-slate-950/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer z-0"
                            >
                              <span className="bg-slate-900/90 text-white text-xs font-bold px-4 py-2 rounded-xl backdrop-blur-md border border-white/20 flex items-center gap-2 shadow-xl">
                                <ZoomIn className="h-4 w-4 text-gov-blue-light" />
                                <span>Tap for Full Resolution Inspection</span>
                              </span>
                            </div>

                            {/* Bottom Gradient Overlay */}
                            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent p-3.5 text-white z-10 pointer-events-none">
                              <div className="flex items-end justify-between gap-2">
                                <div>
                                  <span className="text-[10px] font-mono text-blue-300 uppercase tracking-wider block mb-0.5">
                                    Captured Photo File
                                  </span>
                                  <h5 className="font-bold text-sm leading-tight text-white line-clamp-1">{selectedPhoto.name}</h5>
                                </div>
                                <span className="text-[10px] font-bold bg-gov-blue/90 text-white px-2.5 py-0.5 rounded-full backdrop-blur-sm shrink-0 border border-blue-400/30">
                                  {selectedPhoto.category || selectedCategoryObj.name}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Toolbar underneath the high-res image */}
                          <div className="p-3 bg-white border-t border-slate-200 flex items-center justify-between gap-2 text-xs">
                            <button
                              type="button"
                              onClick={() => setIsPhotoLightboxOpen(true)}
                              className="flex-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              <Maximize2 className="h-3.5 w-3.5 text-gov-blue" />
                              <span>Inspect Full High-Res</span>
                            </button>

                            <button
                              type="button"
                              onClick={startPhotoUploadSimulation}
                              className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                              title="Re-run circular upload progress animation"
                            >
                              <RefreshCw className={`h-3.5 w-3.5 text-gov-blue ${isUploadingPhoto ? "animate-spin" : ""}`} />
                              <span className="hidden sm:inline">Upload Scan ({uploadProgress}%)</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              className="flex-1 py-2 px-3 bg-blue-50 hover:bg-blue-100 text-gov-blue font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-blue-200"
                            >
                              <UploadCloud className="h-3.5 w-3.5" />
                              <span>Change Photo</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setSelectedPhoto(null);
                                setAiAnalysisPreview(null);
                              }}
                              className="py-2 px-3 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer border border-red-200"
                              title="Remove photo"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* Drag and Drop / Photo Picker Dropzone */
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="bg-white border-2 border-dashed border-slate-300 hover:border-gov-blue hover:bg-blue-50/20 rounded-2xl p-6 text-center space-y-3 cursor-pointer transition-all group shadow-2xs"
                      >
                        <div className="w-14 h-14 bg-gov-blue/10 text-gov-blue rounded-full flex items-center justify-center mx-auto group-hover:scale-110 group-hover:bg-gov-blue group-hover:text-white transition-all duration-300 shadow-xs">
                          <Camera className="h-7 w-7" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800">Take Photo or Upload Image</p>
                          <p className="text-xs text-slate-500 mt-1">Tap to open camera or select high-res photo from gallery</p>
                          <p className="text-[10px] text-slate-400 font-mono mt-1">Supports High-Res JPG, PNG, WEBP up to 20MB</p>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            fileInputRef.current?.click();
                          }}
                          className="px-4 py-2 bg-gov-blue text-white text-xs font-bold rounded-xl shadow-sm hover:bg-gov-blue-hover hover:shadow-md transition-all inline-flex items-center gap-1.5 cursor-pointer active:scale-95"
                        >
                          <UploadCloud className="h-4 w-4" />
                          <span>Select High-Res Image</span>
                        </button>
                      </div>
                    )}


                    {/* Fullscreen High-Res Photo Lightbox Modal */}
                    {isPhotoLightboxOpen && selectedPhoto && (
                      <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex flex-col p-4 sm:p-6 animate-in fade-in duration-200">
                        <div className="flex items-center justify-between text-white pb-3 border-b border-white/10">
                          <div className="flex items-center gap-2">
                            <Camera className="h-5 w-5 text-gov-blue-light" />
                            <div>
                              <h4 className="font-bold text-sm text-white">{selectedPhoto.name}</h4>
                              <p className="text-[10px] text-slate-400 font-mono">High-Resolution Media Inspection</p>
                            </div>
                          </div>
                          <button
                            onClick={() => setIsPhotoLightboxOpen(false)}
                            className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors cursor-pointer"
                          >
                            <X className="h-5 w-5" />
                          </button>
                        </div>

                        <div className="flex-1 flex items-center justify-center my-4 overflow-auto">
                          <img
                            src={selectedPhoto.url}
                            alt={selectedPhoto.name}
                            className="max-h-[75vh] max-w-full object-contain rounded-2xl shadow-2xl border border-white/20 animate-in zoom-in-95 duration-300"
                          />
                        </div>

                        <div className="bg-slate-900 border border-white/10 rounded-2xl p-3 text-white text-xs flex flex-wrap items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2.5 py-1 rounded-full text-[10px] font-bold">
                              Full HD Quality
                            </span>
                            <span className="text-slate-300 text-[11px]">
                              Category: <strong className="text-white">{selectedPhoto.category || selectedCategoryObj.name}</strong>
                            </span>
                          </div>

                          <button
                            onClick={() => setIsPhotoLightboxOpen(false)}
                            className="px-4 py-2 bg-gov-blue text-white font-bold rounded-xl text-xs hover:bg-gov-blue-hover transition-colors cursor-pointer"
                          >
                            Close Full Preview
                          </button>
                        </div>
                      </div>
                    )}

                    {/* LIVE AI ANALYSIS CARD */}
                    {(isAIAnalyzing || aiAnalysisPreview) && (
                      <div className="relative bg-[#10243D] text-[#F5F7F5] rounded-2xl overflow-hidden shadow-lg border border-[#2C4A68] civiciq-rise">
                        {/* faint blueprint grid backdrop */}
                        <div
                          className="absolute inset-0 opacity-[0.07] pointer-events-none"
                          style={{
                            backgroundImage:
                              "linear-gradient(#8DA9C4 1px, transparent 1px), linear-gradient(90deg, #8DA9C4 1px, transparent 1px)",
                            backgroundSize: "16px 16px",
                          }}
                        />

                        {/* header strip */}
                        <div className="relative flex items-center justify-between px-4 pt-3.5 pb-2.5">
                          <div className="flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-[#F0A93A]" />
                            <span className="text-xs font-bold tracking-wide">AI Inspection Readout</span>
                          </div>
                          <span className="font-mono text-[10px] text-[#8DA9C4]">
                            SCAN-{String(Math.abs(reportTitle.length * 37 + 4021)).slice(-4)}
                          </span>
                        </div>

                        {/* perforated divider, like a tear-off ticket */}
                        <div className="relative flex items-center px-4">
                          <div className="flex-1 border-t border-dashed border-[#2C4A68]" />
                        </div>

                        <div className="relative px-4 pt-3 pb-4">
                          {isAIAnalyzing ? (
                            <div className="py-5 space-y-3">
                              <div className="flex items-center justify-center gap-2">
                                <div className="w-6 h-6 border-2 border-[#3FBFA6] border-t-transparent rounded-full animate-spin"></div>
                                <p className="text-xs text-[#8DA9C4] font-mono">running hazard diagnostic...</p>
                              </div>
                              <div className="space-y-2">
                                <div className="h-3 rounded civiciq-shimmer" />
                                <div className="h-3 rounded civiciq-shimmer w-3/4" />
                                <div className="h-10 rounded-xl civiciq-shimmer" />
                              </div>
                            </div>
                          ) : aiAnalysisPreview && (
                            <div className="space-y-3">
                              {/* confidence gauge + detected problem */}
                              <div className="flex items-center gap-3.5 bg-[#0D1E33] border border-[#2C4A68] rounded-xl p-3 civiciq-pop">
                                <div className="relative w-14 h-14 shrink-0">
                                  <svg viewBox="0 0 56 56" className="w-14 h-14 -rotate-90">
                                    <circle cx="28" cy="28" r="24" fill="none" stroke="#2C4A68" strokeWidth="4" />
                                    <circle
                                      cx="28"
                                      cy="28"
                                      r="24"
                                      fill="none"
                                      stroke="#3FBFA6"
                                      strokeWidth="4"
                                      strokeLinecap="round"
                                      strokeDasharray={2 * Math.PI * 24}
                                      strokeDashoffset={2 * Math.PI * 24 * (1 - aiAnalysisPreview.confidence)}
                                      style={{ transition: "stroke-dashoffset 0.8s cubic-bezier(0.16,1,0.3,1)" }}
                                    />
                                  </svg>
                                  <div className="absolute inset-0 flex items-center justify-center font-mono text-[11px] font-bold text-[#3FBFA6]">
                                    {Math.round(aiAnalysisPreview.confidence * 100)}%
                                  </div>
                                </div>
                                <div className="min-w-0">
                                  <span className="font-mono text-[10px] text-[#8DA9C4] uppercase tracking-wide block">
                                    Detected problem
                                  </span>
                                  <span className="font-bold text-sm text-[#F5F7F5] block truncate">
                                    {aiAnalysisPreview.category}
                                  </span>
                                  <span className="inline-block mt-1 font-mono text-[10px] text-[#F0A93A] border border-[#F0A93A]/40 bg-[#F0A93A]/10 px-1.5 py-0.5 rounded">
                                    {aiAnalysisPreview.severity} hazard
                                  </span>
                                </div>
                              </div>

                              {/* reasoning */}
                              <div className="border border-[#2C4A68] rounded-xl p-3">
                                <span className="font-mono text-[10px] text-[#8DA9C4] uppercase tracking-wide block mb-1">
                                  Inspector notes
                                </span>
                                <p className="text-[11px] text-[#D3DEE8] leading-relaxed">{aiAnalysisPreview.reasoning}</p>
                              </div>

                              {/* data readout row, like a lab report footer */}
                              <div className="grid grid-cols-3 border border-[#2C4A68] rounded-xl overflow-hidden">
                                <div className="p-2.5 text-center border-r border-[#2C4A68]">
                                  <span className="font-mono text-[9px] text-[#8DA9C4] block uppercase">Repair est.</span>
                                  <span className="font-mono text-sm font-bold text-[#3FBFA6]">
                                    {aiAnalysisPreview.timeToRepairHours}h
                                  </span>
                                </div>
                                <div className="p-2.5 text-center border-r border-[#2C4A68]">
                                  <span className="font-mono text-[9px] text-[#8DA9C4] block uppercase">Priority</span>
                                  <span className="font-mono text-sm font-bold text-[#F5F7F5]">
                                    {aiAnalysisPreview.priorityScore}/100
                                  </span>
                                </div>
                                <div className="p-2.5 text-center">
                                  <span className="font-mono text-[9px] text-[#8DA9C4] block uppercase">Budget</span>
                                  <span className="font-mono text-sm font-bold text-[#F0A93A]">
                                    ₹{aiAnalysisPreview.budgetRequired.toLocaleString("en-IN")}
                                  </span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* ---------- STEP 3: VOICE & TEXT DESCRIPTION ---------- */}
                {submitStep === 3 && (
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <h4 className="text-lg font-bold text-slate-900">3. Describe the problem</h4>
                      <p className="text-xs text-slate-500">Speak or type in English or Hindi.</p>
                    </div>

                    {/* Prominent Voice First Recording Button */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-5 text-center space-y-3">
                      <button
                        type="button"
                        onClick={handleToggleVoice}
                        className={`w-20 h-20 rounded-full mx-auto flex items-center justify-center transition-all duration-200 cursor-pointer shadow-lg ${
                          isRecording ? "bg-red-500 text-white civiciq-ring scale-105" : "bg-gov-blue text-white hover:bg-gov-blue-hover hover:scale-105 active:scale-95"
                        }`}
                      >
                        <Mic className="h-8 w-8" />
                      </button>

                      <div>
                        <p className="text-xs font-bold text-slate-900">
                          {isRecording ? "Listening... Speak now" : "Tap microphone to speak your issue"}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">Supports English, Hindi, and Marathi</p>
                      </div>

                      {isRecording && (
                        <div className="flex justify-center items-end gap-1 h-6 pt-1">
                          {voiceWave.map((h, i) => (
                            <span
                              key={i}
                              className="w-1 bg-red-500 rounded-full transition-all duration-150 ease-out"
                              style={{ height: `${h}%` }}
                            ></span>
                          ))}
                        </div>
                      )}

                      {voiceTranscript && (
                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-left text-xs space-y-1 animate-in fade-in slide-in-from-bottom-1 duration-300">
                          <span className="font-bold text-gov-blue text-[10px] uppercase block">Transcribed Voice Message:</span>
                          <p className="text-slate-800 italic">"{voiceTranscript}"</p>
                        </div>
                      )}
                    </div>

                    {/* Text Inputs */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-800 block">Short Title</label>
                        <input
                          type="text"
                          value={reportTitle}
                          onChange={(e) => setReportTitle(e.target.value)}
                          className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium transition-all focus:border-gov-blue focus:bg-white focus:ring-4 focus:ring-gov-blue/10"
                          placeholder="e.g. Deep pothole outside station"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-800 block">Details (Optional)</label>
                        <textarea
                          value={reportDesc}
                          onChange={(e) => setReportDesc(e.target.value)}
                          rows={3}
                          className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium resize-none transition-all focus:border-gov-blue focus:bg-white focus:ring-4 focus:ring-gov-blue/10"
                          placeholder="Describe size, landmarks, or danger to pedestrians..."
                        ></textarea>
                      </div>
                    </div>
                  </div>
                )}

                {/* ---------- STEP 4: LOCATION ON MAP ---------- */}
                {submitStep === 4 && (
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <h4 className="text-lg font-bold text-slate-900">4. Confirm location</h4>
                      <p className="text-xs text-slate-500">Tap anywhere on the map to place the issue pin.</p>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-2xl p-3 space-y-3">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleAutoGPS}
                          className="flex-1 py-2.5 bg-blue-50 hover:bg-blue-100 text-gov-blue text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer border border-blue-200 active:scale-97"
                        >
                          <MapPin className="h-4 w-4" />
                          <span>📍 Find Current Location</span>
                        </button>

                        {/* Floating Action Button: Street View vs Satellite Mode Toggle */}
                        <button
                          type="button"
                          onClick={() => setWizardMapMode(wizardMapMode === "street" ? "satellite" : "street")}
                          className={`py-2.5 px-3.5 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer border shadow-2xs active:scale-95 ${
                            wizardMapMode === "satellite"
                              ? "bg-emerald-600 text-white border-emerald-500 shadow-md ring-2 ring-emerald-500/20"
                              : "bg-slate-900 text-white border-slate-800 hover:bg-slate-800"
                          }`}
                          title="Toggle map view between Street View and High-Res Satellite Imagery"
                        >
                          {wizardMapMode === "satellite" ? (
                            <>
                              <Globe className="h-4 w-4 text-emerald-300" />
                              <span className="hidden sm:inline">Satellite Active</span>
                              <span className="sm:hidden">Satellite</span>
                            </>
                          ) : (
                            <>
                              <MapIcon className="h-4 w-4 text-blue-300" />
                              <span className="hidden sm:inline">Street View</span>
                              <span className="sm:hidden">Street</span>
                            </>
                          )}
                        </button>
                      </div>

                      <SmartCityMap
                        interactiveMode={true}
                        manualPin={gpsLocation}
                        onMapClick={handleManualMapClick}
                        heightClass="h-[230px]"
                        showHeatmap={false}
                        showClusters={false}
                        showWorkers={false}
                        showPriorityZones={false}
                        initialMapMode={wizardMapMode}
                        onMapModeChange={setWizardMapMode}
                      />

                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-0.5">
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Selected Address:</span>
                        <p className="font-bold text-slate-800 leading-tight">{addressText}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* ---------- STEP 5: REVIEW & SUBMIT ---------- */}
                {submitStep === 5 && (
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <h4 className="text-lg font-bold text-slate-900">5. Review your report</h4>
                      <p className="text-xs text-slate-500">Check details before sending to BMC officers.</p>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 text-xs shadow-2xs">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                        <span className="text-slate-500">Category:</span>
                        <span className="font-bold text-gov-blue bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                          {selectedCategoryObj.name}
                        </span>
                      </div>

                      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                        <span className="text-slate-500">Report Title:</span>
                        <span className="font-bold text-slate-900">{reportTitle || "Civic Hazard Report"}</span>
                      </div>

                      {selectedPhoto && (
                        <div className="border-b border-slate-100 pb-2 flex items-center justify-between">
                          <span className="text-slate-500">Photo Attached:</span>
                          <img src={selectedPhoto.url} alt="Attached" className="w-12 h-12 object-cover rounded-lg border" />
                        </div>
                      )}

                      <div className="border-b border-slate-100 pb-2">
                        <span className="text-slate-500 block">Location:</span>
                        <span className="font-medium text-slate-800">{addressText}</span>
                      </div>

                      {aiAnalysisPreview && (
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                          <span className="text-[10px] font-bold text-gov-blue uppercase block">AI Calculated Priority:</span>
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-extrabold text-slate-900">{aiAnalysisPreview.priorityScore} / 100</span>
                            <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">High Priority Triage</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

              </div>

              {/* Wizard Bottom Buttons */}
              <div className="bg-white border-t border-slate-200 p-4 sticky bottom-0 z-20 flex gap-2">
                {submitStep > 1 && (
                  <button
                    type="button"
                    onClick={() => goToStep((submitStep - 1) as any)}
                    className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer transition-all active:scale-95"
                  >
                    Back
                  </button>
                )}

                {submitStep < 5 ? (
                  <button
                    type="button"
                    onClick={() => goToStep((submitStep + 1) as any)}
                    className="flex-1 py-3.5 bg-gov-blue hover:bg-gov-blue-hover text-white font-bold text-sm rounded-xl transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-1 cursor-pointer active:scale-97"
                  >
                    <span>Next Step</span>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleFormSubmit}
                    disabled={isSubmitting}
                    className="flex-1 py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 disabled:cursor-not-allowed text-white font-bold text-sm rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 cursor-pointer active:scale-97"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-5 w-5" />
                        <span>Submit Report</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* ==================== SCREEN 5: CONFIRMATION RECEIPT ==================== */}
          {screen === "confirm" && (
            <div className="flex-1 flex flex-col p-6 items-center justify-between bg-white text-center animate-in fade-in duration-500">
              <div></div>
              <div className="space-y-4 max-w-xs mx-auto">
                <div className="w-20 h-20 bg-emerald-50 border-2 border-emerald-200 rounded-full flex items-center justify-center mx-auto text-emerald-600 shadow-md civiciq-pop civiciq-ring">
                  <CheckCircle className="h-12 w-12" />
                </div>
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 delay-150">
                  <h3 className="text-2xl font-display font-bold text-slate-900">🎉 Thank you!</h3>
                  <p className="text-xs text-slate-600 font-medium mt-1">Your report helps improve Mumbai.</p>
                  <span className="text-xs font-mono text-gov-blue font-bold uppercase tracking-wider block mt-2 bg-blue-50 py-1 px-3 rounded-full border border-blue-200">
                    Complaint ID: {lastSubmittedComplaint?.id || "CIQ-2026-4821"}
                  </span>
                </div>

                <div className="border border-slate-200 p-4 rounded-2xl bg-slate-50 text-left space-y-2 text-xs text-slate-700 font-medium animate-in fade-in slide-in-from-bottom-1 duration-500 delay-300">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Department:</span>
                    <span className="font-bold text-slate-900">BMC Ward K-West</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Est. Response:</span>
                    <span className="font-bold text-emerald-600">Within 4 Hours</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Priority Score:</span>
                    <span className="font-bold text-gov-blue">{lastSubmittedComplaint?.aiAnalysis?.priorityScore || 84}/100</span>
                  </div>
                </div>
              </div>

              <div className="w-full space-y-2">
                <button
                  onClick={() => {
                    if (lastSubmittedComplaint) handleOpenTracking(lastSubmittedComplaint);
                    else navigate("history");
                  }}
                  className="w-full py-3.5 bg-gov-blue hover:bg-gov-blue-hover text-white font-bold rounded-xl text-xs shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center justify-center gap-1 active:scale-97"
                >
                  <Clock className="h-4 w-4" />
                  <span>Track Complaint Live</span>
                </button>
                <button
                  onClick={() => navigate("home")}
                  className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer transition-all active:scale-97"
                >
                  Return Home
                </button>
              </div>
            </div>
          )}

          {/* ==================== SCREEN 6: VISUAL PROGRESS TIMELINE TRACKING ==================== */}
          {(screen === "tracking" || screen === "history") && (
            <div className="flex-1 flex flex-col bg-slate-50 animate-in fade-in slide-in-from-right-6 duration-300">
              <div className="bg-white p-4 border-b border-slate-200 flex items-center justify-between sticky top-0 z-20 shadow-2xs">
                <div className="flex items-center gap-2">
                  <button onClick={() => navigate("home")} className="p-1.5 text-slate-500 hover:text-slate-800 rounded-full hover:bg-slate-100 cursor-pointer transition-all active:scale-90">
                    <ArrowLeft className="h-5 w-5" />
                  </button>
                  <h3 className="text-sm font-bold text-slate-900">
                    {screen === "tracking" ? "Complaint Status Timeline" : "Your Reports History"}
                  </h3>
                </div>
                {screen === "history" && (
                  <span className="text-xs font-bold bg-blue-50 text-gov-blue px-2.5 py-0.5 rounded-full border border-blue-200">
                    {complaints.length} Total
                  </span>
                )}
              </div>

              {screen === "tracking" && selectedTrackingComplaint ? (
                <div className="flex-1 p-4 space-y-4">
                  {/* Ticket Summary Header */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2 shadow-2xs civiciq-rise">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono text-slate-400 font-bold">{selectedTrackingComplaint.id}</span>
                      <span className="text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300 px-2.5 py-0.5 rounded-full">
                        {selectedTrackingComplaint.status}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900">{selectedTrackingComplaint.title}</h4>
                    <p className="text-xs text-slate-500">{selectedTrackingComplaint.address}</p>
                  </div>

                  {/* VISUAL TIMELINE */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-6 shadow-2xs civiciq-rise">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <h5 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Live Municipal Operations Status</h5>
                      {selectedTrackingComplaint.status === "Accepted" && (
                        <span className="text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 px-2.5 py-0.5 rounded-full animate-pulse">
                          ⚡ Rahul Patil En Route (ETA ~12 mins)
                        </span>
                      )}
                    </div>

                    <div className="space-y-6 relative pl-6 border-l-2 border-slate-200 ml-2">

                      {/* Step 1: Submitted */}
                      <div className="relative">
                        <span className="absolute -left-[31px] top-0 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold shadow">
                          ✓
                        </span>
                        <div>
                          <h6 className="text-xs font-bold text-slate-900">1. Complaint Submitted</h6>
                          <p className="text-[11px] text-slate-500">Report logged into Municipal Central Registry.</p>
                          <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">
                            {new Date(selectedTrackingComplaint.reportedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>

                                           {/* Step 2: AI Review */}
                      <div className="relative">
                        <span className="absolute -left-[31px] top-0 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold shadow">
                          ✓
                        </span>
                        <div>
                          <h6 className="text-xs font-bold text-slate-900">2. AI Review & Classification</h6>
                          <p className="text-[11px] text-slate-500">AI verified issue category and assigned a priority score.</p>
                          <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">
                            {selectedTrackingComplaint.aiAnalysis?.priorityScore ? `Priority ${selectedTrackingComplaint.aiAnalysis.priorityScore}/100` : "Pending"}
                          </span>
                        </div>
                      </div>

                      {/* Step 3: Assigned to Department */}
                      <div className="relative">
                        <span className={`absolute -left-[31px] top-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shadow ${
                          selectedTrackingComplaint.status !== "Pending" ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-400"
                        }`}>
                          {selectedTrackingComplaint.status !== "Pending" ? "✓" : "3"}
                        </span>
                        <div>
                          <h6 className="text-xs font-bold text-slate-900">3. Assigned to Department</h6>
                          <p className="text-[11px] text-slate-500">Routed to the responsible municipal department.</p>
                        </div>
                      </div>

                      {/* Step 4: In Progress */}
                      <div className="relative">
                        <span className={`absolute -left-[31px] top-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shadow ${
                          selectedTrackingComplaint.status === "In Progress" || selectedTrackingComplaint.status === "Resolved" ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-400"
                        }`}>
                          {selectedTrackingComplaint.status === "In Progress" || selectedTrackingComplaint.status === "Resolved" ? "✓" : "4"}
                        </span>
                        <div>
                          <h6 className="text-xs font-bold text-slate-900">4. Work in Progress</h6>
                          <p className="text-[11px] text-slate-500">Field worker is on site resolving the issue.</p>
                        </div>
                      </div>

                      {/* Step 5: Resolved */}
                      <div className="relative">
                        <span className={`absolute -left-[31px] top-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shadow ${
                          selectedTrackingComplaint.status === "Resolved" ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-400"
                        }`}>
                          {selectedTrackingComplaint.status === "Resolved" ? "✓" : "5"}
                        </span>
                        <div>
                          <h6 className="text-xs font-bold text-slate-900">5. Resolved</h6>
                          <p className="text-[11px] text-slate-500">Issue closed and verified.</p>
                        </div>
                      </div>

                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex-1 p-4 space-y-2.5">
                  {complaints.length === 0 ? (
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 text-center text-slate-400 space-y-2">
                      <CheckCircle className="h-8 w-8 mx-auto text-emerald-500/60" />
                      <p className="text-xs font-medium text-slate-600">No reported issues yet.</p>
                    </div>
                  ) : (
                    complaints.map((c) => {
                      let statusColor = "bg-amber-100 text-amber-800 border-amber-300";
                      if (c.status === "Resolved") statusColor = "bg-emerald-100 text-emerald-800 border-emerald-300";
                      else if (c.status === "In Progress") statusColor = "bg-blue-100 text-blue-800 border-blue-300";
                      return (
                        <div
                          key={c.id}
                          onClick={() => handleOpenTracking(c)}
                          className="bg-white border border-slate-200/80 rounded-2xl p-3.5 hover:border-gov-blue cursor-pointer transition-all duration-200 shadow-2xs hover:shadow-md space-y-2"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <span className="text-[10px] font-mono text-slate-400 font-bold block">{c.id}</span>
                              <h5 className="text-xs font-bold text-slate-900 line-clamp-1">{c.title}</h5>
                            </div>
                            <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border ${statusColor}`}>
                              {c.status}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-600 line-clamp-2">{c.description}</p>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          )}

      </div>
    </div>
  );
}
