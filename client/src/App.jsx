import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useQuranStore } from './store/useQuranStore';
import Home from './pages/Home';
import Reader from './pages/Reader';
import './styles/globals.css';

function App() {
  const initAppStyles = useQuranStore((state) => state.initAppStyles);

  // Initialize CSS variables and dark/light themes on mount
  useEffect(() => {
    initAppStyles();
  }, [initAppStyles]);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/surah/:suraNo" element={<Reader />} />
        <Route path="*" element={<Home />} />
      </Routes>
    </Router>
  );
}

export default App;
