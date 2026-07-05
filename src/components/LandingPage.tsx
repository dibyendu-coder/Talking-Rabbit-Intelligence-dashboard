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
  ArrowUpRight
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import SpreadsheetLoader from "./SpreadsheetLoader";
import { ParsedData } from "../types";
import { SAMPLE_DATASETS } from "../data";

interface LandingPageProps {
  onEnterWorkspace: () => void;
  onDataLoaded: (data: ParsedData, rawData: any[]) => void;
  isProcessing: boolean;
  customKey: string;
  onToggleKeyInput: () => void;
}

type MetricType = "revenue" | "growth" | "conversion";

export default function LandingPage({
  onEnterWorkspace,
  onDataLoaded,
  isProcessing,
  customKey,
  onToggleKeyInput
}: LandingPageProps) {
  const [activeDemoMetric, setActiveDemoMetric] = useState<MetricType>("revenue");
  
  // Custom mock interactive data for the premium preview widget
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
      insight: "Consistent month-over-month growth driven by premium service adoption and expansion in North American tech segments."
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
      insight: "Subscriber velocity accelerated in late Q2, largely reflecting secondary organic channels and our viral recommendation loops."
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
      insight: "Minor friction identified in mid-week mobile checkout flows. Recommend targeting cart abandonments with tailored discount pushes."
    }
  };

  const activeDemo = mockMetrics[activeDemoMetric];

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans overflow-x-hidden selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Decorative background grids and blurred ambient lights */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-950/40 via-slate-950/10 to-transparent opacity-80" />
        <div className="absolute top-[20%] left-[10%] w-[450px] h-[450px] bg-indigo-500/5 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: "12s" }} />
        <div className="absolute top-[50%] right-[5%] w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[100px] animate-pulse" style={{ animationDuration: "8s" }} />
        
        {/* Sleek Grid Overlay */}
        <div 
          className="absolute inset-0 opacity-[0.03] pointer-events-none" 
          style={{ 
            backgroundImage: "radial-gradient(#38bdf8 1px, transparent 1px)", 
            backgroundSize: "24px 24px" 
          }} 
        />
      </div>

      {/* Landing Header */}
      <header className="relative z-20 border-b border-slate-900/60 bg-slate-950/60 backdrop-blur-md px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-tr from-indigo-600 to-emerald-500 rounded-xl shadow-lg shadow-indigo-500/10">
              <Sparkles className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-lg font-bold tracking-tight bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent">
                  Talking Rabbitt
                </h1>
                <span className="text-[10px] font-mono font-bold tracking-wider px-2 py-0.5 bg-indigo-950/80 border border-indigo-500/30 rounded-full text-indigo-300">
                  v3.5 PRO
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium">Business Intelligence Workspace</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={onToggleKeyInput}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all duration-200 text-xs font-semibold ${
                customKey 
                  ? "bg-emerald-950/40 text-emerald-300 border-emerald-900/50" 
                  : "bg-slate-900/80 text-slate-300 border-slate-800 hover:bg-slate-800"
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{customKey ? "Custom Key Saved" : "Configure Private Key"}</span>
            </button>

            <button
              onClick={onEnterWorkspace}
              className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg border border-indigo-500/20 text-xs font-bold transition-all shadow-md shadow-indigo-600/10"
            >
              Enter Workspace
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-16 pb-20 flex flex-col items-center text-center">
        {/* Sparkle Tagline */}
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-900/90 border border-slate-800/80 rounded-full text-xs font-mono font-bold text-indigo-400 mb-6 shadow-md">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
          <span>AUTONOMOUS COGNITIVE BUSINESS INSIGHTS</span>
        </div>

        {/* Display Heading */}
        <h2 className="text-4xl sm:text-6xl font-black tracking-tight max-w-4xl text-white leading-[1.1] mb-6">
          Synthesize. Visualize. <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-emerald-400 bg-clip-text text-transparent">Converse.</span>
        </h2>

        {/* Subhead */}
        <p className="text-base sm:text-lg text-slate-400 max-w-2xl leading-relaxed mb-10">
          Transmute static spreadsheet databases into beautiful dynamic visualization canvases. Speak directly with your metrics using our conversational agentic intelligence.
        </p>

        {/* Premium Button CTAs */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-16 w-full max-w-md justify-center">
          <button
            onClick={onEnterWorkspace}
            className="w-full sm:w-auto px-7 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/20 transition-all hover:scale-[1.02] flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Launch Interactive Console</span>
            <ArrowRight className="w-4 h-4 text-white" />
          </button>
          <a
            href="#live-preview-widget"
            className="w-full sm:w-auto px-7 py-3.5 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 text-indigo-400 fill-indigo-400" />
            <span>Interactive Demo</span>
          </a>
        </div>

        {/* Main Live Sandbox Demo Section */}
        <div id="live-preview-widget" className="w-full max-w-5xl bg-slate-900/60 border border-slate-800/80 rounded-3xl p-6 md:p-8 backdrop-blur-md shadow-2xl relative mb-24 overflow-hidden group">
          {/* Subtle Ambient Border Flare */}
          <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent" />

          {/* Interactive Toggle Control Tab */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800/80 pb-6 mb-6">
            <div className="text-left">
              <span className="text-[10px] uppercase tracking-widest font-mono font-bold text-indigo-400">DEMO SANDBOX CONSOLE</span>
              <h3 className="text-lg font-bold text-slate-200 mt-0.5">Explore Analytical Metrics Dynamically</h3>
            </div>
            
            <div className="flex bg-slate-950 p-1 border border-slate-800 rounded-xl items-center gap-1 w-full md:w-auto">
              {(["revenue", "growth", "conversion"] as const).map((metric) => (
                <button
                  key={metric}
                  onClick={() => setActiveDemoMetric(metric)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer capitalize transition-all duration-200 flex-1 md:flex-initial ${
                    activeDemoMetric === metric 
                      ? "bg-indigo-600 text-white shadow" 
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {metric}
                </button>
              ))}
            </div>
          </div>

          {/* Internal Demo Grid Mockup */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Dashboard Visualizer Panel */}
            <div className="lg:col-span-8 space-y-6">
              {/* Premium Mini KPI & Stats Card */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="bg-slate-950/80 border border-slate-800/60 rounded-2xl p-4 text-left shadow-sm">
                  <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500 block">{activeDemo.title}</span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-xl md:text-2xl font-extrabold text-slate-100">{activeDemo.value}</span>
                    <span className={`text-[11px] font-bold ${activeDemo.isPositive ? "text-emerald-400" : "text-amber-400"}`}>
                      {activeDemo.change}
                    </span>
                  </div>
                </div>

                <div className="bg-slate-950/80 border border-slate-800/60 rounded-2xl p-4 text-left shadow-sm">
                  <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500 block">AI Confidence Score</span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-xl md:text-2xl font-extrabold text-slate-100">98.2%</span>
                    <span className="text-[11px] font-bold text-indigo-400">Excellent</span>
                  </div>
                </div>

                <div className="bg-slate-950/80 border border-slate-800/60 rounded-2xl p-4 text-left shadow-sm col-span-2 sm:col-span-1">
                  <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500 block">Synthesis Speed</span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-xl md:text-2xl font-extrabold text-slate-100">0.45s</span>
                    <span className="text-[11px] font-bold text-purple-400">Real-Time</span>
                  </div>
                </div>
              </div>

              {/* Dynamic Simulated Chart Canvas */}
              <div className="bg-slate-950/80 border border-slate-800/60 rounded-2xl p-5 shadow-inner h-[280px] flex flex-col justify-between">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{activeDemo.title} Visualization</span>
                  </h4>
                  <span className="text-[9px] font-mono tracking-widest text-slate-500 uppercase">Interactive Sample</span>
                </div>

                {/* Animated Bars container */}
                <div className="flex-1 flex items-end justify-around gap-2 px-4 pb-2 h-full">
                  {activeDemo.chartData.map((val, idx) => (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-2 group/bar">
                      <div className="w-full relative flex items-end justify-center h-40">
                        {/* Interactive Tooltip popup on hover */}
                        <div className="absolute -top-7 scale-0 group-hover/bar:scale-100 bg-slate-900 border border-slate-800 text-[9px] font-mono font-bold text-slate-200 px-1.5 py-0.5 rounded shadow-lg transition-transform z-10">
                          {val} units
                        </div>
                        {/* Custom Animated Bar with dynamic height */}
                        <div 
                          className={`w-full rounded-t-lg bg-gradient-to-t ${activeDemo.color} opacity-85 hover:opacity-100 transition-all duration-700 shadow-md`}
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

            {/* AI Synthesizer response column */}
            <div className="lg:col-span-4 space-y-4 text-left">
              <div className="bg-slate-950/80 border border-slate-800/60 rounded-2xl p-5 h-full flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 border-b border-slate-900 pb-3 mb-3.5">
                    <div className="p-1.5 bg-indigo-500/10 rounded-lg">
                      <Bot className="w-4 h-4 text-indigo-400" />
                    </div>
                    <span className="text-xs font-extrabold text-indigo-400 tracking-wide uppercase font-mono">Cognitive Insight Engine</span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed italic mb-4 font-medium">
                    "{activeDemo.insight}"
                  </p>

                  <div className="bg-slate-900/60 border border-slate-800/50 rounded-xl p-3 mb-4 space-y-2">
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block font-mono">Strategic Directive:</span>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Initialize full predictive projection sequences within the Workspace Console to discover tactical cost savings up to 14%.
                    </p>
                  </div>
                </div>

                <button
                  onClick={onEnterWorkspace}
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-850 hover:border-indigo-500/40 border border-slate-800 text-indigo-400 hover:text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Analyse Live Metrics</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Direct Uploader section */}
        <div className="w-full max-w-4xl border border-slate-800/80 rounded-3xl p-6 md:p-8 bg-slate-950/60 backdrop-blur-sm relative shadow-xl mb-24">
          <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />
          
          <div className="max-w-2xl mx-auto text-center space-y-3 mb-8">
            <h3 className="text-xl font-bold text-slate-100 tracking-tight">Direct File Analysis</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
              Drag and drop any business spreadsheet. We compile it locally, parse structure statistics, and launch your private workspace automatically.
            </p>
          </div>

          <SpreadsheetLoader onDataLoaded={onDataLoaded} isLoading={isProcessing} />
        </div>

        {/* Premium Bento Grid Features section */}
        <div className="w-full max-w-5xl text-left space-y-6">
          <div className="border-l-2 border-indigo-500 pl-4">
            <span className="text-[10px] uppercase font-mono tracking-widest font-bold text-indigo-400">PRODUCT ARCHITECTURE</span>
            <h3 className="text-2xl font-extrabold text-slate-100 tracking-tight">Engineered for Premium BI Performance</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Feature 1: Auditory Speech (Col span 7) */}
            <div className="md:col-span-7 bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 hover:border-indigo-500/30 transition-all duration-300 relative group overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-xl pointer-events-none group-hover:scale-125 transition-transform" />
              
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-xl">
                  <Volume2 className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-slate-200">Conversational Synth System</h4>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed max-w-md">
                Our custom audio synth engine synthesizes metrics into human-like speech. Listen to automated forecasts, analytical summaries, and interactive data insights without looking at screens.
              </p>
            </div>

            {/* Feature 2: High Security (Col span 5) */}
            <div className="md:col-span-5 bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 hover:border-emerald-500/30 transition-all duration-300 relative group overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl pointer-events-none" />
              
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-slate-200">Zero-Data Retention</h4>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                All uploaded CSV documents are processed strictly inside your secure local memory context. Override API keys are saved directly into your browser's private localStorage.
              </p>
            </div>

            {/* Feature 3: Heatmaps (Col span 5) */}
            <div className="md:col-span-5 bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 hover:border-pink-500/30 transition-all duration-300 relative group overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-pink-500/5 rounded-full blur-xl pointer-events-none" />
              
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 bg-pink-500/10 text-pink-400 rounded-xl">
                  <Activity className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-slate-200">Multi-Dimensional Heatmaps</h4>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Render correlations and segment matrices natively. Discover structural metric densities, regional sales combinations, or SaaS customer lifetime values through interactive grid matrix color scales.
              </p>
            </div>

            {/* Feature 4: Automated KPIs (Col span 7) */}
            <div className="md:col-span-7 bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 hover:border-amber-500/30 transition-all duration-300 relative group overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-xl pointer-events-none" />
              
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-xl">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-slate-200">Dynamic KPI Board Panel</h4>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed max-w-md">
                No manual dashboard setup required. Our visualization agent automatically inspects raw rows, identifies critical KPIs, compiles target benchmarks, and charts them with high-fidelity Recharts visualizers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Decorative Brand CTA Panel */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 mb-24 w-full">
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950/40 border border-slate-800/80 rounded-3xl p-8 md:p-12 text-center relative overflow-hidden group shadow-xl">
          <div className="absolute -top-10 -right-10 w-48 h-48 bg-indigo-500/10 rounded-full blur-[40px] pointer-events-none group-hover:scale-125 transition-transform" />
          
          <h3 className="text-2xl md:text-3xl font-black text-white tracking-tight mb-4 leading-tight">
            Ready to Speak with Your Datasets?
          </h3>
          <p className="text-xs md:text-sm text-slate-400 max-w-xl mx-auto leading-relaxed mb-8">
            Experience the ultimate speed of autonomous visual dashboard generation. No SQL. No programming. Just converse.
          </p>
          
          <button
            onClick={onEnterWorkspace}
            className="px-8 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/20 transition-all hover:scale-[1.02] flex items-center gap-2 mx-auto cursor-pointer"
          >
            <span>Launch Complete Workspace</span>
            <ArrowRight className="w-4 h-4 text-white" />
          </button>
        </div>
      </section>
    </div>
  );
}
