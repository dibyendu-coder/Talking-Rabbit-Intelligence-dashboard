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
  User,
  Zap,
  Lock,
  Boxes,
  Cpu
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

// Elegant Inline Geometric Rabbit Brand Icon SVG styled for Bitcoin DeFi
const GeometricRabbitIcon = ({ className = "w-6 h-6 text-bitcoin" }: { className?: string }) => (
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
  
  // Custom Crypto/DeFi-optimized metric profiles with Bitcoin colors
  const mockMetrics = {
    revenue: {
      title: "Bitcoin DeFi Volume",
      value: "$4,829,000",
      change: "+24.5%",
      isPositive: true,
      chartData: [45, 62, 53, 78, 85, 95],
      labels: ["Block 1", "Block 2", "Block 3", "Block 4", "Block 5", "Block 6"],
      color: "from-bitcoin-burnt to-bitcoin",
      accentBg: "bg-bitcoin/10 text-bitcoin",
      insight: "Protocol transaction volumes have accelerated due to expansion in Layer-2 liquidity bridges and native staking contracts."
    },
    growth: {
      title: "Active Delegators",
      value: "14,820 Nodes",
      change: "+18.2%",
      isPositive: true,
      chartData: [30, 42, 58, 65, 82, 105],
      labels: ["Epoch A", "Epoch B", "Epoch C", "Epoch D", "Epoch E", "Epoch F"],
      color: "from-bitcoin to-bitcoin-gold",
      accentBg: "bg-bitcoin-gold/10 text-bitcoin-gold",
      insight: "Validator nodes reached record capacity, signaling positive sentiment for the automated cross-chain yield optimization loops."
    },
    conversion: {
      title: "Yield Compound Rate",
      value: "12.42% APY",
      change: "-1.1%",
      isPositive: false,
      chartData: [85, 80, 75, 78, 70, 68],
      labels: ["Day 1", "Day 2", "Day 3", "Day 4", "Day 5", "Day 6"],
      color: "from-bitcoin-burnt to-bitcoin-gold",
      accentBg: "bg-bitcoin-burnt/10 text-bitcoin-burnt",
      insight: "Minor contraction in APY as network complexity increases. Recommend immediate automated balancing into stablecoin pools."
    }
  };

  const activeDemo = mockMetrics[activeDemoMetric];

  return (
    <div className="relative min-h-screen bg-background text-foreground flex flex-col font-sans overflow-x-hidden selection:bg-bitcoin/20 selection:text-bitcoin-gold">
      
      {/* Background Textures & Radial Glowing Fields */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Subtle grid pattern overlay */}
        <div className="absolute inset-0 bg-grid-pattern opacity-80" />
        
        {/* Orange glow field at top */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[650px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-bitcoin-burnt/15 via-background to-transparent opacity-80" />
        
        {/* Secondary Gold Glow blob */}
        <div className="absolute top-[20%] right-[10%] w-[500px] h-[500px] bg-bitcoin-gold/3 rounded-full blur-[130px] animate-pulse" style={{ animationDuration: "12s" }} />
        
        {/* Deep Burnt Orange Glow blob */}
        <div className="absolute bottom-[30%] left-[5%] w-[600px] h-[600px] bg-bitcoin/3 rounded-full blur-[150px] animate-pulse" style={{ animationDuration: "16s" }} />
      </div>

      {/* Header with Bitcoin DeFi Elements */}
      <header className="relative z-20 border-b border-white/5 bg-background/85 backdrop-blur-md px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 group">
            <div className="p-2.5 bg-surface border border-white/10 rounded-xl shadow-bitcoin-glow transition-colors duration-300 group-hover:border-bitcoin/50">
              <GeometricRabbitIcon className="w-6 h-6 text-bitcoin transition-transform duration-500 group-hover:scale-105" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-lg font-bold tracking-tight text-white group-hover:text-bitcoin transition-colors duration-200 font-heading">
                  Talking Rabbitt
                </h1>
                <span className="text-[9px] font-mono font-bold tracking-wider px-2 py-0.5 bg-bitcoin/10 border border-bitcoin/30 rounded-full text-bitcoin-gold">
                  DEFI v3.5
                </span>
              </div>
              <p className="text-[10px] text-muted font-medium tracking-wide font-mono">Decentralized Intelligence Hub</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onToggleKeyInput}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all duration-300 text-xs font-semibold font-mono cursor-pointer ${
                customKey 
                  ? "bg-bitcoin/10 text-bitcoin-gold border-bitcoin/30 hover:border-bitcoin/50" 
                  : "bg-surface text-muted border-white/10 hover:border-bitcoin/30 hover:text-white"
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-bitcoin" />
              <span>{customKey ? "API Key Synced" : "Configure API Key"}</span>
            </button>

            {currentUser ? (
              <div className="flex items-center gap-2 bg-surface border border-white/10 px-3.5 py-1.5 rounded-full text-xs font-semibold font-mono">
                <User className="w-3.5 h-3.5 text-bitcoin-gold" />
                <span className="text-white font-bold">{currentUser.displayName || "Key Custodian"}</span>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="px-4 py-1.5 bg-surface hover:bg-surface/80 text-bitcoin hover:text-bitcoin-gold rounded-full border border-white/10 hover:border-bitcoin/40 text-xs font-bold font-mono transition-all cursor-pointer"
              >
                Connect Wallet
              </button>
            )}

            <button
              onClick={onEnterWorkspace}
              className="px-4.5 py-1.5 bg-gradient-to-r from-bitcoin-burnt to-bitcoin hover:from-bitcoin hover:to-bitcoin-gold text-white hover:text-black rounded-full text-xs font-bold transition-all shadow-bitcoin-glow hover:shadow-bitcoin-glow-intense hover:scale-105 cursor-pointer font-mono"
            >
              Console
            </button>
          </div>
        </div>
      </header>

      {/* Main SaaS Frame */}
      <main className="relative z-10 flex-1">
        
        {/* Hero Section with Spinning Orbital Rings & Floating Stat Badges */}
        <section className="max-w-7xl mx-auto px-6 pt-20 pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Bold Copy & Headlines */}
            <div className="lg:col-span-7 text-center lg:text-left space-y-6">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-surface border border-white/5 rounded-full text-xs font-mono font-bold text-muted tracking-wider shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-bitcoin animate-ping" />
                <span className="text-bitcoin">CONVERSATIONAL BITCOIN DEFI PROTOCOL</span>
              </div>

              {/* Title */}
              <h2 className="text-4xl sm:text-6xl font-bold tracking-tight text-white leading-[1.1] font-heading">
                Audit. Forecast. <span className="bg-gradient-to-r from-bitcoin to-bitcoin-gold bg-clip-text text-transparent">Converse.</span>
              </h2>

              {/* Description */}
              <p className="text-base sm:text-lg text-muted max-w-2xl leading-relaxed font-body">
                Turn complex crypto spreadsheets and ledger transaction logs into clean, visual dashboards you can speak with. Experience mathematical precision wrapped in digital gold.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start pt-4">
                <button
                  onClick={onEnterWorkspace}
                  className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-bitcoin-burnt to-bitcoin hover:from-bitcoin hover:to-bitcoin-gold text-white hover:text-background font-bold rounded-full shadow-bitcoin-glow hover:shadow-bitcoin-glow-intense transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2 cursor-pointer font-mono text-xs tracking-wider uppercase"
                >
                  <span>Launch Yield Console</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <a
                  href="#demo-browser-frame"
                  className="w-full sm:w-auto px-8 py-3.5 bg-surface border border-white/10 hover:border-bitcoin/50 text-white hover:text-bitcoin-gold font-bold rounded-full transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer font-mono text-xs tracking-wider uppercase"
                >
                  <Play className="w-3.5 h-3.5 text-bitcoin fill-bitcoin/30" />
                  <span>Sandbox Demo</span>
                </a>
              </div>
            </div>

            {/* Right Column: Spinning Orbital Rings & Bouncing Stat Cards */}
            <div className="lg:col-span-5 flex justify-center items-center relative h-[380px] md:h-[450px]">
              
              {/* Outer Glow Ring (Clockwise Rotation) */}
              <div className="absolute w-[280px] h-[280px] md:w-[350px] md:h-[350px] rounded-full border border-dashed border-bitcoin/20 animate-spin-slow flex items-center justify-center">
                {/* Micro orbital node on outer ring */}
                <div className="absolute top-0 w-3.5 h-3.5 rounded-full bg-bitcoin shadow-bitcoin-glow" />
                <div className="absolute bottom-0 w-3 h-3 rounded-full bg-bitcoin-gold shadow-gold-glow" />
              </div>

              {/* Inner Ring (Counter-Clockwise Rotation) */}
              <div className="absolute w-[200px] h-[200px] md:w-[260px] md:h-[260px] rounded-full border border-double border-white/5 animate-spin-reverse-slow flex items-center justify-center">
                {/* Node on inner ring */}
                <div className="absolute left-0 w-2.5 h-2.5 rounded-full bg-bitcoin-burnt" />
              </div>

              {/* Center Core Holographic Hub representing the Geometric Rabbit */}
              <div className="absolute w-[120px] h-[120px] md:w-[150px] md:h-[150px] rounded-full bg-surface border border-bitcoin/30 flex items-center justify-center shadow-bitcoin-glow animate-float z-10">
                <div className="absolute inset-1.5 rounded-full bg-gradient-to-b from-bitcoin/20 via-background to-black" />
                <GeometricRabbitIcon className="w-16 h-16 text-bitcoin-gold drop-shadow-[0_0_15px_rgba(247,147,26,0.6)] z-20" />
              </div>

              {/* Floating Stat Card 1 - Bouncing Top Right */}
              <div className="absolute top-4 right-2 md:-right-4 bg-surface/90 border border-bitcoin/40 rounded-xl p-3 shadow-bitcoin-glow flex items-center gap-2.5 animate-bounce z-20" style={{ animationDuration: "5s" }}>
                <div className="p-1.5 bg-bitcoin/10 rounded-lg">
                  <Zap className="w-4 h-4 text-bitcoin-gold" />
                </div>
                <div className="text-left">
                  <span className="text-[9px] font-mono text-muted tracking-wider block uppercase">Network APY</span>
                  <span className="text-xs font-mono font-bold text-white">18.42% Secured</span>
                </div>
              </div>

              {/* Floating Stat Card 2 - Bouncing Bottom Left */}
              <div className="absolute bottom-6 left-2 md:-left-4 bg-surface/90 border border-bitcoin-gold/30 rounded-xl p-3 shadow-gold-glow flex items-center gap-2.5 animate-bounce z-20" style={{ animationDuration: "6s", animationDelay: "1s" }}>
                <div className="p-1.5 bg-bitcoin-gold/10 rounded-lg">
                  <Boxes className="w-4 h-4 text-bitcoin" />
                </div>
                <div className="text-left">
                  <span className="text-[9px] font-mono text-muted tracking-wider block uppercase">Blockchain Index</span>
                  <span className="text-xs font-mono font-bold text-white">842,912 Blocks</span>
                </div>
              </div>

              {/* Floating Stat Card 3 - Bouncing Top Left */}
              <div className="absolute top-10 left-6 bg-surface/90 border border-white/10 rounded-xl p-2.5 flex items-center gap-2 animate-bounce z-20 text-xs font-mono" style={{ animationDuration: "7s", animationDelay: "2s" }}>
                <span className="w-2 h-2 rounded-full bg-bitcoin animate-pulse" />
                <span className="text-muted">Gas Optimizer: <strong className="text-white">Active</strong></span>
              </div>

            </div>
          </div>
        </section>

        {/* Live Sandbox Interactive Area styled inside a premium dark browser window mockup frame */}
        <section id="demo-browser-frame" className="max-w-7xl mx-auto px-6 pb-24">
          <div 
            className="w-full max-w-5xl mx-auto bg-surface border border-white/10 rounded-2xl shadow-bitcoin-glow overflow-hidden transition-all duration-300 hover:border-bitcoin/40"
          >
            {/* Desktop Browser Header/Controls bar */}
            <div className="bg-[#030304] border-b border-white/5 px-5 py-3.5 flex items-center justify-between">
              {/* Left Side Window Dots */}
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-bitcoin-burnt opacity-80" />
                <span className="w-3 h-3 rounded-full bg-bitcoin opacity-80" />
                <span className="w-3 h-3 rounded-full bg-bitcoin-gold opacity-80" />
              </div>
              
              {/* Address bar URL */}
              <div className="hidden sm:flex items-center gap-2 px-3.5 py-1 bg-background border border-white/5 rounded-full text-[11px] font-mono text-muted w-full max-w-sm justify-center">
                <Database className="w-3 h-3 text-bitcoin" />
                <span className="tracking-wide">rabbitt.defi/demo/sandbox-console</span>
              </div>

              {/* Right indicators */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-mono tracking-widest text-bitcoin font-bold bg-bitcoin/10 px-2.5 py-0.5 rounded">LIVE STATS</span>
              </div>
            </div>

            {/* Sandbox Workspace Body Area */}
            <div className="p-6 md:p-8 bg-background/50 backdrop-blur-md">
              {/* Interactive Sandbox Header Tab */}
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-white/5 pb-6 mb-6">
                <div className="text-left">
                  <span className="text-[10px] uppercase tracking-widest font-mono font-bold text-bitcoin">EXHIBITION INTERFACE</span>
                  <h3 className="text-lg font-bold text-slate-100 font-heading mt-0.5">Explore Analytical Crypto Metrics</h3>
                </div>
                
                <div className="flex bg-[#030304] p-1 border border-white/5 rounded-full items-center gap-1 w-full md:w-auto">
                  {(["revenue", "growth", "conversion"] as const).map((metric) => (
                    <button
                      key={metric}
                      onClick={() => setActiveDemoMetric(metric)}
                      className={`px-4 py-1.5 rounded-full text-xs font-mono font-semibold cursor-pointer capitalize transition-all duration-300 flex-1 md:flex-initial ${
                        activeDemoMetric === metric 
                          ? "bg-surface border border-white/10 text-bitcoin-gold font-bold shadow-bitcoin-glow" 
                          : "text-muted hover:text-white"
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
                    <div className="bg-surface/80 border border-white/5 rounded-2xl p-4 text-left shadow-sm">
                      <span className="text-[10px] uppercase font-mono tracking-wider text-muted block">{activeDemo.title}</span>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-xl md:text-2xl font-bold font-mono text-white">{activeDemo.value}</span>
                        <span className={`text-[11px] font-bold font-mono ${activeDemo.isPositive ? "text-bitcoin-gold" : "text-bitcoin-burnt"}`}>
                          {activeDemo.change}
                        </span>
                      </div>
                    </div>

                    <div className="bg-surface/80 border border-white/5 rounded-2xl p-4 text-left shadow-sm">
                      <span className="text-[10px] uppercase font-mono tracking-wider text-muted block">AI Verification</span>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-xl md:text-2xl font-bold font-mono text-white">99.8%</span>
                        <span className="text-[11px] font-bold text-bitcoin font-mono">Proof-of-Metric</span>
                      </div>
                    </div>

                    <div className="bg-surface/80 border border-white/5 rounded-2xl p-4 text-left shadow-sm col-span-2 sm:col-span-1">
                      <span className="text-[10px] uppercase font-mono tracking-wider text-muted block">Block Processing</span>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-xl md:text-2xl font-bold font-mono text-white">0.45s</span>
                        <span className="text-[11px] font-bold text-bitcoin-gold font-mono">Instant</span>
                      </div>
                    </div>
                  </div>

                  {/* Dynamic Interactive Chart Canvas */}
                  <div className="bg-surface/65 border border-white/5 rounded-2xl p-5 shadow-inner h-[280px] flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-xs font-bold text-slate-300 flex items-center gap-1.5 font-heading">
                        <Activity className="w-3.5 h-3.5 text-bitcoin" />
                        <span>{activeDemo.title} Visualization</span>
                      </h4>
                      <span className="text-[9px] font-mono tracking-wider text-muted uppercase">Interactive Ledger Sample</span>
                    </div>

                    {/* Animated Bars Container */}
                    <div className="flex-1 flex items-end justify-around gap-2 px-4 pb-2 h-full">
                      {activeDemo.chartData.map((val, idx) => (
                        <div key={idx} className="flex-1 flex flex-col items-center gap-2 group/bar">
                          <div className="w-full relative flex items-end justify-center h-40">
                            {/* Interactive tooltip popup on hover */}
                            <div className="absolute -top-7 scale-0 group-hover/bar:scale-100 bg-[#030304] border border-bitcoin/30 text-[9px] font-mono font-bold text-bitcoin-gold px-1.5 py-0.5 rounded shadow-bitcoin-glow transition-transform z-10">
                              {val} Block Units
                            </div>
                            {/* Animated bar columns */}
                            <div 
                              className={`w-full rounded-t-lg bg-gradient-to-t ${activeDemo.color} opacity-80 hover:opacity-100 transition-all duration-500 shadow-bitcoin-glow`}
                              style={{ height: `${(val / 110) * 100}%` }}
                            />
                          </div>
                          <span className="text-[9px] font-mono font-semibold text-muted uppercase tracking-wide">
                            {activeDemo.labels[idx]}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* AI Synthesizer response panel (Right 4 Columns) */}
                <div className="lg:col-span-4 h-full">
                  <div className="bg-surface/80 border border-white/5 rounded-2xl p-5 h-full flex flex-col justify-between min-h-[380px] shadow-bitcoin-glow">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 border-b border-white/5 pb-3 mb-2.5">
                        <div className="p-1.5 bg-bitcoin/10 rounded-lg">
                          <Bot className="w-4 h-4 text-bitcoin" />
                        </div>
                        <span className="text-xs font-bold text-bitcoin-gold tracking-wide uppercase font-mono">DeFi Insight Engine</span>
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed italic mb-4 font-medium font-body">
                        "{activeDemo.insight}"
                      </p>

                      <div className="bg-[#030304]/60 border border-white/5 rounded-xl p-3.5 space-y-1.5">
                        <span className="text-[10px] font-bold text-bitcoin-gold uppercase tracking-wider block font-mono">Consensus Advice:</span>
                        <p className="text-[11px] text-muted leading-relaxed font-body">
                          Initialize forecast projection sequences inside the Interactive Console to isolate potential staking yield or risk-hedging options.
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={onEnterWorkspace}
                      className="w-full mt-4 py-2.5 bg-background hover:bg-surface border border-white/10 hover:border-bitcoin text-bitcoin hover:text-bitcoin-gold rounded-full text-xs font-bold font-mono transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                    >
                      <span>Analyze Live Ledgers</span>
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
          <div className="w-full max-w-4xl mx-auto border border-white/5 rounded-3xl p-6 md:p-8 bg-surface/50 backdrop-blur-lg relative shadow-bitcoin-glow">
            {/* Linear Gold Gradient Top Highlight Line */}
            <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-bitcoin/50 to-transparent" />
            
            <div className="max-w-2xl mx-auto text-center space-y-2 mb-8">
              <h3 className="text-xl font-bold text-white tracking-tight font-heading">Direct Blockchain/Spreadsheet Importer</h3>
              <p className="text-xs text-muted max-w-md mx-auto leading-relaxed">
                Upload any business or ledger spreadsheet. We compile it immediately inside secure local memory context and construct your private workspace.
              </p>
            </div>

            <SpreadsheetLoader onDataLoaded={onDataLoaded} isLoading={isProcessing} />
          </div>
        </section>

        {/* Premium Bento Grid Features Section with Corner Accents */}
        <section className="max-w-7xl mx-auto px-6 pb-32">
          <div className="max-w-5xl mx-auto space-y-8">
            <div className="border-l-[3px] border-bitcoin pl-4">
              <span className="text-[10px] uppercase font-mono tracking-widest font-bold text-bitcoin">PROTOCOL CAPABILITIES</span>
              <h3 className="text-2xl font-bold text-white tracking-tight font-heading">Cryptographic Accuracy. Instant Yield Analytics.</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
              
              {/* Feature 1: Speech (Col span 7) - Styled with Corner Accents */}
              <div className="md:col-span-7 bg-surface/40 border border-white/10 rounded-2xl p-6 hover:border-bitcoin/40 transition-all duration-300 relative group overflow-hidden">
                {/* Visual Corner Accents */}
                <div className="absolute top-0 left-0 w-3.5 h-3.5 border-t-2 border-l-2 border-bitcoin rounded-tl" />
                <div className="absolute bottom-0 right-0 w-3.5 h-3.5 border-b-2 border-r-2 border-bitcoin rounded-br" />
                
                <div className="absolute top-0 right-0 w-32 h-32 bg-bitcoin/2 rounded-full blur-xl pointer-events-none group-hover:scale-125 transition-transform" />
                
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2.5 bg-background border border-white/5 rounded-xl text-bitcoin shadow-bitcoin-glow">
                    <Volume2 className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-white font-heading">Voice-Synthesized Audits</h4>
                </div>
                <p className="text-xs text-muted leading-relaxed max-w-lg">
                  Our speech engine synthesizes Ledger metrics into natural, clear audio summaries. Listen to automated forecasts, seasonal overviews, and interactive insight reports hands-free.
                </p>
              </div>

              {/* Feature 2: Privacy (Col span 5) */}
              <div className="md:col-span-5 bg-surface/40 border border-white/10 rounded-2xl p-6 hover:border-bitcoin/40 transition-all duration-300 relative group overflow-hidden">
                {/* Visual Corner Accents */}
                <div className="absolute top-0 left-0 w-3.5 h-3.5 border-t-2 border-l-2 border-bitcoin rounded-tl" />
                <div className="absolute bottom-0 right-0 w-3.5 h-3.5 border-b-2 border-r-2 border-bitcoin rounded-br" />

                <div className="absolute top-0 right-0 w-24 h-24 bg-bitcoin-gold/2 rounded-full blur-xl pointer-events-none" />
                
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2.5 bg-background border border-white/5 rounded-xl text-bitcoin-gold shadow-gold-glow">
                    <Lock className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-white font-heading">Custodial Data Privacy</h4>
                </div>
                <p className="text-xs text-muted leading-relaxed">
                  Your transaction secrets remain completely secure. All uploaded spreadsheets are processed strictly in local browser sandbox memory, with zero persistent database server caching.
                </p>
              </div>

              {/* Feature 3: Heatmaps (Col span 5) */}
              <div className="md:col-span-5 bg-surface/40 border border-white/10 rounded-2xl p-6 hover:border-bitcoin/40 transition-all duration-300 relative group overflow-hidden">
                {/* Visual Corner Accents */}
                <div className="absolute top-0 left-0 w-3.5 h-3.5 border-t-2 border-l-2 border-bitcoin rounded-tl" />
                <div className="absolute bottom-0 right-0 w-3.5 h-3.5 border-b-2 border-r-2 border-bitcoin rounded-br" />

                <div className="absolute top-0 right-0 w-24 h-24 bg-bitcoin/2 rounded-full blur-xl pointer-events-none" />
                
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2.5 bg-background border border-white/5 rounded-xl text-bitcoin shadow-bitcoin-glow">
                    <Cpu className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-white font-heading">Ledger Core Heatmaps</h4>
                </div>
                <p className="text-xs text-muted leading-relaxed">
                  Discover asset correlations and value densities with high-fidelity matrices. Perfect for analyzing contract velocities, epoch outputs, or multi-dimensional transactional nodes.
                </p>
              </div>

              {/* Feature 4: Automated KPIs (Col span 7) */}
              <div className="md:col-span-7 bg-surface/40 border border-white/10 rounded-2xl p-6 hover:border-bitcoin/40 transition-all duration-300 relative group overflow-hidden">
                {/* Visual Corner Accents */}
                <div className="absolute top-0 left-0 w-3.5 h-3.5 border-t-2 border-l-2 border-bitcoin rounded-tl" />
                <div className="absolute bottom-0 right-0 w-3.5 h-3.5 border-b-2 border-r-2 border-bitcoin rounded-br" />

                <div className="absolute top-0 right-0 w-32 h-32 bg-bitcoin-gold/2 rounded-full blur-xl pointer-events-none" />
                
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2.5 bg-background border border-white/5 rounded-xl text-bitcoin-gold shadow-gold-glow">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-white font-heading font-heading">Automated Metric Synthesis</h4>
                </div>
                <p className="text-xs text-muted leading-relaxed max-w-lg">
                  Skip manual dashboard configuration. Our AI engine scans columns automatically, building high-yield charts, historical trend projection charts, and pinpoint-accurate risk assessments instantly.
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* Sleek SaaS CTA Area */}
        <section className="max-w-5xl mx-auto px-6 pb-28 w-full">
          <div className="bg-gradient-to-r from-surface via-[#030304] to-surface border border-white/10 rounded-3xl p-8 md:p-12 text-center relative overflow-hidden group shadow-bitcoin-glow hover:border-bitcoin/40 transition-all duration-300">
            <div className="absolute -top-10 -right-10 w-48 h-48 bg-bitcoin/3 rounded-full blur-[40px] pointer-events-none group-hover:scale-125 transition-transform" />
            
            <h3 className="text-2xl md:text-3xl font-bold text-white tracking-tight font-heading mb-4 leading-tight">
              Ready to speak with your business ledgers?
            </h3>
            <p className="text-xs md:text-sm text-muted max-w-xl mx-auto leading-relaxed mb-8 font-body">
              Experience cryptographic business intelligence with zero programming, zero database configurations, and absolute privacy.
            </p>
            
            <button
              onClick={onEnterWorkspace}
              className="px-8 py-3.5 bg-surface hover:bg-gradient-to-r hover:from-bitcoin-burnt hover:to-bitcoin text-bitcoin hover:text-white border border-bitcoin/30 hover:border-bitcoin text-xs font-mono font-bold rounded-full transition-all duration-300 hover:scale-105 hover:shadow-bitcoin-glow-intense flex items-center gap-2 mx-auto cursor-pointer"
            >
              <span>Launch Decoded Console</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </section>

      </main>
    </div>
  );
}
