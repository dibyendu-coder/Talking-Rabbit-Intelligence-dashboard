import React, { useState, useRef } from "react";
import * as XLSX from "xlsx";
import { Upload, FileSpreadsheet, AlertCircle, Sparkles, FolderOpen } from "lucide-react";
import { ParsedData } from "../types";
import { SAMPLE_DATASETS, getParsedStats } from "../data";

interface SpreadsheetLoaderProps {
  onDataLoaded: (data: ParsedData, rawData: any[]) => void;
  isLoading: boolean;
}

export default function SpreadsheetLoader({ onDataLoaded, isLoading }: SpreadsheetLoaderProps) {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Analyze structure and statistics of parsed CSV/Excel array
  const processRawData = (fileName: string, rawRows: any[]) => {
    if (!rawRows || rawRows.length === 0) {
      setError("The uploaded spreadsheet contains no recognizable rows of data.");
      return;
    }

    try {
      const parsed = getParsedStats(fileName, rawRows);
      setError(null);
      onDataLoaded(parsed, rawRows);
    } catch (err: any) {
      setError(`Error gathering data stats: ${err.message}`);
    }
  };

  const handleFile = (file: File) => {
    const isCsv = file.name.endsWith(".csv");
    const isExcel = file.name.endsWith(".xlsx") || file.name.endsWith(".xls");

    if (!isCsv && !isExcel) {
      setError("Please upload a valid business document format (.csv, .xlsx, .xls)");
      return;
    }

    const reader = new FileReader();
    
    if (isCsv) {
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string;
          let json: any[] = [];
          
          try {
            // First attempt: SheetJS
            const workbook = XLSX.read(text, { type: "string", raw: true });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            json = XLSX.utils.sheet_to_json(worksheet);
          } catch (sheetJsErr) {
            console.warn("SheetJS failed to parse, running custom fallback CSV parser", sheetJsErr);
            json = fallbackCSVParser(text);
          }

          if (!json || json.length === 0) {
            // If SheetJS succeeded but empty, try fallback
            json = fallbackCSVParser(text);
          }

          const cleanRows = json.filter(row => {
            if (!row || typeof row !== "object") return false;
            return Object.values(row).some(v => v !== undefined && v !== null && String(v).trim() !== "");
          });

          processRawData(file.name, cleanRows);
        } catch (err: any) {
          setError(`Failed to read CSV file: ${err.message}`);
        }
      };
      reader.readAsText(file);
    } else {
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: "array" });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const json = XLSX.utils.sheet_to_json(worksheet);

          const cleanRows = json.filter(row => {
            if (!row || typeof row !== "object") return false;
            return Object.values(row).some(v => v !== undefined && v !== null && String(v).trim() !== "");
          });

          processRawData(file.name, cleanRows);
        } catch (err: any) {
          setError(`Failed to read spreadsheet file: ${err.message}`);
        }
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const fallbackCSVParser = (text: string): any[] => {
    const lines: string[] = [];
    let currentLine = "";
    let insideQuotes = false;

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      if (char === '"') {
        insideQuotes = !insideQuotes;
        currentLine += char;
      } else if (char === '\n' || char === '\r') {
        if (insideQuotes) {
          currentLine += char;
        } else {
          if (currentLine.trim()) {
            lines.push(currentLine);
          }
          currentLine = "";
        }
      } else {
        currentLine += char;
      }
    }
    if (currentLine.trim()) {
      lines.push(currentLine);
    }

    if (lines.length < 2) return [];

    // Detect delimiter
    const firstLine = lines[0];
    let delimiter = ",";
    const counts = { ",": 0, ";": 0, "\t": 0 };
    let quoteOpen = false;
    for (let i = 0; i < firstLine.length; i++) {
      if (firstLine[i] === '"') quoteOpen = !quoteOpen;
      if (!quoteOpen) {
        if (firstLine[i] === ",") counts[","]++;
        if (firstLine[i] === ";") counts[";"]++;
        if (firstLine[i] === "\t") counts["\t"]++;
      }
    }
    if (counts[";"] > counts[","] && counts[";"] > counts["\t"]) {
      delimiter = ";";
    } else if (counts["\t"] > counts[","] && counts["\t"] > counts[";"]) {
      delimiter = "\t";
    }

    const parseLine = (line: string): string[] => {
      const result: string[] = [];
      let current = "";
      let insideQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          insideQuotes = !insideQuotes;
        } else if (char === delimiter && !insideQuotes) {
          result.push(current.trim());
          current = "";
        } else {
          current += char;
        }
      }
      result.push(current.trim());
      return result;
    };

    const headers = parseLine(lines[0]).map(h => h.replace(/^"|"$/g, "").trim());
    const rows: any[] = [];

    for (let l = 1; l < lines.length; l++) {
      const values = parseLine(lines[l]);
      const row: Record<string, any> = {};
      headers.forEach((header, idx) => {
        let val: any = values[idx];
        if (val !== undefined && val !== null) {
          val = val.replace(/^"|"$/g, "").trim();
          if (val !== "" && !isNaN(Number(val))) {
            val = Number(val);
          }
        } else {
          val = "";
        }
        row[header] = val;
      });
      rows.push(row);
    }

    return rows;
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const onButtonClick = () => {
    fileInputRef.current?.click();
  };

  const selectSample = (sample: typeof SAMPLE_DATASETS[0]) => {
    processRawData(`${sample.name} Template.csv`, sample.data);
  };

  return (
    <div id="spreadsheet-loader" className="w-full max-w-4xl mx-auto space-y-6">
      {/* File Dropper Canvas */}
      <div
        id="drop-zone"
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        className={`flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed transition-all duration-300 relative ${
          dragActive
            ? "border-bitcoin bg-bitcoin/5 scale-[1.01] shadow-bitcoin-glow"
            : "border-white/10 bg-[#030304]/60 hover:border-bitcoin/30 hover:bg-[#030304]/80"
        } ${isLoading ? "opacity-65 pointer-events-none" : ""}`}
      >
        <input
          id="file-upload-input"
          ref={fileInputRef}
          type="file"
          accept=".csv,.xlsx,.xls"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          className="hidden"
        />

        <div className="flex flex-col items-center space-y-3 text-center">
          <div className="p-4 bg-surface border border-white/5 rounded-full text-bitcoin shadow-bitcoin-glow">
            <Upload className="w-8 h-8 animate-bounce text-bitcoin" />
          </div>

          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white font-heading">Import financial data or transaction ledger</h3>
            <p className="text-sm text-muted">
              Drag and drop your spreadsheet here, or{" "}
              <button
                id="btn-upload-browse"
                onClick={onButtonClick}
                className="text-bitcoin hover:text-bitcoin-gold font-semibold underline cursor-pointer"
              >
                browse local files
              </button>
            </p>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-muted font-mono">
            <FileSpreadsheet className="w-4 h-4 text-bitcoin-gold" />
            <span>Supports CSV, XLS, XLSX formats</span>
          </div>
        </div>

        {error && (
          <div id="loader-error" className="mt-4 flex items-center gap-2 p-3 bg-bitcoin-burnt/10 border border-bitcoin-burnt/30 rounded-xl text-bitcoin-burnt text-xs text-center font-mono">
            <AlertCircle className="w-4 h-4 shrink-0 text-bitcoin" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Structured Samples Selector */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-slate-300 font-semibold font-mono text-xs tracking-wider">
          <FolderOpen className="w-4 h-4 text-bitcoin-gold" />
          <span>OR PROCEED IMMEDIATELY WITH PROTOCOL TEMPLATES:</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {SAMPLE_DATASETS.map((sample, idx) => (
            <button
              key={idx}
              id={`btn-sample-dataset-${idx}`}
              onClick={() => selectSample(sample)}
              disabled={isLoading}
              className="flex flex-col items-start p-4 text-left bg-surface border border-white/5 hover:border-bitcoin/30 hover:bg-[#030304]/80 rounded-2xl transition-all duration-300 group cursor-pointer shadow-sm relative overflow-hidden"
            >
              {/* Subtle Corner Accents on Hover */}
              <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-bitcoin rounded-tl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-bitcoin rounded-br opacity-0 group-hover:opacity-100 transition-opacity" />

              <div className="flex items-center justify-between w-full mb-2">
                <span className="text-2xl">{sample.icon}</span>
                <span className="text-[10px] uppercase font-mono tracking-wider px-2 py-0.5 bg-[#030304] text-muted border border-white/5 rounded-full group-hover:bg-bitcoin/10 group-hover:border-bitcoin/35 group-hover:text-bitcoin-gold transition-all">
                  Load Node
                </span>
              </div>
              <h4 className="text-sm font-bold text-white group-hover:text-bitcoin transition-colors font-heading">
                {sample.name}
              </h4>
              <p className="text-xs text-muted mt-1 line-clamp-2 leading-relaxed">
                {sample.description}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
