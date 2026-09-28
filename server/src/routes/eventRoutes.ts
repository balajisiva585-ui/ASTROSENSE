import { Router, Request, Response } from 'express';
import { db } from '../database/db';
import { ActivityType, SyncStatus } from '../types';

export const eventRouter = Router();

eventRouter.get('/', (req: Request, res: Response) => {
  const syncStatus = req.query.syncStatus as SyncStatus | undefined;
  const severity = req.query.severity as string | undefined;
  const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;
  const activity = req.query.activity as ActivityType | undefined;

  const events = db.getEvents({
    syncStatus,
    severity,
    limit,
    activity,
  });

  const session = db.getSession();

  res.json({
    success: true,
    data: {
      events,
      totalCount: session.totalEventsCount,
      unsyncedCount: session.unsyncedEventCount,
    },
  });
});

eventRouter.post('/', (req: Request, res: Response) => {
  try {
    const body = req.body;
    const session = db.getSession();
    const astro = db.getAstronaut();

    const now = new Date();
    const event = db.addEvent({
      astronautId: body.astronautId || astro.id,
      timestamp: body.timestamp || now.toISOString(),
      displayTime: body.displayTime || now.toTimeString().split(' ')[0],
      activity: body.activity || astro.currentActivity,
      confidence: body.confidence || 95.0,
      durationSeconds: body.durationSeconds || 0,
      severity: body.severity || 'INFO',
      module: body.module || astro.currentModule,
      syncStatus: session.commStatus === 'ONLINE' ? 'SYNCED' : 'PENDING',
      source: body.source || 'MANUAL_OVERRIDE',
      processingMode: 'ONBOARD_EDGE_AI',
      details: body.details || 'Manually logged mission event.',
    });

    res.json({ success: true, data: event });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});
