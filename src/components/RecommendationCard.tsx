import React, { useState } from "react";
import { Sparkles, TrendingUp, ChevronDown, ChevronUp, AlertCircle, CalendarCheck } from "lucide-react";
import { Recommendation, Forecast } from "../types";

interface RecommendationCardProps {
  recommendations: Recommendation[];
  forecast: Forecast;
}

export default function RecommendationCard({ recommendations, forecast }: RecommendationCardProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  const getImpactColor = (impact: "High" | "Medium" | "Low") => {
    switch (impact) {
      case "High":
        return "bg-bitcoin-burnt/15 text-bitcoin border-bitcoin-burnt/30 shadow-bitcoin-glow";
      case "Medium":
        return "bg-bitcoin/15 text-bitcoin border-bitcoin/30";
      case "Low":
        return "bg-bitcoin-gold/15 text-bitcoin-gold border-bitcoin-gold/30 shadow-gold-glow";
      default:
        return "bg-white/5 text-slate-300 border-white/10";
    }
  };

  return (
    <div id="recommendations-forecast-wrapper" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Dynamic Recommendation Panel */}
      <div id="rec-panel" className="bg-surface border border-white/5 rounded-2xl p-5 shadow-sm flex flex-col relative overflow-hidden">
        {/* Border Accent */}
        <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-bitcoin rounded-tl" />
        <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-bitcoin rounded-br" />

        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/5">
          <div className="p-2 bg-bitcoin/10 text-bitcoin rounded-xl shadow-bitcoin-glow">
            <Sparkles className="w-4 h-4 text-bitcoin" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white font-heading">Tactical Recommendations</h3>
            <p className="text-xs text-muted font-body">Strategic actions curated by protocol AI</p>
          </div>
        </div>

        <div className="space-y-3 flex-1 overflow-y-auto max-h-[300px] pr-1">
          {recommendations.map((rec, idx) => {
            const isExpanded = expandedIndex === idx;
            return (
              <div
                key={idx}
                id={`rec-item-${idx}`}
                className={`border rounded-xl transition-all duration-300 ${
                  isExpanded ? "bg-[#030304]/60 border-bitcoin/30" : "bg-surface/50 border-white/5 hover:border-bitcoin/30"
                }`}
              >
                <button
                  id={`btn-rec-toggle-${idx}`}
                  onClick={() => setExpandedIndex(isExpanded ? null : idx)}
                  className="w-full flex items-center justify-between p-4 text-left cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-white font-heading">{rec.action}</span>
                    <span
                      className={`text-[9px] font-mono font-bold uppercase px-2 py-0.5 border rounded-full ${getImpactColor(
                        rec.impact
                      )}`}
                    >
                      {rec.impact}
                    </span>
                  </div>
                  {isExpanded ? <ChevronUp className="w-4 h-4 text-muted" /> : <ChevronDown className="w-4 h-4 text-muted" />}
                </button>

                {isExpanded && (
                  <div id={`rec-details-${idx}`} className="px-4 pb-4 pt-1 text-xs text-slate-300 leading-relaxed border-t border-white/5 bg-[#030304]/40 font-body">
                    <p className="mb-2 text-bitcoin-gold uppercase font-mono tracking-widest text-[9px] font-bold">Strategic Plan:</p>
                    {rec.details}
                  </div>
                )}
              </div>
            );
          })}
          {recommendations.length === 0 && (
            <div className="text-center py-8 text-xs text-muted font-mono">
              No specific tactical actions compiled. Import a financial ledger to initialize.
            </div>
          )}
        </div>
      </div>

      {/* Forecasting Panel */}
      <div id="forecast-panel" className="bg-surface border border-white/5 rounded-2xl p-5 shadow-sm flex flex-col relative overflow-hidden">
        {/* Border Accent */}
        <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-bitcoin rounded-tl" />
        <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-bitcoin rounded-br" />

        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/5">
          <div className="p-2 bg-bitcoin-gold/10 text-bitcoin-gold rounded-xl shadow-gold-glow">
            <TrendingUp className="w-4 h-4 text-bitcoin-gold" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white font-heading">Trend & Future Forecast</h3>
            <p className="text-xs text-muted font-body">Predictive ledger timeline projections</p>
          </div>
        </div>

        <div className="flex-1 flex flex-col justify-between">
          <div>
            <span className="text-xs text-muted uppercase tracking-widest font-mono font-bold">Predicted Metric:</span>
            <div className="text-sm font-bold text-bitcoin mt-1 font-heading">
              {forecast.metric || "Staking & Yield Growth Trend"}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 my-4">
            {forecast.values &&
              forecast.values.map((item, idx) => (
                <div
                  key={idx}
                  id={`forecast-point-${idx}`}
                  className="flex flex-col items-center justify-center p-3.5 bg-[#030304]/60 border border-white/5 rounded-xl hover:border-bitcoin/30 transition-all shadow-sm"
                >
                  <span className="text-[9px] text-muted uppercase tracking-widest font-mono text-center font-bold">
                    {item.period}
                  </span>
                  <span className="text-sm font-bold text-white mt-1.5 font-mono drop-shadow-[0_0_10px_rgba(247,147,26,0.2)]">
                    {typeof item.value === "number" && item.value > 1000
                      ? `$${(item.value / 1000).toFixed(1)}K`
                      : item.value}
                  </span>
                  <div className="mt-1 flex items-center gap-0.5 text-[9px] text-bitcoin-gold font-mono font-bold">
                    <CalendarCheck className="w-2.5 h-2.5 text-bitcoin" />
                    <span>Projected</span>
                  </div>
                </div>
              ))}
            {(!forecast.values || forecast.values.length === 0) && (
              <div className="col-span-3 text-center py-6 text-xs text-muted font-mono">
                Import ledger node templates to initialize predictive forecast modules.
              </div>
            )}
          </div>

          <div className="text-[11px] text-slate-300 leading-relaxed p-3 bg-[#030304]/40 border border-white/5 rounded-xl flex items-start gap-2 font-body">
            <AlertCircle className="w-4 h-4 text-bitcoin-gold shrink-0 mt-0.5" />
            <span>
              Projections are computed by combining statistical regression trends with the protocol's high-reasoning Gemini context engine.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
