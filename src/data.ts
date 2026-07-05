import { ParsedData } from "./types";

export const SAMPLE_DATASETS = [
  {
    name: "E-Commerce Global Sales",
    description: "Multi-region retail performance tracker containing Profit, Sales, and Segment metrics.",
    icon: "🛒",
    data: [
      { Date: "2026-01-01", Product: "Cloud Book Reader", Category: "Electronics", Region: "North America", Sales: 12000, Profit: 4200, ReturnRate: 0.02, Segment: "Consumer" },
      { Date: "2026-01-05", Product: "Flex Desk Stand", Category: "Office Supplies", Region: "Europe", Sales: 4500, Profit: 1500, ReturnRate: 0.01, Segment: "Corporate" },
      { Date: "2026-01-12", Product: "Active Noise ANC Pro", Category: "Electronics", Region: "Asia-Pacific", Sales: 18500, Profit: 6200, ReturnRate: 0.04, Segment: "Consumer" },
      { Date: "2026-02-01", Product: "Cloud Book Reader", Category: "Electronics", Region: "Europe", Sales: 15000, Profit: 5100, ReturnRate: 0.03, Segment: "Consumer" },
      { Date: "2026-02-08", Product: "Flex Desk Stand", Category: "Office Supplies", Region: "North America", Sales: 5200, Profit: 1900, ReturnRate: 0.01, Segment: "Corporate" },
      { Date: "2026-02-15", Product: "Ergonomic Mesh Chair", Category: "Furniture", Region: "North America", Sales: 24000, Profit: -3400, ReturnRate: 0.05, Segment: "Home Office" }, // Anomaly: Negative Profit
      { Date: "2026-02-22", Product: "Active Noise ANC Pro", Category: "Electronics", Region: "Europe", Sales: 21000, Profit: 7200, ReturnRate: 0.02, Segment: "Consumer" },
      { Date: "2026-03-01", Product: "Cloud Book Reader", Category: "Electronics", Region: "Asia-Pacific", Sales: 9000, Profit: 3000, ReturnRate: 0.05, Segment: "Consumer" }, // Sales dropped
      { Date: "2026-03-10", Product: "Ergonomic Mesh Chair", Category: "Furniture", Region: "Europe", Sales: 28000, Profit: 4500, ReturnRate: 0.02, Segment: "Corporate" },
      { Date: "2026-03-20", Product: "Smart Desk LED", Category: "Electronics", Region: "North America", Sales: 8000, Profit: 3200, ReturnRate: 0.01, Segment: "Home Office" }
    ]
  },
  {
    name: "SaaS App Growth & Churn",
    description: "Subscription intelligence tracking MRR, Daily Active Users, and Plans.",
    icon: "⚡",
    data: [
      { Month: "January", Plan: "Enterprise", Signups: 140, MRR: 45000, ChurnRate: 0.015, DAU: 8900, SupportTickets: 230 },
      { Month: "January", Plan: "Professional", Signups: 320, MRR: 24000, ChurnRate: 0.022, DAU: 14200, SupportTickets: 410 },
      { Month: "February", Plan: "Enterprise", Signups: 155, MRR: 49000, ChurnRate: 0.012, DAU: 9400, SupportTickets: 190 },
      { Month: "February", Plan: "Professional", Signups: 290, MRR: 21500, ChurnRate: 0.045, DAU: 13500, SupportTickets: 580 }, // Anomaly: Churn spike
      { Month: "March", Plan: "Enterprise", Signups: 175, MRR: 54000, ChurnRate: 0.014, DAU: 11200, SupportTickets: 210 },
      { Month: "March", Plan: "Professional", Signups: 410, MRR: 31000, ChurnRate: 0.019, DAU: 16800, SupportTickets: 390 }
    ]
  },
  {
    name: "Marketing Campaign ROI",
    description: "Performance metrics across ad channels outlining conversions, CTR, and spends.",
    icon: "🎯",
    data: [
      { Campaign: "Q1 Brand Awareness", Channel: "Social Ads", Spend: 12000, Impressions: 980000, Clicks: 24500, Conversions: 480 },
      { Campaign: "Q1 Tech Webinar", Channel: "Email Marketing", Spend: 1500, Impressions: 50000, Clicks: 8200, Conversions: 620 }, // High ROI
      { Campaign: "Q1 Product Launch", Channel: "Search Engine Ads", Spend: 25000, Impressions: 1200000, Clicks: 38000, Conversions: 1150 },
      { Campaign: "Q1 Retargeting", Channel: "Display Network", Spend: 8000, Impressions: 2400000, Clicks: 12000, Conversions: 190 }, // Low ROI anomaly
      { Campaign: "Q2 Growth Push", Channel: "Social Ads", Spend: 18000, Impressions: 1500000, Clicks: 41000, Conversions: 890 }
    ]
  }
];

export function getParsedStats(fileName: string, rawRows: any[]): ParsedData {
  if (!rawRows || rawRows.length === 0) {
    throw new Error("No recognizable rows of data.");
  }

  const columns = Object.keys(rawRows[0]);
  const rowCount = rawRows.length;

  const dataTypes: Record<string, string> = {};
  const summaryStats: Record<string, any> = {};

  columns.forEach((col) => {
    const sampleValues = rawRows
      .map((r) => r[col])
      .filter((v) => v !== undefined && v !== null && v !== "");

    const isNumeric = sampleValues.every((val) => !isNaN(Number(val)));
    const isDate =
      !isNumeric &&
      sampleValues.every((val) => {
        const dateParsed = Date.parse(val);
        return !isNaN(dateParsed) && isNaN(Number(val)) && typeof val === "string" && val.length > 5;
      });

    if (isNumeric && sampleValues.length > 0) {
      dataTypes[col] = "number";
      const nums = sampleValues.map((v) => Number(v));
      const sum = nums.reduce((a, b) => a + b, 0);
      const avg = sum / nums.length;
      const min = Math.min(...nums);
      const max = Math.max(...nums);

      summaryStats[col] = {
        total: sum,
        average: parseFloat(avg.toFixed(2)),
        minimum: min,
        maximum: max,
      };
    } else if (isDate) {
      dataTypes[col] = "date";
      summaryStats[col] = {
        earliest: sampleValues[0],
        latest: sampleValues[sampleValues.length - 1],
      };
    } else {
      dataTypes[col] = "string";
      const frequencies: Record<string, number> = {};
      sampleValues.forEach((val) => {
        const strVal = String(val);
        frequencies[strVal] = (frequencies[strVal] || 0) + 1;
      });

      const sortedFreq = Object.entries(frequencies).sort((a, b) => b[1] - a[1]);
      summaryStats[col] = {
        uniqueCount: Object.keys(frequencies).length,
        topValues: sortedFreq.slice(0, 4).map(([name, count]) => ({ name, count })),
      };
    }
  });

  return {
    fileName,
    rowCount,
    columns,
    dataTypes,
    summaryStats,
    previewRows: rawRows.slice(0, 5),
  };
}
