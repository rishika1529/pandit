import { useState } from 'react';

const SearchBar = ({ onSearch, placeholder = 'Search recordings…', className = '' }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(query);
  };

  const handleClear = () => {
    setQuery('');
    onSearch('');
  };

  return (
    <form onSubmit={handleSubmit} className={`relative ${className}`}>
      {/* Search icon */}
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <svg className="w-4 h-4 text-dark-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      <input
        id="search-bar"
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          if (e.target.value === '') onSearch('');
        }}
        placeholder={placeholder}
        className="input-field !pl-11 !pr-20"
      />

      <div className="absolute inset-y-0 right-0 flex items-center gap-1 pr-2">
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="p-1.5 rounded-lg text-dark-300 hover:text-dark-100 hover:bg-dark-600 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
        <button type="submit" className="px-3 py-1.5 rounded-lg bg-primary-600/30 text-primary-400 text-xs font-medium hover:bg-primary-600/40 transition-colors">
          Search
        </button>
      </div>
    </form>
  );
};

export default SearchBar;
