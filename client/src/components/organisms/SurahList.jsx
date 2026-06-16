import React from 'react';
import './organisms.css';

const SurahList = ({ surahs, onSelectSurah }) => {
  if (surahs.length === 0) {
    return (
      <div className="no-results-placeholder animate-fade-in">
        <span className="no-results-arabic">لَا عِلْمَ لَنَا إِلَّا مَا عَلَّمْتَنَا</span>
        <h3 className="no-results-title">No Surahs Found</h3>
        <p className="no-results-message">
          We couldn't find any Surahs matching your search. Please double check your spelling or search terms (e.g. "Fatiha", "Kahf", or "18").
        </p>
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
