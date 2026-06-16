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

// Search Surahs via search_keywords table
export const searchSurahs = async (req, res) => {
  const { q } = req.query;
  if (!q) {
    return res.status(400).json({ success: false, message: 'Query parameter q is required' });
  }

  try {
    const searchPattern = `%${q.trim()}%`;

    // 1. Fetch search_keywords table column names to support dynamic schema mapping
    const [columnsInfo] = await pool.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'AlQuran' AND TABLE_NAME = 'search_keywords';
    `);

    if (!columnsInfo || columnsInfo.length === 0) {
      throw new Error("Table 'search_keywords' not found or has no columns.");
    }

    const columnNames = columnsInfo.map(col => col.COLUMN_NAME || col.column_name);

    // 2. Identify the suraNo/surahNo mapping column
    const hasSurahNo = columnNames.includes('surahNo');
    const hasSuraNo = columnNames.includes('suraNo');
    const hasId = columnNames.includes('id');
    const suraJoinCol = hasSurahNo ? 'sk.surahNo' : (hasSuraNo ? 'sk.suraNo' : (hasId ? 'sk.id' : null));

    if (!suraJoinCol) {
      throw new Error("Could not find a valid matching suraNo/surahNo/id column in search_keywords table.");
    }

    // 3. Build dynamic WHERE clauses for all columns
    let whereClauses = [];
    let queryParams = [];

    // Exact match for suraNo if query is numeric
    const isNum = !isNaN(q.trim());
    if (isNum) {
      whereClauses.push(`${suraJoinCol} = ?`);
      queryParams.push(parseInt(q.trim()));
    }

    // Substring LIKE match for all other columns
    columnNames.forEach(col => {
      const lowerCol = col.toLowerCase();
      // Skip matching number columns with text LIKE operator
      if (lowerCol !== 'id' && lowerCol !== 'surano' && lowerCol !== 'surahno') {
        whereClauses.push(`sk.${col} LIKE ?`);
        queryParams.push(searchPattern);
      }
    });

    let rows = [];
    if (whereClauses.length > 0) {
      const query = `
        SELECT 
          q.suraNo, 
          q.suraName, 
          MIN(q.paraNo) AS paraNo, 
          MIN(q.paraName) AS paraName, 
          COUNT(*) AS totalAyat 
        FROM quran q
        JOIN search_keywords sk ON q.suraNo = ${suraJoinCol}
        WHERE ${whereClauses.join(' OR ')}
        GROUP BY q.suraNo, q.suraName
        ORDER BY q.suraNo ASC;
      `;
      [rows] = await pool.query(query, queryParams);
    }

    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Error performing surah search:', error);
    res.status(500).json({ success: false, message: 'Server error searching surahs' });
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
