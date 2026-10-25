import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Users, MessageSquare } from 'lucide-react';
import SearchBar from '../components/SearchBar';
import UserCard from '../components/UserCard';
import PostCard from '../components/PostCard';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { userService } from '../services/userService';
import { postService } from '../services/postService';

export default function ExplorePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryParam = searchParams.get('q') || '';

  const [activeTab, setActiveTab] = useState('users'); // 'users' or 'posts'
  const [query, setQuery] = useState(queryParam);
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(Boolean(queryParam));

  useEffect(() => {
    if (queryParam) {
      setQuery(queryParam);
      handlePerformSearch(queryParam);
    } else {
      // Load suggestions by default
      loadInitialSuggestions();
    }
  }, [queryParam]);

  const loadInitialSuggestions = async () => {
    setLoading(true);
    try {
      const res = await userService.getSuggestions();
      if (res.success && res.data?.users) {
        setUsers(res.data.users);
      }
    } catch (err) {
      console.warn('Failed to load suggestions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePerformSearch = async (searchQuery) => {
    const trimmed = searchQuery.trim();
    if (!trimmed) {
      setHasSearched(false);
      loadInitialSuggestions();
      return;
    }

    setHasSearched(true);
    setLoading(true);

    try {
      // Search users
      const userRes = await userService.searchUsers(trimmed);
      if (userRes.success && userRes.data) {
        setUsers(userRes.data.users || []);
      }

      // Search posts via posts endpoint
      const postRes = await postService.getPosts(1, 20, 'all');
      if (postRes.success && postRes.data) {
        const filteredPosts = (postRes.data.posts || []).filter((p) =>
          p.content.toLowerCase().includes(trimmed.toLowerCase()) ||
          p.author.name.toLowerCase().includes(trimmed.toLowerCase()) ||
          p.author.username.toLowerCase().includes(trimmed.toLowerCase())
        );
        setPosts(filteredPosts);
      }
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const onSearchSubmit = (newQuery) => {
    setSearchParams(newQuery ? { q: newQuery } : {});
  };

  return (
    <div>
      {/* Search Header */}
      <div className="card" style={{ padding: '1.25rem', marginBottom: '1.25rem' }}>
        <h2 style={{ fontSize: '1.35rem', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '0.85rem' }}>
          Explore & Connect
        </h2>
        <SearchBar
          placeholder="Search by name, username, or post keywords..."
          initialValue={query}
          onSearch={onSearchSubmit}
        />

        {/* Tab Filters */}
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
          <button
            onClick={() => setActiveTab('users')}
            className={`btn btn-sm ${activeTab === 'users' ? 'btn-primary' : 'btn-outline'}`}
          >
            <Users size={15} /> People ({users.length})
          </button>
          <button
            onClick={() => setActiveTab('posts')}
            className={`btn btn-sm ${activeTab === 'posts' ? 'btn-primary' : 'btn-outline'}`}
          >
            <MessageSquare size={15} /> Posts ({posts.length})
          </button>
        </div>
      </div>

      {/* Results Section */}
      {loading ? (
        <LoadingSpinner text="Searching ConnectSphere..." />
      ) : activeTab === 'users' ? (
        <div>
          {!hasSearched && (
            <div style={{ marginBottom: '0.75rem', paddingLeft: '0.25rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-secondary)' }}>
                SUGGESTED CREATORS TO FOLLOW
              </span>
            </div>
          )}

          {users.length === 0 ? (
            <EmptyState
              icon={Search}
              title="No users found"
              description={`We couldn't find anyone matching "${query}". Try searching with a different name or keyword.`}
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {users.map((u) => (
                <UserCard
                  key={u.id}
                  user={u}
                  onFollowChange={(newStatus) => {
                    setUsers((prev) =>
                      prev.map((item) => (item.id === u.id ? { ...item, is_following: newStatus } : item))
                    );
                  }}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div>
          {posts.length === 0 ? (
            <EmptyState
              icon={Search}
              title="No posts found"
              description={`No published posts match "${query}". Try searching for another topic or hashtag.`}
            />
          ) : (
            <div>
              {posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onPostDeleted={(id) => setPosts((prev) => prev.filter((p) => p.id !== id))}
                  onPostUpdated={(updated) =>
                    setPosts((prev) => prev.map((p) => (p.id === updated.id ? { ...p, ...updated } : p)))
                  }
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
