import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings } from 'lucide-react';
import { useQuranStore } from '../store/useQuranStore';
import { API_BASE_URL } from '../config/constants';
import SearchBar from '../components/molecules/SearchBar';
import HistoryCard from '../components/molecules/HistoryCard';
import SurahList from '../components/organisms/SurahList';
import SettingsDrawer from '../components/organisms/SettingsDrawer';
import Button from '../components/atoms/Button';
import Logo from '../components/atoms/Logo';
import './pages.css';

const Home = () => {
  const navigate = useNavigate();
  const [surahs, setSurahs] = useState([]);
  const [searchResults, setSearchResults] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchError, setSearchError] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const { lastRead } = useQuranStore();

  useEffect(() => {
    const fetchSurahs = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE_URL}/surahs`);
        const result = await res.json();

        if (result.success) {
          setSurahs(result.data);
        } else {
          throw new Error(result.message || 'Failed to fetch surahs');
        }
      } catch (err) {
        console.error('Error fetching surahs list:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSurahs();
  }, []);

  // Debounced search API call
  useEffect(() => {
    const query = searchQuery.trim();
    if (!query) {
      setSearchResults(null);
      setSearchLoading(false);
      setSearchError(false);
      return;
    }

    setSearchLoading(true);
    setSearchError(false);

    const delayDebounce = setTimeout(async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/surahs/search?q=${encodeURIComponent(query)}`);
        
        if (!res.ok) {
          throw new Error('Scripture server not responding');
        }

        const result = await res.json();
        if (result.success) {
          setSearchResults(result.data);
        } else {
          throw new Error(result.message || 'Search failed');
        }
      } catch (err) {
        console.error('Error searching surahs:', err);
        setSearchError(true);
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 400); // 400ms debounce

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  const handleSelectSurah = (suraNo) => {
    navigate(`/surah/${suraNo}`);
  };

  const handleResumeReading = () => {
    if (lastRead) {
      navigate(`/surah/${lastRead.suraNo}?scroll=${lastRead.ayatNo}`);
    }
  };

  const displayedSurahs = searchResults !== null ? searchResults : surahs;

  return (
    <div className="home-page container animate-fade-in">
      <header className="home-header">
        <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-end', marginBottom: '-20px' }}>
          <Button
            variant="icon"
            onClick={() => setIsSettingsOpen(true)}
            title="Open Settings"
          >
            <Settings size={22} />
          </Button>
        </div>
        <Logo size={64} className="home-logo-svg" style={{ marginBottom: '16px' }} />
        <h1 className="home-logo">The Noble Quran</h1>
        <p className="home-subtitle">Read, study, and search translations of the Holy Quran</p>
      </header>

      {lastRead && (
        <HistoryCard
          lastRead={lastRead}
          onResume={handleResumeReading}
        />
      )}

      <section className="search-section">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
        />
      </section>

      <main>
        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading surahs list...</p>
          </div>
        ) : error ? (
          <div className="error-container">
            <h3 className="error-title">Unable to load Quran index</h3>
            <p className="error-message">{error}</p>
          </div>
        ) : searchLoading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Searching Holy Quran...</p>
          </div>
        ) : searchError ? (
          <div className="islamic-error-placeholder animate-fade-in">
            <span className="islamic-error-arabic">لَا تَخَفْ وَلَا تَحْزَنْ</span>
            <h3 className="islamic-error-title">Connection Interrupted</h3>
            <p className="islamic-error-message">
              "Do not fear and do not grieve." We are unable to connect to the scripture servers. Please check your connection or try again shortly.
            </p>
            <Button variant="secondary" onClick={() => setSearchQuery(searchQuery + ' ')} className="smooth-transition">
              Retry Search
            </Button>
          </div>
        ) : (
          <SurahList
            surahs={displayedSurahs}
            onSelectSurah={handleSelectSurah}
          />
        )}
      </main>

      <SettingsDrawer
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
};

export default Home;
