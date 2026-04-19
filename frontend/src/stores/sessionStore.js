/**
 * Session store — manages the current file, analysis state, and chat history.
 */

import { create } from 'zustand';

const useSessionStore = create((set, get) => ({
  // ── Session State ─────────────────────────────────────────
  sessionId: null,
  setSessionId: (id) => set({ sessionId: id }),

  // ── File State ──────────────────────────────────────────
  fileId: null,
  fileName: null,
  fileType: null,
  rowCount: 0,
  columnCount: 0,
  columns: [],
  preview: [],
  isUploading: false,
  uploadError: null,

  setUploadResult: (result) =>
    set({
      fileId: result.file_id,
      fileName: result.filename,
      fileType: result.file_type,
      rowCount: result.row_count,
      columnCount: result.column_count,
      columns: result.columns,
      preview: result.preview,
      isUploading: false,
      uploadError: null,
    }),

  setUploading: (val) => set({ isUploading: val, uploadError: null }),
  setUploadError: (err) => set({ isUploading: false, uploadError: err }),

  // ── Analysis State ──────────────────────────────────────
  analysisTaskId: null,
  analysisStatus: null, // pending | running | completed | failed
  analysisProgress: 0,
  analysisStep: null,
  analysisResult: null,

  setAnalysisStarted: (taskId) =>
    set({
      analysisTaskId: taskId,
      analysisStatus: 'pending',
      analysisProgress: 0,
      analysisStep: 'Starting analysis...',
      // Don't clear analysisResult here — keep showing previous results until new ones arrive
    }),

  setAnalysisProgress: ({ status, progress_percent, current_step }) =>
    set({
      analysisStatus: status,
      analysisProgress: progress_percent,
      analysisStep: current_step,
    }),

  setAnalysisResult: (result) =>
    set((state) => ({
      analysisResult: result,
      analysisStatus: 'completed',
      analysisProgress: 100,
      // Add the AI summary as a chat message so it appears in the conversation
      chatMessages: result?.summary
        ? [
            ...state.chatMessages,
            {
              role: 'assistant',
              content: result.summary,
            },
          ]
        : state.chatMessages,
    })),

  // ── Chat State ──────────────────────────────────────────
  chatMessages: [],
  addChatMessage: (msg) =>
    set((state) => ({
      chatMessages: [...state.chatMessages, msg],
    })),
  clearChat: () => set({ chatMessages: [] }),

  // ── Reset ───────────────────────────────────────────────
  reset: () =>
    set({
      fileId: null,
      fileName: null,
      fileType: null,
      rowCount: 0,
      columnCount: 0,
      columns: [],
      preview: [],
      isUploading: false,
      uploadError: null,
      analysisTaskId: null,
      analysisStatus: null,
      analysisProgress: 0,
      analysisStep: null,
      analysisResult: null,
      chatMessages: [],
    }),
}));

export default useSessionStore;
