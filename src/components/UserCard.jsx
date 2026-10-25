import React from 'react';
import { Link } from 'react-router-dom';
import UserAvatar from './UserAvatar';
import FollowButton from './FollowButton';

export default function UserCard({ user, onFollowChange }) {
  return (
    <div className="card" style={{ padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.85rem' }}>
      <Link
        to={`/profile/${user.username}`}
        style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flex: 1, minWidth: 0, textDecoration: 'none' }}
      >
        <UserAvatar user={user} size={46} />
        <div style={{ minWidth: 0, flex: 1 }}>
          <p style={{ fontWeight: '700', fontSize: '0.95rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {user.name}
          </p>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
            @{user.username}
          </p>
          {user.bio && (
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user.bio}
            </p>
          )}
        </div>
      </Link>

      <div style={{ flexShrink: 0 }}>
        <FollowButton
          userId={user.id}
          initialIsFollowing={user.is_following}
          size="sm"
          onFollowChange={onFollowChange}
        />
      </div>
    </div>
  );
}
