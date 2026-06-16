import React, { useState } from 'react';
import { Bookmark, Copy, Check } from 'lucide-react';
import { TRANSLATIONS } from '../../config/constants';
import Button from '../atoms/Button';
import './molecules.css';

const VerseCard = ({ 
  verse, 
  isActiveLastRead, 
  onMarkLastRead, 
  activeTranslations 
}) => {
  const [copied, setCopied] = useState(false);
  const { suraNo, ayatNo, quranArabic } = verse;

  // Format translation paragraphs based on active settings
  const renderedTranslations = TRANSLATIONS.filter(t => activeTranslations[t.key]).map(t => {
    return {
      ...t,
      text: verse[t.key]
    };
  });

  const handleCopy = async () => {
    try {
      let copyText = `${quranArabic} (${suraNo}:${ayatNo})\n\n`;
      renderedTranslations.forEach(t => {
        if (t.text) {
          copyText += `[${t.name}]: ${t.text}\n`;
        }
      });
      
      await navigator.clipboard.writeText(copyText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy verse: ', err);
    }
  };

  return (
    <div 
      id={`ayah-${ayatNo}`} 
      className={`verse-card smooth-transition ${isActiveLastRead ? 'active-last-read' : ''}`}
    >
      <div className="verse-header">
        <div className="verse-metadata">
          <span className="verse-index">{suraNo}:{ayatNo}</span>
        </div>
        <div className="verse-actions">
          <Button
            variant="icon"
            onClick={handleCopy}
            title={copied ? "Copied!" : "Copy Verse"}
          >
            {copied ? <Check size={18} className="smooth-transition" style={{ color: 'var(--accent-mint)' }} /> : <Copy size={18} />}
          </Button>
          <Button
            variant="icon"
            onClick={onMarkLastRead}
            title="Mark as Last Read"
            active={isActiveLastRead}
          >
            <Bookmark size={18} style={isActiveLastRead ? { fill: 'var(--accent-mint)' } : {}} />
          </Button>
        </div>
      </div>

      <div className="verse-arabic-container">
        <p className="verse-arabic">{quranArabic}</p>
      </div>

      {renderedTranslations.length > 0 && (
        <div className="verse-translations-list">
          {renderedTranslations.map((trans) => {
            if (!trans.text) return null;
            return (
              <div 
                key={trans.key} 
                className={`verse-translation-item ${trans.direction === 'rtl' ? 'rtl-lang' : ''}`}
              >
                <span className="verse-translation-author">{trans.name} ({trans.lang})</span>
                <p className="verse-translation-text">{trans.text}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default VerseCard;
