import React, { useState, useEffect, useCallback } from 'react';
import { Compass, Users, Sparkles } from 'lucide-react';
import CreatePostForm from '../components/CreatePostForm';
import PostCard from '../components/PostCard';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';
import { postService } from '../services/postService';
import { useAuth } from '../hooks/useAuth';

export default function HomePage() {
  const { isAuthenticated } = useAuth();
  const [feedType, setFeedType] = useState('all'); // 'all' or 'following'
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');

  const fetchPosts = useCallback(async (targetPage = 1, isInitial = false) => {
    if (isInitial) setLoading(true);
    else setLoadingMore(true);
    setError('');

    try {
      const res = await postService.getPosts(targetPage, 10, feedType);
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
      setError(err.message || 'Failed to fetch posts');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [feedType]);

  useEffect(() => {
    fetchPosts(1, true);
  }, [fetchPosts]);

  const handlePostCreated = (newPost) => {
    setPosts((prev) => [newPost, ...prev]);
  };

  const handlePostDeleted = (deletedPostId) => {
    setPosts((prev) => prev.filter((p) => p.id !== deletedPostId));
  };

  const handlePostUpdated = (updatedPost) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === updatedPost.id ? { ...p, ...updatedPost } : p))
    );
  };

  const handleLoadMore = () => {
    if (page < totalPages && !loadingMore) {
      fetchPosts(page + 1, false);
    }
  };

  return (
    <div>
      {/* Feed Filter Header */}
      <div className="card" style={{ padding: '0.5rem', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => setFeedType('all')}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              padding: '0.65rem',
              borderRadius: 'var(--radius-md)',
              fontWeight: feedType === 'all' ? '700' : '500',
              color: feedType === 'all' ? 'var(--primary)' : 'var(--text-secondary)',
              backgroundColor: feedType === 'all' ? 'var(--primary-light)' : 'transparent',
              fontSize: '0.9rem',
              transition: 'all 0.15s ease'
            }}
          >
            <Compass size={18} /> Discovery Feed
          </button>

          {isAuthenticated && (
            <button
              onClick={() => setFeedType('following')}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                padding: '0.65rem',
                borderRadius: 'var(--radius-md)',
                fontWeight: feedType === 'following' ? '700' : '500',
                color: feedType === 'following' ? 'var(--primary)' : 'var(--text-secondary)',
                backgroundColor: feedType === 'following' ? 'var(--primary-light)' : 'transparent',
                fontSize: '0.9rem',
                transition: 'all 0.15s ease'
              }}
            >
              <Users size={18} /> Following Feed
            </button>
          )}
        </div>
      </div>

      {/* Post Creator */}
      {isAuthenticated && (
        <CreatePostForm onPostCreated={handlePostCreated} />
      )}

      {/* Posts Section */}
      {error && <ErrorMessage message={error} onRetry={() => fetchPosts(1, true)} />}

      {loading ? (
        <LoadingSpinner text="Loading feed posts..." />
      ) : posts.length === 0 ? (
        <EmptyState
          title={feedType === 'following' ? 'No posts from people you follow' : 'No posts published yet'}
          description={
            feedType === 'following'
              ? 'Follow other creators to see their updates right here in your curated feed!'
              : 'Be the first person to share a post on ConnectSphere!'
          }
          actionText={feedType === 'following' ? 'Switch to Discovery Feed' : undefined}
          onAction={feedType === 'following' ? () => setFeedType('all') : undefined}
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

          {/* Load More Button */}
          {page < totalPages && (
            <div style={{ textAlign: 'center', margin: '2rem 0' }}>
              <button
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="btn btn-outline"
                style={{ padding: '0.65rem 1.75rem', borderRadius: 'var(--radius-full)' }}
              >
                {loadingMore ? 'Loading more posts...' : 'Load More Posts'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
