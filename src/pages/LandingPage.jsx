import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Globe2, Users, MessageSquare, ShieldCheck, Sparkles, ArrowRight } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export default function LandingPage() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/feed" replace />;
  }

  return (
    <div style={{ backgroundColor: '#ffffff', minHeight: 'calc(100vh - 70px)' }}>
      {/* Hero Section */}
      <section style={{
        maxWidth: '1100px',
        margin: '0 auto',
        padding: '5rem 1.5rem 4rem',
        textAlign: 'center'
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.4rem 1rem',
          borderRadius: 'var(--radius-full)',
          backgroundColor: 'var(--primary-light)',
          color: 'var(--primary)',
          fontSize: '0.85rem',
          fontWeight: '700',
          marginBottom: '1.75rem'
        }}>
          <Sparkles size={16} /> Welcome to the Next-Gen Social Experience
        </div>

        <h1 style={{
          fontSize: 'clamp(2.5rem, 6vw, 4rem)',
          fontWeight: '900',
          letterSpacing: '-0.03em',
          color: 'var(--text-primary)',
          lineHeight: '1.15',
          marginBottom: '1.5rem'
        }}>
          Connect with your sphere.<br />
          <span style={{ color: 'var(--primary)' }}>Share your world.</span>
        </h1>

        <p style={{
          fontSize: 'clamp(1rem, 2vw, 1.25rem)',
          color: 'var(--text-secondary)',
          maxWidth: '680px',
          margin: '0 auto 2.5rem',
          lineHeight: '1.6'
        }}>
          ConnectSphere brings creators, developers, and thinkers together in a clean, distraction-free space. Join real discussions, follow inspiring voices, and expand your network.
        </p>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link
            to="/register"
            className="btn btn-primary"
            style={{ padding: '0.85rem 2rem', fontSize: '1rem', borderRadius: 'var(--radius-full)' }}
          >
            Create Your Account <ArrowRight size={18} />
          </Link>
          <Link
            to="/login"
            className="btn btn-outline"
            style={{ padding: '0.85rem 2rem', fontSize: '1rem', borderRadius: 'var(--radius-full)' }}
          >
            Log In to Sphere
          </Link>
        </div>

        {/* Hero image preview mock */}
        <div style={{
          marginTop: '3.5rem',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.12)',
          border: '1px solid var(--border-color)',
          maxHeight: '480px'
        }}>
          <img
            src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&auto=format&fit=crop&q=80"
            alt="ConnectSphere Platform preview"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
      </section>

      {/* Feature Grid */}
      <section style={{ backgroundColor: 'var(--bg-secondary)', padding: '5rem 1.5rem' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
              Why People Love ConnectSphere
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
              Designed from the ground up for speed, privacy, and meaningful interactions.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.75rem'
          }}>
            <div className="card" style={{ padding: '2rem' }}>
              <div style={{
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                backgroundColor: 'var(--primary-light)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.25rem'
              }}>
                <MessageSquare size={24} />
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: '700', marginBottom: '0.5rem' }}>
                Real-Time Conversations
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: '1.6' }}>
                Publish rich posts with text and image URLs. Engage in instant threaded comments and react with live like feedback.
              </p>
            </div>

            <div className="card" style={{ padding: '2rem' }}>
              <div style={{
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                backgroundColor: 'var(--primary-light)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.25rem'
              }}>
                <Users size={24} />
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: '700', marginBottom: '0.5rem' }}>
                Personalized Feeds
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: '1.6' }}>
                Toggle effortlessly between a global discovery feed and a curated following stream featuring the voices you care about.
              </p>
            </div>

            <div className="card" style={{ padding: '2rem' }}>
              <div style={{
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                backgroundColor: 'var(--primary-light)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.25rem'
              }}>
                <ShieldCheck size={24} />
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: '700', marginBottom: '0.5rem' }}>
                Rock-Solid Architecture
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: '1.6' }}>
                Built on persistent SQLite with foreign-key enforcement, bcrypt password hashing, and verified Express security middleware.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
