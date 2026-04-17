/**
 * ErrorBoundary — catches React rendering errors and shows a fallback UI.
 */

import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('🚨 ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '2rem',
          textAlign: 'center',
          color: '#f87171',
          background: 'rgba(248,113,113,0.05)',
          borderRadius: '12px',
          margin: '1rem',
          border: '1px solid rgba(248,113,113,0.2)',
        }}>
          <h3 style={{ marginBottom: '0.5rem' }}>⚠️ Something went wrong</h3>
          <p style={{ color: '#9ca3af', fontSize: '0.9rem' }}>
            {this.props.fallbackMessage || 'This section encountered an error.'}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            style={{
              marginTop: '1rem',
              padding: '0.5rem 1rem',
              background: 'rgba(139,92,246,0.2)',
              border: '1px solid rgba(139,92,246,0.3)',
              borderRadius: '8px',
              color: '#c4b5fd',
              cursor: 'pointer',
            }}
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
