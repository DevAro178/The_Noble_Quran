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
import './pages.css';

const Home = () => {
  const navigate = useNavigate();
  const [surahs, setSurahs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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

  const handleSelectSurah = (suraNo) => {
    navigate(`/surah/${suraNo}`);
  };

  const handleResumeReading = () => {
    if (lastRead) {
      navigate(`/surah/${lastRead.suraNo}?scroll=${lastRead.ayatNo}`);
    }
  };

  // Client side filtering for surah list
  const filteredSurahs = surahs.filter((surah) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;

    // Match surah number
    if (surah.suraNo.toString() === query) return true;

    // Match surah name (English)
    if (surah.suraName.toLowerCase().includes(query)) return true;

    // Match para name
    if (surah.paraName.toLowerCase().includes(query)) return true;

    return false;
  });

  return (
    <div className="home-page container animate-fade-in">
      <header className="home-header">
        <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-end', marginBottom: '-10px' }}>
          <Button 
            variant="icon" 
            onClick={() => setIsSettingsOpen(true)}
            title="Open Settings"
          >
            <Settings size={22} />
          </Button>
        </div>
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
        ) : (
          <SurahList 
            surahs={filteredSurahs} 
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
