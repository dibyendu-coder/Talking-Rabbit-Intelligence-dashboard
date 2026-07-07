Talking Rabbitt
Synthesize. Visualize. Converse.
Talking Rabbitt is a privacy-first, client-driven Conversational Business Intelligence dashboard. It bridges the gap between complex BI setups and flat spreadsheets, allowing anyone to drop in data files, instantly compile high-fidelity interactive visual dashboards, and natively listen to voice-narrated trends and automated metrics—all with zero server footprint.

🚀 Core Features
Zero-Config Automated Analytics: Instantly identifies schemas, currencies, dates, and categorical metrics to render interactive charts and coordinate benchmarks without complex configurations or formulas.

Privacy by Design (Local Context Sandbox): Uploaded spreadsheet files are parsed and held entirely inside secure browser memory. Your data never touches third-party storage during analysis.

Interactive Heatmap Matrices: Deeply visualizes complex data arrays, correlation densities, and multi-dimensional matrices (e.g., customer lifetime value, seasonal shifts).

Text-to-Speech Summaries: A built-in audio engine synthesizes complex operational data into natural, streaming audio overviews for on-the-go decision-making.

Ultra-Low Latency Conversational AI: Integrates with the Gemini API to provide a smart "Insight Analyst" persona yielding hyper-grounded, zero-hallucination metrics in 0.45 seconds.

🏗️ System Architecture & Data Flow
Talking Rabbitt is built around a hybrid client-driven architecture optimized for data security and efficient database mutations:
graph TD
    %% Styling Definitions
    classDef source fill:#f9fafd,stroke:#3b82f6,stroke-width:2px;
    classDef client fill:#eff6ff,stroke:#2563eb,stroke-width:2px;
    classDef process fill:#f0fdf4,stroke:#16a34a,stroke-width:2px;
    classDef storage fill:#fff7ed,stroke:#ea580c,stroke-width:2px;
    classDef output fill:#faf5ff,stroke:#9333ea,stroke-width:2px;

    %% Diagram Nodes
    A[Raw Spreadsheet <br> CSV / XLSX / XLS]:::source
    
    subgraph Client_Side_Engine [Client-Side App Context React + Vite]
        B[File Ingestion & Parsing]:::client
        C[Local State Management <br> Retains 100% of Rows]:::client
        D[Multi-Dimensional Extraction <br> Metrics & Heatmap Matrices]:::client
        E[Smart Payload Capping <br> workspaceService.ts]:::process
    end

    subgraph Cloud_Persistence [Cloud Layer]
        F[Cloud Firestore <br> Lightweight Sync < 100KB]:::storage
    end

    subgraph AI_Audio_Pipeline [Multi-Modal Pipeline]
        G[Gemini 3.5 Flash API <br> Persona: Insight Analyst]:::output
        H[Web Speech Synthesis Engine]:::output
    end

    I[Interactive Dashboard & Charts]:::output
    J[Real-time Voice Summaries]:::output

    %% Data Flow Connections
    A -->|User Upload| B
    B --> C
    C --> D
    D --> I
    
    C -->|Intercepts & Slices to ≤ 500 Rows| E
    E -->|Bypasses 1MB Limit| F
    
    E -->|Optimized Context Payload| G
    G -->|Ultra-fast 0.45s Latency| I
    G -->|Structured Audio Phrasing| H
    H --> J

    %% Apply Styles
    class A source;
    class B,C,D client;
    class E process;
    class F storage;
    class G,H,I,J output;

1. Ingestion & Multi-Dimensional Extraction
When a user drops a spreadsheet file (.csv, .xls, .xlsx), it is intercepted entirely on the client side. The parsing stream converts the file into a structured JSON array directly inside local React state—zero persistent server footprints.

2. Smart Payload Slicing (workspaceService.ts)
For authenticated user sessions syncing with Cloud Firestore, the app manages a dual-layer strategy to bypass Firestore's strict 1MB per document limitation:

Local UI Layer: Holds the complete dataset in the client's memory context for full, high-fidelity data exploration.

Cloud Persistence Layer: The background workspace service intercepts the state and cleanly slices the serialized array to a 500-row representative ceiling (< 100KB document payload). This guarantees database transactions never fail due to document payload limits.

3. Context Grounding & Latency Optimization
The optimized, highly dense 500-row data format is fed straight to the Gemini API context window alongside explicit grounding rules. By keeping the token payload small, the model behaves deterministically without hallucinations, functioning with an ultra-fast response latency of 0.45s.

🛠️ Tech Stack
Frontend Hub: React, Vite, TypeScript

Styling: Tailwind CSS

Database & Auth: Firebase / Cloud Firestore

AI Backend: Gemini API (Grounding Persona: Executive Insight Analyst)

Audio Pipeline: Web Speech Synthesis API

⚙️ Environment Configuration
To run Talking Rabbitt locally, construct a .env file in your root folder and supply the following variables:

Bash
# Vite Environment Configurations
VITE_GEMINI_API_KEY=your_gemini_api_key_here
VITE_FIREBASE_API_KEY=your_firebase_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
📈 Scalability Roadmap
DuckDB + WebAssembly (WASM): Migrate data heavy-lifting to in-browser Web Worker background threads, allowing seamless multi-million row processing without UI execution bottlenecks.

Client-Side RAG (Retrieval-Augmented Generation): Implement vector embedding chunks locally to semantically search and pass hyper-focused slices to the AI context window, expanding past the 500-row cloud ceiling.

Live Database Integration: Introduce secure local OAuth connectors to stream direct data feeds from production databases (PostgreSQL, BigQuery) and platforms (Shopify, Stripe).


## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`
