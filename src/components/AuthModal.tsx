import React, { useState } from "react";
import { 
  X, 
  Mail, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight,
  ShieldAlert,
  Loader2
} from "lucide-react";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendPasswordResetEmail,
  updateProfile
} from "firebase/auth";
import { auth } from "../lib/firebase";
import { motion, AnimatePresence } from "motion/react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: () => void;
}

type AuthMode = "login" | "register" | "forgot";

export default function AuthModal({ isOpen, onClose, onAuthSuccess }: AuthModalProps) {
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setIsLoading(true);

    try {
      if (mode === "login") {
        await signInWithEmailAndPassword(auth, email, password);
        onAuthSuccess();
        onClose();
      } else if (mode === "register") {
        if (!displayName.trim()) {
          throw new Error("Full name is required.");
        }
        if (password.length < 6) {
          throw new Error("Password must be at least 6 characters.");
        }
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName });
        onAuthSuccess();
        onClose();
      } else if (mode === "forgot") {
        await sendPasswordResetEmail(auth, email);
        setSuccessMessage("A password reset link has been dispatched to your email address.");
        setMode("login");
      }
    } catch (err: any) {
      console.error("Auth error:", err);
      let code = err.code || "";
      if (!code && err.message) {
        const match = err.message.match(/\((auth\/[^)]+)\)/);
        if (match) {
          code = match[1];
        }
      }

      let errMsg = "An authentication error occurred. Please try again.";
      if (code === "auth/user-not-found") {
        errMsg = "No profile exists with this email address.";
      } else if (code === "auth/wrong-password") {
        errMsg = "Incorrect password. Please verify your credentials.";
      } else if (code === "auth/invalid-credential") {
        errMsg = "Invalid credentials. Please verify your email and password.";
      } else if (code === "auth/email-already-in-use") {
        errMsg = "An account with this email address is already registered.";
      } else if (code === "auth/invalid-email") {
        errMsg = "Please specify a valid email address.";
      } else if (code === "auth/weak-password") {
        errMsg = "Password should be at least 6 characters.";
      } else {
        errMsg = err.message || errMsg;
      }
      setError(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop overlay */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-10"
        >
          {/* Accent glow bar */}
          <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-indigo-500 via-[#00F5D4] to-indigo-500" />

          {/* Close trigger */}
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white bg-slate-950/40 border border-slate-800/40 rounded-lg hover:border-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="p-6 md:p-8">
            {/* Header copy */}
            <div className="text-center mb-6">
              <span className="text-[10px] tracking-widest font-mono font-bold text-[#00F5D4] uppercase bg-[#00F5D4]/10 px-2.5 py-1 rounded-full">
                SECURE CONSOLE ACCESS
              </span>
              <h3 className="text-xl font-bold text-white mt-3">
                {mode === "login" && "Welcome to Talking Rabbitt"}
                {mode === "register" && "Establish SaaS Console Profile"}
                {mode === "forgot" && "Reset Security Credentials"}
              </h3>
              <p className="text-xs text-slate-400 mt-1.5">
                {mode === "login" && "Log in to synchronize your workspaces and analyze datasets securely."}
                {mode === "register" && "Create an account to persist analytics, dashboard presets, and chat history."}
                {mode === "forgot" && "Specify your email to dispatch a secure password reset link."}
              </p>
            </div>

            {/* Notification messages */}
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 bg-red-950/30 border border-red-900/50 text-red-300 text-xs rounded-xl flex items-start gap-2.5"
              >
                <AlertCircle className="w-4 h-4 mt-0.5 text-red-400 shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}

            {successMessage && (
              <motion.div 
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 bg-emerald-950/30 border border-emerald-900/50 text-emerald-300 text-xs rounded-xl flex items-start gap-2.5"
              >
                <CheckCircle2 className="w-4 h-4 mt-0.5 text-emerald-400 shrink-0" />
                <span>{successMessage}</span>
              </motion.div>
            )}

            {/* Main Form */}
            <form onSubmit={handleAuth} className="space-y-4">
              {mode === "register" && (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono tracking-wider text-slate-400 uppercase block">Full Name</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                      <User className="w-4 h-4" />
                    </span>
                    <input 
                      type="text" 
                      required
                      placeholder="Jane Doe"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-[#00F5D4]/60 transition-colors"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono tracking-wider text-slate-400 uppercase block">Email Address</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input 
                    type="email" 
                    required
                    placeholder="jane@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-[#00F5D4]/60 transition-colors"
                  />
                </div>
              </div>

              {mode !== "forgot" && (
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-mono tracking-wider text-slate-400 uppercase">Password</label>
                    {mode === "login" && (
                      <button 
                        type="button"
                        onClick={() => setMode("forgot")}
                        className="text-[10px] text-indigo-400 hover:text-[#00F5D4] font-medium transition-colors cursor-pointer"
                      >
                        Forgot Password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                      <Lock className="w-4 h-4" />
                    </span>
                    <input 
                      type={showPassword ? "text" : "password"} 
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-9 pr-10 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-[#00F5D4]/60 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}

              {/* Action trigger button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-3 bg-indigo-600 hover:bg-[#00F5D4] text-white hover:text-slate-950 rounded-xl text-xs font-bold transition-all duration-300 hover:scale-[1.01] hover:shadow-[0_0_20px_rgba(0,245,212,0.15)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-55 disabled:pointer-events-none"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-current" />
                    <span>Verifying Secure Connection...</span>
                  </>
                ) : (
                  <>
                    <span>
                      {mode === "login" && "Access Workspace Console"}
                      {mode === "register" && "Create SaaS Profile"}
                      {mode === "forgot" && "Dispatch Recovery Link"}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Alternator links */}
            <div className="border-t border-slate-800/60 mt-6 pt-5 text-center text-xs text-slate-400">
              {mode === "login" ? (
                <>
                  New to Talking Rabbitt?{" "}
                  <button 
                    onClick={() => { setMode("register"); setError(null); }}
                    className="text-[#00F5D4] hover:underline font-bold transition-colors cursor-pointer"
                  >
                    Register free profile
                  </button>
                </>
              ) : (
                <>
                  Already registered?{" "}
                  <button 
                    onClick={() => { setMode("login"); setError(null); }}
                    className="text-[#00F5D4] hover:underline font-bold transition-colors cursor-pointer"
                  >
                    Log in here
                  </button>
                </>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
