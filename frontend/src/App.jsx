/**
 * App — Main application layout with three-panel design.
 */

import { useEffect } from 'react';
import FileUpload from './components/FileUpload';
import DataPreview from './components/DataPreview';
import ChatPanel from './components/ChatPanel';
import NotebookView from './components/NotebookView';
import ChartPanel from './components/ChartPanel';
import useSessionStore from './stores/sessionStore';
import { wsService } from './services/websocket';
import { Sparkles } from 'lucide-react';

function App() {
  const fileId = useSessionStore((s) => s.fileId);
  const analysisResult = useSessionStore((s) => s.analysisResult);

  const setSessionId = useSessionStore((s) => s.setSessionId);
  const setAnalysisProgress = useSessionStore((s) => s.setAnalysisProgress);
  const setAnalysisResult = useSessionStore((s) => s.setAnalysisResult);

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
      setAnalysisResult(data);
    });

    return () => {
      unsubProgress();
      unsubResult();
      wsService.disconnect();
    };
  }, [setSessionId, setAnalysisProgress, setAnalysisResult]);

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
              <ChatPanel />
            </div>

            {/* Center panel — Data + Notebook */}
            <div className="panel panel-center">
              <DataPreview />
              <NotebookView />
            </div>

            {/* Right panel — Charts */}
            <div className="panel panel-right">
              <ChartPanel
                visualizations={analysisResult?.visualizations || []}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
