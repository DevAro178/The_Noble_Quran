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

    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    const surahName = verses[0]?.suraName || 'Quran';
    const activeIntersections = {};

    // Trigger area is between 5% and 60% from the top of the viewport (upper-middle area)
    const options = {
      root: null,
      rootMargin: '-5% 0px -40% 0px',
      threshold: 0
    };

    const callback = (entries) => {
      entries.forEach((entry) => {
        const id = entry.target.id;
        if (entry.isIntersecting) {
          activeIntersections[id] = entry.target;
        } else {
          delete activeIntersections[id];
        }
      });

      const activeIds = Object.keys(activeIntersections);
      if (activeIds.length > 0) {
        // Target scroll-tracking line is 30% from the top of the viewport
        const targetY = window.innerHeight * 0.3;
        let closestAyahNo = null;
        let minDiff = Infinity;

        activeIds.forEach((id) => {
          const element = activeIntersections[id];
          if (element) {
            const rect = element.getBoundingClientRect();
            const diff = Math.abs(rect.top - targetY);
            if (diff < minDiff) {
              minDiff = diff;
              closestAyahNo = parseInt(id.replace('ayah-', ''));
            }
          }
        });

        if (closestAyahNo !== null) {
          const state = useQuranStore.getState();
          const currentLastRead = state.lastRead;
          if (!currentLastRead || currentLastRead.suraNo !== parseInt(suraNo) || currentLastRead.ayatNo !== closestAyahNo) {
            state.setLastRead(parseInt(suraNo), surahName, closestAyahNo);
          }
        }
      }
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
  }, [loading, verses, suraNo]);

  const handleMarkLastRead = (ayatNo) => {
    const surahName = verses[0]?.suraName || 'Quran';
    setLastRead(parseInt(suraNo), surahName, ayatNo);
    
    // Smoothly scroll the clicked verse to the target zone (30% from the top of viewport)
    const element = document.getElementById(`ayah-${ayatNo}`);
    if (element) {
      const rect = element.getBoundingClientRect();
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const targetScrollTop = scrollTop + rect.top - window.innerHeight * 0.3;
      window.scrollTo({
        top: targetScrollTop,
        behavior: 'smooth'
      });
    }
  };

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
                  onMarkLastRead={() => handleMarkLastRead(verse.ayatNo)}
                  activeTranslations={activeTranslations}
                />
              ))}
            </div>

            {/* Bottom Islamic placeholder/footer to enable scrolling the last ayah past the target zone */}
            <div className="reader-footer-placeholder smooth-transition">
              <span className="reader-footer-arabic">صَدَقَ اللهُ الْعَظِيمُ</span>
              <p className="reader-footer-translation">"Allah Almighty has spoken the truth"</p>
              <span className="reader-footer-dua">رَبَّنَا تَقَبَّلْ مِنَّا ۖ إِنَّكَ أَنتَ السَّمِيعُ الْعَلِيمُ</span>
              <p className="reader-footer-dua-translation">"Our Lord, accept [this] from us. Indeed, You are the Hearing, the Knowing."</p>
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
