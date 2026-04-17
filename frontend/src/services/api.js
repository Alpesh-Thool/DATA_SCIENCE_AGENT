/**
 * API service — centralized HTTP client for the FastAPI backend.
 */

const API_BASE = '/api';

class ApiError extends Error {
  constructor(message, status, detail) {
    super(message);
    this.status = status;
    this.detail = detail;
  }
}

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ detail: response.statusText }));
    throw new ApiError(
      err.detail || 'Request failed',
      response.status,
      err
    );
  }

  return response.json();
}

/** Upload a CSV or Excel file. */
export async function uploadFile(file) {
  const formData = new FormData();
  formData.append('file', file);
  return request('/upload', { method: 'POST', body: formData });
}

/** Get paginated preview of an uploaded file. */
export async function getFilePreview(fileId, page = 1, pageSize = 50) {
  return request(`/files/${fileId}/preview?page=${page}&page_size=${pageSize}`);
}

/** Start an AI analysis on an uploaded file. */
export async function startAnalysis(fileId, userQuery = null, sessionId = null) {
  return request('/analysis/start', {
    method: 'POST',
    body: JSON.stringify({ file_id: fileId, user_query: userQuery, session_id: sessionId }),
  });
}

/** Get analysis task status. */
export async function getAnalysisStatus(taskId) {
  return request(`/analysis/${taskId}/status`);
}

/** Get full analysis result. */
export async function getAnalysisResult(taskId) {
  return request(`/analysis/${taskId}/result`);
}

/** Execute a code snippet. */
export async function executeCode(fileId, code, cellId = null) {
  return request('/execute', {
    method: 'POST',
    body: JSON.stringify({ file_id: fileId, code, cell_id: cellId }),
  });
}
