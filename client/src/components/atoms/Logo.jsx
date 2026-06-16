import React from 'react';

const Logo = ({ className = '', size = 56 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ color: 'var(--accent-mint)', display: 'block' }}
    >
      {/* Quran book stand (Rehal) - Bottom intersecting lines */}
      <path
        d="M5 19L19 13M19 19L5 13"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Decorative center accent */}
      <circle cx="12" cy="16" r="1.5" fill="currentColor" />
      {/* Open Quran Pages */}
      <path
        d="M12 7.5C10.5 5.5 7 5 4 5.5V14.5C7 14 10.5 14.5 12 16.5C13.5 14.5 17 14 20 14.5V5.5C17 5 13.5 5 12 7.5Z"
        fill="var(--accent-mint-light)"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Binding / Center line of the book */}
      <path
        d="M12 7.5V16.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      {/* Tiny star icon to represent enlightenment */}
      <path
        d="M12 2.5V3.5M10.5 3L11.5 3M12.5 3L13.5 3"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
      />
    </svg>
  );
};

export default Logo;
