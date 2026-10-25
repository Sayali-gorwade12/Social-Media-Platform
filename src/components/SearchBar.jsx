import React, { useState } from 'react';
import { Search, X } from 'lucide-react';

export default function SearchBar({ placeholder = 'Search...', initialValue = '', onSearch }) {
  const [query, setQuery] = useState(initialValue);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch) onSearch(query.trim());
  };

  const handleClear = () => {
    setQuery('');
    if (onSearch) onSearch('');
  };

  return (
    <form onSubmit={handleSubmit} style={{ position: 'relative', width: '100%' }}>
      <Search
        size={18}
        style={{
          position: 'absolute',
          left: '1rem',
          top: '50%',
          transform: 'translateY(-50%)',
          color: 'var(--text-muted)',
          pointerEvents: 'none'
        }}
      />
      <input
        type="text"
        placeholder={placeholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="form-input"
        style={{
          paddingLeft: '2.5rem',
          paddingRight: query ? '2.5rem' : '1rem',
          borderRadius: 'var(--radius-full)',
          backgroundColor: 'var(--bg-card)'
        }}
      />
      {query && (
        <button
          type="button"
          onClick={handleClear}
          style={{
            position: 'absolute',
            right: '0.85rem',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <X size={16} />
        </button>
      )}
    </form>
  );
}
