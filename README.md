# DataLens AI Agent 🚀

DataLens AI is a user-friendly, generative AI web application that enables non-technical individuals to perform data analysis simply by uploading a file and chatting with an AI assistant. It integrates **FastAPI**, **LangGraph**, and **Gemini 2.0 Flash Lite** to write, execute, evaluate, and interpret Python logic dynamically.

## Features ✨

*   **Natural Language to Code:** Upload a `.csv` or `.xlsx` file and watch the AI write data visualization and statistical code right before your eyes based on simple text prompts.
*   **Intuitive Explanations:** The AI converts its own raw generated code results back into plain-language bullet points and readable metric summaries.
*   **Interactive Notebook Cells:** Generated code appears in modular blocks. You can edit the code natively inside the app using a CodeMirror IDE and trigger re-execution instantly.
*   **Auto Data Profiling & Visualization:** Any Chart built via `plotly.express` is detected immediately by the environment and is natively embedded and fully interactive.

---

## 🏗️ Project Architecture

*   **Frontend:** React 18, Vite, Zustand (State Management), React-Dropzone, Plotly.js, WebSockets.
*   **Backend:** FastAPI, Pandas, LangGraph (Agent State Management), Gemini API.

---

## 🏁 Quick Start Guide

### 1. Requirements
Ensure you have the following installed on your machine:
*   Python 3.12+ 
*   Node.js (v20+ recommended) & npm
*   A free Google Gemini API Key

### 2. Configure Environment Variables
Copy the placeholder environment block and enter your Google API key.
```bash
cp .env.example .env
```
Open `.env` in any text editor and populate your `GOOGLE_API_KEY`.

### 3. Start the Backend (FastAPI + LangGraph)
Open a new terminal window at the root of the project:
```bash
cd backend
# Create and activate a Virtual Environment if you haven't already:
# python3 -m venv venv
source venv/bin/activate

# Start the server (Port 8000)
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### 4. Start the Frontend (Vite/React)
Open a second terminal window at the root of the project:
```bash
cd frontend

# Install UI Dependencies
npm install

# Start Context (Port 5173)
npm run dev
```

---

## 📖 How to Use the App

1.  **Open the App**: Navigate to [http://localhost:5173](http://localhost:5173) in your browser.
2.  **Upload Data**: Drag and drop any Excel sheet or CSV (Make sure the headers are clear).
3.  **Chat**: Once uploaded, click "Start Analysis" or directly type "Show me the distribution of [Column Name]."
4.  **Observe**: A progress bar tracks the LangGraph Agent as it moves backward and forward between the Planner, Analyst, Executor, and Evaluator nodes.
5.  **Explore**:
    *   **Data Preview (Center):** View a slice of your raw data.
    *   **Notebook:** Modify the AI's generated code. Click **Run** on any block to rewrite the data or visualizations.
    *   **Visualizations (Right Side):** Fully hoverable and scalable charts that update automatically. 
