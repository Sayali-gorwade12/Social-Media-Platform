import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, MessageSquare, UserPlus } from 'lucide-react';
import UserAvatar from './UserAvatar';

function formatNotificationTime(dateStr) {
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

export default function NotificationItem({ notification, onMarkAsRead }) {
  const navigate = useNavigate();

  const getIcon = () => {
    switch (notification.type) {
      case 'like':
        return <Heart size={16} fill="#ef4444" color="#ef4444" />;
      case 'comment':
        return <MessageSquare size={16} color="var(--primary)" />;
      case 'follow':
        return <UserPlus size={16} color="var(--success)" />;
      default:
        return null;
    }
  };

  const getActionText = () => {
    switch (notification.type) {
      case 'like':
        return 'liked your post';
      case 'comment':
        return 'commented on your post';
      case 'follow':
        return 'started following you';
      default:
        return 'interacted with your content';
    }
  };

  const handleClick = () => {
    if (!notification.is_read && onMarkAsRead) {
      onMarkAsRead(notification.id);
    }
    if (notification.post_id) {
      navigate(`/post/${notification.post_id}`);
    } else {
      navigate(`/profile/${notification.actor_username}`);
    }
  };

  return (
    <div
      onClick={handleClick}
      style={{
        padding: '1rem',
        borderBottom: '1px solid var(--border-color)',
        backgroundColor: notification.is_read ? '#ffffff' : 'var(--primary-light)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.85rem',
        transition: 'background-color 0.15s ease'
      }}
      onMouseEnter={(e) => {
        if (notification.is_read) e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
      }}
      onMouseLeave={(e) => {
        if (notification.is_read) e.currentTarget.style.backgroundColor = '#ffffff';
      }}
    >
      <div style={{ position: 'relative' }}>
        <Link
          to={`/profile/${notification.actor_username}`}
          onClick={(e) => e.stopPropagation()}
        >
          <UserAvatar
            user={{
              name: notification.actor_name,
              avatar_url: notification.actor_avatar
            }}
            size={40}
          />
        </Link>
        <div style={{
          position: 'absolute',
          bottom: '-3px',
          right: '-3px',
          backgroundColor: '#ffffff',
          borderRadius: '50%',
          padding: '2px',
          display: 'flex',
          boxShadow: 'var(--shadow-sm)'
        }}>
          {getIcon()}
        </div>
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', lineHeight: '1.4' }}>
          <strong style={{ fontWeight: '700' }}>{notification.actor_name}</strong>{' '}
          <span style={{ color: 'var(--text-secondary)' }}>{getActionText()}</span>
        </p>

        {notification.post_content && (
          <p style={{
            fontSize: '0.82rem',
            color: 'var(--text-muted)',
            marginTop: '0.25rem',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            "{notification.post_content}"
          </p>
        )}

        {notification.comment_content && (
          <p style={{
            fontSize: '0.82rem',
            color: 'var(--text-secondary)',
            marginTop: '0.25rem',
            fontStyle: 'italic',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            "{notification.comment_content}"
          </p>
        )}

        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.3rem', display: 'inline-block' }}>
          {formatNotificationTime(notification.created_at)}
        </span>
      </div>

      {!notification.is_read && (
        <div style={{
          width: '9px',
          height: '9px',
          borderRadius: '50%',
          backgroundColor: 'var(--primary)',
          flexShrink: 0,
          marginTop: '6px'
        }} />
      )}
    </div>
  );
}
