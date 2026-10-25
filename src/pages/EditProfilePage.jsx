import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, X, AlertCircle, CheckCircle, Upload } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { userService } from '../services/userService';
import UserAvatar from '../components/UserAvatar';
import { readFileAsDataURL } from '../utils/imageUpload';

export default function EditProfilePage() {
  const { user, updateCurrentUser } = useAuth();
  const navigate = useNavigate();

  const avatarInputRef = useRef(null);
  const coverInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: user?.name || '',
    username: user?.username || '',
    bio: user?.bio || '',
    avatar_url: user?.avatar_url || '',
    cover_url: user?.cover_url || ''
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleAvatarFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await readFileAsDataURL(file, 800, 800);
      setFormData((prev) => ({ ...prev, avatar_url: dataUrl }));
    } catch (err) {
      setError(err.message || 'Could not load avatar image');
    }
  };

  const handleCoverFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await readFileAsDataURL(file, 1600, 800);
      setFormData((prev) => ({ ...prev, cover_url: dataUrl }));
    } catch (err) {
      setError(err.message || 'Could not load cover image');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || formData.name.trim().length < 2) {
      setError('Name must be at least 2 characters long');
      return;
    }

    if (formData.bio.length > 250) {
      setError('Bio must not exceed 250 characters');
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const res = await userService.updateProfile({
        name: formData.name.trim(),
        username: formData.username.trim(),
        bio: formData.bio.trim(),
        avatar_url: formData.avatar_url.trim() || null,
        cover_url: formData.cover_url.trim() || null
      });

      if (res.success && res.data?.user) {
        updateCurrentUser(res.data.user);
        setSuccess('Profile updated successfully!');
        setTimeout(() => {
          navigate(`/profile/${res.data.user.username}`);
        }, 1000);
      }
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
        <button onClick={() => navigate(-1)} className="btn btn-outline btn-sm">
          <ArrowLeft size={16} /> Back
        </button>
        <h2 style={{ fontSize: '1.35rem', fontWeight: '800', color: 'var(--text-primary)' }}>
          Edit Profile
        </h2>
      </div>

      <div className="card" style={{ padding: '1.75rem' }}>
        {error && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem',
            backgroundColor: 'var(--danger-light)',
            color: 'var(--danger)',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.85rem',
            marginBottom: '1.25rem'
          }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem',
            backgroundColor: 'var(--success-light)',
            color: 'var(--success)',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.85rem',
            marginBottom: '1.25rem'
          }}>
            <CheckCircle size={16} />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Avatar Preview */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1.5rem' }}>
            <UserAvatar src={formData.avatar_url} user={{ name: formData.name }} size={72} />
            <div style={{ flex: 1 }}>
              <label className="form-label">Profile Avatar</label>
              <input
                type="file"
                ref={avatarInputRef}
                accept="image/*"
                onChange={handleAvatarFile}
                style={{ display: 'none' }}
              />
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.4rem' }}>
                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  className="btn btn-outline btn-sm"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                >
                  <Upload size={14} /> Upload from PC
                </button>
                {formData.avatar_url && (
                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, avatar_url: '' }))}
                    className="btn btn-outline btn-sm"
                  >
                    Remove
                  </button>
                )}
              </div>
              <input
                type="url"
                name="avatar_url"
                placeholder="Or paste avatar URL (https://...)"
                value={formData.avatar_url}
                onChange={handleChange}
                className="form-input"
                disabled={submitting}
                style={{ fontSize: '0.85rem' }}
              />
            </div>
          </div>

          {/* Cover Preview */}
          <div className="form-group">
            <label className="form-label">Cover Header Photo</label>
            <input
              type="file"
              ref={coverInputRef}
              accept="image/*"
              onChange={handleCoverFile}
              style={{ display: 'none' }}
            />
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.4rem' }}>
              <button
                type="button"
                onClick={() => coverInputRef.current?.click()}
                className="btn btn-outline btn-sm"
                style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
              >
                <Upload size={14} /> Upload from PC
              </button>
              {formData.cover_url && (
                <button
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, cover_url: '' }))}
                  className="btn btn-outline btn-sm"
                >
                  Remove
                </button>
              )}
            </div>
            <input
              type="url"
              name="cover_url"
              placeholder="Or paste cover image URL (https://...)"
              value={formData.cover_url}
              onChange={handleChange}
              className="form-input"
              disabled={submitting}
              style={{ fontSize: '0.85rem' }}
            />
            {formData.cover_url && (
              <div style={{ marginTop: '0.5rem', height: '110px', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                <img
                  src={formData.cover_url}
                  alt="Cover preview"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={() => setError('Cover URL could not be loaded')}
                />
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="name">Display Name</label>
            <input
              id="name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="form-input"
              disabled={submitting}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="form-input"
              disabled={submitting}
              required
            />
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
              <label className="form-label" htmlFor="bio" style={{ marginBottom: 0 }}>Bio</label>
              <span style={{ fontSize: '0.78rem', color: formData.bio.length > 250 ? 'var(--danger)' : 'var(--text-muted)' }}>
                {formData.bio.length}/250
              </span>
            </div>
            <textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              className="form-textarea"
              rows={4}
              placeholder="Tell the community about yourself, your skills, and what you're working on..."
              disabled={submitting}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.75rem' }}>
            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary"
              style={{ flex: 1 }}
            >
              <Save size={16} /> {submitting ? 'Saving changes...' : 'Save Profile'}
            </button>
            <button
              type="button"
              onClick={() => navigate(-1)}
              disabled={submitting}
              className="btn btn-outline"
            >
              <X size={16} /> Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
