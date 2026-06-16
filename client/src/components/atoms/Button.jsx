import React from 'react';
import './atoms.css';

const Button = ({ 
  children, 
  onClick, 
  variant = 'secondary', 
  className = '', 
  disabled = false,
  title = '',
  active = false
}) => {
  const getButtonClass = () => {
    switch (variant) {
      case 'primary': return 'btn-primary';
      case 'outline': return 'btn-outline';
      case 'icon': return `btn-icon ${active ? 'active' : ''}`;
      case 'secondary':
      default:
        return 'btn-secondary';
    }
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`btn ${getButtonClass()} smooth-transition ${className}`}
      title={title}
    >
      {children}
    </button>
  );
};

export default Button;
