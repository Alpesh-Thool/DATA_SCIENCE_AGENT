/**
 * App — Main application layout with three-panel design.
 */

import { useEffect, useRef } from 'react';
import FileUpload from './components/FileUpload';
import DataPreview from './components/DataPreview';
import ChatPanel from './components/ChatPanel';
import NotebookView from './components/NotebookView';
import ChartPanel from './components/ChartPanel';
import ErrorBoundary from './components/ErrorBoundary';
import useSessionStore from './stores/sessionStore';
import useNotebookStore from './stores/notebookStore';
import { wsService } from './services/websocket';
import { getAnalysisResult } from './services/api';
import { Sparkles } from 'lucide-react';

function App() {
  const fileId = useSessionStore((s) => s.fileId);
  const analysisResult = useSessionStore((s) => s.analysisResult);
  const analysisTaskId = useSessionStore((s) => s.analysisTaskId);
  const analysisStatus = useSessionStore((s) => s.analysisStatus);

  const setSessionId = useSessionStore((s) => s.setSessionId);
  const setAnalysisProgress = useSessionStore((s) => s.setAnalysisProgress);
  const setAnalysisResult = useSessionStore((s) => s.setAnalysisResult);
  const addCells = useNotebookStore((s) => s.addCells);
  const clearCells = useNotebookStore((s) => s.clearCells);

  const pollRef = useRef(null);

  // Helper to process a received result
  const handleResult = (data) => {
    setAnalysisResult(data);
    if (data.code_snippets && data.code_snippets.length > 0) {
      clearCells();
      addCells(data.code_snippets);
    }
  };

  // Connect WebSocket on mount
  useEffect(() => {
    const sessionId = crypto.randomUUID();
    setSessionId(sessionId);
    wsService.connect(sessionId);

    // Listen to real-time events from the AI Agent
    const unsubProgress = wsService.on('analysis:progress', (data) => {
      setAnalysisProgress(data);
    });

    const unsubResult = wsService.on('analysis:result', (data) => {
      handleResult(data);
    });

    return () => {
      unsubProgress();
      unsubResult();
      wsService.disconnect();
    };
  }, [setSessionId, setAnalysisProgress, setAnalysisResult, addCells, clearCells]);

  // Polling fallback: if analysis is running, periodically check the HTTP endpoint
  // in case the WebSocket result event was missed during a reconnection
  useEffect(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }

    if (analysisTaskId && (analysisStatus === 'running' || analysisStatus === 'pending')) {
      pollRef.current = setInterval(async () => {
        try {
          const result = await getAnalysisResult(analysisTaskId);
          if (result && result.status === 'completed') {
            handleResult(result);
            clearInterval(pollRef.current);
            pollRef.current = null;
          }
        } catch {
          // Task not done yet or HTTP error — keep polling
        }
      }, 5000); // Poll every 5 seconds
    }

    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
  }, [analysisTaskId, analysisStatus]);

  return (
    <div className="app" id="app-root">
      {/* ── Header ─────────────────────────────────────────── */}
      <header className="app-header" id="app-header">
        <div className="header-brand">
          <Sparkles size={24} className="brand-icon" />
          <h1>DataLens AI</h1>
          <span className="version-badge">v0.1</span>
        </div>
        <p className="header-tagline">
          Upload your data. Get instant insights. No coding required.
        </p>
      </header>

      {/* ── Main Content ───────────────────────────────────── */}
      <main className="app-main">
        {!fileId ? (
          /* ── Upload View ──────────────────────────────────── */
          <div className="upload-view" id="upload-view">
            <div className="upload-hero">
              <h2>Start by uploading your data</h2>
              <p>
                Drop a CSV or Excel file and our AI will analyze it, generate
                visualizations, and suggest code — all in plain language.
              </p>
            </div>
            <FileUpload />
            <div className="feature-cards">
              <div className="feature-card">
                <span className="feature-emoji">📊</span>
                <h4>Auto Visualizations</h4>
                <p>Charts & graphs generated automatically from your data</p>
              </div>
              <div className="feature-card">
                <span className="feature-emoji">💬</span>
                <h4>Plain Language</h4>
                <p>Get summaries anyone can understand — no jargon</p>
              </div>
              <div className="feature-card">
                <span className="feature-emoji">🧪</span>
                <h4>Interactive Notebook</h4>
                <p>Run AI-generated code with one click</p>
              </div>
            </div>
          </div>
        ) : (
          /* ── Analysis View (3-panel layout) ───────────────── */
          <div className="analysis-view" id="analysis-view">
            {/* Left panel — Chat + Summary */}
            <div className="panel panel-left">
              <ErrorBoundary fallbackMessage="Chat panel encountered an error.">
                <ChatPanel />
              </ErrorBoundary>
            </div>

            {/* Center panel — Data + Notebook */}
            <div className="panel panel-center">
              <ErrorBoundary fallbackMessage="Data preview encountered an error.">
                <DataPreview />
              </ErrorBoundary>
              <ErrorBoundary fallbackMessage="Notebook encountered an error.">
                <NotebookView />
              </ErrorBoundary>
            </div>

            {/* Right panel — Charts */}
            <div className="panel panel-right">
              <ErrorBoundary fallbackMessage="Chart rendering encountered an error.">
                <ChartPanel
                  visualizations={analysisResult?.visualizations || []}
                />
              </ErrorBoundary>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
