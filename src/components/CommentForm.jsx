import React, { useState } from 'react';
import { Send } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import UserAvatar from './UserAvatar';
import { commentService } from '../services/commentService';

export default function CommentForm({ postId, onCommentAdded }) {
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <div style={{
        padding: '0.75rem 1rem',
        backgroundColor: 'var(--bg-tertiary)',
        borderRadius: 'var(--radius-md)',
        textAlign: 'center',
        fontSize: '0.85rem',
        color: 'var(--text-secondary)'
      }}>
        Please <a href="/login" style={{ color: 'var(--primary)', fontWeight: '600' }}>log in</a> to leave a comment.
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = content.trim();
    if (!trimmed) return;

    setSubmitting(true);
    setError('');

    try {
      const res = await commentService.addComment(postId, trimmed);
      if (res.success && res.data?.comment) {
        setContent('');
        if (onCommentAdded) {
          onCommentAdded(res.data.comment);
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to post comment');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: '0.75rem' }}>
      <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'flex-start' }}>
        <UserAvatar user={user} size={32} />
        <div style={{ flex: 1, position: 'relative' }}>
          <input
            type="text"
            placeholder="Write a comment..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={submitting}
            style={{
              width: '100%',
              padding: '0.55rem 2.5rem 0.55rem 0.85rem',
              borderRadius: 'var(--radius-full)',
              border: '1px solid var(--border-color)',
              backgroundColor: 'var(--bg-secondary)',
              fontSize: '0.88rem',
              color: 'var(--text-primary)',
              outline: 'none'
            }}
            onFocus={(e) => {
              e.target.style.backgroundColor = '#ffffff';
              e.target.style.borderColor = 'var(--primary)';
            }}
            onBlur={(e) => {
              e.target.style.backgroundColor = 'var(--bg-secondary)';
              e.target.style.borderColor = 'var(--border-color)';
            }}
          />
          <button
            type="submit"
            disabled={!content.trim() || submitting}
            style={{
              position: 'absolute',
              right: '6px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              backgroundColor: content.trim() ? 'var(--primary)' : 'transparent',
              color: content.trim() ? '#ffffff' : 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s ease'
            }}
            title="Post comment"
          >
            <Send size={14} />
          </button>
        </div>
      </div>
      {error && (
        <p style={{ color: 'var(--danger)', fontSize: '0.8rem', marginTop: '0.3rem', marginLeft: '2.7rem' }}>
          {error}
        </p>
      )}
    </form>
  );
}
