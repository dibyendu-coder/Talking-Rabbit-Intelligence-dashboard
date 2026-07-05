import React, { useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { Maximize2, Minimize2, Info, Presentation, Table } from "lucide-react";
import { ChartConfig } from "../types";

interface VisualChartProps {
  config: ChartConfig;
  isMini?: boolean;
}

const COLORS = [
  "#6366f1", // Indigo
  "#10b981", // Emerald
  "#f59e0b", // Amber
  "#ef4444", // Rose
  "#06b6d4", // Cyan
  "#a855f7", // Purple
  "#3b82f6", // Blue
  "#e11d48", // Rose deep
];

export default function VisualChart({ config, isMini = false }: VisualChartProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showTable, setShowTable] = useState(false);
  const { chartType, title, xAxisKey, yAxisKey, data, explanation } = config;
  const [activeChartType, setActiveChartType] = useState<string>(chartType);

  React.useEffect(() => {
    setActiveChartType(chartType);
  }, [chartType]);

  const [isMounted, setIsMounted] = useState(false);
  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  // Track exact container width and height with ResizeObserver to bypass Recharts ResponsiveContainer bugs
  const [dimensions, setDimensions] = useState<{ width: number; height: number }>({
    width: isMini ? 280 : 600,
    height: isMini ? 150 : 220,
  });

  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0) return;
      const { width, height } = entries[0].contentRect;
      // Safeguard against 0 values during hidden/tabs transitions
      if (width > 0 && height > 0) {
        setDimensions({ width, height });
      }
    });

    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  if (chartType === "none" || !data || data.length === 0) {
    if (isMini) return null;
    return (
      <div id="visual-chart-empty" className="flex flex-col items-center justify-center h-72 border border-slate-800 bg-slate-950/40 rounded-2xl text-slate-500 text-sm">
        <Presentation className="w-8 h-8 mb-2 text-slate-600" />
        <span>No dynamic chart requested for this query.</span>
        <span className="text-xs text-slate-600 mt-1">Ask a question like "Which category performed best?" to trigger graphics</span>
      </div>
    );
  }

  // Pre-process and normalize data to ensure yAxisKey is numeric and xAxisKey is populated
  const processedData = React.useMemo(() => {
    if (!data || !Array.isArray(data) || data.length === 0) return [];
    
    const firstItem = data[0];
    if (!firstItem || typeof firstItem !== "object") return [];

    // Support both the structured xValue/yValue properties and legacy custom keys
    const hasStructuredKeys = "xValue" in firstItem && "yValue" in firstItem;

    if (hasStructuredKeys) {
      return data.map(entry => {
        if (!entry || typeof entry !== "object") return {};
        const copy = { ...entry };
        copy[xAxisKey] = entry.xValue !== undefined ? entry.xValue : "";
        
        const yVal = entry.yValue;
        if (typeof yVal === "number") {
          copy[yAxisKey] = yVal;
        } else if (typeof yVal === "string") {
          const cleaned = yVal.replace(/[$,%\s]/g, "").replace(/,/g, "").trim();
          const num = parseFloat(cleaned);
          copy[yAxisKey] = isNaN(num) ? 0 : num;
        } else {
          copy[yAxisKey] = 0;
        }
        return copy;
      });
    }

    const allKeys = Object.keys(firstItem);
    if (allKeys.length === 0) return [];

    // 1. Identify the actual X key inside the data objects
    let actualXKey = xAxisKey;
    if (!(xAxisKey in firstItem)) {
      // Find a key that matches case-insensitively / space-insensitively
      const normalizedX = xAxisKey.toLowerCase().replace(/[\s_-]/g, "");
      const foundX = allKeys.find(k => k.toLowerCase().replace(/[\s_-]/g, "") === normalizedX);
      if (foundX) {
        actualXKey = foundX;
      } else {
        // Fallback: search for a string-like or date-like key, or just pick the first key that is NOT the yAxisKey
        const nonYKeys = allKeys.filter(k => k !== yAxisKey);
        const stringKey = nonYKeys.find(k => typeof firstItem[k] === "string");
        actualXKey = stringKey || nonYKeys[0] || allKeys[0];
      }
    }

    // 2. Identify the actual Y key inside the data objects
    let actualYKey = yAxisKey;
    if (!(yAxisKey in firstItem)) {
      // Find a key that matches case-insensitively / space-insensitively
      const normalizedY = yAxisKey.toLowerCase().replace(/[\s_-]/g, "");
      const foundY = allKeys.find(k => k.toLowerCase().replace(/[\s_-]/g, "") === normalizedY);
      if (foundY) {
        actualYKey = foundY;
      } else {
        // Fallback: find a key that has numeric values, or just pick the first key that is not actualXKey
        const nonXKeys = allKeys.filter(k => k !== actualXKey);
        const numericKey = nonXKeys.find(k => {
          const val = firstItem[k];
          return typeof val === "number" || (typeof val === "string" && !isNaN(parseFloat(val.replace(/[$,%\s]/g, ""))));
        });
        actualYKey = numericKey || nonXKeys[0] || allKeys[1] || allKeys[0];
      }
    }

    // 3. Map all data points to use exactly xAxisKey and yAxisKey
    return data.map(entry => {
      if (!entry || typeof entry !== "object") return {};
      const copy = { ...entry };
      
      // Ensure the X-axis key matches xAxisKey exactly
      const xVal = entry[actualXKey];
      copy[xAxisKey] = xVal !== undefined ? xVal : "";

      // Ensure the Y-axis key matches yAxisKey exactly and is a clean number
      const yVal = entry[actualYKey];
      if (typeof yVal === "number") {
        copy[yAxisKey] = yVal;
      } else if (typeof yVal === "string") {
        const cleaned = yVal.replace(/[$,%\s]/g, "").replace(/,/g, "").trim();
        const num = parseFloat(cleaned);
        copy[yAxisKey] = isNaN(num) ? 0 : num;
      } else {
        copy[yAxisKey] = 0;
      }

      return copy;
    });
  }, [data, xAxisKey, yAxisKey]);

  // Check if original data had percent-formatted values
  const isPercent = React.useMemo(() => {
    if (!data || !Array.isArray(data) || data.length === 0 || !yAxisKey) return false;
    const firstItem = data[0];
    if (!firstItem || typeof firstItem !== "object") return false;
    
    if ("yValue" in firstItem) {
      return data.some(entry => {
        const val = entry.yValue;
        return typeof val === "string" && val.trim().endsWith("%");
      });
    }

    // Find matching key for percentage checks
    const allKeys = Object.keys(firstItem);
    let actualYKey = yAxisKey;
    if (!(yAxisKey in firstItem)) {
      const normalizedY = yAxisKey.toLowerCase().replace(/[\s_-]/g, "");
      const foundY = allKeys.find(k => k.toLowerCase().replace(/[\s_-]/g, "") === normalizedY);
      if (foundY) actualYKey = foundY;
    }
    
    return data.some(entry => {
      const val = entry[actualYKey];
      return typeof val === "string" && val.trim().endsWith("%");
    });
  }, [data, yAxisKey]);

  // Format tick labels
  const formatYAxis = (value: any) => {
    if (typeof value === "number") {
      if (isPercent) {
        return `${value}%`;
      }
      if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
      if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
      return `$${value}`;
    }
    return value;
  };

  const renderChart = (w: number, h: number) => {
    if (!isMounted) return null;
    const chartW = Math.max(w, isMini ? 280 : 500);
    const chartH = Math.max(h, isMini ? 150 : 220);

    if (processedData.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-slate-500 py-6 px-4 text-center">
          <Presentation className="w-6 h-6 mb-1 text-indigo-400 animate-pulse" />
          <span className="text-xs font-semibold text-slate-300">No active records match the selected axes</span>
          <span className="text-[10px] text-slate-500 mt-0.5">Try asking: "Show Sales by Category" or "What is the breakdown of Region?"</span>
        </div>
      );
    }

    switch (activeChartType) {
      case "bar":
        return (
          <BarChart width={chartW} height={chartH} data={processedData} margin={{ top: 10, right: 10, left: -15, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis
              dataKey={xAxisKey}
              stroke="#94a3b8"
              tick={{ fill: "#94a3b8" }}
              fontSize={isMini ? 8 : 10}
              tickLine={false}
              axisLine={false}
              dy={5}
            />
            <YAxis
              stroke="#94a3b8"
              tick={{ fill: "#94a3b8" }}
              fontSize={isMini ? 8 : 10}
              tickLine={false}
              axisLine={false}
              tickFormatter={formatYAxis}
              width={isMini ? 30 : 45}
            />
            <Tooltip
              cursor={{ fill: "#334155", opacity: 0.15 }}
              contentStyle={{
                backgroundColor: "#0f172a",
                borderColor: "#334155",
                borderRadius: "12px",
                color: "#f1f5f9",
                fontSize: isMini ? 10 : 12,
              }}
            />
            {!isMini && <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />}
            <Bar dataKey={yAxisKey} fill="#6366f1" radius={[4, 4, 0, 0]}>
              {processedData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        );

      case "line":
        return (
          <LineChart width={chartW} height={chartH} data={processedData} margin={{ top: 10, right: 10, left: -15, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis
              dataKey={xAxisKey}
              stroke="#94a3b8"
              tick={{ fill: "#94a3b8" }}
              fontSize={isMini ? 8 : 10}
              tickLine={false}
              axisLine={false}
              dy={5}
            />
            <YAxis
              stroke="#94a3b8"
              tick={{ fill: "#94a3b8" }}
              fontSize={isMini ? 8 : 10}
              tickLine={false}
              axisLine={false}
              tickFormatter={formatYAxis}
              width={isMini ? 30 : 45}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#0f172a",
                borderColor: "#334155",
                borderRadius: "12px",
                color: "#f1f5f9",
                fontSize: isMini ? 10 : 12,
              }}
            />
            {!isMini && <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />}
            <Line
              type="monotone"
              dataKey={yAxisKey}
              stroke="#818cf8"
              strokeWidth={isMini ? 1.5 : 3}
              activeDot={{ r: isMini ? 4 : 8 }}
              dot={{ strokeWidth: isMini ? 1 : 2, r: isMini ? 2 : 4 }}
            />
          </LineChart>
        );

      case "area":
        return (
          <AreaChart width={chartW} height={chartH} data={processedData} margin={{ top: 10, right: 10, left: -15, bottom: 5 }}>
            <defs>
              <linearGradient id="areaColor" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis
              dataKey={xAxisKey}
              stroke="#94a3b8"
              tick={{ fill: "#94a3b8" }}
              fontSize={isMini ? 8 : 10}
              tickLine={false}
              axisLine={false}
              dy={5}
            />
            <YAxis
              stroke="#94a3b8"
              tick={{ fill: "#94a3b8" }}
              fontSize={isMini ? 8 : 10}
              tickLine={false}
              axisLine={false}
              tickFormatter={formatYAxis}
              width={isMini ? 30 : 45}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#0f172a",
                borderColor: "#334155",
                borderRadius: "12px",
                color: "#f1f5f9",
                fontSize: isMini ? 10 : 12,
              }}
            />
            {!isMini && <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />}
            <Area
              type="monotone"
              dataKey={yAxisKey}
              stroke="#10b981"
              strokeWidth={isMini ? 1.5 : 2.5}
              fillOpacity={1}
              fill="url(#areaColor)"
            />
          </AreaChart>
        );

      case "pie":
        return (
          <PieChart width={chartW} height={chartH} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
            <Pie
              data={processedData}
              cx="50%"
              cy={isMini ? "50%" : "45%"}
              innerRadius={isMini ? 30 : 60}
              outerRadius={isMini ? 45 : 85}
              paddingAngle={4}
              dataKey={yAxisKey}
              nameKey={xAxisKey}
              label={isMini ? false : ({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
              labelLine={isMini ? false : { stroke: "#475569", strokeWidth: 1 }}
            >
              {processedData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "#0f172a",
                borderColor: "#334155",
                borderRadius: "12px",
                color: "#f1f5f9",
                fontSize: isMini ? 10 : 12,
              }}
            />
            {!isMini && <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: 11 }} />}
          </PieChart>
        );

      default:
        return null;
    }
  };

  if (isMini) {
    return (
      <div ref={containerRef} className="w-full h-full relative min-h-[140px]">
        {renderChart(dimensions.width, dimensions.height)}
      </div>
    );
  }

  return (
    <div
      id="visual-chart-container"
      className={`relative flex flex-col border border-slate-800 bg-slate-900 rounded-2xl p-5 shadow-lg overflow-hidden transition-all duration-300 ${
        isFullscreen
          ? "fixed inset-4 z-50 bg-slate-900 border-2 border-indigo-500/50"
          : "h-[400px]"
      }`}
    >
      {/* Title block */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800 flex-wrap gap-3">
        <div>
          <h3 className="text-base font-bold text-slate-100 tracking-tight">{title}</h3>
          <p className="text-xs text-slate-400 capitalize tracking-wide font-mono mt-0.5">
            Visualization Style: {activeChartType}
          </p>
          <span className="text-[10px] text-slate-500 font-mono block mt-1">
            Schema: x="{xAxisKey}", y="{yAxisKey}" | Rows: {processedData.length} | First: {processedData[0] ? JSON.stringify(processedData[0]).substring(0, 50) : "none"}
          </span>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Interactive Chart Type Selector */}
          <div className="flex bg-slate-950/60 p-1 border border-slate-800/80 rounded-xl items-center gap-1">
            {(["bar", "line", "area", "pie"] as const).map((type) => (
              <button
                key={type}
                onClick={() => {
                  setActiveChartType(type);
                  setShowTable(false);
                }}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider cursor-pointer transition-all ${
                  activeChartType === type && !showTable
                    ? "bg-indigo-600/90 text-white shadow"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-850"
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowTable(!showTable)}
            className="px-2.5 py-1.5 text-indigo-400 hover:text-indigo-300 bg-indigo-950/40 border border-indigo-900/30 rounded-lg hover:bg-indigo-900/30 transition-colors flex items-center gap-1.5 text-[11px] font-semibold cursor-pointer"
            title={showTable ? "Show Chart" : "Show Data Table"}
          >
            {showTable ? <Presentation className="w-3.5 h-3.5" /> : <Table className="w-3.5 h-3.5" />}
            <span>{showTable ? "Chart" : "Data Table"}</span>
          </button>

          <button
            id="btn-chart-expand"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 text-slate-400 hover:text-slate-100 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors"
            title={isFullscreen ? "Minimize" : "Full Screen"}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Chart workspace */}
      <div ref={containerRef} className={`w-full relative ${isFullscreen ? "h-[65vh]" : "h-[220px]"} flex flex-col justify-center`}>
        {showTable ? (
          <div className="overflow-auto max-h-full border border-slate-800 rounded-xl bg-slate-950/40">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/80 font-mono text-slate-400 uppercase tracking-wider text-[10px]">
                  <th className="p-3 font-semibold">{xAxisKey}</th>
                  <th className="p-3 font-semibold text-right">{yAxisKey}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 font-medium">
                {processedData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-900/40 transition-colors">
                    <td className="p-3 text-slate-200">{String(row[xAxisKey] || "")}</td>
                    <td className="p-3 text-slate-100 text-right font-mono">
                      {isPercent ? `${Number(row[yAxisKey]).toFixed(1)}%` : formatYAxis(Number(row[yAxisKey]))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          renderChart(dimensions.width, dimensions.height)
        )}
      </div>

      {/* Explanation drawer */}
      {explanation && (
        <div className="mt-4 flex gap-2 p-3 bg-slate-950/60 border border-slate-800 rounded-xl">
          <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
          <p className="text-[11px] text-slate-300 leading-relaxed font-sans">{explanation}</p>
        </div>
      )}
    </div>
  );
}
