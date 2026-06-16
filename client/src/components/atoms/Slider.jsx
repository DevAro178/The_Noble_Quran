import React from 'react';
import './atoms.css';

const Slider = ({ 
  min, 
  max, 
  value, 
  onChange, 
  title, 
  unit = 'px', 
  className = '' 
}) => {
  return (
    <div className={`slider-wrapper ${className}`}>
      <div className="slider-info">
        <span className="slider-title">{title}</span>
        <span className="slider-value">{value}{unit}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="slider-input"
      />
    </div>
  );
};

export default Slider;
