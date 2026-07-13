/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { motion } from "motion/react";
import { 
  Play, 
  Sparkles, 
  ArrowRight, 
  TrendingUp, 
  TrendingDown, 
  Briefcase, 
  HelpCircle,
  HelpCircle as QuestionIcon,
  Zap,
  CheckCircle2,
  Lock
} from "lucide-react";
import { WhatIfSimulation, SimulationImpact } from "../types";

interface WhatIfSimulatorCardProps {
  simulation?: WhatIfSimulation;
  onRunScenario: (scenarioText: string) => void;
  isProcessing: boolean;
}

const PRESET_SCENARIOS = [
  {
    icon: "📈",
    title: "Marketing Budget Boost",
    prompt: "What if marketing budget increases by 20%?",
    desc: "Predict sales, ROI, customer acquisition, & margin changes."
  },
  {
    icon: "🛑",
    title: "Close Poor Performer",
    prompt: "What if we close our underperforming category or region?",
    desc: "Simulate cash flow recovery, margin changes & volume impact."
  },
  {
    icon: "🏷️",
    title: "Optimized 5% Pricing Hike",
    prompt: "What if we increase average selling price by 5%?",
    desc: "Test elastic volume drops vs net margin expansion."
  },
];

export default function WhatIfSimulatorCard({ 
  simulation, 
  onRunScenario, 
  isProcessing 
}: WhatIfSimulatorCardProps) {

  const getTrendIcon = (trend: "up" | "down" | "neutral") => {
    switch (trend) {
      case "up":
        return <TrendingUp className="w-4 h-4 text-bitcoin-gold shrink-0" />;
      case "down":
        return <TrendingDown className="w-4 h-4 text-bitcoin-burnt shrink-0" />;
      default:
        return <span className="w-2 h-2 rounded-full bg-slate-400 shrink-0 mx-1" />;
    }
  };

  const getTrendColorClass = (trend: "up" | "down" | "neutral") => {
    switch (trend) {
      case "up":
        return "text-bitcoin-gold bg-bitcoin/10 border-bitcoin/20 shadow-[0_0_10px_rgba(247,147,26,0.15)]";
      case "down":
        return "text-bitcoin-burnt bg-bitcoin-burnt/10 border-bitcoin-burnt/20 shadow-[0_0_10px_rgba(239,68,68,0.1)]";
      default:
        return "text-slate-400 bg-neutral-800 border-neutral-700";
    }
  };

  return (
    <div id="what-if-simulator-card" className="bg-surface border border-white/5 rounded-2xl p-5 shadow-sm relative overflow-hidden">
      {/* Visual background lights */}
      <div className="absolute top-0 right-0 w-36 h-36 bg-bitcoin/3 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-bitcoin rounded-tl" />
      <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-bitcoin rounded-br" />

      {/* Header */}
      <div className="flex items-center justify-between mb-5 pb-4 border-b border-white/5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-gradient-to-tr from-bitcoin-gold/20 to-bitcoin/20 text-bitcoin rounded-xl shadow-bitcoin-glow">
            <Sparkles className="w-4.5 h-4.5 text-bitcoin" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white font-heading tracking-wide flex items-center gap-1.5">
              AI "What-If" Business Simulator
              <span className="text-[8px] font-mono font-bold tracking-widest text-bitcoin bg-bitcoin/10 px-1.5 py-0.5 rounded border border-bitcoin/20 uppercase">
                Predictive Sandbox
              </span>
            </h3>
            <p className="text-[11px] text-muted font-body">Model hypothetical strategic moves & project immediate CFO-level impacts.</p>
          </div>
        </div>
      </div>

      {/* Preset Launcher Sandbox */}
      <div className="mb-6">
        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block mb-3">
          Select Strategic Scenario to Simulate:
        </span>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {PRESET_SCENARIOS.map((preset, idx) => (
            <button
              id={`preset-scenario-${idx}`}
              key={idx}
              disabled={isProcessing}
              onClick={() => onRunScenario(preset.prompt)}
              className="group text-left bg-[#030304]/40 hover:bg-bitcoin/5 border border-white/5 hover:border-bitcoin/30 rounded-xl p-3.5 transition-all relative disabled:opacity-50 disabled:pointer-events-none"
            >
              <div className="absolute top-3 right-3 text-white/20 group-hover:text-bitcoin group-hover:scale-110 transition-all">
                <Play className="w-3 h-3 fill-current" />
              </div>
              <span className="text-lg block mb-1">{preset.icon}</span>
              <h4 className="text-xs font-bold text-white group-hover:text-bitcoin-gold transition-colors font-body mb-1">
                {preset.title}
              </h4>
              <p className="text-[10px] text-slate-400 font-body leading-normal">
                {preset.desc}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Simulation Result Stage */}
      {simulation ? (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-5"
        >
          {/* Scenario active header */}
          <div className="p-4 bg-bitcoin/5 border border-bitcoin/15 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <span className="text-[9px] font-mono font-bold uppercase text-bitcoin-gold block tracking-wider mb-0.5">Active Simulation Scenario</span>
              <h4 className="text-xs font-bold text-white font-body leading-normal">"{simulation.scenario}"</h4>
            </div>
            <div className="shrink-0 flex items-center gap-1.5 px-2.5 py-1 bg-bitcoin-gold/10 border border-bitcoin-gold/20 rounded-lg text-[10px] font-mono font-extrabold text-bitcoin-gold">
              <Zap className="w-3 h-3 animate-pulse" />
              {simulation.confidence}
            </div>
          </div>

          {/* Comparative Matrix Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {simulation.impacts.map((impact, idx) => (
              <div key={idx} className="bg-[#030304]/30 border border-white/5 rounded-xl p-3.5 relative hover:border-white/10 transition-colors">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-[11px] font-bold text-slate-300 font-body">{impact.metric}</span>
                  <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border uppercase flex items-center gap-1 ${getTrendColorClass(impact.trend)}`}>
                    {getTrendIcon(impact.trend)}
                    {impact.change}
                  </span>
                </div>

                {/* Simulated Path Visualizer */}
                <div className="flex items-center gap-3 py-1.5 px-2.5 bg-neutral-900/50 rounded-lg border border-white/5 mb-2.5 font-mono text-xs">
                  <div className="flex flex-col">
                    <span className="text-[8px] text-slate-500 uppercase tracking-wider">Before</span>
                    <span className="font-bold text-slate-400">{impact.before}</span>
                  </div>
                  <ArrowRight className="w-3 h-3 text-bitcoin/60 shrink-0" />
                  <div className="flex flex-col">
                    <span className="text-[8px] text-bitcoin uppercase tracking-wider">Projected</span>
                    <span className="font-extrabold text-white">{impact.after}</span>
                  </div>
                </div>

                <p className="text-[10px] text-slate-400 font-body leading-relaxed">
                  {impact.explanation}
                </p>
              </div>
            ))}
          </div>

          {/* Strategic CEO advisory brief */}
          <div className="p-4 bg-[#030304]/60 border border-white/5 rounded-xl relative">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-bitcoin rounded-l" />
            <div className="flex items-center gap-2 mb-2 pl-1">
              <Briefcase className="w-3.5 h-3.5 text-bitcoin" />
              <span className="text-[10px] font-mono font-extrabold uppercase tracking-widest text-white">
                McKinsey / CFO Strategic Advisory Brief
              </span>
            </div>
            <p className="text-xs text-slate-300 pl-1 leading-relaxed font-body">
              {simulation.strategicSummary}
            </p>
          </div>
        </motion.div>
      ) : (
        <div className="p-6 text-center bg-[#030304]/20 border border-dashed border-white/10 rounded-xl">
          <HelpCircle className="w-8 h-8 text-white/10 mx-auto mb-2" />
          <h4 className="text-xs font-bold text-white mb-1">No Active Simulation</h4>
          <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
            Click one of the strategic presets above or type a predictive hypothetical question (e.g., "What if pricing increases by 10%?") in the business console below to launch our CFO projection engine.
          </p>
        </div>
      )}
    </div>
  );
}
