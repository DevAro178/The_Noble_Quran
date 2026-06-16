import pool from '../config/db.js';

// Get list of all 114 Surahs
export const getSurahs = async (req, res) => {
  try {
    const query = `
      SELECT 
        suraNo, 
        suraName, 
        MIN(paraNo) AS paraNo, 
        MIN(paraName) AS paraName, 
        COUNT(*) AS totalAyat 
      FROM quran 
      GROUP BY suraNo, suraName 
      ORDER BY suraNo ASC;
    `;
    const [rows] = await pool.query(query);
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Error fetching surahs:', error);
    res.status(500).json({ success: false, message: 'Server error fetching surahs list' });
  }
};

// Get all verses for a specific Surah
export const getSurahVerses = async (req, res) => {
  const { suraNo } = req.params;
  try {
    const query = `
      SELECT * 
      FROM quran 
      WHERE suraNo = ? 
      ORDER BY ayatNo ASC;
    `;
    const [rows] = await pool.query(query, [suraNo]);
    
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: `Surah number ${suraNo} not found` });
    }
    
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error(`Error fetching verses for surah ${suraNo}:`, error);
    res.status(500).json({ success: false, message: 'Server error fetching surah verses' });
  }
};

// Search Quran Surah name or translations
export const searchQuran = async (req, res) => {
  const { q } = req.query;
  if (!q) {
    return res.status(400).json({ success: false, message: 'Query parameter q is required' });
  }
  
  try {
    const searchPattern = `%${q}%`;
    const query = `
      SELECT 
        id, 
        suraNo, 
        suraName, 
        ayatNo, 
        quranArabic, 
        quMehmood, 
        quFateh, 
        engTaqi, 
        engMohsin 
      FROM quran 
      WHERE 
        suraName LIKE ? 
        OR quMehmood LIKE ? 
        OR quFateh LIKE ? 
        OR engTaqi LIKE ? 
        OR engMohsin LIKE ? 
      LIMIT 50;
    `;
    const [rows] = await pool.query(query, [
      searchPattern,
      searchPattern,
      searchPattern,
      searchPattern,
      searchPattern
    ]);
    
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Error performing search:', error);
    res.status(500).json({ success: false, message: 'Server error performing search' });
  }
};
