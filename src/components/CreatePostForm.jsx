import React, { useState, useRef } from 'react';
import { Upload, Link2, Send, X, AlertCircle, Image as ImageIcon } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import UserAvatar from './UserAvatar';
import { postService } from '../services/postService';
import { readFileAsDataURL } from '../utils/imageUpload';

const MAX_CHARS = 2000;

export default function CreatePostForm({ onPostCreated }) {
  const { user, isAuthenticated } = useAuth();
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [loading, setLoading] = useState(false);
  const [readingFile, setReadingFile] = useState(false);
  const [error, setError] = useState('');

  const fileInputRef = useRef(null);

  if (!isAuthenticated) return null;

  const charCount = content.length;
  const isOverLimit = charCount > MAX_CHARS;
  const isValid = content.trim().length > 0 && !isOverLimit;

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setReadingFile(true);
    setError('');

    try {
      const dataUrl = await readFileAsDataURL(file);
      setImageUrl(dataUrl);
      setShowUrlInput(false);
    } catch (err) {
      setError(err.message || 'Could not load selected file from your computer');
    } finally {
      setReadingFile(false);
      // Reset input so same file can be re-selected if deleted
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = () => {
    setImageUrl('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid || loading) return;

    setLoading(true);
    setError('');

    try {
      const res = await postService.createPost({
        content: content.trim(),
        imageUrl: imageUrl.trim() || undefined
      });

      if (res.success && res.data?.post) {
        setContent('');
        setImageUrl('');
        setShowUrlInput(false);
        if (onPostCreated) {
          onPostCreated(res.data.post);
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to publish post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card" style={{ padding: '1.25rem' }}>
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', gap: '0.85rem' }}>
          <UserAvatar user={user} size={42} />

          <div style={{ flex: 1 }}>
            <textarea
              placeholder={`What's happening in your sphere, ${user?.name?.split(' ')[0] || 'there'}?`}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={loading}
              rows={3}
              style={{
                width: '100%',
                border: 'none',
                outline: 'none',
                resize: 'none',
                fontSize: '1rem',
                color: 'var(--text-primary)',
                fontFamily: 'inherit',
                backgroundColor: 'transparent'
              }}
            />

            {/* Hidden PC File Input */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/png, image/jpeg, image/jpg, image/webp, image/gif"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />

            {/* Optional URL Input */}
            {showUrlInput && (
              <div style={{
                marginTop: '0.5rem',
                padding: '0.65rem',
                backgroundColor: 'var(--bg-tertiary)',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <input
                  type="url"
                  placeholder="Paste image web link (https://...)"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  style={{
                    flex: 1,
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '0.4rem 0.6rem',
                    fontSize: '0.85rem'
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    setImageUrl('');
                    setShowUrlInput(false);
                  }}
                  style={{ color: 'var(--text-muted)', padding: '4px' }}
                >
                  <X size={16} />
                </button>
              </div>
            )}

            {/* Image Preview from PC or URL */}
            {imageUrl && (
              <div style={{
                position: 'relative',
                marginTop: '0.75rem',
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                maxHeight: '280px',
                border: '1px solid var(--border-color)'
              }}>
                <img
                  src={imageUrl}
                  alt="Post preview"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  onError={() => setError('Image could not be rendered')}
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  title="Remove image"
                  style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    backgroundColor: 'rgba(15, 23, 42, 0.75)',
                    color: '#ffffff',
                    borderRadius: '50%',
                    padding: '5px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'background-color 0.15s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.9)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(15, 23, 42, 0.75)'}
                >
                  <X size={15} />
                </button>
              </div>
            )}

            {error && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--danger)', fontSize: '0.82rem', marginTop: '0.5rem' }}>
                <AlertCircle size={14} />
                <span>{error}</span>
              </div>
            )}

            {/* Action Bar */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: '1rem',
              paddingTop: '0.75rem',
              borderTop: '1px solid var(--border-subtle)',
              flexWrap: 'wrap',
              gap: '0.75rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                {/* Upload from PC Button */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={readingFile || loading}
                  className="btn btn-outline btn-sm"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    color: 'var(--primary)',
                    borderColor: 'rgba(37, 99, 235, 0.3)',
                    backgroundColor: 'var(--primary-light)'
                  }}
                  title="Choose image from your computer"
                >
                  <Upload size={15} />
                  <span>{readingFile ? 'Loading image...' : 'Photo from PC'}</span>
                </button>

                {/* Paste URL Button */}
                <button
                  type="button"
                  onClick={() => setShowUrlInput(!showUrlInput)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    color: showUrlInput ? 'var(--primary)' : 'var(--text-secondary)',
                    fontSize: '0.82rem',
                    fontWeight: '600',
                    padding: '0.4rem 0.6rem',
                    borderRadius: 'var(--radius-full)',
                    background: 'none'
                  }}
                  title="Or paste image web link"
                >
                  <Link2 size={15} />
                  <span>Web Link</span>
                </button>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{
                  fontSize: '0.78rem',
                  fontWeight: '600',
                  color: isOverLimit ? 'var(--danger)' : charCount > 1800 ? '#eab308' : 'var(--text-muted)'
                }}>
                  {charCount}/{MAX_CHARS}
                </span>

                <button
                  type="submit"
                  disabled={!isValid || loading || readingFile}
                  className="btn btn-primary btn-sm"
                  style={{ padding: '0.45rem 1.15rem' }}
                >
                  <Send size={14} />
                  <span>{loading ? 'Posting...' : 'Publish'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
