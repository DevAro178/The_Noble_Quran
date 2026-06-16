import React from 'react';
import { Search, X } from 'lucide-react';
import './molecules.css';

const SearchBar = ({ 
  value, 
  onChange, 
  placeholder = 'Search by Surah name, number, or chapter name...', 
  className = '' 
}) => {
  return (
    <div className={`search-bar-container smooth-transition ${className}`}>
      <div className="search-icon">
        <Search size={20} />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="search-input"
      />
      {value && (
        <button 
          onClick={() => onChange('')} 
          className="search-clear-btn smooth-transition"
          title="Clear search"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
};

export default SearchBar;
