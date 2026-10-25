import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { userService } from '../services/userService';
import UserAvatar from './UserAvatar';
import FollowButton from './FollowButton';

export default function RightSidebar() {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function fetchSuggestions() {
      try {
        const res = await userService.getSuggestions();
        if (isMounted && res.success && res.data?.users) {
          setSuggestions(res.data.users.slice(0, 5));
        }
      } catch (err) {
        console.warn('Could not load suggestions:', err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchSuggestions();
    return () => { isMounted = false; };
  }, []);

  return (
    <aside style={{
      position: 'sticky',
      top: '5rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '1.25rem'
    }}>
      {/* Suggested Users Card */}
      <div className="card" style={{ padding: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.85rem' }}>
          <Sparkles size={18} style={{ color: 'var(--primary)' }} />
          <h3 style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--text-primary)' }}>
            Who to Follow
          </h3>
        </div>

        {loading ? (
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Finding people you might know...</p>
        ) : suggestions.length === 0 ? (
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No suggestions right now.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {suggestions.map((u) => (
              <div key={u.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                <Link
                  to={`/profile/${u.username}`}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', minWidth: 0, textDecoration: 'none' }}
                >
                  <UserAvatar user={u} size={36} />
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontWeight: '600', fontSize: '0.85rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {u.name}
                    </p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      @{u.username}
                    </p>
                  </div>
                </Link>
                <FollowButton
                  userId={u.id}
                  initialIsFollowing={u.is_following}
                  size="sm"
                  onFollowChange={(newStatus) => {
                    setSuggestions((prev) =>
                      prev.map((item) => (item.id === u.id ? { ...item, is_following: newStatus } : item))
                    );
                  }}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', padding: '0 0.5rem', lineHeight: '1.6' }}>
        <p>© 2026 ConnectSphere • CodeAlpha Task 2</p>
        <p>Built with React, Express & SQLite</p>
      </div>
    </aside>
  );
}
