import React from 'react';
import './organisms.css';

const SurahList = ({ surahs, onSelectSurah }) => {
  if (surahs.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-secondary)' }}>
        No Surahs match your search query.
      </div>
    );
  }

  return (
    <div className="surah-grid animate-fade-in">
      {surahs.map((surah) => {
        const { suraNo, suraName, paraNo, paraName, totalAyat } = surah;
        return (
          <div 
            key={suraNo} 
            className="surah-card smooth-transition"
            onClick={() => onSelectSurah(suraNo)}
          >
            <div className="surah-card-left">
              <div className="surah-num-badge">
                <span className="surah-num-inner">{suraNo}</span>
              </div>
              <div className="surah-card-info">
                <span className="surah-card-name-en">{suraName}</span>
                <span className="surah-card-details">
                  Para {paraNo} | {totalAyat} Verses
                </span>
              </div>
            </div>
            <div className="surah-card-right">
              {/* Display a fallback stylized representation for the Surah name */}
              <span className="surah-card-name-ar">سورة {suraName}</span>
              <span className="surah-card-para" title="Para Name">
                {paraName}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SurahList;
