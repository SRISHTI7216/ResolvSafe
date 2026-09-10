import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { createServer as createViteServer } from 'vite';

import authRouter from './server/routes/auth';
import complaintsRouter from './server/routes/complaints';
import messagesRouter from './server/routes/messages';
import feedbackRouter from './server/routes/feedback';
import notificationsRouter from './server/routes/notifications';
import analyticsRouter from './server/routes/analytics';
import { seedMongoDB } from './server/db';

dotenv.config();

const PORT = Number(process.env.PORT) || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/resolvsafe';

async function startServer() {
  const app = express();

  // Basic Middlewares
  app.use(express.json({ limit: '20mb' }));
  app.use(express.urlencoded({ extended: true, limit: '20mb' }));

  // MongoDB connection
  try {
    await mongoose.connect(MONGODB_URI);
    console.log(`Connected to MongoDB successfully at ${MONGODB_URI}`);
    await seedMongoDB();
  } catch (mongoErr) {
    console.error('CRITICAL: Failed to connect to MongoDB:', mongoErr);
    process.exit(1);
  }

  // API Routes
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      stack: 'MERN (MongoDB + Express + React + Node.js)',
      database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    });
  });

  app.post('/api/seed', async (_req, res) => {
    try {
      await seedMongoDB(true);
      res.json({ message: 'MongoDB reset and re-seeded with initial demo records successfully.' });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to reseed database' });
    }
  });

  app.use('/api/auth', authRouter);
  app.use('/api/complaints', complaintsRouter);
  app.use('/api/messages', messagesRouter);
  app.use('/api/feedback', feedbackRouter);
  app.use('/api/notifications', notificationsRouter);
  app.use('/api/analytics', analyticsRouter);

  // Serve AI Studio static assets if any
  const publicAssetsPath = path.resolve(process.cwd(), 'public');
  app.use('/assets', express.static(path.join(publicAssetsPath, 'assets')));

  // Vite middleware for development vs Static files in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ResolvSafe MERN server running at http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server startup failure:', err);
  process.exit(1);
});
