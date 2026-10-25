import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, Edit3 } from 'lucide-react';
import UserAvatar from './UserAvatar';
import FollowButton from './FollowButton';
import { useAuth } from '../hooks/useAuth';

function formatJoinedDate(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
}

export default function ProfileHeader({ profileUser, isOwnProfile, onFollowChange }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const coverStyle = {
    height: '180px',
    backgroundColor: 'var(--primary)',
    backgroundImage: profileUser.cover_url
      ? `url(${profileUser.cover_url})`
      : 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    position: 'relative'
  };

  return (
    <div className="card" style={{ overflow: 'hidden', marginBottom: '1.5rem' }}>
      {/* Cover Image */}
      <div style={coverStyle} />

      {/* Profile Details Container */}
      <div style={{ padding: '0 1.5rem 1.5rem', position: 'relative' }}>
        {/* Avatar overlapping cover */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          marginTop: '-48px',
          marginBottom: '1rem'
        }}>
          <div style={{
            border: '4px solid #ffffff',
            borderRadius: '50%',
            boxShadow: 'var(--shadow-md)',
            display: 'inline-block'
          }}>
            <UserAvatar user={profileUser} size={96} />
          </div>

          <div>
            {isOwnProfile ? (
              <Link to="/profile/edit" className="btn btn-outline btn-sm">
                <Edit3 size={15} /> Edit Profile
              </Link>
            ) : (
              <FollowButton
                userId={profileUser.id}
                initialIsFollowing={profileUser.is_following}
                onFollowChange={onFollowChange}
              />
            )}
          </div>
        </div>

        {/* User Names & Username */}
        <div style={{ marginBottom: '0.85rem' }}>
          <h1 style={{ fontSize: '1.45rem', fontWeight: '800', color: 'var(--text-primary)', lineHeight: '1.2' }}>
            {profileUser.name}
          </h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            @{profileUser.username}
          </p>
        </div>

        {/* Bio */}
        {profileUser.bio && (
          <p style={{
            fontSize: '0.95rem',
            color: 'var(--text-secondary)',
            marginBottom: '1rem',
            whiteSpace: 'pre-line',
            lineHeight: '1.6'
          }}>
            {profileUser.bio}
          </p>
        )}

        {/* Joined Date */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
          <Calendar size={15} />
          <span>Joined {formatJoinedDate(profileUser.created_at)}</span>
        </div>

        {/* Stats Row */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1.75rem',
          paddingTop: '0.85rem',
          borderTop: '1px solid var(--border-color)'
        }}>
          <div>
            <span style={{ fontWeight: '800', color: 'var(--text-primary)', fontSize: '1rem', marginRight: '0.35rem' }}>
              {profileUser.posts_count || 0}
            </span>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Posts</span>
          </div>

          <Link
            to={`/profile/${profileUser.username}/followers`}
            style={{ textDecoration: 'none' }}
          >
            <span style={{ fontWeight: '800', color: 'var(--text-primary)', fontSize: '1rem', marginRight: '0.35rem' }}>
              {profileUser.followers_count || 0}
            </span>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Followers</span>
          </Link>

          <Link
            to={`/profile/${profileUser.username}/following`}
            style={{ textDecoration: 'none' }}
          >
            <span style={{ fontWeight: '800', color: 'var(--text-primary)', fontSize: '1rem', marginRight: '0.35rem' }}>
              {profileUser.following_count || 0}
            </span>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Following</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
