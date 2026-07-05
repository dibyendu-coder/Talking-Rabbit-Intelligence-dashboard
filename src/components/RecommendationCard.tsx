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
        return "bg-rose-500/10 text-rose-400 border-rose-500/30";
      case "Medium":
        return "bg-amber-500/10 text-amber-400 border-amber-500/30";
      case "Low":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
      default:
        return "bg-slate-500/10 text-slate-400 border-slate-500/30";
    }
  };

  return (
    <div id="recommendations-forecast-wrapper" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Dynamic Recommendation Panel */}
      <div id="rec-panel" className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-800">
          <div className="p-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100">Tactical Recommendations</h3>
            <p className="text-xs text-slate-400">Strategic actions curated by AI</p>
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
                  isExpanded ? "bg-slate-950/40 border-slate-700" : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
                }`}
              >
                <button
                  id={`btn-rec-toggle-${idx}`}
                  onClick={() => setExpandedIndex(isExpanded ? null : idx)}
                  className="w-full flex items-center justify-between p-4 text-left"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-slate-200">{rec.action}</span>
                    <span
                      className={`text-[10px] font-mono font-medium uppercase px-2 py-0.5 border rounded-full ${getImpactColor(
                        rec.impact
                      )}`}
                    >
                      {rec.impact} Impact
                    </span>
                  </div>
                  {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </button>

                {isExpanded && (
                  <div id={`rec-details-${idx}`} className="px-4 pb-4 pt-1 text-xs text-slate-300 leading-relaxed border-t border-slate-800/80 bg-slate-950/20">
                    <p className="mb-2 text-slate-400 uppercase font-mono tracking-wider text-[10px]">Strategic Plan:</p>
                    {rec.details}
                  </div>
                )}
              </div>
            );
          })}
          {recommendations.length === 0 && (
            <div className="text-center py-8 text-xs text-slate-500">
              No specific tactical actions generated. Load a dataset or ask a business question first.
            </div>
          )}
        </div>
      </div>

      {/* Forecasting Panel */}
      <div id="forecast-panel" className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-800">
          <div className="p-1.5 bg-indigo-500/10 text-indigo-400 rounded-lg">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100">Trend & Future Forecast</h3>
            <p className="text-xs text-slate-400">Predictive timeline modeling</p>
          </div>
        </div>

        <div className="flex-1 flex flex-col justify-between">
          <div>
            <span className="text-xs text-slate-400 uppercase tracking-wider font-mono">Predicted Metric:</span>
            <div className="text-sm font-bold text-indigo-400 mt-1 font-sans">
              {forecast.metric || "Business Growth Trend"}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 my-4">
            {forecast.values &&
              forecast.values.map((item, idx) => (
                <div
                  key={idx}
                  id={`forecast-point-${idx}`}
                  className="flex flex-col items-center justify-center p-3.5 bg-slate-950/40 border border-slate-800 rounded-xl hover:border-slate-700 transition-colors"
                >
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider font-mono text-center">
                    {item.period}
                  </span>
                  <span className="text-sm font-bold text-slate-100 mt-1.5 font-mono">
                    {typeof item.value === "number" && item.value > 1000
                      ? `$${(item.value / 1000).toFixed(1)}K`
                      : item.value}
                  </span>
                  <div className="mt-1 flex items-center gap-0.5 text-[9px] text-emerald-400 font-mono">
                    <CalendarCheck className="w-2.5 h-2.5" />
                    <span>Projected</span>
                  </div>
                </div>
              ))}
            {(!forecast.values || forecast.values.length === 0) && (
              <div className="col-span-3 text-center py-6 text-xs text-slate-500">
                Generate or load spreadsheet files to initialize timeline forecasting models.
              </div>
            )}
          </div>

          <div className="text-[11px] text-slate-400 leading-relaxed p-3 bg-slate-950/20 border border-slate-800/60 rounded-xl flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
            <span>
              Projections are computed by combining statistical regression trends with Gemini's high-reasoning context modeling. These values simulate standard quarters.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
