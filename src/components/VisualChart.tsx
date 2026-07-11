import React, { useState } from "react";
import {
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
  "#F7931A", // Bitcoin Orange
  "#FFD600", // Digital Gold
  "#EA580C", // Burnt Orange
  "#F59E0B", // Amber
  "#EF4444", // Rose
  "#EAB308", // Yellow
  "#CA8A04", // Dark Gold
  "#F97316", // Orange secondary
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
      <div id="visual-chart-empty" className="flex flex-col items-center justify-center h-72 border border-white/5 bg-[#030304]/40 rounded-2xl text-muted text-sm font-mono">
        <Presentation className="w-8 h-8 mb-2 text-bitcoin shadow-bitcoin-glow" />
        <span className="font-bold text-white font-heading">No dynamic ledger charts compiled.</span>
        <span className="text-xs text-muted mt-1">Ask a prompt like "Show yield projection categories" to trigger graphics</span>
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
        <div className="flex flex-col items-center justify-center h-full text-muted py-6 px-4 text-center font-mono">
          <Presentation className="w-6 h-6 mb-1 text-bitcoin animate-pulse" />
          <span className="text-xs font-bold text-white">No active records match the selected axes</span>
          <span className="text-[10px] text-muted mt-0.5">Try: "Show Volume by Block" or "Compare yield segments"</span>
        </div>
      );
    }

    switch (activeChartType) {
      case "bar":
        return (
          <BarChart width={chartW} height={chartH} data={processedData} margin={{ top: 10, right: 10, left: -15, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
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
              cursor={{ fill: "rgba(247, 147, 26, 0.05)" }}
              contentStyle={{
                backgroundColor: "#0F1115",
                borderColor: "rgba(247, 147, 26, 0.3)",
                borderRadius: "12px",
                color: "#f1f5f9",
                fontSize: isMini ? 10 : 12,
              }}
            />
            {!isMini && <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />}
            <Bar dataKey={yAxisKey} fill="#F7931A" radius={[4, 4, 0, 0]}>
              {processedData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        );

      case "line":
        return (
          <LineChart width={chartW} height={chartH} data={processedData} margin={{ top: 10, right: 10, left: -15, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
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
                backgroundColor: "#0F1115",
                borderColor: "rgba(247, 147, 26, 0.3)",
                borderRadius: "12px",
                color: "#f1f5f9",
                fontSize: isMini ? 10 : 12,
              }}
            />
            {!isMini && <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />}
            <Line
              type="monotone"
              dataKey={yAxisKey}
              stroke="#F7931A"
              strokeWidth={isMini ? 1.5 : 3}
              activeDot={{ r: isMini ? 4 : 8, strokeWidth: 0, fill: "#FFD600" }}
              dot={{ strokeWidth: isMini ? 1 : 2, r: isMini ? 2 : 4, stroke: "#EA580C" }}
            />
          </LineChart>
        );

      case "area":
        return (
          <AreaChart width={chartW} height={chartH} data={processedData} margin={{ top: 10, right: 10, left: -15, bottom: 5 }}>
            <defs>
              <linearGradient id="bitcoinAreaColor" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#F7931A" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#F7931A" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
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
                backgroundColor: "#0F1115",
                borderColor: "rgba(247, 147, 26, 0.3)",
                borderRadius: "12px",
                color: "#f1f5f9",
                fontSize: isMini ? 10 : 12,
              }}
            />
            {!isMini && <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />}
            <Area
              type="monotone"
              dataKey={yAxisKey}
              stroke="#F7931A"
              strokeWidth={isMini ? 1.5 : 2.5}
              fillOpacity={1}
              fill="url(#bitcoinAreaColor)"
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
              labelLine={isMini ? false : { stroke: "rgba(255,255,255,0.1)", strokeWidth: 1 }}
            >
              {processedData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "#0F1115",
                borderColor: "rgba(247, 147, 26, 0.3)",
                borderRadius: "12px",
                color: "#f1f5f9",
                fontSize: isMini ? 10 : 12,
              }}
            />
            {!isMini && <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: 11 }} />}
          </PieChart>
        );

      case "heatmap": {
        const gridData: { x: string; y: string; val: number }[] = [];
        const xSet = new Set<string>();
        const ySet = new Set<string>();

        processedData.forEach((entry) => {
          const rawX = String(entry[xAxisKey] || "");
          let xPart = rawX;
          let yPart = "Default";

          if (rawX.includes("|")) {
            const parts = rawX.split("|");
            xPart = parts[0]?.trim() || "";
            yPart = parts[1]?.trim() || "";
          }

          const numericVal = Number(entry[yAxisKey]) || 0;
          gridData.push({ x: xPart, y: yPart, val: numericVal });
          xSet.add(xPart);
          ySet.add(yPart);
        });

        if (ySet.size === 1 && xSet.size > 3) {
          const xList = Array.from(xSet);
          xSet.clear();
          ySet.clear();
          gridData.length = 0;
          
          const colCount = Math.ceil(Math.sqrt(xList.length));
          processedData.forEach((entry, idx) => {
            const rowIdx = Math.floor(idx / colCount);
            const colIdx = idx % colCount;
            const xLabel = xList[colIdx] || `Col ${colIdx + 1}`;
            const yLabel = `Segment ${rowIdx + 1}`;
            
            const numericVal = Number(entry[yAxisKey]) || 0;
            gridData.push({ x: xLabel, y: yLabel, val: numericVal });
            xSet.add(xLabel);
            ySet.add(yLabel);
          });
        }

        const cols = Array.from(xSet);
        const rows = Array.from(ySet);

        const values = gridData.map(d => d.val);
        const maxVal = values.length ? Math.max(...values) : 100;
        const minVal = values.length ? Math.min(...values) : 0;
        const range = maxVal - minVal || 1;

        const getCellBg = (val: number) => {
          const ratio = (val - minVal) / range;
          if (ratio < 0.25) return "bg-[#030304] text-muted border-white/5";
          if (ratio < 0.5) return "bg-bitcoin/10 text-bitcoin border-bitcoin/25 hover:bg-bitcoin/15";
          if (ratio < 0.75) return "bg-bitcoin/20 text-bitcoin-gold border-bitcoin/45 hover:bg-bitcoin/25";
          return "bg-bitcoin/85 text-black font-extrabold border-bitcoin shadow-bitcoin-glow hover:scale-[1.04]";
        };

        return (
          <div className="w-full h-full overflow-auto flex flex-col justify-between py-2 font-mono">
            <div className="min-w-[450px] overflow-x-auto pr-2">
              <div 
                className="grid gap-2 text-center"
                style={{ 
                  gridTemplateColumns: `100px repeat(${cols.length}, minmax(70px, 1fr))` 
                }}
              >
                <div className="text-left text-[10px] uppercase font-bold tracking-wider text-muted self-center truncate p-1">
                  Metric Nodes
                </div>
                {cols.map((col, idx) => (
                  <div key={idx} className="text-[10px] font-bold text-slate-300 uppercase tracking-wide truncate p-1" title={col}>
                    {col}
                  </div>
                ))}

                {rows.map((row, rIdx) => (
                  <React.Fragment key={rIdx}>
                    <div className="text-left text-[10px] font-bold text-slate-300 truncate p-1 bg-[#030304]/60 border border-white/5 rounded-lg flex items-center px-2">
                      {row}
                    </div>
                    {cols.map((col, cIdx) => {
                      const item = gridData.find(d => d.x === col && d.y === row);
                      const val = item ? item.val : 0;
                      return (
                        <div
                          key={cIdx}
                          className={`p-3 rounded-xl border text-xs transition-all duration-200 hover:shadow-bitcoin-glow flex flex-col justify-center items-center h-14 cursor-pointer ${getCellBg(val)}`}
                          title={`${row} x ${col}: ${isPercent ? `${val.toFixed(1)}%` : formatYAxis(val)}`}
                        >
                          <span className="text-[11px] font-extrabold tracking-tight">
                            {isPercent ? `${val.toFixed(0)}%` : val >= 1000 ? `${(val / 1000).toFixed(1)}K` : val}
                          </span>
                        </div>
                      );
                    })}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {!isMini && (
              <div className="mt-4 flex items-center justify-end gap-2.5 text-[10px] text-muted px-2 flex-wrap">
                <span>Density scale:</span>
                <div className="flex items-center gap-1 bg-[#030304]/60 p-1.5 border border-white/5 rounded-xl">
                  <span className="w-2.5 h-2.5 rounded bg-[#030304] border border-white/5"></span>
                  <span className="text-muted mr-2">Low ({isPercent ? `${minVal.toFixed(0)}%` : formatYAxis(minVal)})</span>
                  <span className="w-2.5 h-2.5 rounded bg-bitcoin/10 border border-bitcoin/20"></span>
                  <span className="w-2.5 h-2.5 rounded bg-bitcoin/20 border border-bitcoin/40"></span>
                  <span className="w-2.5 h-2.5 rounded bg-bitcoin/80 border border-bitcoin"></span>
                  <span className="text-white">High ({isPercent ? `${maxVal.toFixed(0)}%` : formatYAxis(maxVal)})</span>
                </div>
              </div>
            )}
          </div>
        );
      }

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
      className={`relative flex flex-col border border-white/5 bg-surface rounded-2xl p-5 shadow-sm overflow-hidden transition-all duration-300 ${
        isFullscreen
          ? "fixed inset-4 z-50 bg-surface border-2 border-bitcoin/50"
          : "h-[400px]"
      }`}
    >
      {/* Visual Corner Accents */}
      <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-bitcoin rounded-tl" />
      <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-bitcoin rounded-br" />

      {/* Title block */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/5 flex-wrap gap-3">
        <div>
          <h3 className="text-base font-bold text-white tracking-tight font-heading">{title}</h3>
          <p className="text-xs text-bitcoin capitalize tracking-widest font-mono mt-0.5 font-bold">
            PROTOCOL VIEWPORTS: {activeChartType}
          </p>
          <span className="text-[10px] text-muted font-mono block mt-1">
            Metrics: x="{xAxisKey}", y="{yAxisKey}" | Rows: {processedData.length}
          </span>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Interactive Chart Type Selector */}
          <div className="flex bg-[#030304]/60 p-1 border border-white/5 rounded-xl items-center gap-1">
            {(["bar", "line", "area", "pie", "heatmap"] as const).map((type) => (
              <button
                key={type}
                onClick={() => {
                  setActiveChartType(type);
                  setShowTable(false);
                }}
                className={`px-2.5 py-1 rounded-lg text-[9px] font-mono font-bold uppercase tracking-wider cursor-pointer transition-all ${
                  activeChartType === type && !showTable
                    ? "bg-gradient-to-r from-bitcoin-burnt to-bitcoin text-white shadow-bitcoin-glow"
                    : "text-muted hover:text-white"
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowTable(!showTable)}
            className="px-2.5 py-1.5 text-bitcoin hover:text-bitcoin-gold bg-bitcoin/10 border border-bitcoin/20 rounded-lg hover:bg-bitcoin/20 transition-all flex items-center gap-1.5 text-[11px] font-bold font-mono cursor-pointer"
            title={showTable ? "Show Chart visual" : "Show Data Table ledger"}
          >
            {showTable ? <Presentation className="w-3.5 h-3.5" /> : <Table className="w-3.5 h-3.5" />}
            <span>{showTable ? "Chart" : "Ledger Table"}</span>
          </button>

          <button
            id="btn-chart-expand"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 text-muted hover:text-white bg-[#030304] border border-white/5 rounded-lg hover:border-white/10 transition-colors cursor-pointer"
            title={isFullscreen ? "Minimize" : "Full Screen"}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Chart workspace */}
      <div ref={containerRef} className={`w-full relative ${isFullscreen ? "h-[65vh]" : "h-[220px]"} flex flex-col justify-center`}>
        {showTable ? (
          <div className="overflow-auto max-h-full border border-white/5 rounded-xl bg-[#030304]/60 font-mono">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-white/5 bg-[#030304] text-muted uppercase tracking-wider text-[9px] font-bold">
                  <th className="p-3 font-semibold">{xAxisKey}</th>
                  <th className="p-3 font-semibold text-right">{yAxisKey}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-semibold text-slate-300">
                {processedData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-white/5 transition-colors">
                    <td className="p-3">{String(row[xAxisKey] || "")}</td>
                    <td className="p-3 text-right text-white">
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
        <div className="mt-4 flex gap-2 p-3 bg-[#030304]/40 border border-white/5 rounded-xl">
          <Info className="w-4 h-4 text-bitcoin-gold shrink-0 mt-0.5 shadow-gold-glow" />
          <p className="text-[11px] text-slate-300 leading-relaxed font-body">{explanation}</p>
        </div>
      )}
    </div>
  );
}
