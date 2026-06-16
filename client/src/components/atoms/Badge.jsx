import React from 'react';
import './atoms.css';

const Badge = ({ children, className = '' }) => {
  return (
    <div className={`badge-container smooth-transition ${className}`}>
      {children}
    </div>
  );
};

export default Badge;
