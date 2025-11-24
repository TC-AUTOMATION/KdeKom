import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { query } from './database/db';
import apiRoutes from './routes/api';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api', apiRoutes);

// Health check route
app.get('/health', async (req, res) => {
  try {
    const result = await query('SELECT NOW()');
    res.json({ status: 'ok', time: result.rows[0].now });
  } catch (error) {
    console.error('Database health check failed:', error);
    res.status(500).json({ status: 'error', message: 'Database connection failed' });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});