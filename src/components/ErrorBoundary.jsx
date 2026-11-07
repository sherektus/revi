import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Revi ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleResetState = () => {
    try {
      localStorage.removeItem('revi_dashboard_config_v1');
    } catch {
      // ignore
    }
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          textAlign: 'center',
          background: '#F7F8F2',
          color: '#182B29',
          fontFamily: 'system-ui, sans-serif'
        }}>
          <div style={{
            maxWidth: '480px',
            background: '#ffffff',
            padding: '2rem',
            borderRadius: '16px',
            boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
            border: '1px solid #E2E8F0'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: '#FEE2E2',
              color: '#DC2626',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem'
            }}>
              <AlertTriangle size={24} />
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0 0 0.5rem' }}>
              Midagi läks ootamatult valesti
            </h2>
            <p style={{ fontSize: '0.9rem', color: '#64748B', lineHeight: 1.5, margin: '0 0 1.5rem' }}>
              Revi taastab lehe algseise ja värskendab töölaua andmed.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button
                type="button"
                onClick={this.handleReload}
                style={{
                  padding: '0.65rem 1.25rem',
                  borderRadius: '9999px',
                  border: 'none',
                  background: '#059669',
                  color: '#ffffff',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  cursor: 'pointer'
                }}
              >
                Laadi uuesti
              </button>
              <button
                type="button"
                onClick={this.handleResetState}
                style={{
                  padding: '0.65rem 1.25rem',
                  borderRadius: '9999px',
                  border: '1px solid #CBD5E1',
                  background: '#F8FAFC',
                  color: '#334155',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  cursor: 'pointer'
                }}
              >
                Taasta vaikeseaded
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
