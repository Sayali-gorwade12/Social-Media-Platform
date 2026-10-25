import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Users } from 'lucide-react';
import UserCard from '../components/UserCard';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';
import { userService } from '../services/userService';

export default function FollowersPage() {
  const { username } = useParams();
  const navigate = useNavigate();
  const [followers, setFollowers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;
    async function fetchFollowers() {
      setLoading(true);
      setError('');
      try {
        const res = await userService.getUserFollowers(username);
        if (isMounted && res.success && res.data) {
          setFollowers(res.data.followers || []);
        }
      } catch (err) {
        if (isMounted) setError(err.message || 'Failed to fetch followers');
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchFollowers();
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
            Followers
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>@{username}</p>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner text="Loading followers..." />
      ) : error ? (
        <ErrorMessage message={error} />
      ) : followers.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No followers yet"
          description={`@${username} doesn't have any followers yet.`}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {followers.map((u) => (
            <UserCard
              key={u.id}
              user={u}
              onFollowChange={(newStatus) => {
                setFollowers((prev) =>
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
