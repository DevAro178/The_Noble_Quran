import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import quranRoutes from './routes/quran.routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', quranRoutes);

// Simple Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Al-Quran API server is running.' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Internal Server Error' });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;
