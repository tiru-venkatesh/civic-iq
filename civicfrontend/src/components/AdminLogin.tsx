import React, { useState } from "react";
import { Shield, Lock, User, AlertCircle, Home, Eye, EyeOff, UserPlus, CheckCircle2 } from "lucide-react";
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";

// ==== Firebase config ====
// Get these from Firebase Console > Project Settings > General > Your apps > Web app.
// You haven't registered a web app yet (Console shows "There are no apps in your
// project") — do that first, then paste the config object it gives you here.
const firebaseConfig = {
  apiKey: "AIzaSyAQi4BK3fD8UecPDl4lY3SUUVFc99WOya8",
  authDomain: "civic-iq.firebaseapp.com",
  projectId: "civic-iq",
  storageBucket: "civic-iq.firebasestorage.app",
  messagingSenderId: "816058667104",
  appId: "1:816058667104:web:808b3581625e874644b305",
  measurementId: "G-217GEWCYRT"
};


// avoids "Firebase app already initialized" if this file re-renders/hot-reloads
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

interface AdminLoginProps {
  onLoginSuccess: () => void;
  onBackToHome: () => void;
}

export default function AdminLogin({ onLoginSuccess, onBackToHome }: AdminLoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedEmail || !trimmedPassword) {
      setError("AUTHENTICATION FAILED: Credentials cannot be empty.");
      return;
    }

    setIsVerifying(true);
    try {
      // real Firebase Auth check — no hardcoded credentials
      const cred = await signInWithEmailAndPassword(auth, trimmedEmail, trimmedPassword);

      // Firestore role check — the users/{uid} doc must have role: "admin".
      // NOTE: admin accounts aren't self-signup. Create them manually for now:
      // 1. Firebase Console > Authentication > Add user (email + password)
      // 2. Firestore > users collection > new doc, doc ID = that user's UID,
      //    fields: { name, email, role: "admin", createdAt }
      const userDoc = await getDoc(doc(db, "users", cred.user.uid));

      if (userDoc.exists() && userDoc.data()?.role === "admin") {
        onLoginSuccess();
      } else {
        await signOut(auth); // don't leave a signed-in session for a non-admin
        setError("ACCESS DENIED: This account does not have administrator access.");
      }
    } catch (err: any) {
      if (
        err.code === "auth/invalid-credential" ||
        err.code === "auth/user-not-found" ||
        err.code === "auth/wrong-password"
      ) {
        setError("ACCESS DENIED: Invalid email or password.");
      } else if (err.code === "auth/invalid-api-key" || err.code === "auth/api-key-not-valid.-please-pass-a-valid-api-key.") {
        setError("CONFIG ERROR: Firebase isn't set up yet — register a web app in the Firebase Console first.");
      } else {
        setError(`AUTHENTICATION ERROR: ${err.message || "Service unavailable."}`);
      }
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-[#F5F7FA]">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl border border-slate-200 shadow-xl transition-all duration-300">

        {/* Header Branding & Security Icon */}
        <div className="text-center space-y-3">
          <div className="inline-flex p-4 bg-blue-50 text-[#1565C0] rounded-full ring-8 ring-blue-50/50">
            <Shield className="h-8 w-8" />
          </div>
          <div>
            <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-[#1565C0] bg-blue-50 px-2.5 py-1 rounded">
              ADMINISTRATOR LOGIN
            </span>
            <h2 className="mt-2 text-2xl font-display font-extrabold text-slate-950 tracking-tight">
              Official Municipal Portal
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Mumbai Municipal Corporation (MMC) Administration
            </p>
          </div>
        </div>

        {/* Security Alert Compliance Banner */}
        <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3.5 text-[11px] text-amber-800 leading-relaxed flex gap-2.5 items-start">
          <AlertCircle className="h-4.5 w-4.5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block text-[11.5px] text-amber-900 mb-0.5">AUTHORIZATION REQUIRED</span>
            Access to this dashboard is restricted to authorized municipal officers and department managers.
          </div>
        </div>

        {/* Login Form */}
        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-xs font-mono font-medium flex items-center gap-2 animate-shake">
              <AlertCircle className="h-4.5 w-4.5 text-red-500 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Email Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 tracking-wide uppercase font-mono block">
              Officer Email
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <User className="h-4 w-4" />
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="officer@bmc.gov.in"
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-[#1565C0] focus:bg-white rounded-xl text-xs text-slate-800 font-medium placeholder-slate-400 outline-none transition-all"
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-slate-700 tracking-wide uppercase font-mono block">
                Password
              </label>
              <span className="text-[10px] text-slate-400 font-medium">Case sensitive</span>
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <Lock className="h-4 w-4" />
              </span>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-[#1565C0] focus:bg-white rounded-xl text-xs text-slate-800 font-medium placeholder-slate-400 outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          {/* Demo Credentials Hint */}
<div className="bg-blue-50/70 border border-blue-200/80 rounded-xl p-3.5 text-[11px] text-blue-800 leading-relaxed flex gap-2.5 items-start">
  <Shield className="h-4.5 w-4.5 text-blue-600 shrink-0 mt-0.5" />
  <div>
    <span className="font-bold block text-[11.5px] text-blue-900 mb-0.5">DEMO CREDENTIALS</span>
    Email: <span className="font-mono font-bold">officer@gmail.com</span> · Password: <span className="font-mono font-bold">officer</span>
  </div>
</div>
          {/* Action buttons */}
          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={onBackToHome}
              className="w-full sm:w-1/3 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 hover:text-slate-900 text-slate-600 font-semibold rounded-xl text-xs transition-all flex items-center justify-center gap-1.5"
            >
              <Home className="h-3.5 w-3.5" />
              <span>Back</span>
            </button>
            <button
              type="submit"
              disabled={isVerifying}
              className="w-full sm:w-2/3 py-2.5 bg-[#1565C0] hover:bg-[#0D47A1] text-white font-semibold rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              {isVerifying ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Logging in...</span>
                </>
              ) : (
                <>
                  <Shield className="h-3.5 w-3.5" />
                  <span>Log In</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
