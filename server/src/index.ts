import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

import { astronautRouter } from './routes/astronautRoutes';
import { activityRouter } from './routes/activityRoutes';
import { eventRouter } from './routes/eventRoutes';
import { anomalyRouter } from './routes/anomalyRoutes';
import { syncRouter } from './routes/syncRoutes';
import { simulationRouter } from './routes/simulationRoutes';
import { exportRouter } from './routes/exportRoutes';
import { settingsRouter } from './routes/settingsRoutes';
import { assistantRouter } from './routes/assistantRoutes';
import { telemetryRouter } from './routes/telemetryRoutes';
import { asteroidRouter } from './routes/asteroidRoutes';
import { crewRouter } from './routes/crewRoutes';
import { robotRoutes } from './routes/robotRoutes';
import { routineRoutes } from './routes/routineRoutes';
import { voiceRoutes } from './routes/voiceRoutes';
import { videoRoutes } from './routes/videoRoutes';
import { db } from './database/db';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health Check API
app.get('/api/health', (_req: Request, res: Response) => {
  const session = db.getSession();
  res.json({
    status: 'HEALTHY',
    system: 'ASTROSENSE_ONBOARD_EDGE_AI',
    mission: session.missionName,
    commStatus: session.commStatus,
    autonomousMode: session.autonomousModeActive,
    timestamp: new Date().toISOString(),
  });
});

// Mount Existing & Additive Routes
app.use('/api/astronaut', astronautRouter);
app.use('/api/activities', activityRouter);
app.use('/api/events', eventRouter);
app.use('/api/anomalies', anomalyRouter);
app.use('/api/sync', syncRouter);
app.use('/api/simulation', simulationRouter);
app.use('/api/export', exportRouter);
app.use('/api/settings', settingsRouter);

// Additive Routes
app.use('/api/assistant', assistantRouter);
app.use('/api/telemetry', telemetryRouter);
app.use('/api/asteroids', asteroidRouter);
app.use('/api/crew', crewRouter);
app.use('/api/robots', robotRoutes);
app.use('/api/routine', routineRoutes);
app.use('/api/voice', voiceRoutes);
app.use('/api/video', videoRoutes);

// Global Error Handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[ASTROSENSE ERROR]:', err);
  res.status(500).json({
    success: false,
    error: err.message || 'Internal onboard system fault',
  });
});

app.listen(PORT, () => {
  console.log(`
  =============================================================
   🛰️  ASTROSENSE | ONBOARD AI CREW MONITORING SYSTEM
   🚀  Mission Aurora - Day 042 | Autonomous Edge Node
  =============================================================
   📡  API Server Running on: http://localhost:${PORT}
   🧠  Inference Engine: Modular Onboard Edge AI (Zero-Cloud)
   🤖  AI Assistant: Local Offline Space Knowledge Engine Active
   ☄️  Deep Space / Asteroid Monitor: 4 Simulated Objects Tracked
   👨‍🚀 Multi-Crew Management: AST-01 to AST-04 Synced
   💾  Database: Local Resilient Persistence Initialized
   🔒  Network Isolation: OFFLINE-READY & AUTONOMOUS
  =============================================================
  `);
});

export default app;
