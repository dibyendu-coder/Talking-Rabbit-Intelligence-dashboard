/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Download, Printer, FileText, Check, ChevronDown } from "lucide-react";
import { AnalysisResponse, ParsedData } from "../types";

interface ExportControlsProps {
  currentResponse: AnalysisResponse | null;
  parsedData: ParsedData | null;
  datasetName: string;
}

export default function ExportControls({ currentResponse, parsedData, datasetName }: ExportControlsProps) {
  const [isExportingCsv, setIsExportingCsv] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  if (!currentResponse && !parsedData) return null;

  // Helper to convert data to CSV string and trigger download
  const handleExportCSV = () => {
    setIsExportingCsv(true);
    try {
      let csvContent = "";

      // 1. Report Metadata
      csvContent += `METADATA,VALUE\n`;
      csvContent += `Report Title,"AI Ledger Intelligence Report"\n`;
      csvContent += `Dataset,"${datasetName || "Active Workspace Ledger"}"\n`;
      csvContent += `Export Timestamp,"${new Date().toLocaleString()}"\n`;
      csvContent += `\n`;

      // 2. KPIs
      if (currentResponse?.kpis && currentResponse.kpis.length > 0) {
        csvContent += `SECTION,KEY PERFORMANCE INDICATORS (KPIs)\n`;
        csvContent += `Metric,Current Value,Change,Status\n`;
        currentResponse.kpis.forEach(kpi => {
          csvContent += `"${kpi.label || ""}","${kpi.value || ""}","${kpi.change || ""}","${kpi.status || ""}"\n`;
        });
        csvContent += `\n`;
      }

      // 3. Strategic Insights
      if (currentResponse?.insights && currentResponse.insights.length > 0) {
        csvContent += `SECTION,STRATEGIC INSIGHTS\n`;
        csvContent += `Type,Detail Narrative\n`;
        currentResponse.insights.forEach(insight => {
          csvContent += `"${insight.type || ""}","${insight.text || ""}"\n`;
        });
        csvContent += `\n`;
      }

      // 4. Strategic Recommendations
      if (currentResponse?.recommendations && currentResponse.recommendations.length > 0) {
        csvContent += `SECTION,TACTICAL RECOMMENDATIONS\n`;
        csvContent += `Impact,Strategic Title,Details\n`;
        currentResponse.recommendations.forEach(rec => {
          csvContent += `"${rec.impact || ""}","${rec.action || ""}","${rec.details || ""}"\n`;
        });
        csvContent += `\n`;
      }

      // 5. Chart / Forecast Data
      if (currentResponse?.chartConfig?.data && currentResponse.chartConfig.data.length > 0) {
        csvContent += `SECTION,VISUALIZATION DATA POINTS\n`;
        const dataKeys = Object.keys(currentResponse.chartConfig.data[0]);
        csvContent += `${dataKeys.join(",")}\n`;
        currentResponse.chartConfig.data.forEach((row: any) => {
          const rowVals = dataKeys.map(k => {
            const val = row[k];
            return typeof val === "string" ? `"${val}"` : val;
          });
          csvContent += `${rowVals.join(",")}\n`;
        });
        csvContent += `\n`;
      }

      // Trigger Download
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `AI_Ledger_Report_${datasetName.replace(/[^a-z0-9]/gi, "_") || "Workspace"}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Failed to generate CSV export", err);
    }
    setTimeout(() => {
      setIsExportingCsv(false);
      setShowDropdown(false);
    }, 1000);
  };

  // Helper to generate a beautifully styled HTML page in a print iframe and print it as PDF
  const handleExportPDF = () => {
    setIsExportingPdf(true);
    try {
      const iframe = document.createElement("iframe");
      iframe.style.position = "fixed";
      iframe.style.right = "0";
      iframe.style.bottom = "0";
      iframe.style.width = "0";
      iframe.style.height = "0";
      iframe.style.border = "0";
      document.body.appendChild(iframe);

      const doc = iframe.contentWindow?.document || iframe.contentDocument;
      if (!doc) throw new Error("Could not access iframe document");

      // Compile a high-fashion, clean, modern corporate layout styled with Tailwind CSS or native styles
      const printHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>AI Ledger Intelligence Report</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;700&display=swap');
            
            body {
              font-family: 'Inter', sans-serif;
              color: #1e293b;
              background: #ffffff;
              line-height: 1.5;
              padding: 40px;
              margin: 0;
            }
            
            .header {
              border-bottom: 2px solid #f1f5f9;
              padding-bottom: 20px;
              margin-bottom: 30px;
              display: flex;
              justify-content: space-between;
              align-items: flex-end;
            }
            
            .header-title h1 {
              font-size: 24px;
              font-weight: 800;
              color: #0f172a;
              margin: 0 0 5px 0;
              letter-spacing: -0.025em;
            }
            
            .header-title p {
              font-size: 13px;
              color: #64748b;
              margin: 0;
            }
            
            .timestamp {
              font-family: 'JetBrains Mono', monospace;
              font-size: 10px;
              color: #f7931a;
              font-weight: 700;
              text-align: right;
            }
            
            .grid-kpi {
              display: grid;
              grid-template-columns: repeat(4, 1fr);
              gap: 15px;
              margin-bottom: 35px;
            }
            
            .kpi-card {
              background: #f8fafc;
              border: 1px solid #e2e8f0;
              border-radius: 12px;
              padding: 15px;
            }
            
            .kpi-card .kpi-title {
              font-size: 10px;
              font-weight: 700;
              text-transform: uppercase;
              color: #64748b;
              letter-spacing: 0.05em;
              margin-bottom: 5px;
            }
            
            .kpi-card .kpi-value {
              font-size: 20px;
              font-weight: 800;
              color: #0f172a;
              margin-bottom: 3px;
            }
            
            .kpi-card .kpi-status {
              display: inline-block;
              font-size: 9px;
              font-weight: 700;
              padding: 2px 6px;
              background: #f1f5f9;
              border-radius: 4px;
              color: #475569;
              text-transform: uppercase;
            }
            
            .section-title {
              font-size: 14px;
              font-weight: 800;
              text-transform: uppercase;
              letter-spacing: 0.05em;
              color: #0f172a;
              border-bottom: 1px solid #e2e8f0;
              padding-bottom: 8px;
              margin-bottom: 15px;
              margin-top: 30px;
            }
            
            .insight-item {
              margin-bottom: 15px;
              padding-left: 15px;
              border-left: 3px solid #f7931a;
            }
            
            .insight-header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 4px;
            }
            
            .insight-title {
              font-size: 13px;
              font-weight: 700;
              color: #0f172a;
            }
            
            .insight-category {
              font-family: 'JetBrains Mono', monospace;
              font-size: 9px;
              font-weight: 700;
              color: #f7931a;
              text-transform: uppercase;
            }
            
            .insight-text {
              font-size: 12px;
              color: #334155;
            }
            
            .rec-card {
              background: #f8fafc;
              border: 1px solid #e2e8f0;
              border-radius: 12px;
              padding: 15px;
              margin-bottom: 15px;
            }
            
            .rec-title {
              font-size: 13px;
              font-weight: 700;
              color: #0f172a;
              margin-bottom: 6px;
            }
            
            .rec-desc {
              font-size: 12px;
              color: #475569;
              margin-bottom: 10px;
            }
            
            .rec-actions {
              display: flex;
              flex-direction: column;
              gap: 5px;
            }
            
            .rec-action {
              font-size: 11px;
              color: #334155;
              display: flex;
              align-items: center;
              gap: 6px;
            }
            
            .rec-action::before {
              content: "•";
              color: #f7931a;
              font-weight: bold;
            }
            
            .chart-data-table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 15px;
              font-size: 11px;
            }
            
            .chart-data-table th {
              background: #f1f5f9;
              color: #475569;
              font-weight: 700;
              text-align: left;
              padding: 8px 12px;
              text-transform: uppercase;
              font-size: 9px;
              letter-spacing: 0.05em;
              border-bottom: 1px solid #e2e8f0;
            }
            
            .chart-data-table td {
              padding: 8px 12px;
              border-bottom: 1px solid #f1f5f9;
              color: #334155;
            }
            
            .footer-note {
              margin-top: 50px;
              text-align: center;
              font-size: 10px;
              color: #94a3b8;
              border-top: 1px solid #f1f5f9;
              padding-top: 15px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="header-title">
              <h1>AI Ledger Intelligence Report</h1>
              <p>Dataset: <strong>${datasetName || "Active Ledger Workspace"}</strong></p>
            </div>
            <div class="timestamp">
              GENERATE PROTOCOL SYSTEM ACTIVE<br>
              ${new Date().toLocaleDateString()} @ ${new Date().toLocaleTimeString()}
            </div>
          </div>

          ${currentResponse?.kpis && currentResponse.kpis.length > 0 ? `
            <div class="section-title">Key Performance Indicators</div>
            <div class="grid-kpi">
              ${currentResponse.kpis.map(kpi => `
                <div class="kpi-card">
                  <div class="kpi-title">${kpi.label || "Metric"}</div>
                  <div class="kpi-value">${kpi.value || "-"}</div>
                  <div class="kpi-status">${kpi.change || ""} (${kpi.status || "Stable"})</div>
                </div>
              `).join("")}
            </div>
          ` : ""}

          ${currentResponse?.answer ? `
            <div class="section-title">Executive Summary</div>
            <p style="font-size: 12px; color: #334155; line-height: 1.6; margin-bottom: 25px;">
              ${currentResponse.answer}
            </p>
          ` : ""}

          ${currentResponse?.insights && currentResponse.insights.length > 0 ? `
            <div class="section-title">Strategic Insights</div>
            <div style="margin-bottom: 25px;">
              ${currentResponse.insights.map(insight => `
                <div class="insight-item">
                  <div class="insight-header">
                    <span class="insight-title">${insight.type || "Analytical"} Insight</span>
                  </div>
                  <div class="insight-text">${insight.text}</div>
                </div>
              `).join("")}
            </div>
          ` : ""}

          ${currentResponse?.recommendations && currentResponse.recommendations.length > 0 ? `
            <div class="section-title">Strategic Recommendations</div>
            <div style="margin-bottom: 25px;">
              ${currentResponse.recommendations.map(rec => `
                <div class="rec-card">
                  <div class="rec-title">${rec.action} <span style="font-size: 9px; text-transform: uppercase; padding: 2px 6px; background: #fffbeb; border: 1px solid #fef3c7; color: #d97706; border-radius: 4px; margin-left: 8px;">${rec.impact} Impact</span></div>
                  <div class="rec-desc">${rec.details}</div>
                </div>
              `).join("")}
            </div>
          ` : ""}

          ${currentResponse?.chartConfig?.data && currentResponse.chartConfig.data.length > 0 ? `
            <div class="section-title">Visualized Ledger Points</div>
            <table class="chart-data-table">
              <thead>
                <tr>
                  ${Object.keys(currentResponse.chartConfig.data[0]).map(k => `<th>${k}</th>`).join("")}
                </tr>
              </thead>
              <tbody>
                ${currentResponse.chartConfig.data.map((row: any) => `
                  <tr>
                    ${Object.keys(row).map(k => `<td>${row[k]}</td>`).join("")}
                  </tr>
                `).join("")}
              </tbody>
            </table>
          ` : ""}

          <div class="footer-note">
            Confidential. For internal strategic governance use only. Designed via AI Studio Protocol.
          </div>
        </body>
        </html>
      `;

      doc.open();
      doc.write(printHtml);
      doc.close();

      // Wait for content loading inside iframe and print
      setTimeout(() => {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
        
        // Cleanup iframe after print dialog resolves
        setTimeout(() => {
          document.body.removeChild(iframe);
          setIsExportingPdf(false);
          setShowDropdown(false);
        }, 1000);
      }, 500);

    } catch (err) {
      console.error("Failed to generate PDF printable workspace", err);
      setIsExportingPdf(false);
    }
  };

  return (
    <div id="export-controls-container" className="relative">
      <button
        id="export-trigger-btn"
        onClick={() => setShowDropdown(!showDropdown)}
        className="px-3 py-1.5 bg-[#030304]/60 hover:bg-bitcoin/10 border border-white/5 hover:border-bitcoin/30 rounded-xl text-xs font-bold text-slate-300 hover:text-white cursor-pointer transition-all flex items-center gap-1.5 font-mono select-none"
      >
        <Download className="w-3.5 h-3.5 text-bitcoin" />
        <span>Export Findings</span>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform ${showDropdown ? "rotate-180" : ""}`} />
      </button>

      {showDropdown && (
        <>
          {/* Click outside backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)} />
          
          <div className="absolute right-0 mt-2 w-52 bg-surface border border-white/10 rounded-xl shadow-xl z-50 overflow-hidden font-mono text-xs">
            <button
              id="export-csv-btn"
              onClick={handleExportCSV}
              disabled={isExportingCsv}
              className="w-full text-left px-4 py-3 hover:bg-bitcoin/5 text-slate-300 hover:text-white border-b border-white/5 flex items-center gap-2.5 transition-colors disabled:opacity-50"
            >
              {isExportingCsv ? (
                <Check className="w-4 h-4 text-emerald-400 animate-pulse" />
              ) : (
                <FileText className="w-4 h-4 text-bitcoin-gold" />
              )}
              <div className="flex flex-col text-left">
                <span className="font-bold">Export Excel CSV</span>
                <span className="text-[9px] text-muted font-normal">All metrics & chart values</span>
              </div>
            </button>

            <button
              id="export-pdf-btn"
              onClick={handleExportPDF}
              disabled={isExportingPdf}
              className="w-full text-left px-4 py-3 hover:bg-bitcoin/5 text-slate-300 hover:text-white flex items-center gap-2.5 transition-colors disabled:opacity-50"
            >
              {isExportingPdf ? (
                <Check className="w-4 h-4 text-emerald-400 animate-pulse" />
              ) : (
                <Printer className="w-4 h-4 text-bitcoin" />
              )}
              <div className="flex flex-col text-left">
                <span className="font-bold">Print/Save as PDF</span>
                <span className="text-[9px] text-muted font-normal">Executive corporate report</span>
              </div>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
