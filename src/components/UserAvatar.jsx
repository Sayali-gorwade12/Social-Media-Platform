import React, { useState } from 'react';

const COLORS = [
  '#2563eb', '#7c3aed', '#db2777', '#ea580c', 
  '#059669', '#0891b2', '#4f46e5', '#d97706'
];

function getInitials(name) {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return parts[0].substring(0, 2).toUpperCase();
}

function getAvatarColor(name) {
  if (!name) return COLORS[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % COLORS.length;
  return COLORS[index];
}

export default function UserAvatar({ user, src, alt, size = 40, className = '' }) {
  const [imageError, setImageError] = useState(false);

  const avatarUrl = src || user?.avatar_url || user?.avatarUrl;
  const name = user?.name || alt || 'User';
  const initials = getInitials(name);
  const bgColor = getAvatarColor(name);

  const style = {
    width: `${size}px`,
    height: `${size}px`,
    minWidth: `${size}px`,
    minHeight: `${size}px`,
    borderRadius: '50%',
    objectFit: 'cover'
  };

  if (avatarUrl && !imageError) {
    return (
      <img
        src={avatarUrl}
        alt={name}
        style={style}
        className={`user-avatar ${className}`}
        onError={() => setImageError(true)}
      />
    );
  }

  return (
    <div
      style={{
        ...style,
        backgroundColor: bgColor,
        color: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: '700',
        fontSize: size > 48 ? '1.25rem' : size < 32 ? '0.75rem' : '0.9rem',
        userSelect: 'none'
      }}
      className={`user-avatar-initials ${className}`}
    >
      {initials}
    </div>
  );
}
