import express, { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

import authRouter from '../server/routes/auth';
import complaintsRouter from '../server/routes/complaints';
import messagesRouter from '../server/routes/messages';
import feedbackRouter from '../server/routes/feedback';
import notificationsRouter from '../server/routes/notifications';
import analyticsRouter from '../server/routes/analytics';
import { seedMongoDB } from '../server/db';

dotenv.config();

const app = express();

app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Cached DB connection for serverless environment
let isConnected = false;

async function connectDB() {
  if (isConnected || mongoose.connection.readyState === 1) {
    isConnected = true;
    return;
  }

  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI is not set in environment variables.');
  }

  await mongoose.connect(MONGODB_URI);
  isConnected = true;
  await seedMongoDB();
}

// DB connection middleware
app.use(async (_req: Request, res: Response, next: NextFunction) => {
  try {
    await connectDB();
    next();
  } catch (err: any) {
    console.error('CRITICAL: Serverless MongoDB connection failed:', err);
    res.status(500).json({ error: 'Database connection failed: ' + (err.message || 'Unknown error') });
  }
});

// Health check endpoint
const handleHealth = (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    stack: 'MERN (MongoDB + Express + React + Node.js) on Vercel Serverless',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
  });
};

// Reseed database endpoint
const handleSeed = async (_req: Request, res: Response) => {
  try {
    await seedMongoDB(true);
    res.json({ message: 'MongoDB reset and re-seeded with initial demo records successfully.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to reseed database' });
  }
};

// Route definitions for both /api/* and root mount
app.get('/api/health', handleHealth);
app.get('/health', handleHealth);

app.post('/api/seed', handleSeed);
app.post('/seed', handleSeed);

app.use('/api/auth', authRouter);
app.use('/auth', authRouter);

app.use('/api/complaints', complaintsRouter);
app.use('/complaints', complaintsRouter);

app.use('/api/messages', messagesRouter);
app.use('/messages', messagesRouter);

app.use('/api/feedback', feedbackRouter);
app.use('/feedback', feedbackRouter);

app.use('/api/notifications', notificationsRouter);
app.use('/notifications', notificationsRouter);

app.use('/api/analytics', analyticsRouter);
app.use('/analytics', analyticsRouter);

export default app;
