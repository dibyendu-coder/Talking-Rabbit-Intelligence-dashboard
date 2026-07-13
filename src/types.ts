export interface KPI {
  label: string;
  value: string;
  change: string;
  status: "up" | "down";
}

export interface Insight {
  type: "trend" | "anomaly" | "positive" | "negative";
  text: string;
}

export interface Recommendation {
  action: string;
  details: string;
  impact: "High" | "Medium" | "Low";
}

export interface ForecastPoint {
  period: string;
  value: number;
}

export interface Forecast {
  metric: string;
  values: ForecastPoint[];
}

export interface ChartConfig {
  chartType: "bar" | "line" | "pie" | "area" | "heatmap" | "none";
  title: string;
  xAxisKey: string;
  yAxisKey: string;
  data: any[];
  explanation: string;
}

export interface AnalysisResponse {
  answer: string;
  chartConfig: ChartConfig;
  insights: Insight[];
  recommendations: Recommendation[];
  forecast: Forecast;
  kpis: KPI[];
  rootCauseAnalysis?: RootCauseAnalysis;
  whatIfSimulation?: WhatIfSimulation;
}

export interface SimulationImpact {
  metric: string;
  before: string;
  after: string;
  change: string;
  trend: "up" | "down" | "neutral";
  explanation: string;
}

export interface WhatIfSimulation {
  scenario: string;
  confidence: string;
  impacts: SimulationImpact[];
  strategicSummary: string;
}

export interface RootCauseFactor {
  factor: string;
  subtext: string;
  impact: "high" | "medium" | "low";
}

export interface RootCauseAnalysis {
  metric: string;
  trend: "up" | "down" | "flat";
  changeText: string;
  factors: RootCauseFactor[];
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  timestamp: string;
  hasAudio?: boolean;
  chartConfig?: ChartConfig;
}

export interface ParsedData {
  fileName: string;
  rowCount: number;
  columns: string[];
  dataTypes: Record<string, string>;
  summaryStats: Record<string, any>;
  previewRows: Record<string, any>[];
}
