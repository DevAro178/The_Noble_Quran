import React from 'react';
import { BookOpen, ArrowRight } from 'lucide-react';
import Button from '../atoms/Button';
import './molecules.css';

const HistoryCard = ({ lastRead, onResume }) => {
  if (!lastRead) return null;

  const { suraNo, suraName, ayatNo, timestamp } = lastRead;

  // Format relative time helper
  const getRelativeTime = (time) => {
    const seconds = Math.floor((Date.now() - time) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div className="history-card smooth-transition">
      <div className="history-content">
        <div className="history-icon-wrapper">
          <BookOpen size={24} />
        </div>
        <div className="history-info">
          <span className="history-label">Reading History</span>
          <span className="history-detail">Surah {suraName} ({suraNo}:{ayatNo})</span>
          <span className="history-time">{getRelativeTime(timestamp)}</span>
        </div>
      </div>
      <div className="history-actions">
        <Button 
          variant="primary" 
          onClick={onResume}
          className="smooth-transition"
        >
          Resume Reading
          <ArrowRight size={16} />
        </Button>
      </div>
    </div>
  );
};

export default HistoryCard;
