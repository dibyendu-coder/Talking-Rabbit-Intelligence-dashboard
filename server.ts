import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: "50mb" }));

// Lazy initializer for Gemini client
function getGeminiClient(customKey?: string) {
  const key = customKey || process.env.GEMINI_API_KEY;
  if (!key) {
    throw new Error("GEMINI_API_KEY is not configured. Please add it via the Settings > Secrets panel or provide your own API key.");
  }
  return new GoogleGenAI({
    apiKey: key,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// System instructions for the talking dashboard analytical agent
const DASHBOARD_SYSTEM_PROMPT = `
You are the Chief Data Officer and AI Analytics Agent of an interactive "Talking Dashboard".
Your job is to act as a world-class business intelligence expert. You analyze dataset structures and subsets, perform conversational analytics, generate beautiful charts, detect anomalies, formulate tactical recommendations, and generate natural conversational responses.

You must respond STRICTLY with a valid JSON object matching the requested schema. Do not wrap the JSON in markdown code blocks like \`\`\`json. Return raw JSON text.

Your response must include:
1. "answer": A natural, conversational voice-optimized reply that explains the metrics, insights, and answers the query. It should be concise and direct so it is easy to read out loud. Avoid complex markdown formatting in this specific field (no asterisks, hash signs, or tables), because this field is read aloud by the Text-to-Speech engine. Keep it extremely engaging!
2. "chartConfig": Configuration for visual representations. Choose the most appropriate chartType ("bar", "line", "pie", "area", or "none"). 
   CRITICAL CRITERION: If the user's query asks for a chart, comparison, trend, distribution, rate, or breakdown, you MUST choose a visual chartType ("bar", "line", "pie", "area") and must NOT return "none". Calculate and aggregate the data from the raw records provided to populate the chart's data property.
3. "insights": 3-4 deep analytical insights highlighting positive trends, negative trends, anomalies, or underperforming items.
4. "recommendations": 3 practical recommendations with details, suggested offers or interventions, and estimated business impact.
5. "forecast": Simple 3-period predictive projections based on trends.
6. "kpis": 3-4 core metrics calculated or estimated (e.g. Total Revenue, Average Order Value, Conversion Rate, Growth Rate) with current values, changes, and statuses ("up" or "down").
`;

// API endpoint for analyzing data and queries
app.post("/api/analyze", async (req, res) => {
  try {
    const { query, datasetSummary, rawData = [], history = [], isInitial = false } = req.body;
    const customApiKey = req.headers["x-custom-api-key"] as string | undefined;

    const ai = getGeminiClient(customApiKey);

    let userPrompt = "";
    if (isInitial) {
      userPrompt = `Perform an initial auto-discovery analysis on this dataset. Detect key trends, anomalies, top-performing dimensions, underperforming areas, and compile standard KPIs. 
Dataset metadata & summary stats:
${JSON.stringify(datasetSummary, null, 2)}

Row-level raw records (sample or complete):
${JSON.stringify(rawData, null, 2)}

Provide your response in JSON matching the specified schema. Choose the most exciting visual chart to represent the dataset's main story.`;
    } else {
      userPrompt = `The user is asking the following query: "${query}"
Analyze the query in relation to this dataset's structure, statistics, and actual raw records.
Dataset metadata & summary stats:
${JSON.stringify(datasetSummary, null, 2)}

Row-level raw records (essential: compute aggregates, group, filter, or calculate rates using these records to build the dynamic chart):
${JSON.stringify(rawData, null, 2)}

Chat history for context:
${JSON.stringify(history, null, 2)}

Formulate a concise conversational answer, prepare a curated small aggregated dataset (max 12 items) specifically for a chart to visualize the answer, generate insights, recommendations, and update the KPIs if relevant.`;
    }

    let response;
    let usedModel = "gemini-3.5-flash";
    const requestConfig = {
      systemInstruction: DASHBOARD_SYSTEM_PROMPT,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        required: ["answer", "chartConfig", "insights", "recommendations", "forecast", "kpis"],
        properties: {
          answer: {
            type: Type.STRING,
            description: "Clear, conversational voice-optimized response to the user's question. No asterisks, markdown syntax or tables.",
          },
          chartConfig: {
            type: Type.OBJECT,
            required: ["chartType", "title", "xAxisKey", "yAxisKey", "data", "explanation"],
            properties: {
              chartType: {
                type: Type.STRING,
                description: "Must be one of 'bar', 'line', 'pie', 'area', or 'none'. Select none ONLY for plain textual greetings with zero data involved.",
              },
              title: { type: Type.STRING, description: "Title of the chart" },
              xAxisKey: { type: Type.STRING, description: "Exact label or category name for x-axis (e.g., 'Product Type' or 'Month')." },
              yAxisKey: { type: Type.STRING, description: "Exact label or metric name for y-axis (e.g., 'Total Net Sales' or 'Churn Rate')." },
              data: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  description: "Data points to plot. Each object MUST contain 'xValue' and 'yValue' properties.",
                  required: ["xValue", "yValue"],
                  properties: {
                    xValue: {
                      type: Type.STRING,
                      description: "The category, label, or date for the x-axis (e.g., 'Electronics', 'January').",
                    },
                    yValue: {
                      type: Type.NUMBER,
                      description: "The numeric metric value for the y-axis (e.g., 12000, 0.04).",
                    },
                  },
                },
              },
              explanation: { type: Type.STRING, description: "Why this chart fits" },
            },
          },
          insights: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              required: ["type", "text"],
              properties: {
                type: { type: Type.STRING, description: "Must be 'trend', 'anomaly', 'positive', or 'negative'" },
                text: { type: Type.STRING, description: "Descriptive insight" },
              },
            },
          },
          recommendations: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              required: ["action", "details", "impact"],
              properties: {
                action: { type: Type.STRING, description: "Title of recommendation" },
                details: { type: Type.STRING, description: "In-depth steps to execute" },
                impact: { type: Type.STRING, description: "High, Medium, or Low" },
              },
            },
          },
          forecast: {
            type: Type.OBJECT,
            required: ["metric", "values"],
            properties: {
              metric: { type: Type.STRING, description: "The metric being projected" },
              values: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    period: { type: Type.STRING, description: "Future period label (e.g. Next Month)" },
                    value: { type: Type.NUMBER, description: "Forecasted value" },
                  },
                },
              },
            },
          },
          kpis: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              required: ["label", "value", "change", "status"],
              properties: {
                label: { type: Type.STRING, description: "KPI Name (e.g., Sales, ROI, conversion)" },
                value: { type: Type.STRING, description: "Formatted value (e.g., $120,400 or 15.4%)" },
                change: { type: Type.STRING, description: "Change statement (e.g. +12% MoM)" },
                status: { type: Type.STRING, description: "up or down" },
              },
            },
          },
        },
      },
    };

    try {
      response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: userPrompt,
        config: requestConfig,
      });
    } catch (primaryError: any) {
      const errorStr = String(primaryError?.message || primaryError || "").toLowerCase();
      const isQuotaError = errorStr.includes("429") || errorStr.includes("resource_exhausted") || errorStr.includes("quota") || errorStr.includes("limit exceeded");
      
      if (isQuotaError) {
        console.warn("Primary model gemini-3.5-flash quota exceeded or rate-limited. Falling back to gemini-3.1-flash-lite...");
        try {
          usedModel = "gemini-3.1-flash-lite";
          response = await ai.models.generateContent({
            model: "gemini-3.1-flash-lite",
            contents: userPrompt,
            config: requestConfig,
          });
        } catch (fallbackError: any) {
          console.error("Fallback model gemini-3.1-flash-lite also failed:", fallbackError);
          throw primaryError; // Re-throw primary quota error to propagate nicely
        }
      } else {
        throw primaryError;
      }
    }
 
    const text = response.text;
    if (!text) {
      throw new Error(`No response text returned from Gemini API using model ${usedModel}`);
    }
 
    res.json(JSON.parse(text));
  } catch (error: any) {
    console.error("Error analyzing dashboard request:", error);
    const errorStr = String(error?.message || error || "").toLowerCase();
    const isQuotaError = errorStr.includes("429") || errorStr.includes("resource_exhausted") || errorStr.includes("quota") || errorStr.includes("limit exceeded");
    
    if (isQuotaError) {
      res.status(429).json({
        error: "Gemini API free-tier quota has been fully exhausted. Click below to instantly activate the high-quota Paid Model Flow, or wait for your daily limit to reset.",
        isQuotaExceeded: true,
      });
    } else {
      res.status(500).json({
        error: error.message || "An error occurred during data analysis.",
      });
    }
  }
});

// Configure Vite or Static files serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
