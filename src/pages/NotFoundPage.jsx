import React from 'react';
import { Link } from 'react-router-dom';
import { Globe2, Home } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div style={{
      textAlign: 'center',
      padding: '5rem 1.5rem',
      maxWidth: '500px',
      margin: '0 auto'
    }}>
      <div style={{
        width: '64px',
        height: '64px',
        borderRadius: '50%',
        backgroundColor: 'var(--primary-light)',
        color: 'var(--primary)',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '1.25rem'
      }}>
        <Globe2 size={32} />
      </div>
      <h1 style={{ fontSize: '3.5rem', fontWeight: '900', color: 'var(--primary)', lineHeight: 1 }}>
        404
      </h1>
      <h2 style={{ fontSize: '1.4rem', fontWeight: '800', marginTop: '0.75rem', marginBottom: '0.5rem' }}>
        Sphere Not Found
      </h2>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '2rem' }}>
        The page you are looking for doesn't exist or may have been moved.
      </p>
      <Link to="/" className="btn btn-primary" style={{ padding: '0.75rem 1.5rem' }}>
        <Home size={18} /> Return Home
      </Link>
    </div>
  );
}
