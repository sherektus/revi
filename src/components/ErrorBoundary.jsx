import React from 'react';
import { AlertTriangle, RotateCcw, Copy, Check, RefreshCw } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      copied: false,
      resetStage: 'idle'
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Revi ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleSoftReset = () => {
    try {
      // Clear navigation and dashboard view caches to safely return to home view
      const keysToClear = [
        'kordur_nav_state_v1',
        'revi_dashboard_config_v1',
        'kordur_last_session_v1'
      ];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && keysToClear.some((prefix) => k.includes(prefix))) {
          localStorage.removeItem(k);
        }
      }
    } catch {
      // ignore
    }
    window.location.href = window.location.origin + window.location.pathname;
  };

  handleHardReset = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch {
      // ignore
    }
    window.location.href = window.location.origin + window.location.pathname;
  };

  handleCopyError = () => {
    const errorText = [
      `Revi Error: ${this.state.error?.message || String(this.state.error)}`,
      `Stack: ${this.state.error?.stack || ''}`,
      `Component: ${this.state.errorInfo?.componentStack || ''}`,
      `URL: ${window.location.href}`,
      `UserAgent: ${navigator.userAgent}`
    ].join('\n\n');

    navigator.clipboard?.writeText(errorText).then(() => {
      this.setState({ copied: true });
      setTimeout(() => this.setState({ copied: false }), 2500);
    }).catch(() => {
      // fallback
    });
  };

  render() {
    if (this.state.hasError) {
      const errorMessage = this.state.error?.message || String(this.state.error || 'Tundmatu viga');
      const isEn = typeof navigator !== 'undefined' && (navigator.language || '').toLowerCase().startsWith('en');

      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1.5rem',
          textAlign: 'center',
          background: '#0D1412',
          color: '#E6ECE8',
          fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        }}>
          <div style={{
            maxWidth: '560px',
            width: '100%',
            background: '#131D1A',
            padding: '2.25rem 2rem',
            borderRadius: '20px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
            border: '1px solid rgba(255,255,255,0.08)'
          }}>
            <div style={{
              width: '52px',
              height: '52px',
              borderRadius: '50%',
              background: 'rgba(239, 68, 68, 0.15)',
              color: '#EF4444',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1.25rem',
              border: '1px solid rgba(239, 68, 68, 0.25)'
            }}>
              <AlertTriangle size={26} />
            </div>

            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, margin: '0 0 0.5rem', letterSpacing: '-0.02em', color: '#FFFFFF' }}>
              {isEn ? 'Something went wrong' : 'Midagi läks ootamatult valesti'}
            </h2>

            <p style={{ fontSize: '0.92rem', color: '#94A3B8', lineHeight: 1.5, margin: '0 0 1.25rem' }}>
              {isEn
                ? 'Revi caught an unexpected issue. You can reload the page or restore safe defaults.'
                : 'Revi peatas ootamatu süsteemivea. Saad lehe uuesti laadida või vahemälu taastada.'}
            </p>

            {/* Error details snippet */}
            <div style={{
              background: 'rgba(0,0,0,0.35)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '12px',
              padding: '0.85rem 1rem',
              textAlign: 'left',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.75rem'
            }}>
              <code style={{
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                fontSize: '0.82rem',
                color: '#FCA5A5',
                wordBreak: 'break-word',
                lineHeight: 1.4,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical'
              }}>
                {errorMessage}
              </code>

              <button
                type="button"
                onClick={this.handleCopyError}
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  color: '#CBD5E1',
                  borderRadius: '8px',
                  padding: '0.4rem 0.65rem',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  flexShrink: 0
                }}
                title={isEn ? 'Copy full error log' : 'Kopeeri kogu veateade'}
              >
                {this.state.copied ? <Check size={13} color="#10B981" /> : <Copy size={13} />}
                <span>{this.state.copied ? (isEn ? 'Copied' : 'Kopeeritud') : (isEn ? 'Copy' : 'Kopeeri')}</span>
              </button>
            </div>

            {/* Actions */}
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.75rem',
              justifyContent: 'center',
              marginBottom: '1.25rem'
            }}>
              <button
                type="button"
                onClick={this.handleReload}
                style={{
                  padding: '0.7rem 1.4rem',
                  borderRadius: '9999px',
                  border: 'none',
                  background: '#059669',
                  color: '#FFFFFF',
                  fontWeight: 600,
                  fontSize: '0.92rem',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  boxShadow: '0 4px 12px rgba(5,150,105,0.3)'
                }}
              >
                <RefreshCw size={15} />
                <span>{isEn ? 'Reload Page' : 'Laadi uuesti'}</span>
              </button>

              <button
                type="button"
                onClick={this.handleSoftReset}
                style={{
                  padding: '0.7rem 1.3rem',
                  borderRadius: '9999px',
                  border: '1px solid rgba(255,255,255,0.15)',
                  background: 'rgba(255,255,255,0.06)',
                  color: '#E2E8F0',
                  fontWeight: 600,
                  fontSize: '0.92rem',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem'
                }}
              >
                <RotateCcw size={15} />
                <span>{isEn ? 'Reset View' : 'Taasta avaleht'}</span>
              </button>
            </div>

            {/* Hard Reset fallback */}
            <div style={{
              borderTop: '1px solid rgba(255,255,255,0.06)',
              paddingTop: '1rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '0.8rem',
              color: '#64748B'
            }}>
              <span>{isEn ? 'Still not loading?' : 'Leht ei taastu ikka?'}</span>
              <button
                type="button"
                onClick={this.handleHardReset}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#EF4444',
                  textDecoration: 'underline',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  padding: '0.2rem'
                }}
              >
                {isEn ? 'Clear all cache & factory reset' : 'Tühjenda kogu vahemälu ja taasta tehaseseaded'}
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
