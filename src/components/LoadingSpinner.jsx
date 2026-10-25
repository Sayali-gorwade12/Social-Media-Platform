import React from 'react';
import { Loader2 } from 'lucide-react';

export default function LoadingSpinner({ text = 'Loading...', size = 24 }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2.5rem 1rem',
      gap: '0.75rem',
      color: 'var(--text-secondary)'
    }}>
      <Loader2 size={size} className="spinner-icon" style={{
        animation: 'spin 1s linear infinite',
        color: 'var(--primary)'
      }} />
      {text && <span style={{ fontSize: '0.9rem' }}>{text}</span>}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
