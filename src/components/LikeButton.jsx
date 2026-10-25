import React, { useState } from 'react';
import { Heart } from 'lucide-react';
import { postService } from '../services/postService';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export default function LikeButton({ postId, initialIsLiked = false, initialCount = 0, onLikeChange }) {
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [likeCount, setLikeCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleToggleLike = async (e) => {
    e.stopPropagation();

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (loading) return;

    // Optimistic update
    const previousIsLiked = isLiked;
    const previousCount = likeCount;

    const nextIsLiked = !isLiked;
    const nextCount = nextIsLiked ? previousCount + 1 : Math.max(0, previousCount - 1);

    setIsLiked(nextIsLiked);
    setLikeCount(nextCount);
    setLoading(true);

    try {
      if (nextIsLiked) {
        const res = await postService.likePost(postId);
        if (res.success && res.data) {
          setLikeCount(res.data.likeCount);
          if (onLikeChange) onLikeChange(true, res.data.likeCount);
        }
      } else {
        const res = await postService.unlikePost(postId);
        if (res.success && res.data) {
          setLikeCount(res.data.likeCount);
          if (onLikeChange) onLikeChange(false, res.data.likeCount);
        }
      }
    } catch (err) {
      console.error('Like toggle failed:', err.message);
      // Rollback on failure
      setIsLiked(previousIsLiked);
      setLikeCount(previousCount);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggleLike}
      disabled={loading}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.4rem',
        padding: '0.4rem 0.75rem',
        borderRadius: 'var(--radius-full)',
        color: isLiked ? '#ef4444' : 'var(--text-secondary)',
        backgroundColor: isLiked ? 'rgba(239, 68, 68, 0.08)' : 'transparent',
        fontSize: '0.85rem',
        fontWeight: '600',
        transition: 'all 0.15s ease'
      }}
      onMouseEnter={(e) => {
        if (!isLiked) {
          e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.08)';
          e.currentTarget.style.color = '#ef4444';
        }
      }}
      onMouseLeave={(e) => {
        if (!isLiked) {
          e.currentTarget.style.backgroundColor = 'transparent';
          e.currentTarget.style.color = 'var(--text-secondary)';
        }
      }}
      title={isLiked ? 'Unlike post' : 'Like post'}
    >
      <Heart
        size={18}
        fill={isLiked ? '#ef4444' : 'none'}
        strokeWidth={isLiked ? 0 : 2}
        style={{
          transition: 'transform 0.15s ease',
          transform: isLiked ? 'scale(1.1)' : 'scale(1)'
        }}
      />
      <span>{likeCount}</span>
    </button>
  );
}
