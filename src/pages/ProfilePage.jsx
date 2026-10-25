import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ProfileHeader from '../components/ProfileHeader';
import PostCard from '../components/PostCard';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';
import { userService } from '../services/userService';
import { useAuth } from '../hooks/useAuth';

export default function ProfilePage() {
  const { username } = useParams();
  const { user: currentUser } = useAuth();
  const [profileUser, setProfileUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');

  const isOwnProfile = currentUser && currentUser.username.toLowerCase() === username.toLowerCase();

  // Load user profile
  useEffect(() => {
    let isMounted = true;
    async function fetchUserProfile() {
      setLoadingUser(true);
      setError('');
      try {
        const res = await userService.getUserByUsername(username);
        if (isMounted && res.success && res.data?.user) {
          setProfileUser(res.data.user);
        }
      } catch (err) {
        if (isMounted) setError(err.message || 'User not found');
      } finally {
        if (isMounted) setLoadingUser(false);
      }
    }
    fetchUserProfile();
    return () => { isMounted = false; };
  }, [username]);

  // Load user posts
  const fetchUserPosts = async (targetPage = 1, isInitial = false) => {
    if (isInitial) setLoadingPosts(true);
    else setLoadingMore(true);

    try {
      const res = await userService.getUserPosts(username, targetPage, 10);
      if (res.success && res.data) {
        if (targetPage === 1) {
          setPosts(res.data.posts);
        } else {
          setPosts((prev) => [...prev, ...res.data.posts]);
        }
        setPage(targetPage);
        setTotalPages(res.data.pagination?.totalPages || 1);
      }
    } catch (err) {
      console.warn('Failed to load user posts:', err.message);
    } finally {
      setLoadingPosts(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    if (username) {
      fetchUserPosts(1, true);
    }
  }, [username]);

  const handleFollowChange = (newStatus, followersCount) => {
    setProfileUser((prev) =>
      prev ? { ...prev, is_following: newStatus, followers_count: followersCount } : null
    );
  };

  const handlePostDeleted = (deletedId) => {
    setPosts((prev) => prev.filter((p) => p.id !== deletedId));
    setProfileUser((prev) =>
      prev ? { ...prev, posts_count: Math.max(0, (prev.posts_count || 1) - 1) } : null
    );
  };

  const handlePostUpdated = (updated) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === updated.id ? { ...p, ...updated } : p))
    );
  };

  if (loadingUser) {
    return <LoadingSpinner text="Loading profile details..." />;
  }

  if (error || !profileUser) {
    return <ErrorMessage message={error || 'User does not exist'} />;
  }

  return (
    <div>
      <ProfileHeader
        profileUser={profileUser}
        isOwnProfile={isOwnProfile}
        onFollowChange={handleFollowChange}
      />

      {/* User Posts Header */}
      <div style={{ marginBottom: '1rem', borderBottom: '2px solid var(--border-color)', paddingBottom: '0.5rem' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-primary)' }}>
          Posts by {profileUser.name}
        </h3>
      </div>

      {loadingPosts ? (
        <LoadingSpinner text="Loading posts..." />
      ) : posts.length === 0 ? (
        <EmptyState
          title="No posts yet"
          description={
            isOwnProfile
              ? "You haven't posted anything yet. Share your thoughts with the community!"
              : `@${profileUser.username} hasn't published any posts yet.`
          }
        />
      ) : (
        <div>
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onPostDeleted={handlePostDeleted}
              onPostUpdated={handlePostUpdated}
            />
          ))}

          {page < totalPages && (
            <div style={{ textAlign: 'center', margin: '2rem 0' }}>
              <button
                onClick={() => fetchUserPosts(page + 1, false)}
                disabled={loadingMore}
                className="btn btn-outline"
                style={{ padding: '0.65rem 1.75rem', borderRadius: 'var(--radius-full)' }}
              >
                {loadingMore ? 'Loading more...' : 'Load More'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
