/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import {
  Sparkles,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Bot,
  User,
  Send,
  RefreshCw,
  FileSpreadsheet,
  AlertTriangle,
  FileText,
  Volume2,
  Undo2,
  Maximize2,
  Upload,
  Key,
  Check,
  Eye,
  EyeOff,
  Database,
  Cpu,
  Lock,
  Wallet
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { ParsedData, ChatMessage, AnalysisResponse, KPI, Insight, Recommendation, Forecast } from "./types";
import SpreadsheetLoader from "./components/SpreadsheetLoader";
import VoiceController from "./components/VoiceController";
import VisualChart from "./components/VisualChart";
import RecommendationCard from "./components/RecommendationCard";
import LandingPage from "./components/LandingPage";
import { auth } from "./lib/firebase";
import { User as FirebaseUser } from "firebase/auth";
import { 
  getUserWorkspaces, 
  createWorkspace, 
  updateWorkspace, 
  deleteWorkspace, 
  Workspace 
} from "./lib/workspaceService";
import AuthModal from "./components/AuthModal";
import WorkspacesSidebar from "./components/WorkspacesSidebar";

export default function App() {
  const [showLanding, setShowLanding] = useState(true);
  const [parsedData, setParsedData] = useState<ParsedData | null>(null);
  const [rawData, setRawData] = useState<any[]>([]);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [currentResponse, setCurrentResponse] = useState<AnalysisResponse | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [userInput, setUserInput] = useState("");
  const [lastSpeechText, setLastSpeechText] = useState("");
  const [activeTab, setActiveTab] = useState<"dashboard" | "preview">("dashboard");
  const [apiError, setApiError] = useState<string | null>(null);
  const [isQuotaError, setIsQuotaError] = useState(false);
  
  const [customKey, setCustomKey] = useState<string>(
    () => localStorage.getItem("custom_gemini_api_key") || ""
  );
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [isKeyVisible, setIsKeyVisible] = useState(false);
  const [keySavedStatus, setKeySavedStatus] = useState(false);

  // Secure Authentication & Workspace states
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Scroll chat on updates
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  // Helper to select a workspace
  const selectWorkspace = (ws: Workspace) => {
    setActiveWorkspaceId(ws.id);
    setParsedData(ws.parsedData);
    setRawData(ws.rawData);
    setChatHistory(ws.chatHistory);
    setCurrentResponse(ws.currentResponse);
    setCustomKey(ws.customApiKey);
  };

  // Helper to sync changes of the active workspace to Firestore
  const syncActiveWorkspace = async (updatedFields: Partial<Omit<Workspace, "id" | "userId" | "createdAt">>) => {
    if (auth.currentUser && activeWorkspaceId) {
      try {
        await updateWorkspace(activeWorkspaceId, updatedFields);
        setWorkspaces((prev) =>
          prev.map((w) => (w.id === activeWorkspaceId ? { ...w, ...updatedFields } : w))
        );
      } catch (error) {
        console.error("Failed to sync workspace update to Cloud", error);
      }
    }
  };

  // Create workspace operation
  const handleCreateWorkspace = async (name: string) => {
    if (!currentUser) return;
    try {
      const newWs = await createWorkspace(currentUser.uid, name);
      setWorkspaces((prev) => [newWs, ...prev]);
      selectWorkspace(newWs);
    } catch (error) {
      console.error("Error creating workspace", error);
    }
  };

  // Delete workspace operation
  const handleDeleteWorkspace = async (id: string) => {
    try {
      await deleteWorkspace(id);
      const remaining = workspaces.filter((w) => w.id !== id);
      setWorkspaces(remaining);
      if (activeWorkspaceId === id) {
        if (remaining.length > 0) {
          selectWorkspace(remaining[0]);
        } else {
          resetDashboard();
          setActiveWorkspaceId(null);
        }
      }
    } catch (error) {
      console.error("Error deleting workspace", error);
    }
  };

  // Rename workspace operation
  const handleRenameWorkspace = async (id: string, newName: string) => {
    try {
      await updateWorkspace(id, { name: newName });
      setWorkspaces((prev) =>
        prev.map((w) => (w.id === id ? { ...w, name: newName } : w))
      );
    } catch (error) {
      console.error("Error renaming workspace", error);
    }
  };

  // Secure Auth State listener & cloud synchronization on boot
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          const wsList = await getUserWorkspaces(user.uid);
          setWorkspaces(wsList);
          if (wsList.length > 0) {
            selectWorkspace(wsList[0]);
          } else {
            // No workspaces exist: create a default workspace on cloud with current dataset or a sample data
            const defaultName = parsedData ? `Workspace: ${parsedData.fileName}` : "Analytics Workspace";
            const newWs = await createWorkspace(user.uid, defaultName, {
              parsedData,
              rawData,
              chatHistory,
              currentResponse,
              customApiKey: customKey
            });
            setWorkspaces([newWs]);
            setActiveWorkspaceId(newWs.id);
          }
        } catch (error) {
          console.error("Error fetching workspaces on login", error);
        }
      } else {
        setWorkspaces([]);
        setActiveWorkspaceId(null);
        // Load default local sample on logout if no data exists
        if (!parsedData) {
          import("./data").then(({ SAMPLE_DATASETS, getParsedStats }) => {
            const defaultSample = SAMPLE_DATASETS[0];
            const parsed = getParsedStats(`${defaultSample.name} Template.csv`, defaultSample.data);
            setParsedData(parsed);
            setRawData(defaultSample.data);
            runInitialAnalysis(parsed, defaultSample.data);
          });
        }
      }
    });
    return () => unsubscribe();
  }, []);

  // Auto-load default dataset on mount ONLY for unauthenticated guests
  useEffect(() => {
    if (!auth.currentUser) {
      import("./data").then(({ SAMPLE_DATASETS, getParsedStats }) => {
        const defaultSample = SAMPLE_DATASETS[0];
        const parsed = getParsedStats(`${defaultSample.name} Template.csv`, defaultSample.data);
        setParsedData(parsed);
        setRawData(defaultSample.data);
        runInitialAnalysis(parsed, defaultSample.data);
      }).catch(err => {
        console.error("Failed to load default sample dataset", err);
      });
    }
  }, []);

  // Initial analytic auto-discovery once data gets uploaded
  const runInitialAnalysis = async (metadata: ParsedData, rawRows: any[]) => {
    setIsProcessing(true);
    setApiError(null);
    setIsQuotaError(false);
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          ...(customKey ? { "x-custom-api-key": customKey } : {})
        },
        body: JSON.stringify({
          isInitial: true,
          datasetSummary: metadata,
          rawData: rawRows.slice(0, 150),
        }),
      });

      if (!response.ok) {
        const errObj = await response.json();
        if (response.status === 429 || errObj?.isQuotaExceeded) {
          setIsQuotaError(true);
        }
        throw new Error(errObj.error || "Failed to analyze dataset.");
      }

      const result: AnalysisResponse = await response.json();
      setIsQuotaError(false);
      setCurrentResponse(result);
      setLastSpeechText(result.answer);

      // Add assistant welcome greeting to chat
      const welcomeMsg: ChatMessage = {
        id: "initial-welcome",
        role: "assistant",
        text: result.answer,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        chartConfig: result.chartConfig,
      };
      setChatHistory([welcomeMsg]);

      // Sync welcome and results to current active cloud workspace
      syncActiveWorkspace({
        parsedData: metadata,
        rawData: rawRows,
        chatHistory: [welcomeMsg],
        currentResponse: result
      });
    } catch (err: any) {
      console.error(err);
      setApiError(err.message || "An error occurred during dataset compilation.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDataLoaded = async (data: ParsedData, raw: any[]) => {
    setParsedData(data);
    setRawData(raw);

    // Sync initial load of data
    syncActiveWorkspace({
      parsedData: data,
      rawData: raw,
      chatHistory: [],
      currentResponse: null
    });

    await runInitialAnalysis(data, raw);
  };

  // Process user message (text or speech)
  const submitQuery = async (queryText: string) => {
    if (!queryText.trim() || !parsedData) return;

    // Add user message to chat
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      text: queryText,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    const updatedHistoryWithUser = [...chatHistory, userMsg];
    setChatHistory(updatedHistoryWithUser);
    setUserInput("");
    setIsProcessing(true);
    setApiError(null);

    // Context preparation: Send dataset metadata + last 10 chat messages
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          ...(customKey ? { "x-custom-api-key": customKey } : {})
        },
        body: JSON.stringify({
          query: queryText,
          datasetSummary: parsedData,
          rawData: rawData.slice(0, 150),
          history: chatHistory.slice(-10),
          isInitial: false,
        }),
      });

      if (!response.ok) {
        const errObj = await response.json();
        if (response.status === 429 || errObj?.isQuotaExceeded) {
          setIsQuotaError(true);
        }
        throw new Error(errObj.error || "Failed to answer query.");
      }

      const result: AnalysisResponse = await response.json();
      setIsQuotaError(false);

      // Update dashboard visuals dynamically if requested
      const nextResponse = {
        ...result,
        kpis: result.kpis?.length ? result.kpis : currentResponse?.kpis
      };
      setCurrentResponse(nextResponse);

      setLastSpeechText(result.answer);

      // Add assistant reply to chat
      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        text: result.answer,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        chartConfig: result.chartConfig,
      };
      
      const finalHistory = [...updatedHistoryWithUser, assistantMsg];
      setChatHistory(finalHistory);

      // Sync updated history and result to cloud database
      syncActiveWorkspace({
        chatHistory: finalHistory,
        currentResponse: nextResponse
      });
    } catch (err: any) {
      console.error(err);
      setApiError(err.message || "An error occurred. Check backend connections.");
    } finally {
      setIsProcessing(false);
    }
  };

  const resetDashboard = () => {
    setParsedData(null);
    setRawData([]);
    setChatHistory([]);
    setCurrentResponse(null);
    setLastSpeechText("");
    setApiError(null);
    setIsQuotaError(false);
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case "positive":
        return <ArrowUpRight className="w-4 h-4 text-bitcoin-gold" />;
      case "negative":
        return <ArrowDownRight className="w-4 h-4 text-bitcoin-burnt" />;
      case "anomaly":
        return <AlertTriangle className="w-4 h-4 text-bitcoin animate-pulse" />;
      default:
        return <Layers className="w-4 h-4 text-muted" />;
    }
  };

  if (showLanding) {
    return (
      <>
        <LandingPage
          onEnterWorkspace={() => setShowLanding(false)}
          onDataLoaded={(data, raw) => {
            handleDataLoaded(data, raw);
            setShowLanding(false);
          }}
          isProcessing={isProcessing}
          customKey={customKey}
          onToggleKeyInput={() => {
            setShowKeyInput(true);
            setShowLanding(false);
          }}
          onOpenAuth={() => setIsAuthModalOpen(true)}
        />
        <AuthModal 
          isOpen={isAuthModalOpen} 
          onClose={() => setIsAuthModalOpen(false)} 
          onAuthSuccess={() => {}}
        />
      </>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-background text-foreground flex flex-row overflow-hidden font-sans selection:bg-bitcoin/20 selection:text-bitcoin-gold">
      
      {/* Background grids */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-40" />
      </div>

      <WorkspacesSidebar
        workspaces={workspaces}
        activeWorkspaceId={activeWorkspaceId}
        onSelectWorkspace={(id) => {
          const ws = workspaces.find(w => w.id === id);
          if (ws) selectWorkspace(ws);
        }}
        onCreateWorkspace={handleCreateWorkspace}
        onDeleteWorkspace={handleDeleteWorkspace}
        onRenameWorkspace={handleRenameWorkspace}
        onOpenAuth={() => setIsAuthModalOpen(true)}
      />

      <div className="flex-1 flex flex-col h-screen overflow-y-auto relative z-10">
        {/* Dynamic Header Block */}
        <header className="border-b border-white/5 bg-surface/85 backdrop-blur-md sticky top-0 z-40 px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div 
            className="flex items-center gap-3 w-full sm:w-auto cursor-pointer hover:opacity-90 active:scale-[0.99] transition-all group" 
            onClick={() => setShowLanding(true)}
            title="Return to Landing Page"
          >
            <div className="p-2.5 bg-gradient-to-tr from-bitcoin-burnt to-bitcoin rounded-xl shadow-bitcoin-glow transition-colors duration-300 group-hover:border-bitcoin/50">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-xl font-bold tracking-tight text-white group-hover:text-bitcoin transition-colors font-heading">
                  Talking Rabbitt
                </h1>
                <span className="text-[9px] font-mono tracking-widest text-bitcoin font-extrabold uppercase bg-bitcoin/10 border border-bitcoin/30 px-1.5 py-0.5 rounded-full">CORE</span>
              </div>
              <p className="text-xs text-muted font-medium font-mono">Decentralized Intelligence Hub</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end flex-wrap">
            <button
              onClick={() => setShowLanding(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-surface hover:bg-[#030304] text-muted hover:text-white rounded-xl border border-white/10 hover:border-bitcoin/40 transition-all duration-200 text-xs font-bold font-mono cursor-pointer"
              title="Return to Premium Landing Page"
            >
              <span>← Landing Protocol</span>
            </button>

            <button
              onClick={() => setShowKeyInput(!showKeyInput)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl border transition-all duration-200 shadow-sm text-xs font-bold font-mono cursor-pointer ${
                showKeyInput 
                  ? "bg-[#030304] text-bitcoin border-bitcoin/50" 
                  : customKey 
                    ? "bg-bitcoin/10 text-bitcoin-gold border-bitcoin/35 hover:bg-bitcoin/20" 
                    : "bg-surface text-muted border-white/10 hover:bg-[#030304] hover:text-white hover:border-bitcoin/40"
              }`}
              title="Configure Private API Key"
            >
              {customKey ? (
                <span className="relative flex h-2 w-2 mr-0.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-bitcoin-gold opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-bitcoin"></span>
                </span>
              ) : (
                <Key className="w-4 h-4 shrink-0 text-bitcoin" />
              )}
              <span>{customKey ? "Custom Key Active" : "Set API Key"}</span>
            </button>

            {parsedData && (
              <>
                <div className="hidden md:flex items-center gap-2 bg-[#030304] border border-white/5 px-3.5 py-2 rounded-xl text-xs text-slate-300 font-mono">
                  <FileSpreadsheet className="w-4 h-4 text-bitcoin shrink-0" />
                  <span className="truncate max-w-[120px] font-bold">{parsedData.fileName}</span>
                  <span className="text-muted font-bold">({parsedData.rowCount} Nodes)</span>
                </div>

                <button
                  id="btn-header-reset"
                  onClick={resetDashboard}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-bitcoin-burnt to-bitcoin text-white hover:text-black rounded-xl border border-bitcoin/30 transition-all duration-300 shadow-bitcoin-glow hover:scale-105 cursor-pointer text-xs font-bold font-mono"
                  title="Upload another CSV / Reset Workspace"
                >
                  <Upload className="w-4 h-4 shrink-0" />
                  <span>Upload New Ledger</span>
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Collapsible API Key settings panel */}
      {showKeyInput && (
        <div className="bg-surface border-b border-white/5 px-6 py-4 backdrop-blur-md relative z-30">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-bitcoin animate-pulse"></span>
                <label className="text-xs font-bold text-bitcoin block font-mono tracking-widest uppercase">GEMINI API KEY OVERRIDE</label>
              </div>
              <p className="text-[11px] text-slate-300 max-w-xl leading-relaxed font-body">
                Configure your personal Gemini API Key. Once active, <strong className="text-bitcoin-gold font-bold">all processing loads</strong> compile directly through your private quota, bypassing public rate ceilings. Value stored securely inside local memory.
              </p>
            </div>
            <div className="flex items-center gap-2.5 flex-1 md:max-w-md">
              <div className="relative flex-1">
                <input
                  type={isKeyVisible ? "text" : "password"}
                  value={customKey}
                  onChange={(e) => {
                    const val = e.target.value.trim();
                    setCustomKey(val);
                    setKeySavedStatus(false);
                  }}
                  placeholder="Paste private key (AIzaSy...)"
                  className="w-full bg-[#030304] border border-white/10 focus:border-bitcoin rounded-xl px-3.5 py-2 text-xs font-mono text-white placeholder-white/20 focus:outline-none transition-all pr-10"
                />
                <button
                  type="button"
                  onClick={() => setIsKeyVisible(!isKeyVisible)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-white cursor-pointer"
                >
                  {isKeyVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <button
                type="button"
                onClick={() => {
                  localStorage.setItem("custom_gemini_api_key", customKey);
                  setKeySavedStatus(true);
                  syncActiveWorkspace({ customApiKey: customKey });
                  setTimeout(() => setKeySavedStatus(false), 2500);
                }}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold font-mono cursor-pointer transition-all shrink-0 select-none ${
                  keySavedStatus 
                    ? "bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-500/20" 
                    : "bg-gradient-to-r from-bitcoin-burnt to-bitcoin text-white hover:text-black shadow-bitcoin-glow hover:scale-[1.01]"
                }`}
              >
                {keySavedStatus ? <Check className="w-3.5 h-3.5 shrink-0" /> : null}
                <span>{keySavedStatus ? "Saved" : "Save Key"}</span>
              </button>
              {customKey && (
                <button
                  type="button"
                  onClick={() => {
                    setCustomKey("");
                    localStorage.removeItem("custom_gemini_api_key");
                    setKeySavedStatus(false);
                    syncActiveWorkspace({ customApiKey: "" });
                  }}
                  className="px-3.5 py-2 bg-[#030304] hover:bg-bitcoin-burnt/10 hover:text-bitcoin border border-white/5 hover:border-bitcoin-burnt/35 rounded-xl text-xs text-muted cursor-pointer transition-all shrink-0"
                  title="Clear Override Key"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Workspace Frame */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-6 flex flex-col relative z-20">
        {!parsedData ? (
          /* Empty onboarding stage */
          <div className="flex-1 flex flex-col items-center justify-center py-10">
            <div className="text-center max-w-2xl mx-auto mb-10 space-y-3">
              <span className="text-xs uppercase font-mono tracking-widest font-bold text-bitcoin bg-bitcoin/10 border border-bitcoin/30 px-3 py-1 rounded-full">
                AI CONVERSATIONAL LEDGER ROUTINES
              </span>
              <h2 className="text-3xl font-extrabold text-white tracking-tight sm:text-4xl font-heading">
                Compile Your Financial Ledgers
              </h2>
              <p className="text-base text-muted leading-relaxed font-body">
                Import local sheets, crypto transaction records, SaaS metrics, or yield logs. 
                Our high-reasoning protocol maps structural models, identifies anomalies, compiles metrics, and provides syntheses hands-free.
              </p>
            </div>

            <SpreadsheetLoader onDataLoaded={handleDataLoaded} isLoading={isProcessing} />
          </div>
        ) : (
          /* Active Interactive Workspace */
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 flex-1 items-start">
            {/* Visual Dashboard and recommendation lists (Takes up 2/3 columns) */}
            <div className="xl:col-span-2 space-y-6">
              {/* Tab Toggles */}
              <div className="flex border-b border-white/5 pb-px font-mono">
                <button
                  id="tab-toggle-dashboard"
                  onClick={() => setActiveTab("dashboard")}
                  className={`py-2 px-4 font-bold text-sm border-b-2 transition-all duration-200 cursor-pointer ${
                    activeTab === "dashboard"
                      ? "border-bitcoin text-bitcoin-gold"
                      : "border-transparent text-muted hover:text-white"
                  }`}
                >
                  Intelligent Console
                </button>
                <button
                  id="tab-toggle-preview"
                  onClick={() => setActiveTab("preview")}
                  className={`py-2 px-4 font-bold text-sm border-b-2 transition-all duration-200 cursor-pointer ${
                    activeTab === "preview"
                      ? "border-bitcoin text-bitcoin-gold"
                      : "border-transparent text-muted hover:text-white"
                  }`}
                >
                  Raw Ledger Nodes ({parsedData.rowCount} rows)
                </button>
              </div>

              {activeTab === "dashboard" ? (
                <>
                  {/* Dynamic Visualization Agent Control Center */}
                  <div id="vis-agent-control-center" className="bg-gradient-to-r from-surface via-[#030304]/80 to-surface border border-white/5 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4 relative overflow-hidden">
                    {/* Visual Corner Accent */}
                    <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-bitcoin rounded-tl" />
                    <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-bitcoin rounded-br" />

                    <div className="flex items-center gap-3 w-full md:w-auto">
                      <div className="p-2.5 bg-bitcoin/10 text-bitcoin rounded-xl shrink-0">
                        <Sparkles className="w-5 h-5 text-bitcoin animate-pulse" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white font-heading">Dynamic Optimization Router</h3>
                        <p className="text-[11px] text-muted font-body">Deploy instant visualization layouts, cryptographic correlation heatmaps, and summaries.</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 w-full md:w-auto justify-end font-mono">
                      <button
                        type="button"
                        onClick={() => submitQuery("Analyze the dataset and generate a dynamic bar chart comparing the top performing metrics")}
                        className="px-3 py-1.5 bg-[#030304] border border-white/5 hover:border-bitcoin/40 hover:bg-surface text-muted hover:text-white rounded-xl text-xs font-semibold cursor-pointer transition-all flex items-center gap-1.5"
                      >
                        <Layers className="w-3.5 h-3.5 text-bitcoin" />
                        <span>Bar Chart</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => submitQuery("Perform a complete multidimensional analysis on the dataset and represent it as a beautiful visual heatmap matrix")}
                        className="px-3 py-1.5 bg-[#030304] border border-white/5 hover:border-bitcoin/40 hover:bg-surface text-muted hover:text-white rounded-xl text-xs font-semibold cursor-pointer transition-all flex items-center gap-1.5"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-bitcoin shadow-bitcoin-glow"></span>
                        <span>Heatmap Matrix</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => submitQuery("Extract 4 core business metrics from this dataset to compile my dynamic KPI dashboard panel")}
                        className="px-3 py-1.5 bg-[#030304] border border-white/5 hover:border-bitcoin/40 hover:bg-surface text-muted hover:text-white rounded-xl text-xs font-semibold cursor-pointer transition-all flex items-center gap-1.5"
                      >
                        <ArrowUpRight className="w-3.5 h-3.5 text-bitcoin-gold" />
                        <span>KPI Cluster</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => submitQuery("Synthesize a high-level performance summary of this data highlighting trends, anomalies, and tactical action items")}
                        className="px-3 py-1.5 bg-[#030304] border border-white/5 hover:border-bitcoin/40 hover:bg-surface text-muted hover:text-white rounded-xl text-xs font-semibold cursor-pointer transition-all flex items-center gap-1.5"
                      >
                        <FileText className="w-3.5 h-3.5 text-bitcoin-burnt" />
                        <span>Audit Synopsis</span>
                      </button>
                    </div>
                  </div>

                  {/* Real-time KPI Dashboards dynamically computed by AI */}
                  {currentResponse?.kpis && (
                    <div id="kpis-grid" className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {currentResponse.kpis.map((kpi, idx) => (
                        <div
                          key={idx}
                          id={`kpi-card-${idx}`}
                          className="bg-surface border border-white/5 rounded-2xl p-4 shadow-sm flex flex-col justify-between relative overflow-hidden group"
                        >
                          <div className="absolute top-0 left-0 w-2.5 h-2.5 border-t border-l border-bitcoin/20 group-hover:border-bitcoin/40 rounded-tl transition-all" />
                          <span className="text-xs text-muted font-bold truncate uppercase tracking-widest font-mono">
                            {kpi.label}
                          </span>
                          <div className="flex items-baseline gap-2 mt-2">
                            <span className="text-xl font-extrabold text-white font-mono tracking-tight drop-shadow-[0_0_10px_rgba(247,147,26,0.15)]">
                              {kpi.value}
                            </span>
                            <span
                              className={`flex items-center text-xs font-mono font-bold ${
                                kpi.status === "up" ? "text-bitcoin-gold" : "text-bitcoin-burnt"
                              }`}
                            >
                              {kpi.status === "up" ? "+" : ""}
                              {kpi.change}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Dynamic Graphic Stage */}
                  {currentResponse?.chartConfig && (
                    <VisualChart config={currentResponse.chartConfig} />
                  )}

                  {/* Anomaly Detection List & Deep Insights */}
                  {currentResponse?.insights && (
                    <div id="insights-panel" className="bg-surface border border-white/5 rounded-2xl p-5 shadow-sm relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-bitcoin rounded-tl" />
                      <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-bitcoin rounded-br" />

                      <div className="flex items-center gap-2 mb-4">
                        <FileText className="w-5 h-5 text-bitcoin" />
                        <h3 className="text-base font-bold text-white font-heading">Network Audits & Anomalies</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {currentResponse.insights.map((insight, idx) => (
                          <div
                            key={idx}
                            id={`insight-item-${idx}`}
                            className="flex items-start gap-3 p-3.5 bg-[#030304]/40 border border-white/5 rounded-xl hover:border-bitcoin/30 transition-all font-body"
                          >
                            <div className="mt-0.5 shrink-0">{getInsightIcon(insight.type)}</div>
                            <div className="space-y-0.5">
                              <span className="text-[9px] uppercase font-bold tracking-widest font-mono text-muted block">
                                {insight.type}
                              </span>
                              <p className="text-xs text-slate-300 leading-relaxed">{insight.text}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Strategic Suggestions & Predictive Forecasting (Recommendation Agent) */}
                  {currentResponse && (
                    <RecommendationCard
                      recommendations={currentResponse.recommendations}
                      forecast={currentResponse.forecast}
                    />
                  )}
                </>
              ) : (
                /* Data Preview Ingest view */
                <div id="spreadsheet-preview-workspace" className="bg-surface border border-white/5 rounded-2xl p-5 shadow-sm overflow-hidden relative">
                  <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-bitcoin rounded-tl" />
                  <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-bitcoin rounded-br" />

                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/5">
                    <div>
                      <h3 className="text-base font-bold text-white font-heading">Ledger Index Previews</h3>
                      <p className="text-xs text-muted font-body">Targeting the first 15 records stored inside local cache</p>
                    </div>
                  </div>

                  <div className="overflow-x-auto font-mono">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-white/5 bg-[#030304] text-muted">
                          {parsedData.columns.map((col, idx) => (
                            <th key={idx} className="p-3 font-bold uppercase tracking-wider text-[9px]">
                              {col} <span className="text-[9px] text-bitcoin-gold">({parsedData.dataTypes[col]})</span>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 text-slate-300">
                        {rawData.slice(0, 15).map((row, rIdx) => (
                          <tr key={rIdx} className="hover:bg-white/5 transition-all">
                            {parsedData.columns.map((col, cIdx) => (
                              <td key={cIdx} className="p-3 truncate max-w-[180px] font-semibold">
                                {row[col]?.toString() ?? <span className="text-muted italic">NULL</span>}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Conversational Assistant & Voice Controller (Takes up 1/3 columns) */}
            <div id="chat-sidebar" className="xl:col-span-1 bg-surface border border-white/5 rounded-2xl flex flex-col h-[650px] shadow-sm relative overflow-hidden sticky top-24">
              {/* Visual Corner Accent */}
              <div className="absolute top-0 left-0 w-3.5 h-3.5 border-t-2 border-l-2 border-bitcoin rounded-tl" />
              <div className="absolute bottom-0 right-0 w-3.5 h-3.5 border-b-2 border-r-2 border-bitcoin rounded-br" />

              {/* Header */}
              <div className="px-5 py-4 border-b border-white/5 bg-[#030304]/60 flex items-center justify-between z-10">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-bitcoin/10 text-bitcoin rounded-lg shadow-bitcoin-glow">
                    <Bot className="w-4 h-4 text-bitcoin" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white font-heading">Protocol Agent Feed</h3>
                    <p className="text-[10px] text-bitcoin-gold flex items-center gap-1 font-mono font-bold uppercase tracking-wider">
                      <span className="w-1.5 h-1.5 rounded-full bg-bitcoin animate-pulse"></span>
                      INTELLIGENCE LINKED
                    </p>
                  </div>
                </div>

                {isProcessing && <RefreshCw className="w-4 h-4 text-bitcoin animate-spin" />}
              </div>

              {/* Chat bubbles viewport */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 z-10">
                {chatHistory.map((msg) => (
                  <div
                    key={msg.id}
                    id={`chat-bubble-${msg.id}`}
                    className={`flex items-start gap-2.5 max-w-[85%] ${
                      msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                    }`}
                  >
                    <div
                      className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${
                        msg.role === "user" ? "bg-[#030304] border border-white/5 text-bitcoin-gold" : "bg-bitcoin/10 text-bitcoin"
                      }`}
                    >
                      {msg.role === "user" ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                    </div>

                    <div className="space-y-1 w-full">
                      <div
                        className={`p-3 rounded-2xl text-xs leading-relaxed border font-body ${
                          msg.role === "user"
                            ? "bg-[#030304]/90 border-white/10 text-white rounded-tr-none font-semibold"
                            : "bg-[#030304]/40 border-white/5 text-slate-300 rounded-tl-none"
                        }`}
                      >
                        {msg.text}
                      </div>

                      {msg.role === "assistant" && msg.chartConfig && msg.chartConfig.chartType !== "none" && (
                        <div className="mt-2 p-3 bg-[#030304]/60 border border-white/10 rounded-xl overflow-hidden w-full max-w-[340px] shadow-sm relative">
                          <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-bitcoin rounded-tl" />
                          <h4 className="text-[11px] font-bold text-bitcoin truncate mb-1.5 font-heading">{msg.chartConfig.title}</h4>
                          <div className="h-[160px] w-full">
                            <VisualChart config={msg.chartConfig} isMini={true} />
                          </div>
                          {msg.chartConfig.explanation && (
                            <p className="text-[9px] text-muted mt-1.5 leading-relaxed italic font-body">{msg.chartConfig.explanation}</p>
                          )}
                        </div>
                      )}

                      <span className="text-[9px] text-muted block text-right font-mono font-bold px-1 uppercase tracking-wider">
                        {msg.timestamp}
                      </span>
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>

              {/* System API error notices */}
              {apiError && (
                <div id="api-error-alert" className="mx-4 p-3 bg-bitcoin-burnt/10 border border-bitcoin-burnt/30 text-bitcoin text-xs rounded-xl flex flex-col gap-2.5 items-start z-10 relative">
                  <div className="flex items-start gap-2 font-mono">
                    <AlertTriangle className="w-4.5 h-4.5 shrink-0 text-bitcoin-burnt mt-0.5 shadow-bitcoin-glow" />
                    <span>{apiError}</span>
                  </div>
                  {isQuotaError && (
                    <div className="flex flex-wrap gap-2.5 mt-0.5 font-mono">
                      <button
                        type="button"
                        onClick={() => {
                          submitQuery("Please activate the paid model flow for me.");
                        }}
                        className="px-3 py-1.5 bg-[#030304] hover:bg-surface text-bitcoin hover:text-bitcoin-gold border border-white/5 rounded-lg text-[9px] font-bold cursor-pointer transition-all"
                      >
                        🚀 PROCEED WITH PREMIUM CORE
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowKeyInput(true);
                        }}
                        className="px-3 py-1.5 bg-gradient-to-r from-bitcoin-burnt to-bitcoin text-white hover:text-black rounded-lg text-[9px] font-bold shadow-bitcoin-glow cursor-pointer transition-all hover:scale-[1.02]"
                      >
                        🔑 CONFIGURE API KEY OVERRIDE
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Speech Controls & Soundwaves */}
              <div className="p-3 border-t border-white/5 bg-[#030304]/30 z-10">
                <VoiceController
                  onSpeechToText={submitQuery}
                  isProcessing={isProcessing}
                  lastAssistantSpeech={lastSpeechText}
                />
              </div>

              {/* Chat Input form */}
              <form
                id="chat-input-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  submitQuery(userInput);
                }}
                className="p-4 border-t border-white/5 flex gap-2 bg-[#030304]/40 z-10"
              >
                <input
                  id="chat-text-input"
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder="Ask financial protocol queries..."
                  disabled={isProcessing}
                  className="flex-1 bg-[#030304] border border-white/10 hover:border-white/20 focus:border-bitcoin rounded-xl px-3 py-2 text-xs text-white focus:outline-none transition-colors disabled:opacity-50"
                />
                <button
                  id="btn-chat-submit"
                  type="submit"
                  disabled={isProcessing || !userInput.trim()}
                  className="p-2.5 bg-gradient-to-r from-bitcoin-burnt to-bitcoin text-white hover:text-black rounded-xl transition-all duration-300 shadow-bitcoin-glow disabled:opacity-40 disabled:cursor-not-allowed shrink-0 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        )}
      </main>

      {/* Footer credits */}
      <footer className="border-t border-white/5 bg-[#030304] py-4 px-6 mt-12 relative z-20">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-[10px] text-muted font-mono uppercase tracking-widest font-bold">
          <span>Talking Rabbitt Ledger Engine</span>
          <span className="flex items-center gap-1.5">
            {customKey ? (
              <>
                <span className="h-1.5 w-1.5 rounded-full bg-bitcoin shadow-bitcoin-glow animate-pulse"></span>
                <span className="text-bitcoin-gold">Gemini 3.5 Flash (Key Override Synced)</span>
              </>
            ) : (
              <span>Gemini 3.5 Flash (Shared Chain Channel)</span>
            )}
          </span>
        </div>
      </footer>
      </div>
      </div>
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        onAuthSuccess={() => {}}
      />
    </>
  );
}
