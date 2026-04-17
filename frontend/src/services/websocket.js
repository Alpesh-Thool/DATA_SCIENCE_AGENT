/**
 * WebSocket service — persistent connection for real-time updates.
 */

const WS_BASE = 'ws://localhost:8000/api/ws';

class WebSocketService {
  constructor() {
    this.ws = null;
    this.sessionId = null;
    this.listeners = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 10;
    this.reconnectDelay = 2000;
    this._pingInterval = null;
  }

  /** Connect to the WebSocket server. */
  connect(sessionId) {
    if (this.ws?.readyState === WebSocket.OPEN) return;

    this.sessionId = sessionId;
    this.ws = new WebSocket(`${WS_BASE}/${sessionId}`);

    this.ws.onopen = () => {
      console.log('🔌 WebSocket connected');
      this.reconnectAttempts = 0;
      this._emit('connected', {});
      // Start keepalive pings every 15 seconds
      this._startPing();
    };

    this.ws.onmessage = (event) => {
      try {
        const { event: eventType, data } = JSON.parse(event.data);
        this._emit(eventType, data);
      } catch (err) {
        console.error('WS parse error:', err);
      }
    };

    this.ws.onclose = () => {
      console.log('🔌 WebSocket disconnected');
      this._stopPing();
      this._emit('disconnected', {});
      this._tryReconnect();
    };

    this.ws.onerror = (err) => {
      console.error('WS error:', err);
    };
  }

  /** Disconnect from the server. */
  disconnect() {
    this._stopPing();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  /** Start keepalive pings to prevent timeout during long operations. */
  _startPing() {
    this._stopPing();
    this._pingInterval = setInterval(() => {
      this.send('ping', {});
    }, 15000); // Every 15 seconds
  }

  _stopPing() {
    if (this._pingInterval) {
      clearInterval(this._pingInterval);
      this._pingInterval = null;
    }
  }

  /** Send a typed event to the server. */
  send(event, data = {}) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ event, data }));
    }
  }

  /** Register an event listener. Returns an unsubscribe function. */
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);
    return () => this.listeners.get(event)?.delete(callback);
  }

  _emit(event, data) {
    this.listeners.get(event)?.forEach((cb) => cb(data));
  }

  _tryReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) return;
    this.reconnectAttempts++;
    const delay = this.reconnectDelay * this.reconnectAttempts;
    console.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})...`);
    setTimeout(() => this.connect(this.sessionId), delay);
  }
}

// Singleton
export const wsService = new WebSocketService();
