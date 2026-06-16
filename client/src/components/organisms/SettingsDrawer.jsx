import React, { useEffect, useRef } from 'react';
import { X, Sun, Moon } from 'lucide-react';
import { useQuranStore } from '../../store/useQuranStore';
import { TRANSLATIONS } from '../../config/constants';
import Toggle from '../atoms/Toggle';
import Slider from '../atoms/Slider';
import Button from '../atoms/Button';
import './organisms.css';

const SettingsDrawer = ({ isOpen, onClose }) => {
  const drawerRef = useRef(null);
  
  const { 
    theme, 
    setTheme, 
    arabicFontSize, 
    setArabicFontSize, 
    translationFontSize, 
    setTranslationFontSize, 
    activeTranslations, 
    toggleTranslation 
  } = useQuranStore();

  // Close drawer when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (isOpen && drawerRef.current && !drawerRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen, onClose]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="drawer-backdrop">
      <div className="drawer-container" ref={drawerRef}>
        <div className="drawer-header">
          <span className="drawer-title">Settings</span>
          <Button variant="icon" onClick={onClose} title="Close Settings">
            <X size={20} />
          </Button>
        </div>

        <div className="drawer-content">
          {/* Theme selection */}
          <div className="drawer-section">
            <span className="drawer-section-title">Theme</span>
            <div className="theme-toggle-group">
              <button
                className={`theme-btn smooth-transition ${theme === 'light' ? 'active' : ''}`}
                onClick={() => setTheme('light')}
              >
                <Sun size={18} />
                Light
              </button>
              <button
                className={`theme-btn smooth-transition ${theme === 'dark' ? 'active' : ''}`}
                onClick={() => setTheme('dark')}
              >
                <Moon size={18} />
                Dark
              </button>
            </div>
          </div>

          {/* Typography configuration */}
          <div className="drawer-section">
            <span className="drawer-section-title">Typography</span>
            <Slider
              title="Arabic Font Size"
              min={20}
              max={48}
              value={arabicFontSize}
              onChange={setArabicFontSize}
              unit="px"
            />
            <Slider
              title="Translation Font Size"
              min={12}
              max={26}
              value={translationFontSize}
              onChange={setTranslationFontSize}
              unit="px"
            />
          </div>

          {/* Translations configuration */}
          <div className="drawer-section">
            <span className="drawer-section-title">Translations</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {TRANSLATIONS.map((trans) => (
                <Toggle
                  key={trans.key}
                  id={trans.key}
                  checked={!!activeTranslations[trans.key]}
                  onChange={() => toggleTranslation(trans.key)}
                  title={trans.name}
                  description={`${trans.lang} | By ${trans.author}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsDrawer;
