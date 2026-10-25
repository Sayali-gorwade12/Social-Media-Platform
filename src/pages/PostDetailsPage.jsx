import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import PostCard from '../components/PostCard';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { postService } from '../services/postService';

export default function PostDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;
    async function fetchPost() {
      setLoading(true);
      setError('');
      try {
        const res = await postService.getPostById(id);
        if (isMounted && res.success && res.data?.post) {
          setPost(res.data.post);
        }
      } catch (err) {
        if (isMounted) setError(err.message || 'Post not found');
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchPost();
    return () => { isMounted = false; };
  }, [id]);

  const handlePostDeleted = () => {
    navigate('/feed');
  };

  const handlePostUpdated = (updated) => {
    setPost(updated);
  };

  return (
    <div>
      <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <button
          onClick={() => navigate(-1)}
          className="btn btn-outline btn-sm"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <ArrowLeft size={16} /> Back
        </button>
        <span style={{ fontWeight: '700', fontSize: '1.1rem', color: 'var(--text-primary)' }}>
          Post Conversation
        </span>
      </div>

      {loading ? (
        <LoadingSpinner text="Loading post conversation..." />
      ) : error ? (
        <ErrorMessage message={error} onRetry={() => navigate('/feed')} />
      ) : post ? (
        <PostCard
          post={post}
          onPostDeleted={handlePostDeleted}
          onPostUpdated={handlePostUpdated}
        />
      ) : null}
    </div>
  );
}
