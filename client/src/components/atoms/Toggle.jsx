import React from 'react';
import './atoms.css';

const Toggle = ({ 
  id, 
  checked, 
  onChange, 
  title, 
  description,
  className = '' 
}) => {
  return (
    <div className={`toggle-container ${className}`}>
      <div className="toggle-label">
        <span className="toggle-title">{title}</span>
        {description && <span className="toggle-desc">{description}</span>}
      </div>
      <label className="toggle-switch">
        <input 
          id={id} 
          type="checkbox" 
          checked={checked} 
          onChange={(e) => onChange(e.target.checked)} 
        />
        <span className="toggle-slider"></span>
      </label>
    </div>
  );
};

export default Toggle;
