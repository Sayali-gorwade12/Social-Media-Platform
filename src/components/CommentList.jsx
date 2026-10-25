import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Edit2, Trash2, Check, X } from 'lucide-react';
import UserAvatar from './UserAvatar';
import { commentService } from '../services/commentService';
import { useAuth } from '../hooks/useAuth';

function formatDate(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const diffSec = Math.floor((now - date) / 1000);

  if (diffSec < 60) return 'just now';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  if (diffSec < 604800) return `${Math.floor(diffSec / 86400)}d ago`;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export default function CommentList({ comments = [], onCommentUpdated, onCommentDeleted }) {
  const { user } = useAuth();
  const [editingId, setEditingId] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleStartEdit = (comment) => {
    setEditingId(comment.id);
    setEditContent(comment.content);
    setError('');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditContent('');
    setError('');
  };

  const handleSaveEdit = async (commentId) => {
    const trimmed = editContent.trim();
    if (!trimmed) return;

    setSubmitting(true);
    setError('');

    try {
      const res = await commentService.updateComment(commentId, trimmed);
      if (res.success && res.data?.comment) {
        if (onCommentUpdated) {
          onCommentUpdated(res.data.comment);
        }
        setEditingId(null);
      }
    } catch (err) {
      setError(err.message || 'Failed to update comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;

    try {
      const res = await commentService.deleteComment(commentId);
      if (res.success) {
        if (onCommentDeleted) {
          onCommentDeleted(commentId);
        }
      }
    } catch (err) {
      alert(err.message || 'Failed to delete comment');
    }
  };

  if (!comments || comments.length === 0) {
    return (
      <p style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)', padding: '1rem 0' }}>
        No comments yet. Be the first to share your thoughts!
      </p>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginTop: '0.75rem' }}>
      {comments.map((comment) => {
        const isAuthor = user && user.id === comment.author.id;
        const isEditing = editingId === comment.id;

        return (
          <div key={comment.id} style={{ display: 'flex', gap: '0.65rem', alignItems: 'flex-start' }}>
            <Link to={`/profile/${comment.author.username}`}>
              <UserAvatar user={comment.author} size={30} />
            </Link>

            <div style={{
              flex: 1,
              backgroundColor: 'var(--bg-secondary)',
              borderRadius: 'var(--radius-md)',
              padding: '0.65rem 0.85rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                  <Link
                    to={`/profile/${comment.author.username}`}
                    style={{ fontWeight: '700', fontSize: '0.82rem', color: 'var(--text-primary)' }}
                  >
                    {comment.author.name}
                  </Link>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    @{comment.author.username} • {formatDate(comment.createdAt)}
                  </span>
                </div>

                {isAuthor && !isEditing && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <button
                      onClick={() => handleStartEdit(comment)}
                      title="Edit comment"
                      style={{ color: 'var(--text-muted)', padding: '2px' }}
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      onClick={() => handleDelete(comment.id)}
                      title="Delete comment"
                      style={{ color: 'var(--danger)', padding: '2px' }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                )}
              </div>

              {isEditing ? (
                <div style={{ marginTop: '0.4rem' }}>
                  <input
                    type="text"
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    disabled={submitting}
                    style={{
                      width: '100%',
                      padding: '0.4rem 0.6rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-color)',
                      fontSize: '0.85rem'
                    }}
                  />
                  {error && <p style={{ color: 'var(--danger)', fontSize: '0.78rem', marginTop: '0.2rem' }}>{error}</p>}
                  <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.4rem' }}>
                    <button
                      onClick={() => handleSaveEdit(comment.id)}
                      disabled={submitting || !editContent.trim()}
                      className="btn btn-primary btn-sm"
                      style={{ padding: '0.25rem 0.6rem', fontSize: '0.78rem' }}
                    >
                      <Check size={12} /> Save
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      disabled={submitting}
                      className="btn btn-outline btn-sm"
                      style={{ padding: '0.25rem 0.6rem', fontSize: '0.78rem' }}
                    >
                      <X size={12} /> Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <p style={{ fontSize: '0.88rem', color: 'var(--text-primary)', wordBreak: 'break-word', whiteSpace: 'pre-line' }}>
                  {comment.content}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
