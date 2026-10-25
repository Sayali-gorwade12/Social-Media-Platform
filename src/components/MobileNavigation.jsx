import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Compass, Bell, User, Settings } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export default function MobileNavigation() {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) return null;

  const links = [
    { label: 'Feed', path: '/feed', icon: Home },
    { label: 'Explore', path: '/explore', icon: Compass },
    { label: 'Alerts', path: '/notifications', icon: Bell },
    { label: 'Profile', path: `/profile/${user?.username}`, icon: User },
    { label: 'Settings', path: '/settings', icon: Settings }
  ];

  return (
    <nav style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      height: '3.6rem',
      backgroundColor: 'rgba(255, 255, 255, 0.96)',
      backdropFilter: 'blur(10px)',
      borderTop: '1px solid var(--border-color)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-around',
      zIndex: 50,
      boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.05)'
    }}>
      {links.map((link) => {
        const Icon = link.icon;
        return (
          <NavLink
            key={link.path}
            to={link.path}
            style={({ isActive }) => ({
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.15rem',
              color: isActive ? 'var(--primary)' : 'var(--text-muted)',
              textDecoration: 'none',
              padding: '0.25rem 0.5rem',
              transition: 'color 0.15s ease'
            })}
          >
            <Icon size={20} />
            <span style={{ fontSize: '0.68rem', fontWeight: '600' }}>{link.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}
