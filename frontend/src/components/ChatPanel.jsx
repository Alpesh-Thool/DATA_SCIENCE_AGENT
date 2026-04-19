/**
 * ChatPanel — AI summary and conversational chat interface.
 */

import { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Bot, User } from 'lucide-react';
import useSessionStore from '../stores/sessionStore';
import { startAnalysis } from '../services/api';

export default function ChatPanel() {
  const {
    sessionId,
    fileId,
    fileName,
    analysisStatus,
    analysisStep,
    analysisProgress,
    analysisResult,
    chatMessages,
    addChatMessage,
    setAnalysisStarted,
  } = useSessionStore();

  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, analysisResult]);

  const handleAnalyze = async () => {
    if (!fileId) return;
    try {
      addChatMessage({
        role: 'user',
        content: `Analyze the uploaded file "${fileName}"`,
      });
      const result = await startAnalysis(fileId, null, sessionId);
      setAnalysisStarted(result.task_id);
      addChatMessage({
        role: 'assistant',
        content: result.message || 'Analysis has been queued. Results will appear soon!',
      });
    } catch (err) {
      addChatMessage({
        role: 'assistant',
        content: `⚠️ Error starting analysis: ${err.message}`,
      });
    }
  };

  const handleSend = async () => {
    if (!input.trim() || !fileId) return;
    
    // Optimistically add user message
    addChatMessage({ role: 'user', content: input });
    const query = input;
    setInput('');
    
    try {
      const result = await startAnalysis(fileId, query, sessionId);
      setAnalysisStarted(result.task_id);
    } catch (err) {
      addChatMessage({
        role: 'assistant',
        content: `⚠️ Error starting analysis: ${err.message}`,
      });
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="chat-panel" id="chat-panel">
      <div className="chat-header">
        <h3>
          <Sparkles size={18} />
          AI Assistant
        </h3>
      </div>

      <div className="chat-messages">
        {/* Welcome message */}
        {chatMessages.length === 0 && (
          <div className="chat-welcome">
            <Bot size={32} className="welcome-icon" />
            <p>Upload a file and I'll help you understand your data!</p>
            {fileId && (
              <button className="btn-primary" onClick={handleAnalyze} id="analyze-btn">
                <Sparkles size={16} />
                Analyze {fileName}
              </button>
            )}
          </div>
        )}

        {/* Messages */}
        {chatMessages.map((msg, idx) => (
          <div key={idx} className={`chat-message ${msg.role}`}>
            <div className="message-avatar">
              {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
            </div>
            <div className="message-content">
              <p>{msg.content}</p>
            </div>
          </div>
        ))}

        {/* Analysis progress */}
        {analysisStatus === 'running' && (
          <div className="analysis-progress">
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${analysisProgress}%` }}
              />
            </div>
            <span className="progress-step">{analysisStep}</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="chat-input-area">
        {fileId && chatMessages.length === 0 && (
          <button className="btn-primary analyze-inline" onClick={handleAnalyze} id="analyze-btn-inline">
            <Sparkles size={16} />
            Start Analysis
          </button>
        )}
        <div className="chat-input-wrapper">
          <textarea
            className="chat-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question about your data..."
            rows={1}
            id="chat-input"
          />
          <button
            className="send-btn"
            onClick={handleSend}
            disabled={!input.trim()}
            id="send-btn"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
