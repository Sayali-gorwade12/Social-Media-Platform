import React, { useState } from 'react';
import { UserPlus, UserCheck, UserX } from 'lucide-react';
import { userService } from '../services/userService';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export default function FollowButton({ 
  userId, 
  initialIsFollowing = false, 
  size = 'md',
  onFollowChange 
}) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [isHovered, setIsHovered] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // If viewing self, don't show follow button
  if (user && user.id === userId) {
    return null;
  }

  const handleToggleFollow = async (e) => {
    e.stopPropagation();
    e.preventDefault();

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (loading) return;

    const previousStatus = isFollowing;
    const nextStatus = !isFollowing;

    setIsFollowing(nextStatus);
    setLoading(true);

    try {
      if (nextStatus) {
        const res = await userService.followUser(userId);
        if (res.success && res.data) {
          if (onFollowChange) onFollowChange(true, res.data.followersCount);
        }
      } else {
        const res = await userService.unfollowUser(userId);
        if (res.success && res.data) {
          if (onFollowChange) onFollowChange(false, res.data.followersCount);
        }
      }
    } catch (err) {
      console.error('Follow action failed:', err.message);
      setIsFollowing(previousStatus);
    } finally {
      setLoading(false);
    }
  };

  const isSmall = size === 'sm';

  if (isFollowing) {
    return (
      <button
        onClick={handleToggleFollow}
        disabled={loading}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="btn btn-outline"
        style={{
          padding: isSmall ? '0.35rem 0.75rem' : '0.5rem 1rem',
          fontSize: isSmall ? '0.8rem' : '0.88rem',
          borderRadius: 'var(--radius-full)',
          borderColor: isHovered ? 'var(--danger)' : 'var(--border-color)',
          color: isHovered ? 'var(--danger)' : 'var(--text-secondary)',
          backgroundColor: isHovered ? 'var(--danger-light)' : 'transparent'
        }}
        title={isHovered ? 'Unfollow' : 'Following'}
      >
        {isHovered ? (
          <>
            <UserX size={isSmall ? 14 : 16} /> Unfollow
          </>
        ) : (
          <>
            <UserCheck size={isSmall ? 14 : 16} /> Following
          </>
        )}
      </button>
    );
  }

  return (
    <button
      onClick={handleToggleFollow}
      disabled={loading}
      className="btn btn-primary"
      style={{
        padding: isSmall ? '0.35rem 0.75rem' : '0.5rem 1rem',
        fontSize: isSmall ? '0.8rem' : '0.88rem',
        borderRadius: 'var(--radius-full)'
      }}
      title="Follow user"
    >
      <UserPlus size={isSmall ? 14 : 16} /> Follow
    </button>
  );
}
