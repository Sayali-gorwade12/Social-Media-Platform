import React, { useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import RightSidebar from './components/RightSidebar';
import MobileNavigation from './components/MobileNavigation';
import ProtectedRoute from './components/ProtectedRoute';

import LandingPage from './pages/LandingPage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import PostDetailsPage from './pages/PostDetailsPage';
import ProfilePage from './pages/ProfilePage';
import EditProfilePage from './pages/EditProfilePage';
import FollowersPage from './pages/FollowersPage';
import FollowingPage from './pages/FollowingPage';
import NotificationsPage from './pages/NotificationsPage';
import ExplorePage from './pages/ExplorePage';
import SettingsPage from './pages/SettingsPage';
import NotFoundPage from './pages/NotFoundPage';

import { useAuth } from './hooks/useAuth';

export default function App() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  // Certain pages like landing, login, register are full-width standalone pages
  const isStandalonePage = ['/', '/login', '/register'].includes(location.pathname);

  return (
    <div className="app-container">
      <Navbar />

      {isStandalonePage ? (
        <main style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
      ) : (
        <div className="main-layout">
          {/* Left Sidebar */}
          <div className="left-sidebar-col">
            <Sidebar />
          </div>

          {/* Center Main Feed / Page Column */}
          <main className="center-feed-col">
            <Routes>
              <Route
                path="/feed"
                element={
                  <ProtectedRoute>
                    <HomePage />
                  </ProtectedRoute>
                }
              />
              <Route path="/post/:id" element={<PostDetailsPage />} />
              <Route path="/profile/:username" element={<ProfilePage />} />
              <Route path="/profile/:username/followers" element={<FollowersPage />} />
              <Route path="/profile/:username/following" element={<FollowingPage />} />
              <Route
                path="/profile/edit"
                element={
                  <ProtectedRoute>
                    <EditProfilePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/notifications"
                element={
                  <ProtectedRoute>
                    <NotificationsPage />
                  </ProtectedRoute>
                }
              />
              <Route path="/explore" element={<ExplorePage />} />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <SettingsPage />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>

          {/* Right Sidebar */}
          <div className="right-sidebar-col">
            <RightSidebar />
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation */}
      <MobileNavigation />
    </div>
  );
}
