import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Home, Compass, Bell, User, Settings, LogOut, PlusCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import UserAvatar from './UserAvatar';

export default function Sidebar({ onOpenCreatePost }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { label: 'Home Feed', path: '/feed', icon: Home },
    { label: 'Explore', path: '/explore', icon: Compass },
    { label: 'Notifications', path: '/notifications', icon: Bell },
    { label: 'Profile', path: `/profile/${user?.username}`, icon: User },
    { label: 'Settings', path: '/settings', icon: Settings }
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside style={{
      position: 'sticky',
      top: '5rem',
      height: 'calc(100vh - 6rem)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      paddingRight: '0.5rem'
    }}>
      <div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.85rem',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-full)',
                  fontWeight: isActive ? '700' : '500',
                  color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                  backgroundColor: isActive ? 'var(--primary-light)' : 'transparent',
                  transition: 'all 0.15s ease'
                })}
              >
                <Icon size={20} />
                <span style={{ fontSize: '0.95rem' }}>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {onOpenCreatePost && (
          <button
            onClick={onOpenCreatePost}
            className="btn btn-primary"
            style={{
              width: '100%',
              marginTop: '1.25rem',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.95rem',
              fontWeight: '700'
            }}
          >
            <PlusCircle size={18} /> Create Post
          </button>
        )}
      </div>

      {/* Mini User Profile Card */}
      {user && (
        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-lg)',
          padding: '0.85rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.6rem',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div 
            onClick={() => navigate(`/profile/${user.username}`)}
            style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', overflow: 'hidden', cursor: 'pointer' }}
          >
            <UserAvatar user={user} size={36} />
            <div style={{ minWidth: 0 }}>
              <p style={{ fontWeight: '700', fontSize: '0.86rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user.name}
              </p>
              <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                @{user.username}
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            title="Log Out"
            style={{
              color: 'var(--text-muted)',
              padding: '0.4rem',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'color 0.15s, background-color 0.15s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--danger)';
              e.currentTarget.style.backgroundColor = 'var(--danger-light)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--text-muted)';
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <LogOut size={16} />
          </button>
        </div>
      )}
    </aside>
  );
}
