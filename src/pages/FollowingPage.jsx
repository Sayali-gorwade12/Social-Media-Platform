import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Users } from 'lucide-react';
import UserCard from '../components/UserCard';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';
import { userService } from '../services/userService';

export default function FollowingPage() {
  const { username } = useParams();
  const navigate = useNavigate();
  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;
    async function fetchFollowing() {
      setLoading(true);
      setError('');
      try {
        const res = await userService.getUserFollowing(username);
        if (isMounted && res.success && res.data) {
          setFollowing(res.data.following || []);
        }
      } catch (err) {
        if (isMounted) setError(err.message || 'Failed to fetch followed users');
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchFollowing();
    return () => { isMounted = false; };
  }, [username]);

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
        <button onClick={() => navigate(`/profile/${username}`)} className="btn btn-outline btn-sm">
          <ArrowLeft size={16} /> Profile
        </button>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-primary)' }}>
            Following
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>@{username}</p>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner text="Loading followed users..." />
      ) : error ? (
        <ErrorMessage message={error} />
      ) : following.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Not following anyone yet"
          description={`@${username} hasn't followed any users yet.`}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {following.map((u) => (
            <UserCard
              key={u.id}
              user={u}
              onFollowChange={(newStatus) => {
                setFollowing((prev) =>
                  prev.map((item) => (item.id === u.id ? { ...item, is_following: newStatus } : item))
                );
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
