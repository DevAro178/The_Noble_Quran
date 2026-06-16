import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Settings } from 'lucide-react';
import { useQuranStore } from '../store/useQuranStore';
import { API_BASE_URL } from '../config/constants';
import VerseCard from '../components/molecules/VerseCard';
import SettingsDrawer from '../components/organisms/SettingsDrawer';
import Button from '../components/atoms/Button';
import './pages.css';

const Reader = () => {
  const { suraNo } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const scrollTargetAyah = searchParams.get('scroll');

  const [verses, setVerses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  const observerRef = useRef(null);
  const scrollRestoredRef = useRef(false);

  const { 
    lastRead, 
    setLastRead, 
    activeTranslations 
  } = useQuranStore();

  // Fetch verses
  useEffect(() => {
    const fetchVerses = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE_URL}/surah/${suraNo}`);
        const result = await res.json();
        
        if (result.success) {
          setVerses(result.data);
          scrollRestoredRef.current = false;
        } else {
          throw new Error(result.message || 'Failed to fetch verses');
        }
      } catch (err) {
        console.error('Error fetching verses:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchVerses();
  }, [suraNo]);

  // Scroll Restoration
  useEffect(() => {
    if (!loading && verses.length > 0 && scrollTargetAyah && !scrollRestoredRef.current) {
      const timer = setTimeout(() => {
        const element = document.getElementById(`ayah-${scrollTargetAyah}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          scrollRestoredRef.current = true;
        }
      }, 500); // Allow elements to finish rendering and layout
      return () => clearTimeout(timer);
    }
  }, [loading, verses, scrollTargetAyah]);

  // Intersection Observer to track scroll progress
  useEffect(() => {
    if (loading || verses.length === 0) return;

    // Disconnect old observer if any
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    const surahName = verses[0]?.suraName || 'Quran';

    // Set up observer: trigger when verse is in upper viewport area
    const options = {
      root: null,
      rootMargin: '0px 0px -75% 0px', // Detects items near the top third of viewport
      threshold: 0
    };

    const callback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const ayatId = entry.target.id;
          const ayatNo = parseInt(ayatId.replace('ayah-', ''));
          
          // Only update if it is different from the stored last read
          if (!lastRead || lastRead.suraNo !== parseInt(suraNo) || lastRead.ayatNo !== ayatNo) {
            setLastRead(parseInt(suraNo), surahName, ayatNo);
          }
        }
      });
    };

    observerRef.current = new IntersectionObserver(callback, options);

    // Observe each verse card
    verses.forEach((verse) => {
      const el = document.getElementById(`ayah-${verse.ayatNo}`);
      if (el) {
        observerRef.current.observe(el);
      }
    });

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [loading, verses, suraNo, lastRead, setLastRead]);

  const handleBack = () => {
    navigate('/');
  };

  const currentSurahName = verses[0]?.suraName || `Surah ${suraNo}`;
  const totalVerses = verses.length;
  
  // Show Bismillah banner: Don't show for Surah At-Tawbah (9) or Surah Al-Fatihah (1, which has Bismillah as verse 1)
  const shouldShowBismillah = parseInt(suraNo) !== 1 && parseInt(suraNo) !== 9;

  return (
    <div className="reader-page animate-fade-in">
      <div className="reader-navbar-wrapper">
        <div className="container reader-navbar">
          <div className="reader-navbar-left">
            <Button variant="icon" onClick={handleBack} title="Back to Home">
              <ArrowLeft size={20} />
            </Button>
            <span className="reader-surah-title">{currentSurahName}</span>
          </div>
          <Button 
            variant="icon" 
            onClick={() => setIsSettingsOpen(true)}
            title="Open Settings"
          >
            <Settings size={20} />
          </Button>
        </div>
      </div>

      <main className="container">
        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading verses...</p>
          </div>
        ) : error ? (
          <div className="error-container">
            <h3 className="error-title">Unable to load verses</h3>
            <p className="error-message">{error}</p>
            <Button variant="secondary" onClick={handleBack} className="smooth-transition">
              Return to Index
            </Button>
          </div>
        ) : (
          <>
            <div className="reader-banner smooth-transition">
              <h2 className="reader-banner-title">Surah {currentSurahName}</h2>
              <span className="reader-banner-subtitle">
                Surah No. {suraNo} | {totalVerses} Verses
              </span>
            </div>

            {shouldShowBismillah && (
              <div className="reader-bismillah-container">
                <span className="reader-bismillah">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</span>
              </div>
            )}

            <div className="verses-stream">
              {verses.map((verse) => (
                <VerseCard
                  key={verse.id}
                  verse={verse}
                  isActiveLastRead={lastRead && lastRead.suraNo === parseInt(suraNo) && lastRead.ayatNo === verse.ayatNo}
                  onMarkLastRead={() => setLastRead(parseInt(suraNo), currentSurahName, verse.ayatNo)}
                  activeTranslations={activeTranslations}
                />
              ))}
            </div>
          </>
        )}
      </main>

      <SettingsDrawer 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
      />
    </div>
  );
};

export default Reader;
