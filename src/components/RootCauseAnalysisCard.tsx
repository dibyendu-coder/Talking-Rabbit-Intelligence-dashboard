/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  ArrowDown, 
  ArrowUp, 
  TrendingDown, 
  TrendingUp, 
  Minus, 
  GitBranch, 
  Sparkles, 
  ShieldAlert, 
  ChevronDown, 
  ChevronUp,
  Activity,
  Info
} from "lucide-react";
import { RootCauseAnalysis, RootCauseFactor } from "../types";

interface RootCauseAnalysisCardProps {
  analysis?: RootCauseAnalysis;
}

export default function RootCauseAnalysisCard({ analysis }: RootCauseAnalysisCardProps) {
  const [expandedFactorIdx, setExpandedFactorIdx] = useState<number | null>(null);

  if (!analysis || !analysis.factors || analysis.factors.length === 0) {
    return null;
  }

  const { metric, trend, changeText, factors } = analysis;

  const getTrendIcon = () => {
    switch (trend) {
      case "down":
        return <TrendingDown className="w-5 h-5 text-bitcoin-burnt" />;
      case "up":
        return <TrendingUp className="w-5 h-5 text-bitcoin-gold" />;
      default:
        return <Minus className="w-5 h-5 text-slate-400" />;
    }
  };

  const getTrendBadgeStyle = () => {
    switch (trend) {
      case "down":
        return "bg-bitcoin-burnt/10 border-bitcoin-burnt/30 text-bitcoin-burnt shadow-[0_0_15px_rgba(239,68,68,0.1)]";
      case "up":
        return "bg-bitcoin-gold/10 border-bitcoin-gold/30 text-bitcoin-gold shadow-[0_0_15px_rgba(247,147,26,0.1)]";
      default:
        return "bg-neutral-800 border-neutral-700 text-neutral-400";
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact.toLowerCase()) {
      case "high":
        return {
          bg: "bg-red-500/10 text-red-400 border-red-500/30",
          text: "text-red-400",
          accent: "bg-red-500",
          glow: "shadow-[0_0_10px_rgba(239,68,68,0.25)]"
        };
      case "medium":
        return {
          bg: "bg-amber-500/10 text-amber-400 border-amber-500/30",
          text: "text-amber-400",
          accent: "bg-amber-500",
          glow: "shadow-[0_0_10px_rgba(245,158,11,0.2)]"
        };
      default:
        return {
          bg: "bg-blue-500/10 text-blue-400 border-blue-500/30",
          text: "text-blue-400",
          accent: "bg-blue-500",
          glow: "shadow-[0_0_10px_rgba(59,130,246,0.15)]"
        };
    }
  };

  return (
    <div id="root-cause-analysis-card" className="bg-surface border border-white/5 rounded-2xl p-5 shadow-sm relative overflow-hidden">
      {/* Background decoration elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-bitcoin/3 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-bitcoin rounded-tl" />
      <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-bitcoin rounded-br" />

      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-bitcoin/10 text-bitcoin rounded-xl shadow-bitcoin-glow">
            <GitBranch className="w-4.5 h-4.5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white font-heading tracking-wide flex items-center gap-1.5">
              AI Root Cause Analysis
              <span className="text-[8px] font-mono font-bold tracking-widest text-bitcoin bg-bitcoin/10 px-1.5 py-0.5 rounded border border-bitcoin/20 uppercase">
                Diagnostic Node
              </span>
            </h3>
            <p className="text-[11px] text-muted font-body">Causal graph tracing operational symptoms to underlying events.</p>
          </div>
        </div>
      </div>

      {/* FLOWCHART STAGE */}
      <div className="flex flex-col items-center py-4 relative">
        
        {/* Step 1: The Root Symptom (Effect) */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`flex items-center gap-3 px-5 py-3 border rounded-xl font-mono text-xs font-bold relative z-10 ${getTrendBadgeStyle()}`}
        >
          <div className="shrink-0">{getTrendIcon()}</div>
          <div className="text-center">
            <span className="text-slate-400 text-[10px] block uppercase tracking-widest mb-0.5">Symptomatic Metric</span>
            <span className="text-white text-sm font-extrabold">{metric}</span>{" "}
            <span className="ml-1 font-extrabold text-white/90 font-mono text-xs">{changeText}</span>
          </div>
        </motion.div>

        {/* Vertical Flow Connector */}
        <div className="relative w-full flex flex-col items-center">
          {/* Stem path */}
          <div className="w-0.5 h-10 bg-gradient-to-b from-bitcoin to-bitcoin-burnt/40" />
          
          {/* Arrow head */}
          <div className="absolute bottom-0 -translate-x-1/2 left-1/2">
            <ArrowDown className="w-4 h-4 text-bitcoin-burnt animate-bounce" />
          </div>
        </div>

        {/* Junction Label Box */}
        <div className="px-4 py-1.5 bg-[#030304] border border-white/10 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider text-slate-300 relative z-10 mb-8 shadow-sm">
          Dynamic Causal Breakdown
        </div>

        {/* Forking connection path background (Vertical alignment with absolute left indicators) */}
        <div className="w-full max-w-xl space-y-3.5 relative">
          
          {/* Fork stem line (left vertical alignment behind items) */}
          <div className="absolute left-6 top-0 bottom-4 w-0.5 bg-dashed-pattern opacity-30 pointer-events-none" />

          {factors.map((item, idx) => {
            const colors = getImpactColor(item.impact);
            const isExpanded = expandedFactorIdx === idx;

            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={`relative pl-12 group transition-all duration-200`}
              >
                {/* Horizontal branch node wire */}
                <div className="absolute left-6 top-5 w-6 h-0.5 bg-white/5 group-hover:bg-bitcoin/30 transition-colors" />
                
                {/* Indicator bullet */}
                <div className={`absolute left-4.5 top-3.5 w-3 h-3 rounded-full border border-surface flex items-center justify-center transition-transform group-hover:scale-110 ${colors.accent} ${colors.glow}`} />

                {/* Card Item */}
                <div 
                  onClick={() => setExpandedFactorIdx(isExpanded ? null : idx)}
                  className={`bg-[#030304]/45 border hover:border-bitcoin/20 rounded-xl p-3.5 transition-all cursor-pointer relative ${
                    isExpanded ? "border-bitcoin/35 bg-bitcoin/5 shadow-[inset_0_1px_20px_rgba(247,147,26,0.05)]" : "border-white/5"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-[8px] font-mono font-extrabold uppercase px-1.5 py-0.2 border rounded ${colors.bg}`}>
                          {item.impact} IMPACT
                        </span>
                        <span className="text-[9px] font-mono font-bold text-muted uppercase">Factor {idx + 1}</span>
                      </div>
                      <h4 className="text-xs font-bold text-white leading-relaxed font-body">
                        {item.factor}
                      </h4>
                    </div>
                    
                    <button className="text-muted hover:text-white shrink-0 mt-0.5">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Expandable Evidence Panel */}
                  <AnimatePresence initial={false}>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-3 pt-3 border-t border-white/5 text-[11px] text-slate-300 leading-relaxed font-body flex items-start gap-2">
                          <Info className="w-4 h-4 shrink-0 text-bitcoin mt-0.5" />
                          <div>
                            <strong className="text-bitcoin-gold font-mono uppercase tracking-wider block text-[9px] mb-0.5">Diagnostic Evidence:</strong>
                            {item.subtext}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
