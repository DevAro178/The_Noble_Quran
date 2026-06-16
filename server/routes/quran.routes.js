import express from 'express';
import { getSurahs, getSurahVerses, searchQuran, searchSurahs } from '../controllers/quran.controller.js';

const router = express.Router();

router.get('/surahs', getSurahs);
router.get('/surahs/search', searchSurahs);
router.get('/surah/:suraNo', getSurahVerses);
router.get('/search', searchQuran);

export default router;
