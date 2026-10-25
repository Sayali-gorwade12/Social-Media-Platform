import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MessageCircle, MoreHorizontal, Edit, Trash2, Share2, Check, X, Upload } from 'lucide-react';
import UserAvatar from './UserAvatar';
import LikeButton from './LikeButton';
import CommentList from './CommentList';
import CommentForm from './CommentForm';
import FollowButton from './FollowButton';
import { postService } from '../services/postService';
import { commentService } from '../services/commentService';
import { useAuth } from '../hooks/useAuth';
import { readFileAsDataURL } from '../utils/imageUpload';

function formatPostTime(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const diffSec = Math.floor((now - date) / 1000);

  if (diffSec < 60) return 'just now';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h`;
  if (diffSec < 604800) return `${Math.floor(diffSec / 86400)}d`;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export default function PostCard({ post, onPostDeleted, onPostUpdated }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [comments, setComments] = useState([]);
  const [commentsLoaded, setCommentsLoaded] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentCount, setCommentCount] = useState(post.commentCount || 0);
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const [editImageUrl, setEditImageUrl] = useState(post.imageUrl || '');
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [imageError, setImageError] = useState(false);
  const editFileInputRef = useRef(null);

  const handleEditFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await readFileAsDataURL(file);
      setEditImageUrl(dataUrl);
    } catch (err) {
      alert(err.message || 'Could not read image file');
    }
  };

  const isAuthor = user && user.id === post.author.id;

  const toggleComments = async () => {
    if (!showComments && !commentsLoaded) {
      try {
        const res = await commentService.getPostComments(post.id);
        if (res.success && res.data?.comments) {
          setComments(res.data.comments);
          setCommentsLoaded(true);
        }
      } catch (err) {
        console.error('Failed to load comments:', err);
      }
    }
    setShowComments(!showComments);
  };

  const handleCommentAdded = (newComment) => {
    setComments((prev) => [...prev, newComment]);
    setCommentCount((prev) => prev + 1);
  };

  const handleCommentUpdated = (updatedComment) => {
    setComments((prev) =>
      prev.map((c) => (c.id === updatedComment.id ? { ...c, ...updatedComment } : c))
    );
  };

  const handleCommentDeleted = (commentId) => {
    setComments((prev) => prev.filter((c) => c.id !== commentId));
    setCommentCount((prev) => Math.max(0, prev - 1));
  };

  const handleDeletePost = async () => {
    setShowMenu(false);
    if (!window.confirm('Are you sure you want to delete this post? This cannot be undone.')) return;

    try {
      const res = await postService.deletePost(post.id);
      if (res.success) {
        if (onPostDeleted) onPostDeleted(post.id);
      }
    } catch (err) {
      alert(err.message || 'Failed to delete post');
    }
  };

  const handleSaveEdit = async () => {
    const trimmed = editContent.trim();
    if (!trimmed) return;

    setSubmitting(true);
    try {
      const res = await postService.updatePost(post.id, {
        content: trimmed,
        imageUrl: editImageUrl.trim() || null
      });

      if (res.success && res.data?.post) {
        setIsEditing(false);
        if (onPostUpdated) onPostUpdated(res.data.post);
      }
    } catch (err) {
      alert(err.message || 'Failed to update post');
    } finally {
      setSubmitting(false);
    }
  };

  const handleShare = () => {
    const url = `${window.location.origin}/post/${post.id}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <article className="card" style={{ padding: '1.25rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Link to={`/profile/${post.author.username}`}>
            <UserAvatar user={post.author} size={42} />
          </Link>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
              <Link
                to={`/profile/${post.author.username}`}
                style={{ fontWeight: '700', fontSize: '0.95rem', color: 'var(--text-primary)' }}
              >
                {post.author.name}
              </Link>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                @{post.author.username}
              </span>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>•</span>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                {formatPostTime(post.createdAt)}
              </span>
            </div>
          </div>
        </div>

        {/* Right actions: Follow or Post Menu */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', position: 'relative' }}>
          {!isAuthor && (
            <FollowButton userId={post.author.id} size="sm" />
          )}

          {isAuthor && (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowMenu(!showMenu)}
                style={{
                  padding: '0.35rem',
                  borderRadius: '50%',
                  color: 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                title="Post options"
              >
                <MoreHorizontal size={18} />
              </button>

              {showMenu && (
                <div style={{
                  position: 'absolute',
                  right: 0,
                  top: '100%',
                  width: '140px',
                  backgroundColor: '#ffffff',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: 'var(--shadow-lg)',
                  padding: '0.35rem',
                  zIndex: 20
                }}
                onMouseLeave={() => setShowMenu(false)}
                >
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      setIsEditing(true);
                    }}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.45rem 0.65rem',
                      fontSize: '0.82rem',
                      color: 'var(--text-primary)',
                      borderRadius: 'var(--radius-sm)'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <Edit size={14} /> Edit Post
                  </button>
                  <button
                    onClick={handleDeletePost}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.45rem 0.65rem',
                      fontSize: '0.82rem',
                      color: 'var(--danger)',
                      borderRadius: 'var(--radius-sm)'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--danger-light)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Post Content / Edit Mode */}
      {isEditing ? (
        <div style={{ marginBottom: '1rem' }}>
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            disabled={submitting}
            className="form-textarea"
            rows={3}
          />

          <input
            type="file"
            ref={editFileInputRef}
            accept="image/*"
            onChange={handleEditFileChange}
            style={{ display: 'none' }}
          />

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
            <button
              type="button"
              onClick={() => editFileInputRef.current?.click()}
              className="btn btn-outline btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
            >
              <Upload size={14} /> Change Photo from PC
            </button>
            <input
              type="url"
              placeholder="Or paste image URL"
              value={editImageUrl}
              onChange={(e) => setEditImageUrl(e.target.value)}
              disabled={submitting}
              className="form-input"
              style={{ flex: 1, padding: '0.4rem 0.6rem', fontSize: '0.85rem' }}
            />
            {editImageUrl && (
              <button
                type="button"
                onClick={() => setEditImageUrl('')}
                className="btn btn-outline btn-sm"
                title="Remove image"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {editImageUrl && (
            <div style={{ marginTop: '0.5rem', maxHeight: '160px', overflow: 'hidden', borderRadius: 'var(--radius-sm)' }}>
              <img src={editImageUrl} alt="Edit preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          )}

          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.65rem' }}>
            <button
              onClick={handleSaveEdit}
              disabled={submitting || !editContent.trim()}
              className="btn btn-primary btn-sm"
            >
              <Check size={14} /> Save
            </button>
            <button
              onClick={() => setIsEditing(false)}
              disabled={submitting}
              className="btn btn-outline btn-sm"
            >
              <X size={14} /> Cancel
            </button>
          </div>
        </div>
      ) : (
        <div style={{ marginBottom: '1rem' }}>
          <p style={{
            fontSize: '0.96rem',
            lineHeight: '1.6',
            color: 'var(--text-primary)',
            whiteSpace: 'pre-line',
            wordBreak: 'break-word'
          }}>
            {post.content}
          </p>

          {post.imageUrl && !imageError && (
            <div style={{ marginTop: '0.85rem', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
              <img
                src={post.imageUrl}
                alt="Post attachment"
                style={{ width: '100%', maxHeight: '440px', objectFit: 'cover', display: 'block' }}
                onError={() => setImageError(true)}
              />
            </div>
          )}
        </div>
      )}

      {/* Action Footer */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: '0.65rem',
        borderTop: '1px solid var(--border-subtle)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <LikeButton
            postId={post.id}
            initialIsLiked={post.isLiked}
            initialCount={post.likeCount}
          />

          <button
            onClick={toggleComments}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.4rem 0.75rem',
              borderRadius: 'var(--radius-full)',
              color: 'var(--text-secondary)',
              fontSize: '0.85rem',
              fontWeight: '600'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--primary-light)';
              e.currentTarget.style.color = 'var(--primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = 'var(--text-secondary)';
            }}
            title="Comments"
          >
            <MessageCircle size={18} />
            <span>{commentCount}</span>
          </button>
        </div>

        <div>
          <button
            onClick={handleShare}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.4rem 0.75rem',
              borderRadius: 'var(--radius-full)',
              color: copied ? 'var(--success)' : 'var(--text-muted)',
              fontSize: '0.82rem',
              fontWeight: '600'
            }}
            title="Share post"
          >
            {copied ? <Check size={16} /> : <Share2 size={16} />}
            <span>{copied ? 'Copied!' : 'Share'}</span>
          </button>
        </div>
      </div>

      {/* Expanded Comments Section */}
      {showComments && (
        <div style={{ marginTop: '0.85rem', paddingTop: '0.85rem', borderTop: '1px solid var(--border-subtle)' }}>
          <CommentForm postId={post.id} onCommentAdded={handleCommentAdded} />
          <CommentList
            comments={comments}
            onCommentUpdated={handleCommentUpdated}
            onCommentDeleted={handleCommentDeleted}
          />
        </div>
      )}
    </article>
  );
}
