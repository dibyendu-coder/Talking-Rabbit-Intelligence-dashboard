import React, { useState } from "react";
import { 
  Sparkles, 
  Layers, 
  Bot, 
  Play, 
  ArrowRight, 
  Volume2, 
  Activity, 
  FileText, 
  Upload, 
  ShieldCheck, 
  Layout, 
  FileSpreadsheet, 
  TrendingUp, 
  Workflow,
  ChevronRight,
  Database,
  ArrowUpRight,
  User
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import SpreadsheetLoader from "./SpreadsheetLoader";
import { ParsedData } from "../types";
import { SAMPLE_DATASETS } from "../data";
import { auth } from "../lib/firebase";

interface LandingPageProps {
  onEnterWorkspace: () => void;
  onDataLoaded: (data: ParsedData, rawData: any[]) => void;
  isProcessing: boolean;
  customKey: string;
  onToggleKeyInput: () => void;
  onOpenAuth: () => void;
}

type MetricType = "revenue" | "growth" | "conversion";

// Elegant Inline Geometric Rabbit Brand Icon SVG
const GeometricRabbitIcon = ({ className = "w-6 h-6 text-emerald-400" }: { className?: string }) => (
  <svg 
    viewBox="0 0 100 100" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="4.5" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    {/* Ears */}
    <path d="M32 15 L43 46 L50 34 L57 46 L68 15" />
    {/* Crown & Head Bridge */}
    <path d="M43 46 L57 46" />
    {/* Facet Lines */}
    <path d="M37 54 L50 43 L63 54" />
    {/* Nose and Chin whiskers */}
    <path d="M50 43 L50 68 L36 80" />
    <path d="M50 68 L64 80" />
  </svg>
);

export default function LandingPage({
  onEnterWorkspace,
  onDataLoaded,
  isProcessing,
  customKey,
  onToggleKeyInput,
  onOpenAuth
}: LandingPageProps) {
  const [activeDemoMetric, setActiveDemoMetric] = useState<MetricType>("revenue");
  
  const currentUser = auth.currentUser;
  
  // High-fidelity mock interactive metrics for the live preview browser sandbox
  const mockMetrics = {
    revenue: {
      title: "Quarterly Sales Revenue",
      value: "$482,900",
      change: "+24.5%",
      isPositive: true,
      chartData: [45, 62, 53, 78, 85, 95],
      labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
      color: "from-indigo-500 to-indigo-400",
      accentBg: "bg-indigo-500/10 text-indigo-400",
      insight: "Consistent month-over-month growth driven by enterprise service adoption and expansion in key technology segments."
    },
    growth: {
      title: "Active Subscribers",
      value: "14,820",
      change: "+18.2%",
      isPositive: true,
      chartData: [30, 42, 58, 65, 82, 105],
      labels: ["Wk 1", "Wk 2", "Wk 3", "Wk 4", "Wk 5", "Wk 6"],
      color: "from-emerald-500 to-emerald-400",
      accentBg: "bg-emerald-500/10 text-emerald-400",
      insight: "Subscriber velocity accelerated in late Q2, reflecting positive referral loops and new integration channels."
    },
    conversion: {
      title: "Checkout Conversion Rate",
      value: "3.42%",
      change: "-1.1%",
      isPositive: false,
      chartData: [85, 80, 75, 78, 70, 68],
      labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
      color: "from-amber-500 to-amber-400",
      accentBg: "bg-amber-500/10 text-amber-400",
      insight: "Identified minor conversion loss in mobile checkout stages. Recommend launching targeted reminders to cart drop-offs."
    }
  };

  const activeDemo = mockMetrics[activeDemoMetric];

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans overflow-x-hidden selection:bg-[#00F5D4]/20 selection:text-[#00F5D4]">
      {/* Premium ambient backdrop meshes */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-950/20 via-slate-950/5 to-transparent opacity-80" />
        <div className="absolute top-[15%] left-[5%] w-[550px] h-[550px] bg-[#00F5D4]/3 rounded-full blur-[140px] animate-pulse" style={{ animationDuration: "14s" }} />
        <div className="absolute top-[40%] right-[3%] w-[500px] h-[500px] bg-indigo-500/3 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: "10s" }} />
        
        {/* Sleek Dot Grid Overlay */}
        <div 
          className="absolute inset-0 opacity-[0.015] pointer-events-none" 
          style={{ 
            backgroundImage: "radial-gradient(#00F5D4 1px, transparent 1px)", 
            backgroundSize: "32px 32px" 
          }} 
        />
      </div>

      {/* Landing Header */}
      <header className="relative z-20 border-b border-slate-900/80 bg-slate-950/75 backdrop-blur-md px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 group">
            <div className="p-2 bg-slate-900 border border-slate-800 rounded-xl shadow-lg transition-colors duration-300 group-hover:border-[#00F5D4]/40">
              <GeometricRabbitIcon className="w-5.5 h-5.5 text-[#00F5D4] transition-transform duration-500 group-hover:scale-105" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-lg font-bold tracking-tight text-white group-hover:text-[#00F5D4] transition-colors duration-200">
                  Talking Rabbitt
                </h1>
                <span className="text-[9px] font-mono font-bold tracking-wider px-2 py-0.5 bg-[#00F5D4]/10 border border-[#00F5D4]/30 rounded-full text-[#00F5D4]">
                  v3.5 PRO
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium">Conversational Intelligence Workspace</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onToggleKeyInput}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all duration-300 text-xs font-semibold cursor-pointer ${
                customKey 
                  ? "bg-emerald-950/30 text-emerald-300 border-emerald-900/50 hover:border-emerald-700/60" 
                  : "bg-slate-900/60 text-slate-300 border-slate-800 hover:border-slate-700 hover:bg-slate-800/80"
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#00F5D4]" />
              <span>{customKey ? "Custom Key Saved" : "Configure Private Key"}</span>
            </button>

            {currentUser ? (
              <div className="flex items-center gap-2 bg-slate-900/65 border border-slate-800 px-3 py-1.5 rounded-lg text-xs font-semibold">
                <User className="w-3.5 h-3.5 text-[#00F5D4]" />
                <span className="text-slate-200 font-bold">{currentUser.displayName || "Subscriber"}</span>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="px-3.5 py-1.5 bg-slate-900/80 hover:bg-slate-800 text-[#00F5D4] hover:text-white rounded-lg border border-slate-800 hover:border-[#00F5D4]/40 text-xs font-bold transition-all shadow-sm cursor-pointer"
              >
                Sign In
              </button>
            )}

            <button
              onClick={onEnterWorkspace}
              className="px-4 py-1.5 bg-slate-900 hover:bg-slate-850 hover:border-[#00F5D4]/50 text-white rounded-lg border border-slate-800 text-xs font-bold transition-all shadow-md cursor-pointer hover:shadow-[0_0_15px_rgba(0,245,212,0.1)]"
            >
              Enter Workspace
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Sections - Generous spacing for natural SaaS layout */}
      <main className="relative z-10 flex-1">
        
        {/* Hero Area */}
        <section className="max-w-7xl mx-auto px-6 pt-24 pb-16 flex flex-col items-center text-center">
          {/* Conversational Tagline Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-slate-900/90 border border-slate-800 rounded-full text-xs font-mono font-bold text-slate-400 mb-8 tracking-wide shadow-md">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00F5D4] animate-ping" />
            <span className="text-[#00F5D4]">CONVERSATIONAL BUSINESS INTELLIGENCE</span>
          </div>

          {/* Hero Display Heading */}
          <h2 className="text-4xl sm:text-6xl font-extrabold tracking-tight max-w-4xl text-white leading-[1.1] mb-6">
            Synthesize. Visualize. <span className="bg-gradient-to-r from-white via-slate-200 to-[#00F5D4] bg-clip-text text-transparent">Converse.</span>
          </h2>

          {/* Crisp, Grounded, Benefit-Driven Subhead */}
          <p className="text-base sm:text-lg text-slate-400 max-w-2xl leading-relaxed mb-10">
            Turn raw spreadsheets into interactive dashboards you can talk to. Secure, instant, and completely local.
          </p>

          {/* Premium High-Fidelity Button CTAs */}
          <div className="flex flex-col sm:flex-row items-center gap-4 mb-20 w-full max-w-md justify-center">
            <button
              onClick={onEnterWorkspace}
              className="w-full sm:w-auto px-7 py-3.5 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-[#00F5D4] hover:to-[#00e1c2] hover:text-slate-950 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/10 hover:shadow-[0_0_25px_rgba(0,245,212,0.25)] transition-all duration-300 hover:scale-[1.02] flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Launch Interactive Console</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <a
              href="#demo-browser-frame"
              className="w-full sm:w-auto px-7 py-3.5 bg-slate-900 border border-slate-800 hover:border-[#00F5D4]/40 text-slate-300 hover:text-white font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 text-[#00F5D4] fill-[#00F5D4]" />
              <span>Interactive Demo</span>
            </a>
          </div>
        </section>

        {/* Live Sandbox Interactive Area styled inside a premium browser window mockup frame */}
        <section className="max-w-7xl mx-auto px-6 pb-24">
          <div 
            id="demo-browser-frame" 
            className="w-full max-w-5xl mx-auto bg-slate-900/40 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 hover:border-slate-700/80"
          >
            {/* Desktop Browser Header/Controls bar */}
            <div className="bg-slate-950/95 border-b border-slate-900 px-5 py-3.5 flex items-center justify-between">
              {/* Left Side Window Dots */}
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#FF6B6B] opacity-90 hover:opacity-100 transition-opacity" />
                <span className="w-3 h-3 rounded-full bg-[#FFBE2D] opacity-90 hover:opacity-100 transition-opacity" />
                <span className="w-3 h-3 rounded-full bg-[#00F5D4] opacity-90 hover:opacity-100 transition-opacity" />
              </div>
              
              {/* Address bar URL */}
              <div className="hidden sm:flex items-center gap-2 px-3.5 py-1 bg-slate-900 border border-slate-800/80 rounded-lg text-[11px] font-mono text-slate-400 w-full max-w-sm justify-center">
                <Database className="w-3 h-3 text-[#00F5D4]" />
                <span className="tracking-wide">talkingrabbitt.ai/demo/sandbox-console</span>
              </div>

              {/* Right indicators */}
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] uppercase font-mono tracking-widest text-[#00F5D4] font-extrabold bg-[#00F5D4]/10 px-2 py-0.5 rounded-md">LIVE CONSOLE</span>
              </div>
            </div>

            {/* Sandbox Workspace Body Area */}
            <div className="p-6 md:p-8 bg-slate-900/20 backdrop-blur-md">
              {/* Interactive Sandbox Header Tab */}
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800/60 pb-6 mb-6">
                <div className="text-left">
                  <span className="text-[10px] uppercase tracking-widest font-mono font-bold text-slate-500">EXHIBITION PLATFORM</span>
                  <h3 className="text-lg font-bold text-slate-200 mt-0.5">Explore Analytical Metrics Dynamically</h3>
                </div>
                
                <div className="flex bg-slate-950 p-1 border border-slate-800 rounded-xl items-center gap-1 w-full md:w-auto">
                  {(["revenue", "growth", "conversion"] as const).map((metric) => (
                    <button
                      key={metric}
                      onClick={() => setActiveDemoMetric(metric)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer capitalize transition-all duration-300 flex-1 md:flex-initial ${
                        activeDemoMetric === metric 
                          ? "bg-slate-900 border border-slate-800 text-[#00F5D4] shadow-sm font-bold" 
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      {metric}
                    </button>
                  ))}
                </div>
              </div>

              {/* Demo Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Visualizer Frame (Left 8 Columns) */}
                <div className="lg:col-span-8 space-y-6">
                  {/* Premium Mini KPI & Stats Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <div className="bg-slate-950/70 border border-slate-800/50 rounded-2xl p-4 text-left shadow-sm">
                      <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500 block">{activeDemo.title}</span>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-xl md:text-2xl font-extrabold text-slate-100">{activeDemo.value}</span>
                        <span className={`text-[11px] font-bold ${activeDemo.isPositive ? "text-[#00F5D4]" : "text-[#FF6B6B]"}`}>
                          {activeDemo.change}
                        </span>
                      </div>
                    </div>

                    <div className="bg-slate-950/70 border border-slate-800/50 rounded-2xl p-4 text-left shadow-sm">
                      <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500 block">AI Accuracy Rate</span>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-xl md:text-2xl font-extrabold text-slate-100">98.2%</span>
                        <span className="text-[11px] font-bold text-[#00F5D4]">Verified</span>
                      </div>
                    </div>

                    <div className="bg-slate-950/70 border border-slate-800/50 rounded-2xl p-4 text-left shadow-sm col-span-2 sm:col-span-1">
                      <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500 block">Response Latency</span>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-xl md:text-2xl font-extrabold text-slate-100">0.45s</span>
                        <span className="text-[11px] font-bold text-indigo-400">Ultra-fast</span>
                      </div>
                    </div>
                  </div>

                  {/* Dynamic Interactive Chart Canvas */}
                  <div className="bg-slate-950/70 border border-slate-800/50 rounded-2xl p-5 shadow-inner h-[280px] flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                        <Activity className="w-3.5 h-3.5 text-[#00F5D4]" />
                        <span>{activeDemo.title} Visualization</span>
                      </h4>
                      <span className="text-[9px] font-mono tracking-wider text-slate-600 uppercase">Interactive Sample</span>
                    </div>

                    {/* Animated Bars Container */}
                    <div className="flex-1 flex items-end justify-around gap-2 px-4 pb-2 h-full">
                      {activeDemo.chartData.map((val, idx) => (
                        <div key={idx} className="flex-1 flex flex-col items-center gap-2 group/bar">
                          <div className="w-full relative flex items-end justify-center h-40">
                            {/* Interactive tooltip popup on hover */}
                            <div className="absolute -top-7 scale-0 group-hover/bar:scale-100 bg-slate-950 border border-slate-800 text-[9px] font-mono font-bold text-[#00F5D4] px-1.5 py-0.5 rounded shadow-lg transition-transform z-10">
                              {val} units
                            </div>
                            {/* Animated bar columns */}
                            <div 
                              className={`w-full rounded-t-lg bg-gradient-to-t ${activeDemo.color} opacity-85 hover:opacity-100 transition-all duration-500 shadow-md`}
                              style={{ height: `${(val / 110) * 100}%` }}
                            />
                          </div>
                          <span className="text-[9px] font-mono font-semibold text-slate-500 uppercase tracking-wide">
                            {activeDemo.labels[idx]}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* AI Synthesizer response panel (Right 4 Columns) */}
                <div className="lg:col-span-4 h-full">
                  <div className="bg-slate-950/70 border border-slate-800/50 rounded-2xl p-5 h-full flex flex-col justify-between min-h-[380px]">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 border-b border-slate-900 pb-3 mb-2.5">
                        <div className="p-1.5 bg-[#00F5D4]/10 rounded-lg">
                          <Bot className="w-4 h-4 text-[#00F5D4]" />
                        </div>
                        <span className="text-xs font-bold text-[#00F5D4] tracking-wide uppercase font-mono">Insight Analyst</span>
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed italic mb-4 font-medium">
                        "{activeDemo.insight}"
                      </p>

                      <div className="bg-slate-900/40 border border-slate-800/40 rounded-xl p-3.5 space-y-1.5">
                        <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block font-mono">Primary Action:</span>
                        <p className="text-[11px] text-slate-400 leading-relaxed">
                          Initialize forecast projection sequences inside the Interactive Console to isolate potential cost-saving options.
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={onEnterWorkspace}
                      className="w-full mt-4 py-2.5 bg-slate-900 hover:bg-slate-850 hover:border-[#00F5D4]/40 border border-slate-800 text-slate-300 hover:text-[#00F5D4] rounded-xl text-xs font-bold transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>Analyze Live Metrics</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Local Drag & Drop Spreadsheet Loader Area */}
        <section className="max-w-7xl mx-auto px-6 pb-28">
          <div className="w-full max-w-4xl mx-auto border border-slate-800 rounded-3xl p-6 md:p-8 bg-slate-950/40 backdrop-blur-sm relative shadow-xl">
            <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-[#00F5D4]/30 to-transparent" />
            
            <div className="max-w-2xl mx-auto text-center space-y-2 mb-8">
              <h3 className="text-xl font-bold text-slate-100 tracking-tight">Direct Spreadsheet Analysis</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                Upload any business spreadsheet. We compile it immediately inside secure local memory context and construct your private dashboard workspace.
              </p>
            </div>

            <SpreadsheetLoader onDataLoaded={onDataLoaded} isLoading={isProcessing} />
          </div>
        </section>

        {/* Premium Bento Grid Features Section */}
        <section className="max-w-7xl mx-auto px-6 pb-32">
          <div className="max-w-5xl mx-auto space-y-8">
            <div className="border-l-[3px] border-[#00F5D4] pl-4">
              <span className="text-[10px] uppercase font-mono tracking-widest font-bold text-slate-500">PRODUCT FEATURES</span>
              <h3 className="text-2xl font-extrabold text-slate-100 tracking-tight">Enterprise Intelligence. Local Executions.</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
              
              {/* Feature 1: Speech (Col span 7) */}
              <div className="md:col-span-7 bg-slate-900/20 border border-slate-800/80 rounded-2xl p-6 hover:border-[#00F5D4]/30 transition-all duration-300 relative group overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#00F5D4]/2 rounded-full blur-xl pointer-events-none group-hover:scale-125 transition-transform" />
                
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-[#00F5D4]">
                    <Volume2 className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-slate-200">Voice Summaries & Speech</h4>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed max-w-lg">
                  Our speech engine synthesizes metrics into natural, clear audio summaries. Listen to automated forecasts, seasonal overviews, and interactive insight reports without sitting in front of a screen.
                </p>
              </div>

              {/* Feature 2: Privacy (Col span 5) */}
              <div className="md:col-span-5 bg-slate-900/20 border border-slate-800/80 rounded-2xl p-6 hover:border-[#00F5D4]/30 transition-all duration-300 relative group overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-[#00F5D4]/2 rounded-full blur-xl pointer-events-none" />
                
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-[#00F5D4]">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-slate-200">Local Data Privacy</h4>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Your business secrets remain completely private. All uploaded spreadsheets are processed directly in your local browser memory, with zero persistent server-side storage.
                </p>
              </div>

              {/* Feature 3: Heatmaps (Col span 5) */}
              <div className="md:col-span-5 bg-slate-900/20 border border-slate-800/80 rounded-2xl p-6 hover:border-[#00F5D4]/30 transition-all duration-300 relative group overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-[#00F5D4]/2 rounded-full blur-xl pointer-events-none" />
                
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-[#00F5D4]">
                    <Activity className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-slate-200">Interactive Heatmap Matrices</h4>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Discover correlations and trend densities with high-fidelity grid representations. Perfect for analyzing customer lifetime value, seasonal patterns, or multi-dimensional matrices.
                </p>
              </div>

              {/* Feature 4: Automated KPIs (Col span 7) */}
              <div className="md:col-span-7 bg-slate-900/20 border border-slate-800/80 rounded-2xl p-6 hover:border-[#00F5D4]/30 transition-all duration-300 relative group overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#00F5D4]/2 rounded-full blur-xl pointer-events-none" />
                
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-[#00F5D4]">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-slate-200">Automated Key Metrics</h4>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed max-w-lg">
                  Skip manual visualization setups. Our engine identifies key metrics automatically, compiling high-quality interactive dashboards, trend charts, and targeted benchmarks instantly.
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* Sleek SaaS CTA Area */}
        <section className="max-w-5xl mx-auto px-6 pb-28 w-full">
          <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950/20 border border-slate-800/80 rounded-3xl p-8 md:p-12 text-center relative overflow-hidden group shadow-xl hover:border-slate-700/80 transition-all duration-300">
            <div className="absolute -top-10 -right-10 w-48 h-48 bg-[#00F5D4]/3 rounded-full blur-[40px] pointer-events-none group-hover:scale-125 transition-transform" />
            
            <h3 className="text-2xl md:text-3xl font-black text-white tracking-tight mb-4 leading-tight">
              Ready to converse with your metrics?
            </h3>
            <p className="text-xs md:text-sm text-slate-400 max-w-xl mx-auto leading-relaxed mb-8">
              Experience business intelligence with zero complexity. No setup, no programming, no SQL queries—just clear insights.
            </p>
            
            <button
              onClick={onEnterWorkspace}
              className="px-8 py-3.5 bg-slate-900 hover:bg-[#00F5D4] text-[#00F5D4] hover:text-slate-950 border border-[#00F5D4]/30 hover:border-[#00F5D4] text-xs font-bold rounded-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(0,245,212,0.2)] flex items-center gap-2 mx-auto cursor-pointer"
            >
              <span>Launch Conversational Console</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </section>

      </main>
    </div>
  );
}
