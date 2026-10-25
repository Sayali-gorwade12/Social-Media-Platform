import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function ErrorMessage({ message = 'Something went wrong', onRetry }) {
  return (
    <div style={{
      padding: '1.25rem',
      backgroundColor: 'var(--danger-light)',
      border: '1px solid rgba(239, 68, 68, 0.2)',
      borderRadius: 'var(--radius-md)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '1rem',
      margin: '1rem 0',
      color: 'var(--danger)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
        <AlertCircle size={20} style={{ flexShrink: 0 }} />
        <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>{message}</span>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="btn btn-sm btn-danger"
          style={{ whiteSpace: 'nowrap' }}
        >
          <RefreshCw size={14} /> Retry
        </button>
      )}
    </div>
  );
}
